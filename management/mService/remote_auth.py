import os
import json
from typing import Optional, Tuple
import logging

from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

try:
    import requests
except Exception:
    requests = None


class RemoteUser:
    #user object is returned after verification
    def __init__(self, id: Optional[int] = None, username: Optional[str] = None, email: Optional[str] = None):
        self.id = id
        self.username = username
        self.email = email

    @property
    def is_authenticated(self) -> bool:  # DRF checks this
        return True


class RemoteAuth(BaseAuthentication):

    def authenticate(self, request) -> Optional[Tuple[object, str]]:
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        token = self._extract_token(auth_header)
        if not token:
            return None

        # Ensure requests is available
        if requests is None:
            raise exceptions.AuthenticationFailed('requests library is not installed on the server')

        auth_service = os.getenv('AUTH_SERVICE_URL', 'http://localhost:5050')
        verify_url = auth_service.rstrip('/') + '/api/auth/me/'

        headers = {'Authorization': f'Bearer {token}'}

        try:
            resp = requests.get(verify_url, headers=headers, timeout=5)
        except requests.RequestException as exc:
            logger = logging.getLogger(__name__)
            logger.exception('Failed to reach auth service at %s', verify_url)
            raise exceptions.AuthenticationFailed(f'Unable to reach auth service for token verification: {exc}')

        if resp.status_code != 200:
            # Token invalid or expired
            raise exceptions.AuthenticationFailed('Invalid or expired token')

        try:
            payload = resp.json()
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid response from auth service')

        user = RemoteUser(id=payload.get('id'), username=payload.get('username'), email=payload.get('email'))
        return (user, token)

    def _extract_token(self, header: str) -> Optional[str]:
        parts = header.split()
        if len(parts) == 0:
            return None
        if len(parts) == 1:
            # header might be just the raw token
            return parts[0]
        # support "Bearer <token>"
        if parts[0].lower() == 'bearer':
            return parts[1]
        # fallback: return the second part
        return parts[-1]
