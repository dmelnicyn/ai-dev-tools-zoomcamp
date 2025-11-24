# Django TODO App - Homework Plan

## Overview

Build a simple Django TODO application with create, edit, delete, and mark-resolved functionality. Each step corresponds to a homework question with explicit answers.

## Step 1: Question 1 - Install Django

**Location:** `/home/dmelnitsyn/projects/ai-dev-tools-zoomcamp/01-todo/`

**Commands:**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp
mkdir -p 01-todo
cd 01-todo
uv init
uv add django
uv run python -m django --version
```

**Deliverables:**

- Django installed via `uv`
- Verification command confirms installation

**Homework Q1 answer:** `uv add django`

---

## Step 2: Question 2 - Project and App

**Commands:**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp/01-todo
uv run django-admin startproject todo_project .
uv run python manage.py startapp todos
```

**Files to edit:**

- `todo_project/settings.py` - Add `'todos'` to `INSTALLED_APPS`

**Code change in `todo_project/settings.py`:**

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos',  # Add this line
]
```

**Homework Q2 answer:** `settings.py`

---

## Step 3: Question 3 - Django Models

**Files to create/edit:**

- `todos/models.py` - Define Todo model

**Code for `todos/models.py`:**

```python
from django.db import models

class Todo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

**Commands:**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp/01-todo
uv run python manage.py makemigrations
uv run python manage.py migrate
```

**Optional:** Register in admin (`todos/admin.py`):

```python
from django.contrib import admin
from .models import Todo

admin.site.register(Todo)
```

**Homework Q3 answer:** `Run migrations`

---

## Step 4: Question 4 - TODO Logic

**Files to create/edit:**

- `todos/views.py` - Implement all view functions
- `todos/urls.py` - Create URL patterns
- `todo_project/urls.py` - Include todos URLs

**Code for `todos/views.py`:**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Todo

def home(request):
    todos = Todo.objects.all().order_by('-created_at')
    return render(request, 'home.html', {'todos': todos})

def create_todo(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        due_date = request.POST.get('due_date') or None
        Todo.objects.create(
            title=title,
            description=description,
            due_date=due_date
        )
        return redirect('home')
    return render(request, 'create_todo.html')

def edit_todo(request, todo_id):
    todo = get_object_or_404(Todo, id=todo_id)
    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description', '')
        todo.due_date = request.POST.get('due_date') or None
        todo.save()
        return redirect('home')
    return render(request, 'edit_todo.html', {'todo': todo})

def delete_todo(request, todo_id):
    todo = get_object_or_404(Todo, id=todo_id)
    if request.method == 'POST':
        todo.delete()
        return redirect('home')
    return render(request, 'delete_todo.html', {'todo': todo})

def toggle_resolved(request, todo_id):
    todo = get_object_or_404(Todo, id=todo_id)
    todo.is_completed = not todo.is_completed
    todo.save()
    return redirect('home')
```

**Code for `todos/urls.py` (new file):**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('create/', views.create_todo, name='create_todo'),
    path('edit/<int:todo_id>/', views.edit_todo, name='edit_todo'),
    path('delete/<int:todo_id>/', views.delete_todo, name='delete_todo'),
    path('toggle/<int:todo_id>/', views.toggle_resolved, name='toggle_resolved'),
]
```

**Code change in `todo_project/urls.py`:**

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todos.urls')),
]
```

**Homework Q4 answer:** `views.py`

---

## Step 5: Question 5 - Templates

**Files to create:**

- `templates/base.html`
- `templates/home.html`
- `templates/create_todo.html`
- `templates/edit_todo.html`
- `templates/delete_todo.html`

**Code change in `todo_project/settings.py`:**

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Add this line
        'APP_DIRS': True,
        # ... rest of config
    },
]
```

**Code for `templates/base.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}TODO App{% endblock %}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .todo-item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .completed { opacity: 0.6; text-decoration: line-through; }
        .btn { padding: 8px 15px; margin: 5px; text-decoration: none; border-radius: 3px; display: inline-block; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-warning { background-color: #ffc107; color: black; }
        form { margin: 20px 0; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>{% block header %}TODO App{% endblock %}</h1>
    {% block content %}{% endblock %}
</body>
</html>
```

**Code for `templates/home.html`:**

```html
{% extends 'base.html' %}

{% block content %}
<a href="{% url 'create_todo' %}" class="btn btn-primary">Create New TODO</a>

{% for todo in todos %}
<div class="todo-item {% if todo.is_completed %}completed{% endif %}">
    <h3>{{ todo.title }}</h3>
    {% if todo.description %}<p>{{ todo.description }}</p>{% endif %}
    {% if todo.due_date %}<p><strong>Due:</strong> {{ todo.due_date }}</p>{% endif %}
    <p><strong>Status:</strong> {% if todo.is_completed %}Completed{% else %}Pending{% endif %}</p>
    <a href="{% url 'edit_todo' todo.id %}" class="btn btn-warning">Edit</a>
    <a href="{% url 'toggle_resolved' todo.id %}" class="btn btn-success">
        {% if todo.is_completed %}Mark Pending{% else %}Mark Completed{% endif %}
    </a>
    <a href="{% url 'delete_todo' todo.id %}" class="btn btn-danger">Delete</a>
</div>
{% empty %}
<p>No TODOs yet. <a href="{% url 'create_todo' %}">Create one!</a></p>
{% endfor %}
{% endblock %}
```

**Code for `templates/create_todo.html`:**

```html
{% extends 'base.html' %}

{% block content %}
<h2>Create New TODO</h2>
<form method="post">
    {% csrf_token %}
    <label>Title:</label>
    <input type="text" name="title" required>
    <label>Description:</label>
    <textarea name="description"></textarea>
    <label>Due Date:</label>
    <input type="date" name="due_date">
    <button type="submit" class="btn btn-primary">Create</button>
    <a href="{% url 'home' %}" class="btn">Cancel</a>
</form>
{% endblock %}
```

**Code for `templates/edit_todo.html`:**

```html
{% extends 'base.html' %}

{% block content %}
<h2>Edit TODO</h2>
<form method="post">
    {% csrf_token %}
    <label>Title:</label>
    <input type="text" name="title" value="{{ todo.title }}" required>
    <label>Description:</label>
    <textarea name="description">{{ todo.description }}</textarea>
    <label>Due Date:</label>
    <input type="date" name="due_date" value="{{ todo.due_date|date:'Y-m-d' }}">
    <button type="submit" class="btn btn-primary">Update</button>
    <a href="{% url 'home' %}" class="btn">Cancel</a>
</form>
{% endblock %}
```

**Code for `templates/delete_todo.html`:**

```html
{% extends 'base.html' %}

{% block content %}
<h2>Delete TODO</h2>
<p>Are you sure you want to delete "{{ todo.title }}"?</p>
<form method="post">
    {% csrf_token %}
    <button type="submit" class="btn btn-danger">Yes, Delete</button>
    <a href="{% url 'home' %}" class="btn">Cancel</a>
</form>
{% endblock %}
```

**Homework Q5 answer:** `TEMPLATES['DIRS'] in project's settings.py`

---

## Step 6: Question 6 - Tests

**Files to create/edit:**

- `todos/tests.py` - Implement test cases

**Code for `todos/tests.py`:**

```python
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
```

**Commands:**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp/01-todo
uv run python manage.py test
```

**Homework Q6 answer:** `python manage.py test`

---

## Step 7: Final - Running the App + GitHub

**Commands:**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp/01-todo
uv run python manage.py runserver
```

**Verification:**

- Open http://127.0.0.1:8000/ in browser
- Test creating, editing, deleting, and marking TODOs as resolved

**GitHub commit (reminder):**

```bash
cd /home/dmelnitsyn/projects/ai-dev-tools-zoomcamp
git add 01-todo/
git commit -m "Add Django TODO app for ai-dev-tools-zoomcamp homework"
git push
```

---

## Summary of Homework Answers

- **Q1:** `uv add django`
- **Q2:** `settings.py`
- **Q3:** `Run migrations`
- **Q4:** `views.py`
- **Q5:** `TEMPLATES['DIRS'] in project's settings.py`
- **Q6:** `python manage.py test`

