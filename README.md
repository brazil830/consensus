# Consensus AI Project

## Overview

This repository hosts the **Consensus AI** platform, a full‑stack application combining a FastAPI backend with a modern Vite‑powered frontend. The backend provides a suite of decision‑governance APIs, while the frontend offers a web UI for interacting with cases, deliberations, and explainability reports.

## Prerequisites

- **Python 3.11+** (recommended) – for the backend.
- **Node.js 20+** and **pnpm** (or npm) – for the frontend and monorepo tooling.
- **Git** – to clone the repository.

## Setup Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/your-org/consensus.git
   cd consensus-main
   ```

2. **Install workspace dependencies** (uses the pnpm workspace defined in `pnpm-workspace.yaml`):
   ```bash
   pnpm install      # installs both backend and frontend packages
   ```

3. **Set up the Python virtual environment** for the backend:
   ```bash
   python -m venv venv
   source venv/Scripts/activate   # on Windows PowerShell
   pip install -r backend/requirements.txt
   ```

## Running the Project (Development)

### Backend

Start the FastAPI server with hot‑reload:
```bash
# Ensure the virtual environment is activated
uvicorn backend.app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### Frontend

Run the Vite development server:
```bash
cd frontend
pnpm dev   # or `npm run dev`
```
The web UI will be served at `http://localhost:5173` and proxy API requests to the backend.

## Building for Production

1. **Build the frontend assets**:
   ```bash
   cd frontend
   pnpm build   # generates `dist/` folder
   ```

2. **Collect static files** (optional – you may serve the `frontend/dist` folder with any static file server or integrate it into the FastAPI app).

3. **Run the backend in production mode** (no reload):
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

## Useful Scripts

- `pnpm lint` – run code linting across the workspace.
- `pnpm test` – execute any test suites defined.
- `pnpm format` – apply `prettier` formatting.

## Database

The project uses an SQLite database (`consensus_ai.db`). It is created automatically on first startup. To reset the database (e.g., for a fresh start):
```bash
rm consensus_ai.db   # delete the file
# then restart the backend – seed data will be loaded automatically
```

---

Feel free to adapt these commands to your preferred environment (Docker, CI/CD pipelines, etc.). Happy coding!
