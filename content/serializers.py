from rest_framework.serializers import ModelSerializer
from .models import UserPost, PostMedia, PostLikes, PostComments
from users.serializers import UserListSerializer, UserViewSerializer
from users.models import UserProfile
from django.contrib.auth.models import User

class UserPostCreateSerializer(ModelSerializer):

    def create(self, validated_data):
        validated_data['author'] = self.context['current_user']
        return UserPost.objects.create(**validated_data)

    class Meta:
        model = UserPost
        fields = ('id', 'caption_text', 'location', 'is_published', )

class PostMediaCreateSerializer(ModelSerializer):

    class Meta:
        model = PostMedia
        fields = ('media_file', 'sequence_index', 'post', )

class PostMediaViewSerializer(ModelSerializer):
    class Meta:
        model = PostMedia
        exclude = ('post', )

class AuthorDetailsSerializer(ModelSerializer):
    user = UserViewSerializer()
    class Meta:
        model = UserProfile
        fields = '__all__'

class PostFeedSerializer(ModelSerializer):
    author = AuthorDetailsSerializer()
    media = PostMediaViewSerializer(many=True)
    class Meta:
        model = UserPost
        fields = '__all__'
        include = ('media', )

class PostLikeCreateSerializer(ModelSerializer):

    def create(self, validated_data):
        validated_data['liked_by'] = self.context["current_user"]
        return PostLikes.objects.create(**validated_data)

    class Meta:
        model = PostLikes
        fields = ('id', 'post', )

class PostLikesViewSerializer(ModelSerializer):
    liked_by = UserListSerializer()
    class Meta:
        model = PostLikes
        fields = ('liked_by', )

class PostCommentCreateSerializer(ModelSerializer):

    def create(self, validated_data):
        validated_data['author'] = self.context["current_user"]
        return PostComments.objects.create(**validated_data)
    
    class Meta: 
        model = PostComments
        fields = ('id', 'text', 'post', )
