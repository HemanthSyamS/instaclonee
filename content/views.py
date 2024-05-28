from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserPost, PostLikes, PostComments
from rest_framework import mixins
from .serializers import UserPostCreateSerializer, PostMediaCreateSerializer, PostFeedSerializer
from .filters import CurrentUserFollowingFilterBackend
from rest_framework.response import Response
from rest_framework import viewsets
from .serializers import PostLikeCreateSerializer, PostLikesViewSerializer, PostCommentCreateSerializer
from .permissions import IsOwnerOrReadOnly

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

class PostLikeViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin,
                        mixins.DestroyModelMixin, mixins.ListModelMixin):

    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JWTAuthentication, ]
    queryset = PostLikes.objects.all()
    serializer_class = PostLikeCreateSerializer

    def get_serializer_context(self):
        return {"current_user" : self.request.user.profile}

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostLikesViewSerializer
        return self.serializer_class

    def list(self, request):

        post_likes = self.queryset.filter(post_id = request.query_params['post_id'])

        page = self.paginate_queryset(post_likes)

        if page:
            serializer = self.get_serializer(page, many = True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(post_likes, many = True)

        return Response(serializer.data)

class PostCommentViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin,
                            mixins.DestroyModelMixin):

    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly, ]
    authentication_classes = [JWTAuthentication, ]
    queryset = PostComments.objects.all()
    serializer_class = PostCommentCreateSerializer

    def get_serializer_context(self):
        return {"current_user" : self.request.user.profile}

    def list(self, request):
        post_comments = self.queryset.filter(post_id = request.query_params['post_id'])
        page = self.paginate_queryset(post_comments)

        if page:
            serializer = self.get_serializer(page, many = True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(post_comments, many = True)

        return Response(serializer.data)

