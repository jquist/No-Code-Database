from rest_framework import serializers
from .models import Project, Canvas, Schema
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'client_id', 'data', 'created_at')
        read_only_fields = ('id', 'created_at')

class CanvasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Canvas
        fields = ['id', 'project', 'data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class SchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schema
        fields = ['id', 'project', 'name', 'sql_file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']