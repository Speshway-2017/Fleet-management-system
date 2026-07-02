# Fleet Management System

Monorepo for the Fleet Management System application.

## Project Structure

```
Fleet-management-system/
├── frontend/     # React + Vite frontend app
└── backend/      # Backend API (coming soon)
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Or from the repo root:

```bash
npm run dev
```

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_API_BASE_URL` — backend API URL (default: `http://localhost:5000/api`)
- `VITE_MAPBOX_TOKEN` — Mapbox access token for the fleet map

## Scripts (from root)

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |
| `npm run preview` | Preview production build |
