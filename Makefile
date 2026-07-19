# StadiumAI NOC — Root Makefile

.PHONY: help dev-backend dev-frontend test lint build install clean

help:
	@echo "StadiumAI NOC Management Targets:"
	@echo "  make dev-backend   - Run FastAPI backend locally with live reload"
	@echo "  make dev-frontend  - Run Vite React frontend locally"
	@echo "  make test          - Execute Python pytest test suite"
	@echo "  make lint          - Run Oxlint and code quality checks"
	@echo "  make build         - Compile TypeScript and build production static bundle"
	@echo "  make install       - Install frontend and backend dependencies"

dev-backend:
	cd backend && .\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test:
	cd backend && .\.venv\Scripts\pytest -v

lint:
	cd frontend && npx oxlint
	cd backend && .\.venv\Scripts\python -m py_compile app/main.py

build:
	cd frontend && npm run build

install:
	cd frontend && npm install
	cd backend && .\.venv\Scripts\pip install -r requirements.txt

clean:
	rm -rf frontend/dist backend/.pytest_cache
