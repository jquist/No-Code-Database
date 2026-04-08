from django.contrib import admin
from .models import Project, Schema, Canvas

# Register your models here.

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    readonly_fields = ('created_at',)


class SchemaAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'name', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


class CanvasAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


admin.site.register(Project, ProjectAdmin)
admin.site.register(Schema, SchemaAdmin)
admin.site.register(Canvas, CanvasAdmin)