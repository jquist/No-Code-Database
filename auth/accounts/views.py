from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from .serializers import MyTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer,
    UserUpdateSerializer
)
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Unwrap nested data object from frontend
        payload = request.data.get('data', request.data)
        
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
class LogoutView(APIView):
    """
    An endpoint to blocklist a refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Unwrap nested data object from frontend
            payload = request.data.get('data', request.data)
            refresh_token = payload["refresh"]
            
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        payload = request.data.get('data', request.data)

        serializer = self.get_serializer(data=payload)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({
                "detail": "Invalid credentials", 
                "errors": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(email=payload.get('email'))
        
        response_data = {
            "data": {
                "access": serializer.validated_data['access'],
                "refresh": serializer.validated_data['refresh'],
                "name": f"{user.first_name} {user.last_name}",
                "admin": user.is_staff
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class PasswordResetRequestView(APIView):
    """
    Handles the request for a password reset link (POST /password-reset/).
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.data.get('data', request.data)
        
        serializer = PasswordResetRequestSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return 200 OK even if the user doesn't exist for security reasons
            return Response({'message': 'Password reset link sent (if user exists).'}, 
                            status=status.HTTP_200_OK)

        # Generate the secure token and UID
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Construct the reset link
        reset_link = f"{settings.FRONTEND_URL}/reset/{uid}/{token}/"
        
        subject = 'Password Reset Request for Your Account'
        message = (
            f"You requested a password reset. Please click the link below to set a new password:\n\n"
            f"{reset_link}\n\n"
            f"If you did not request this, please ignore this email."
        )
        recipient_list = [user.email]

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)
            message_text = 'Password reset link sent.'
        except Exception as e:
            print(f"ERROR: Could not send email. Exception: {e}")
            message_text = 'Password reset link sent (but failed to connect to email service).'

        return Response({'message': message_text}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    """
    Handles confirming the password reset (POST /password-reset/confirm/).
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.data.get('data', request.data)
        
        serializer = PasswordResetConfirmSerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            # Decode the user ID (UID) from the link
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        
        # Check if the user exists and if the token is valid
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful.'}, 
                            status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid reset link or token has expired.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        
class PasswordChangeView(APIView):
    """
    Handles changing the password for an authenticated user.
    """
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        user = request.user
        
        payload = request.data.get('data', request.data)
        
        serializer = PasswordChangeSerializer(data=payload)
        serializer.is_valid(raise_exception=True)

        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not user.check_password(old_password):
            return Response({'error': 'Old password is not correct.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password updated successfully.'}, 
                        status=status.HTTP_200_OK)
    
class ProfileView(APIView):
    """
    A protected endpoint to view and update the current user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name, 
            'last_name': user.last_name,
        }
        return Response(data)

    def patch(self, request):
        payload = request.data.get('data', request.data)
        
        serializer = UserUpdateSerializer(request.user, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)