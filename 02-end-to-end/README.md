# Coding Interview Platform

A real-time collaborative coding interview application built with React, Node.js, and WebSockets. This application allows interviewers and candidates to collaborate on coding problems in real-time, with syntax highlighting for multiple languages and safe in-browser code execution.

## Features

- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with instant synchronization
- **Multiple Language Support**: Full syntax highlighting for JavaScript and Python (with support for TypeScript, Java, C++, C#, Go, and Rust)
  - **JavaScript**: Optimized with auto-formatting, intelligent suggestions, and 2-space indentation
  - **Python**: Configured with 4-space indentation (PEP 8 standard) and Python-specific editor features
- **WASM-Based Code Execution**: Execute code safely in the browser using WebAssembly
  - **JavaScript**: Executed in a sandboxed iframe using native JavaScript engine
  - **Python**: Executed using Pyodide (CPython compiled to WebAssembly) - runs entirely in the browser, no server execution
  - All code execution happens client-side for maximum security
- **Session Management**: Create unique session URLs to share with candidates
- **Modern UI**: Clean, professional interface suitable for coding interviews

## Tech Stack

### Backend
- Node.js with Express
- Socket.IO for real-time WebSocket communication
- TypeScript
- Jest for testing

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Monaco Editor (VS Code editor in the browser)
- React Router for navigation
- Vitest + React Testing Library for testing

## Prerequisites

- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install server dependencies:
```bash
cd server
npm install
cd ..
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

## Running the Application

### Development Mode

From the root directory, run:

```bash
npm run dev
```

This will start both the backend server (on port 4000) and the frontend development server (on port 5173) concurrently.

You can also run them separately:

- Backend only: `npm run dev:server`
- Frontend only: `npm run dev:client`

### Accessing the Application

Once running, open your browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### Docker Deployment

The application can be containerized and run in a single Docker container.

#### Using Docker Compose (Recommended)

The easiest way to run the application locally with Docker:

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:4000

You can customize the port by creating a `.env` file:
```bash
PORT=8080
```

Then run:
```bash
docker-compose up
```

#### Using Docker Directly

From the `02-end-to-end` directory:

**Building the Docker Image:**
```bash
docker build -t coding-interview-app .
```

**Running the Container:**
```bash
docker run -p 4000:4000 coding-interview-app
```

**With Environment Variables:**
```bash
docker run -p 8080:8080 -e PORT=8080 coding-interview-app
```

#### Production Notes

- The Docker image uses a multi-stage build for optimal size
- Frontend and backend are built and served from a single container
- Static files are served by the Express server
- All code execution (JavaScript/Python) still happens client-side in the browser
- Docker Compose includes health checks and automatic restart policies

### Cloud Deployment (Render)

The application can be deployed to Render.com with minimal configuration.

#### Prerequisites

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a free account on [Render.com](https://render.com)

#### Deploy via Render Dashboard

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `coding-interview-app` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users (e.g., `Oregon`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `02-end-to-end` if deploying from monorepo root)
   - **Dockerfile Path**: `Dockerfile` (or `02-end-to-end/Dockerfile` if deploying from monorepo root)
5. Click "Create Web Service"
6. Render will automatically build and deploy your application

#### Deploy via Render Blueprint

If you've pushed `render.yaml` to your repository:

1. Log in to Render dashboard
2. Click "New +" and select "Blueprint"
3. Connect your Git repository
4. Render will detect `render.yaml` and create the service automatically

#### Environment Variables

The following environment variables can be configured in Render:

- `NODE_ENV`: Set to `production` (default in Dockerfile)
- `PORT`: Automatically set by Render, but defaults to 4000
- `CORS_ORIGIN`: Optional, defaults to `*` in production

#### Render Features

- ✅ Automatic HTTPS/SSL certificates
- ✅ Health checks via `/health` endpoint
- ✅ Auto-deploy on Git push (configurable)
- ✅ Free tier available (with some limitations)
- ✅ Custom domains support

#### Access Your Application

After deployment, Render provides a URL like:
```
https://coding-interview-app.onrender.com
```

Your application will be accessible at this URL with automatic HTTPS.

## Usage

### Creating a Session

1. Navigate to the home page
2. Click "Create New Session"
3. You'll be redirected to a unique session URL (e.g., `/session/abc123`)
4. Copy the session link and share it with the candidate

### Joining a Session

1. Navigate to the home page
2. Enter the session ID in the input field
3. Click "Join Session" or press Enter

### Collaborating

- Type code in the editor - changes are automatically synchronized with all connected users
- Change the programming language using the dropdown (affects syntax highlighting only)
- Copy the session ID or share link using the toolbar buttons

### Running Code

- **JavaScript and Python** code can be executed directly in the browser
- **JavaScript**: Executed in a sandboxed iframe using native JavaScript engine
- **Python**: Executed using Pyodide (WebAssembly-based Python runtime) - supports full Python 3.x with standard library
- Click "Run Code" to execute the code (only enabled for JavaScript and Python)
- View output and errors in the output panel on the right
- All execution happens in the browser - no code is sent to the server for security

## Testing

Run all tests from the root directory:

```bash
npm test
```

This runs both backend and frontend tests.

Run tests individually:

- Backend tests: `cd server && npm test`
- Frontend tests: `cd client && npm test`

### Test Coverage

**Backend Tests:**
- **Unit Tests**: Session store logic (`sessionStore.test.ts`)
- **Integration Tests**:
  - REST API endpoints (`api.integration.test.ts`) - Tests HTTP endpoints with real Express server
  - Socket.IO real-time communication (`socket.integration.test.ts`) - Tests WebSocket events with real Socket.IO connections
  - End-to-end workflows (`workflow.integration.test.ts`) - Tests complete user flows combining REST and WebSocket

**Frontend Tests:**
- Component tests with mocked dependencies (`HomePage.test.tsx`, `SessionPage.test.tsx`)

## Project Structure

```
02-end-to-end/
├── server/              # Backend Node.js/Express application
│   ├── src/
│   │   ├── index.ts    # Express app and Socket.IO setup
│   │   ├── config.ts   # Server configuration
│   │   ├── routes/     # REST API routes
│   │   ├── realtime/   # Socket.IO event handlers
│   │   ├── models/     # Session store
│   │   └── __tests__/  # Backend tests
│   └── package.json
├── client/              # Frontend React application
│   ├── src/
│   │   ├── routes/     # React Router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # API clients and utilities
│   │   └── __tests__/  # Frontend tests
│   ├── public/
│   │   └── runner.html # Sandboxed iframe for code execution
│   └── package.json
└── package.json         # Root package with dev scripts
```

## Architecture

### Real-time Communication

- Uses Socket.IO for WebSocket-based real-time updates
- Each session is a Socket.IO room identified by `sessionId`
- Code changes are debounced (500ms) to reduce WebSocket traffic
- Session state is maintained in-memory on the backend

### Code Execution

- Code execution happens entirely in the browser using WebAssembly (WASM) for security
- **JavaScript**: Executed in a sandboxed iframe with `sandbox="allow-scripts"` attribute for isolation
- **Python**: Executed using Pyodide (CPython compiled to WebAssembly)
  - Full Python 3.x support with standard library
  - Runs entirely in the browser - no server-side execution
  - Supports print statements, error handling, and standard Python features
- Console output (print statements, console.log) is captured and displayed in the output panel
- All execution is client-side only - no code is ever sent to or executed on the server

### Session Management

- Sessions are stored in-memory on the backend (ephemeral)
- Session IDs are generated using nanoid
- No persistence - sessions are lost on server restart

## Configuration

### Backend Configuration

Edit `server/src/config.ts` to configure:
- Server port (default: 4000)
- CORS origin (default: http://localhost:5173)

Or set environment variables:
- `PORT`: Server port
- `CORS_ORIGIN`: Allowed CORS origin

### Frontend Configuration

Edit `client/vite.config.ts` to configure:
- Development server port
- API proxy settings

## Limitations

- Sessions are stored in-memory and will be lost on server restart
- Only JavaScript code execution is supported
- No authentication or authorization
- No session persistence across server restarts

## License

ISC
