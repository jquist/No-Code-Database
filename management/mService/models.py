from django.db import models
from django.core.validators import RegexValidator

alnum_validator = RegexValidator(
    regex=r'^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$',
    message='Project name may contain only English letters (A-Z, a-z) and numbers (0-9).'
)

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=20, blank=False, null=False, default='untitled project', validators=[alnum_validator], help_text="Only English letters and numbers allowed.")
    description = models.TextField(blank=True, null=True, max_length=200, validators=[alnum_validator], help_text="Only English letters and numbers allowed.")
    client_id = models.CharField(max_length=255, blank=False, null=True, db_index=True, unique=False)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Project {self.id} created at {self.created_at.isoformat()}"
    

class Canvas(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='canvases')
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Canvas {self.id} for Project {self.project.id}"


class Schema(models.Model):
    """Stores an uploaded SQL file associated with a Project."""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='schemas')
    name = models.CharField(max_length=20, blank=False, null=False, default='untitled schema', validators=[alnum_validator], help_text="Only English letters and numbers allowed.")
    sql_file = models.FileField(upload_to='schemas/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Schema {self.id} for Project {self.project.id}"