# Virtual Staging App

## Overview
AI-powered virtual staging application that lets users upload photos of empty rooms and automatically adds furniture using OpenAI's gpt-image-1 model. One-click staging with multiple design styles.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI gpt-image-1 via Replit AI Integrations (no API key needed)

## Key Features
- Drag & drop image upload
- Room type selection (Living Room, Bedroom, Kitchen, etc.)
- Design style selection (Modern, Minimalist, Scandinavian, etc.)
- Before/after comparison slider
- Staging history
- Download staged results
- Dark/light theme toggle

## Project Structure
- `client/src/pages/home.tsx` - Main page with all staging UI
- `client/src/components/` - Reusable components (image-upload, style-selector, before-after, staging-history, theme-*)
- `server/routes.ts` - API endpoints (/api/staging)
- `server/storage.ts` - Database storage layer
- `server/db.ts` - PostgreSQL connection
- `shared/schema.ts` - Data models (stagingProjects table)

## API Endpoints
- `GET /api/staging` - Get all staging projects
- `GET /api/staging/:id` - Get single project
- `POST /api/staging` - Create new staging (body: { image: base64, roomType, style })

## Design Tokens
- Primary color: Blue (210 hue)
- Font: Inter
- Supports dark mode via class toggle

## Recent Changes
- 2026-02-18: Initial MVP build with image upload, AI staging, before/after comparison
