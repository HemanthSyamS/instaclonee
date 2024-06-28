from django.db import models
from django.contrib.auth.models import User
import os

# Create your models here.

class TimeStamp(models.Model): 

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta: 
        abstract = True

def user_profile_pic_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'user_{instance.user.username}.{ext}'
    return os.path.join('profile_pic', filename)

class UserProfile(TimeStamp): 

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=False)
    profile_pic = models.ImageField(upload_to=user_profile_pic_path, blank=True, null=True)
    bio = models.CharField(max_length=255, blank=True )
    is_verified = models.BooleanField(default=False)


class NetworkEdge(TimeStamp):

    from_user = models.ForeignKey(UserProfile, related_name= "following", on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserProfile, related_name= "followers", on_delete=models.CASCADE)

    class Meta : 
        unique_together = ('from_user', 'to_user')