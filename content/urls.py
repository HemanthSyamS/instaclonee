from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserPostCreateFeed.as_view(), name = 'user_post_view'),
    path('media/', views.PostMediaView.as_view(), name = 'post_media_view'),
    path('<int:pk>/', views.PostViewUpdateDeleteView.as_view(), name = 'post_publish_view'),
]