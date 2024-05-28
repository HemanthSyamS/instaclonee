from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('like', views.PostLikeViewSet)
router.register('comment', views.PostCommentViewSet)

urlpatterns = [
    path('', views.UserPostCreateFeed.as_view(), name = 'user_post_view'),
    path('media/', views.PostMediaView.as_view(), name = 'post_media_view'),
    path('<int:pk>/', views.PostViewUpdateDeleteView.as_view(), name = 'post_publish_view'),
    path('', include(router.urls)),
    
]