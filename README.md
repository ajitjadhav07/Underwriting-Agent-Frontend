# Underwriting Agent — Frontend

React SPA for the Axis Underwriting Agent.

## Stack
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State**: Zustand
- **HTTP**: Axios
- **Icons**: Lucide React

## Pages

| Route | Page | Description |
|---|---|---|
| /login | LoginPage | JWT login |
| /dashboard | DashboardPage | All cases table + stats |
| /upload | UploadPage | Submit new case with PDF upload |
| /jobs/:id | JobStatusPage | Live pipeline progress via WebSocket |
| /review/:id | ReviewPage | HIL review + Approve/Refer/Decline |

## Local development

```bash
# 1. Install
npm install

# 2. Start dev server (proxies /api to localhost:10000)
npm run dev
```

Frontend runs at `http://localhost:3000`  
Make sure the backend is running on port 10000.

## Docker

```bash
# Build image (multi-stage: builds React then serves with Express)
docker build -t ua-frontend .

# Run
docker run -p 3000:3000 -e APP_API_URL=http://ua-backend:10000 ua-frontend
```

## Environment variables

| Variable | Description |
|---|---|
| VITE_API_URL | Backend URL (used during `npm run dev`) |
| APP_API_URL | Backend URL used by the Express proxy (Docker/production) |
