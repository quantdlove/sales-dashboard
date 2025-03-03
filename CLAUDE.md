# CLAUDE.md - Repository Guide

## About This Project
This is a Next.js Sales Dashboard application that tracks leads and their progression through a pipeline. 
The app connects to a Supabase backend to fetch and update lead data.

## Build & Test Commands
- Install: `npm install`
- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Environment Variables
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - The URL of your Supabase instance
- `SUPABASE_SERVICE_ROLE_KEY` - The service role key for Supabase
- `API_KEY` - API key for securing API endpoints

## Code Style Guidelines
- **Formatting**: Use Prettier with default settings
- **Imports**: Group imports (1. built-in, 2. external, 3. internal)
- **Types**: Use TypeScript with strict mode enabled
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes and types
  - UPPER_SNAKE_CASE for constants
- **Error Handling**: Use try/catch for async code, prefer explicit error types
- **Documentation**: JSDoc for public APIs, inline comments for complex logic
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind CSS for styling

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable React components
- `/public` - Static assets
- `next.config.js` - Next.js configuration