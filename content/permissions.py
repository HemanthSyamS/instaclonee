from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, veiw, obj):

        if request.method in permissions.SAFE_METHODS:
            return True

        is_owner = obj.author == request.user.profile
        return is_owner