# ai-dev-tools-zoomcamp

A development project for AI development tools and zoomcamp materials.

## Projects

### 01-todo - Django TODO Application

A simple Django web application for managing TODOs, built as part of the ai-dev-tools-zoomcamp homework.

**Features:**
- Create, edit, and delete TODOs
- Assign due dates to TODOs
- Mark TODOs as resolved/completed
- Clean, simple web interface

**Tech Stack:**
- Django 5.2.8
- Python 3.12+
- SQLite database
- `uv` for package management

**Setup:**

```bash
cd 01-todo
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

Then open http://127.0.0.1:8000/ in your browser.

**Running Tests:**

```bash
cd 01-todo
uv run python manage.py test
```

**Project Structure:**
- `todo_project/` - Django project configuration
- `todos/` - Django app with models, views, URLs, and tests
- `templates/` - HTML templates for the web interface

For detailed implementation plan, see [django-todo-app-homework.plan.md](django-todo-app-homework.plan.md).
