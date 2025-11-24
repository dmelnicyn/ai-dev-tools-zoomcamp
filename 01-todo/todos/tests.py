from django.test import TestCase, Client
from django.urls import reverse
from .models import Todo
from datetime import date, timedelta

class TodoModelTest(TestCase):
    def test_create_todo(self):
        todo = Todo.objects.create(
            title="Test Todo",
            description="Test description",
            due_date=date.today()
        )
        self.assertEqual(todo.title, "Test Todo")
        self.assertFalse(todo.is_completed)

class TodoViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="Test description"
        )

    def test_home_page_loads(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test Todo")

    def test_create_todo_view(self):
        response = self.client.post(reverse('create_todo'), {
            'title': 'New Todo',
            'description': 'New description',
            'due_date': '2024-12-31'
        })
        self.assertEqual(response.status_code, 302)  # Redirect
        self.assertTrue(Todo.objects.filter(title='New Todo').exists())

    def test_edit_todo_view(self):
        response = self.client.post(reverse('edit_todo', args=[self.todo.id]), {
            'title': 'Updated Todo',
            'description': 'Updated description'
        })
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')

    def test_delete_todo_view(self):
        todo_id = self.todo.id
        response = self.client.post(reverse('delete_todo', args=[todo_id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Todo.objects.filter(id=todo_id).exists())

    def test_toggle_resolved_view(self):
        self.assertFalse(self.todo.is_completed)
        response = self.client.get(reverse('toggle_resolved', args=[self.todo.id]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_completed)
