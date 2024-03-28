from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignUpSerializer, UserListSerializer, UserProfileUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

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


