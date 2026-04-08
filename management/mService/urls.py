from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, CanvasViewSet, SchemaViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'canvases', CanvasViewSet, basename='canvas')
router.register(r'schemas', SchemaViewSet, basename='schema')
urlpatterns = [
    path("", include(router.urls)),
]