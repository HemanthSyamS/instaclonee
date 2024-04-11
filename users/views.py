from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics, mixins
from .serializers import SignUpSerializer, UserListSerializer, UserProfileUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, NetworkEdge
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import NetworkEdgeCreateSerializer, NetworkEdgeFollowersSerializer, NetworkEdgeFollowingSerializer

# Create your views here.


@api_view(['POST'])
def signup(request) : 
    
    serializer = SignUpSerializer(data = request.data)

    response_data = {
        "errors": None,
        "data" : None,
    }

    if serializer.is_valid():
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        response_data['data'] = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        response_status = status.HTTP_201_CREATED
    else :
        response_data['errors'] = serializer.errors
        response_status = status.HTTP_400_BAD_REQUEST


    return Response(response_data, status=response_status)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
def user_list(request) : 
    
    print(f"On line 46 : {request.user}")
    users = UserProfile.objects.all()
    
    serialized_data = UserListSerializer(instance = users, many = True)

    return Response(serialized_data.data, status=status.HTTP_200_OK)


class UserProfileViewUpdate(APIView):

    authentication_classes = [JWTAuthentication, ]
    permission_classes = [IsAuthenticated, ]

    def get(self, request, pk):
        user = UserProfile.objects.filter(id=pk).first()

        if user : 
            serializer = UserListSerializer(instance=user)
            respon_data = {
                "data": serializer.data,
                "errors": None
            }
            response_status = status.HTTP_200_OK
        else : 
            respon_data = {
                "data": None,
                "errors" : "user not found!!"
            }
            response_status = status.HTTP_404_NOT_FOUND

        return Response(respon_data, status= response_status)
    

    def post(self, request, pk=None):
        user_profile_serializer = UserProfileUpdateSerializer(instance = request.user.profile,
                                                            data = request.data)
        response_data = {
            'data' : None,
            'errors' : None
        }

        if user_profile_serializer.is_valid() : 
            user_profile = user_profile_serializer.save()
            response_data['data'] = UserListSerializer(instance = user_profile).data
            response_status = status.HTTP_200_OK
        else :
            response_data['errors'] = user_profile_serializer.errors
            response_status = status.HTTP_400_BAD_REQUEST

        return Response(response_data, response_status)


class NetworkEdgeView(generics.GenericAPIView,
                         mixins.CreateModelMixin,
                         mixins.ListModelMixin, 
                         mixins.DestroyModelMixin ):

    queryset = NetworkEdge.objects.all()
    serializer_class = NetworkEdgeCreateSerializer
    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JWTAuthentication, ]

    def get_serializer_class(self ):
        if self.request.method == 'GET':
            edge_direction = self.request.query_params['direction']
            if edge_direction == 'following':
                return NetworkEdgeFollowingSerializer
            return NetworkEdgeFollowersSerializer
        return self.serializer_class

    def get_queryset(self):
        edge_direction = self.request.query_params['direction']
        if edge_direction == 'followers':
            return self.queryset.filter(to_user=self.request.user.profile)
        elif edge_direction == 'following':
            return self.queryset.filter(from_user=self.request.user.profile)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        request.data['from_user'] = request.user.profile.id
        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        
        network_edge = NetworkEdge.objects.filter(from_user=request.user.profile,
                                                    to_user=request.data['to_user'])

        if network_edge.exists():
            network_edge.delete()
            unfollowed_profile = UserProfile.objects.get(id = request.data['to_user']).user.username
            message = f"User {unfollowed_profile} unfollowed successfully."
        else :
            message = 'No user found in your follow list'

        return Response({"data" : None, "message" : message}, status= status.HTTP_200_OK)


