from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class TimeStamp(models.Model): 

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta: 
        abstract = True

class UserProfile(TimeStamp): 

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=False)
    profile_pic_url = models.FileField(upload_to='profile_pic/', blank=True)
    bio = models.CharField(max_length=255, blank=True )
    is_verified = models.BooleanField(default=False)