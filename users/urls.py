from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('signup/', views.signup, name = 'signup_api'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('list/', views.user_list, name = "user_list"),
    path('<int:pk>/', views.UserProfileViewUpdate.as_view(), name = 'get_single_user'),
    path('update/', views.UserProfileViewUpdate.as_view(), name = 'update_user_profile'),
]