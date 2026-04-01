# Marketplace Platform

Multi-vendor marketplace platform with React web frontend, FastAPI backend, and Flutter mobile app support.

## Architecture

```
market_place/
├── backend/          # FastAPI + PostgreSQL + Redis + Meilisearch
├── frontend/         # React + Vite + TailwindCSS
└── render.yaml       # Render deployment config
```

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (Supabase), Redis, Meilisearch
- **Auth**: JWT + bcrypt
- **Real-time**: WebSockets for chat
- **Deployment**: Render

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit with your values
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `backend/.env.example` for required variables:

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| REDIS_URL | Redis connection string |
| MEILI_HOST | Meilisearch host URL |
| MEILI_KEY | Meilisearch API key |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_KEY | Supabase anon key |
| SUPABASE_SERVICE_KEY | Supabase service key |
| JWT_SECRET | Secret for JWT signing |
| CORS_ORIGINS | Comma-separated allowed origins |

## Features

- User registration & JWT authentication
- Product CRUD with image management
- Category browsing & filtering
- Full-text search with Meilisearch
- Redis caching with auto-invalidation
- Real-time buyer-seller chat (WebSockets)
- Order management with status tracking
- Product reviews & ratings
- Wishlist functionality
- Dark/Light theme support
- Responsive mobile-first design
- Pagination & lazy loading

## Design Theme

Follows the Flutter mobile app design:
- **Primary**: Dark Green (#1B5E20)
- **Accent**: Green (#66BB6A)
- **Currency**: UGX
- **Cards**: Rounded 16px with shadows, product badges (New/Hot)
- **Dark mode** support
