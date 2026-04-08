from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Project
from unittest.mock import patch, MagicMock


class ProjectAPITestCase(TestCase):
	def setUp(self):
		self.client = APIClient()
		# Mock the remote auth verification to accept any Bearer token
		self.auth_patcher = patch('mService.remote_auth.requests.get')
		self.mock_auth = self.auth_patcher.start()
		
		# Configure mock to return successful auth response
		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {
			'id': 1,
			'username': 'testuser',
			'email': 'test@example.com'
		}
		self.mock_auth.return_value = mock_response
	
	def tearDown(self):
		self.auth_patcher.stop()
	
	def _add_auth_header(self, headers=None):
		"""Helper to add Authorization header to requests"""
		if headers is None:
			headers = {}
		headers['Authorization'] = 'Bearer test-token-12345'
		return headers

	def test_create_project_extracts_numeric_client_id(self):
		url = reverse('project-list')
		payload = {
			'data': {
				'user': {'id': 123},
				'test': 'something'
			}
		}
		resp = self.client.post(url, payload, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 201)
		# client_id should be present and stored (as string in the model)
		self.assertIn('client_id', resp.data)
		self.assertEqual(str(resp.data['client_id']), '123')
		# data should be returned as a dict
		self.assertIsInstance(resp.data['data'], dict)
		self.assertEqual(resp.data['data'].get('test'), 'something')

	def test_create_project_with_data_json_string_extracts_client_id(self):
		url = reverse('project-list')
		payload = {
			'data': '{"user": {"id": "test123"}, "a": 1}'
		}
		resp = self.client.post(url, payload, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 201)
		self.assertIn('client_id', resp.data)
		self.assertEqual(resp.data['client_id'], 'test123')
		# data should have been parsed from the JSON string
		self.assertIsInstance(resp.data['data'], dict)
		self.assertEqual(resp.data['data'].get('a'), 1)

	def test_get_projects_filter_by_client_id(self):
		# create some projects directly
		Project.objects.create(name='p1', client_id='client-A', data={})
		Project.objects.create(name='p2', client_id='client-B', data={})
		Project.objects.create(name='p3', client_id='client-A', data={})

		url = reverse('project-list') + '?client_id=client-A'
		resp = self.client.get(url, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 200)
		# Only two projects should be returned for client-A
		self.assertEqual(len(resp.data), 2)


class CanvasAPITestCase(TestCase):
	def setUp(self):
		self.client = APIClient()
		# Mock the remote auth verification to accept any Bearer token
		self.auth_patcher = patch('mService.remote_auth.requests.get')
		self.mock_auth = self.auth_patcher.start()
		
		# Configure mock to return successful auth response
		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {
			'id': 1,
			'username': 'testuser',
			'email': 'test@example.com'
		}
		self.mock_auth.return_value = mock_response
		
		# create a project to attach canvases to
		self.project = Project.objects.create(name='canvas1', client_id='id1', data={})
	
	def tearDown(self):
		self.auth_patcher.stop()

	def test_create_canvas_and_retrieve(self):
		url = reverse('canvas-list')
		payload = {
			'project': self.project.id,
			'data': {'stuff': [{'more stuff': 'the stuff inside the stuff'}]}
		}
		resp = self.client.post(url, payload, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 201)
		self.assertIn('id', resp.data)
		self.assertEqual(int(resp.data['project']), self.project.id)
		self.assertIsInstance(resp.data['data'], dict)

	def test_get_canvases_filter_by_project(self):
		# create two canvases for this project and one for another
		from .models import Canvas
		Canvas.objects.create(project=self.project, data={})
		Canvas.objects.create(project=self.project, data={})
		other = Project.objects.create(name='other', client_id='id2', data={})
		Canvas.objects.create(project=other, data={})

		url = reverse('canvas-list') + f'?project={self.project.id}'
		resp = self.client.get(url, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(len(resp.data), 2)


class SchemaAPITestCase(TestCase):
	def setUp(self):
		self.client = APIClient()
		# Mock the remote auth verification to accept any Bearer token
		self.auth_patcher = patch('mService.remote_auth.requests.get')
		self.mock_auth = self.auth_patcher.start()
		
		# Configure mock to return successful auth response
		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {
			'id': 1,
			'username': 'testuser',
			'email': 'test@example.com'
		}
		self.mock_auth.return_value = mock_response
		
		self.project = Project.objects.create(name='schema1', client_id='id1', data={})
	
	def tearDown(self):
		self.auth_patcher.stop()

	def test_upload_schema_file(self):
		url = reverse('schema-list')
		from django.core.files.uploadedfile import SimpleUploadedFile
		file_data = SimpleUploadedFile('test.sql', b'CREATE TABLE t (id INTEGER);', content_type='text/sql')
		payload = {
			'project': self.project.id,
			'name': 'schemainitial',
			'sql_file': file_data,
		}
		resp = self.client.post(url, payload, format='multipart', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 201)
		self.assertIn('id', resp.data)
		self.assertEqual(int(resp.data['project']), self.project.id)
		self.assertEqual(resp.data['name'], 'schemainitial')

	def test_get_schemas_filter_by_project(self):
		from .models import Schema
		# create two schemas for this project and one for another
		Schema.objects.create(project=self.project, name='s1', sql_file='schemas/dummy.sql')
		Schema.objects.create(project=self.project, name='s2', sql_file='schemas/dummy2.sql')
		other = Project.objects.create(name='other-schema', client_id='x', data={})
		Schema.objects.create(project=other, name='other', sql_file='schemas/other.sql')

		url = reverse('schema-list') + f'?project={self.project.id}'
		resp = self.client.get(url, format='json', **{'HTTP_AUTHORIZATION': 'Bearer test-token-12345'})
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(len(resp.data), 2)
