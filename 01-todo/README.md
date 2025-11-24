# Django TODO Application

A simple Django web application for managing TODOs, built as part of the ai-dev-tools-zoomcamp homework.

## Features

- ✅ Create new TODOs with title, description, and optional due date
- ✏️ Edit existing TODOs
- 🗑️ Delete TODOs
- ✅ Mark TODOs as completed/resolved
- 📅 View due dates
- 📋 List all TODOs with their status

## Requirements

- Python 3.12+
- `uv` package manager (or pip with virtual environment)

## Installation

1. Install dependencies using `uv`:
   ```bash
   uv sync
   ```

   Or using pip:
   ```bash
   pip install django
   ```

2. Run database migrations:
   ```bash
   uv run python manage.py migrate
   # or
   python manage.py migrate
   ```

## Running the Application

Start the development server:

```bash
uv run python manage.py runserver
# or
python manage.py runserver
```

Then open http://127.0.0.1:8000/ in your browser.

## Running Tests

Run the test suite:

```bash
uv run python manage.py test
# or
python manage.py test
```

The test suite includes:
- Model tests (creating TODOs)
- View tests (home page, create, edit, delete, toggle resolved)

## Project Structure

```
01-todo/
├── manage.py              # Django management script
├── pyproject.toml         # Project dependencies
├── todo_project/          # Django project settings
│   ├── settings.py        # Project configuration
│   ├── urls.py           # Root URL configuration
│   └── ...
├── todos/                 # Django app
│   ├── models.py         # Todo model definition
│   ├── views.py          # View functions
│   ├── urls.py           # App URL patterns
│   ├── admin.py          # Admin configuration
│   ├── tests.py          # Test cases
│   └── migrations/       # Database migrations
└── templates/            # HTML templates
    ├── base.html
    ├── home.html
    ├── create_todo.html
    ├── edit_todo.html
    └── delete_todo.html
```

## Usage

1. **View all TODOs**: Navigate to the home page to see all your TODOs
2. **Create a TODO**: Click "Create New TODO" button
3. **Edit a TODO**: Click "Edit" on any TODO item
4. **Mark as completed**: Click "Mark Completed" to toggle the status
5. **Delete a TODO**: Click "Delete" and confirm the deletion

## Database

The application uses SQLite by default. The database file (`db.sqlite3`) is created automatically when you run migrations.

## Admin Interface

Access the Django admin interface at http://127.0.0.1:8000/admin/ (requires creating a superuser first):

```bash
uv run python manage.py createsuperuser
```

## Homework Answers

This project was created to answer the following homework questions:

- **Q1:** `uv add django`
- **Q2:** `settings.py`
- **Q3:** `Run migrations`
- **Q4:** `views.py`
- **Q5:** `TEMPLATES['DIRS'] in project's settings.py`
- **Q6:** `python manage.py test`

