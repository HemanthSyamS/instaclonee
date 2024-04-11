from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserPost
from rest_framework import mixins
from .serializers import UserPostCreateSerializer, PostMediaCreateSerializer, PostFeedSerializer
from .filters import CurrentUserFollowingFilterBackend
from rest_framework.response import Response

# Create your views here.

class UserPostCreateFeed(generics.GenericAPIView, mixins.CreateModelMixin, 
                            mixins.ListModelMixin, ):

    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JWTAuthentication, ]
    queryset = UserPost.objects.all()
    serializer_class = UserPostCreateSerializer
    filter_backends = [CurrentUserFollowingFilterBackend, ]

    def get_serializer_context(self):
        return {'current_user': self.request.user.profile}

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PostFeedSerializer
        return self.serializer_class

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
    
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    

class PostMediaView(generics.GenericAPIView, mixins.CreateModelMixin):

    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JWTAuthentication, ]
    serializer_class = PostMediaCreateSerializer

    def put(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class PostViewUpdateDeleteView(generics.GenericAPIView, mixins.UpdateModelMixin,
                                mixins.RetrieveModelMixin, mixins.DestroyModelMixin):

    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JWTAuthentication, ]
    serializer_class = UserPostCreateSerializer
    queryset = UserPost.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostFeedSerializer
        return self.serializer_class

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
        

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    # def delete(self, request, *args, **kwargs):
    #     return self.destroy(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        post = UserPost.objects.filter(id = kwargs['pk'])

        if post.exists():
            post.delete()
            message = f"post {kwargs['pk']} deleted successfully."
            response_status = status.HTTP_200_OK
        else :
            message = f"No post found with the id {kwargs['pk']}"
            response_status = status.HTTP_404_NOT_FOUND

        return Response({"data" : None, "message" : message}, status= response_status)