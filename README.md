# Swabhimaan NGO Website

This repository contains a React frontend and Python FastAPI backend for a responsive NGO website inspired by the provided Swabhimaan design.

## Features
- Responsive React frontend compatible with mobile and laptop screens
- Python FastAPI backend with public content APIs
- AWS S3 image upload endpoint
- Admin video post endpoint at `/api/admin/videos`
- Separate admin UI route at `/Admin`

## Structure
- `frontend/` – React + Vite application
- `backend/` – FastAPI application with AWS image upload and admin endpoints

## Local setup

### Backend
1. Create a virtual environment and install dependencies:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
2. Copy the example env file and configure AWS:
   ```powershell
   copy .env.example .env
   ```
3. Start the backend:
   ```powershell
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend
1. Install dependencies:
   ```powershell
   cd ..\frontend
   npm install
   ```
2. Start the frontend development server:
   ```powershell
   npm run dev
   ```
3. Open the site at the URL shown by Vite.

## AWS deployment notes
- Backend can be deployed to AWS Elastic Beanstalk, ECS, or AWS Lambda using an ASGI container.
- Frontend can be deployed to AWS Amplify, S3 + CloudFront, or any static hosting provider.
- Use environment variables for AWS credentials and the admin token.

## Environment variables
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `ADMIN_TOKEN`
- Optional: `AWS_ENDPOINT_URL` for local S3-compatible testing

## Admin
- Admin endpoint: `POST /api/admin/videos`
- The frontend also provides a separate admin route at `/Admin`
- The backend expects the admin token in the `X-Admin-Token` header

## Notes
- Image upload uses AWS S3 public-read uploads.
- The backend serves static data for core sections and can be extended with a database.
