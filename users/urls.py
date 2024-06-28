from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('signup/', views.signup, name = 'signup_api'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('list/', views.user_list, name = "user_list"),
    path('profile/', views.UserProfileViewUpdate.as_view(), name = 'get_single_user'),
    path('profile/update/', views.UserProfileViewUpdate.as_view(), name = 'update_user_profile'),
    path('profile/delete/', views.UserProfileViewUpdate.as_view(), name = 'update_user_profile'),
    path('edge/', views.NetworkEdgeView.as_view(), name = 'follow_user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)