from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Project, Canvas, Schema
from .serializers import ProjectSerializer, CanvasSerializer, SchemaSerializer
import json


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = Project.objects.filter(client_id=str(self.request.user.id)).order_by('-created_at')
        client_id = self.request.query_params.get('client_id')
        if client_id is not None:
            qs = qs.filter(client_id=client_id)
        return qs

    def _extract_client_id_from_data(self, raw_data):
        """
        Accepts either a dict or a JSON string and returns the nested user.id if present.
        Returns None when not found.
        """
        data = raw_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                return None

        if not isinstance(data, dict):
            return None

        user = data.get("user") or {}
        if isinstance(user, dict):
            client_id = user.get("id")
            # Normalize numeric-looking ids to int, otherwise keep as string
            if client_id is None:
                return None
            try:
                # if it's numeric and not a long id representation you want as string:
                return int(client_id)
            except (ValueError, TypeError):
                return str(client_id)
        return None

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        raw_data = data.get("data")
        client_id = self._extract_client_id_from_data(raw_data)

        if client_id is None and getattr(request, "user", None) is not None:
            client_id = request.user.id
        if client_id is not None:
            data["client_id"] = str(client_id)

        # Ensure data is a dict (if data was sent as a JSON string)
        raw_data = data.get("data")
        if isinstance(raw_data, str):
            try:
                data["data"] = json.loads(raw_data)
            except Exception:
                # leave as-is; serializer will validate and raise if invalid
                pass

        # Use the prepared data (including client_id) when validating/creating
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        # Always enforce ownership on update; prevent client_id from being reassigned
        enforced_client_id = str(getattr(self.request.user, "id", ""))
        serializer.save(client_id=enforced_client_id)
    
class CanvasViewSet(viewsets.ModelViewSet):
    queryset = Canvas.objects.all().order_by('-updated_at')
    serializer_class = CanvasSerializer

    def get_queryset(self):
        qs = Canvas.objects.filter(project__client_id=str(self.request.user.id)).order_by('-updated_at')
        project = self.request.query_params.get('project')
        if project is not None:
            qs = qs.filter(project=project)
        return qs

    def perform_create(self, serializer):
        # Ensure the provided project belongs to the authenticated user
        project = serializer.validated_data.get('project')
        if project is None or str(project.client_id) != str(self.request.user.id):
            from rest_framework import exceptions
            raise exceptions.PermissionDenied('You do not own the target project.')
        serializer.save()

    def perform_update(self, serializer):
        # If project is being changed, enforce that it belongs to the user
        project = serializer.validated_data.get('project')
        if project is not None and str(project.client_id) != str(self.request.user.id):
            from rest_framework import exceptions
            raise exceptions.PermissionDenied('You do not own the target project.')
        serializer.save()

class SchemaViewSet(viewsets.ModelViewSet):
    queryset = Schema.objects.all().order_by('-uploaded_at')
    serializer_class = SchemaSerializer

    def get_queryset(self):
        qs = Schema.objects.filter(project__client_id=str(self.request.user.id)).order_by('-uploaded_at')
        project = self.request.query_params.get('project')
        if project is not None:
            qs = qs.filter(project=project)
        return qs

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project is None or str(project.client_id) != str(self.request.user.id):
            from rest_framework import exceptions
            raise exceptions.PermissionDenied('You do not own the target project.')
        serializer.save()

    def perform_update(self, serializer):
        project = serializer.validated_data.get('project')
        if project is not None and str(project.client_id) != str(self.request.user.id):
            from rest_framework import exceptions
            raise exceptions.PermissionDenied('You do not own the target project.')
        serializer.save()
