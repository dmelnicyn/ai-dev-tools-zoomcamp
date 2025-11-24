You are my AI pair programmer in PLAN MODE for the ai-dev-tools-zoomcamp homework.

Goal:
Build a small TODO web application in Django and, along the way, explicitly answer the homework questions 1–6 so I can copy them into the homework form.

High-level app requirements:
- Create, edit and delete TODOs
- Assign due dates
- Mark TODOs as resolved

Constraints / environment:
- This is homework, so keep things simple, idiomatic, and educational.
- Use only Python and standard Django tooling (you MAY suggest using `uv` for env + package management).
- Assume a Unix-like environment (Linux, rag-vm).
- There will be a Git repo for the course; inside it we’ll create a folder like `01-todo/` for this project.
- DO NOT create nested Git repositories or Git submodules unless I explicitly ask.

=== HOW I WANT YOU TO WORK (PLAN MODE) ===
1. Start by generating a clear, ordered PLAN with sections that correspond to:
   - Question 1: Install Django
   - Question 2: Project and App
   - Question 3: Django Models
   - Question 4: TODO Logic
   - Question 5: Templates
   - Question 6: Tests
   - Final: Running the app + GitHub commit

2. For EACH step:
   - Show me the TERMINAL COMMANDS to run.
   - Show me the FILES to create/edit and their content.
   - Keep changes minimal and focused; don’t over-engineer.
   - After completing that step, clearly state the homework answer for the relevant question in the format:
     - **Homework QX answer:** <answer text>

3. Don’t skip steps. If something fails (migrations, tests, runserver), update the plan and fix it.

4. When suggesting commands, assume we are working from inside the course repo, in a subfolder like `01-todo/`. Do NOT run `git init` unless I ask. You can, however, remind me to commit at the end.

---

### STEP-BY-STEP HOMEWORK FLOW

#### Question 1 – Install Django
Task:
- Help me set up Python tooling (optionally `uv`) and install Django in a clean, project-local environment.

Deliverables:
- Propose ONE recommended way to install Django (e.g. with `uv` or `pip` inside a venv).
- Give me the exact command you recommend, and mark it for the homework, e.g.:
  - `uv add django`
  - OR `pip install django`
- Make sure Django is actually installed (`python -m django --version`).

Important:
- After this step, output:
  - **Homework Q1 answer:** <exact command you suggested>

#### Question 2 – Project and App
Task:
- Create a new Django project (e.g. `todo_project`) and a Django app (e.g. `todos`).
- Make sure the app is registered in the project correctly.

Required guidance:
- Provide commands:
  - `django-admin startproject todo_project .` (or similar)
  - `python manage.py startapp todos`
- Show me which file to edit to add the app to `INSTALLED_APPS` (the correct answer is `settings.py`, but still guide me there).
- Show a minimal diff / snippet adding `'todos'` to `INSTALLED_APPS` in the project’s `settings.py`.

After this step, output explicitly:
- **Homework Q2 answer:** `settings.py`

#### Question 3 – Django Models
Task:
- Design and implement models for the TODO app.

Model requirements (keep it simple):
- A `Todo` model with at least:
  - `title` (short text)
  - `description` (optional longer text)
  - `due_date` (nullable/optional date or datetime)
  - `is_completed` or `resolved` (boolean flag)
  - Optionally `created_at` / `updated_at` timestamps with `auto_now_add` / `auto_now`.

Plan:
- Show the code to put in `todos/models.py`.
- Then explain the **next required step** in the Django workflow (migrations).

Important:
- We need to run:
  - `python manage.py makemigrations`
  - `python manage.py migrate`
- Also show how to register the model in the admin (but clarify that the immediate next step, from the options given, is “Run migrations”).

After this step, output explicitly:
- **Homework Q3 answer:** `Run migrations`

#### Question 4 – TODO Logic
Task:
- Implement the core logic (list, create, edit, delete, mark resolved) for the TODOs.

Guidance:
- Implement Django views in `todos/views.py`:
  - List view for all TODOs.
  - Create view (GET for form, POST to create).
  - Update/edit view.
  - Delete view.
  - Action to mark TODO as resolved (or toggle completion).
- Wire URLs in:
  - Project `urls.py` to include `todos.urls`.
  - App-level `todos/urls.py` for route definitions.

Important:
- Clarify that the main TODO logic belongs in `views.py` (not in `urls.py`, `admin.py`, or `tests.py`).

After this step, output explicitly:
- **Homework Q4 answer:** `views.py`

#### Question 5 – Templates
Task:
- Create at least:
  - `templates/base.html`
  - `templates/home.html` (for listing and basic actions for TODOs).
- Wire the template directory properly in settings.

Guidance:
- Decide whether to use project-level templates directory (e.g. `BASE_DIR / "templates"`) or app-specific templates.
- Show how to configure in `settings.py`:
  - `TEMPLATES[0]['DIRS'] = [BASE_DIR / "templates"]`
- Show minimal HTML for `base.html` and `home.html`:
  - `base.html` with a block for content.
  - `home.html` extending base, listing TODOs and providing links/buttons for create/edit/delete/mark resolved.

Important:
- The homework’s question 5 is about where to register the directory with templates. The answer should be: `TEMPLATES['DIRS']` in the project’s `settings.py`.

After this step, output explicitly:
- **Homework Q5 answer:** `TEMPLATES['DIRS'] in project's settings.py`

#### Question 6 – Tests
Task:
- Ask yourself which scenarios to cover and then implement tests.

Scenarios (at least):
- Creating a TODO via view or model.
- Updating/editing a TODO.
- Marking a TODO as resolved.
- Deleting a TODO.
- Listing TODOs (e.g. home page returns 200 and shows existing items).

Guidance:
- Implement tests in `todos/tests.py` using Django’s built-in test framework (`django.test.TestCase`).
- Show me how to run tests from the terminal using Django’s standard test command:
  - `python manage.py test`

Important:
- The homework wants the command used to run tests. We’ll use `python manage.py test`.

After this step, output explicitly:
- **Homework Q6 answer:** `python manage.py test`

---

### Final Step – Running the App + GitHub

Task:
- Run the development server:
  - `python manage.py runserver`
- Confirm that:
  - Home page loads.
  - I can create/edit/delete/resolve TODOs.
- If anything fails, iterate on the code and update the plan.

GitHub:
- Remind me to:
  - Ensure all code is under a folder like `01-todo/` in the course repo.
  - Stage and commit changes:
    - `git add .`
    - `git commit -m "Add Django TODO app for ai-dev-tools-zoomcamp homework"`
  - Push to GitHub.

---

IMPORTANT STYLE NOTES:
- At each step, show concise, copy-pastable command blocks and code snippets.
- After each major step (Q1–Q6), explicitly print the corresponding “Homework QX answer” line so I can copy it into the homework form.
- Keep explanations short but clear; prioritize practical commands and code.
- Do NOT introduce extra frameworks or complex front-end; plain Django + HTML is enough.
