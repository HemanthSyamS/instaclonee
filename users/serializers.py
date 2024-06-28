from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import UserProfile, NetworkEdge
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        return token


class SignUpSerializer(ModelSerializer):

    def create(self, validated_data):

        validated_data['password'] = make_password(validated_data['password'])

        user = User.objects.create(**validated_data)

        UserProfile.objects.create(user = user)

        return user

    class Meta: 
        model = User
        fields = ('username', 'password', 'email', )


class UserViewSerializer(ModelSerializer): 
    
    class Meta: 
        model = User
        fields = ('username', 'first_name','last_name','email', )

class UserListSerializer(ModelSerializer):
    user = UserViewSerializer()
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta : 
        model = UserProfile
        exclude = ('created_on', )
    
    def get_follower_count(self, obj):
        return obj.followers.count()
    def get_following_count(self, obj):
        return obj.following.count()


class UserProfileUpdateSerializer(ModelSerializer):

    first_name = serializers.CharField()
    last_name = serializers.CharField()

    def update(self, instance, validated_data) :

        user = instance.user
        user.first_name = validated_data.pop('first_name',None)
        user.last_name = validated_data.pop('last_name',None)
        user.save()

        instance.bio = validated_data.get('bio', None)
        profile_pic = validated_data.get('profile_pic', None)
        if profile_pic is not None:
            instance.profile_pic = profile_pic
        instance.save()

        return instance


    class Meta : 
        model = UserProfile
        fields = ('first_name', 'last_name', 'bio', 'profile_pic')

class NetworkEdgeCreateSerializer(ModelSerializer):

    class Meta : 
        model = NetworkEdge
        fields = ('from_user', 'to_user', )

class NetworkEdgeFollowingSerializer(ModelSerializer):

    # from_user = UserListSerializer()
    to_user = UserListSerializer()
    
    class Meta:
        model = NetworkEdge
        fields = ('to_user', )

class NetworkEdgeFollowersSerializer(ModelSerializer):

    from_user = UserListSerializer()
    # to_user = UserListSerializer()
    
    class Meta:
        model = NetworkEdge
        fields = ('from_user', )

