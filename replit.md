# AI Agent Management System

## Overview

This is a full-stack web application for managing AI agents. It's built with React (frontend) and Express.js (backend), using a PostgreSQL database with Drizzle ORM for data persistence. The system allows users to create, manage, and interact with AI agents through a modern web interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon Database serverless driver
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Structure**: RESTful API with `/api` prefix
- **Build System**: ESBuild for production bundling

### Database Schema
The application uses two main entities:
- **Users**: Basic user authentication with username/password
- **Agents**: AI agents with name, creator, and creation timestamp

## Key Components

### Frontend Components
- **Dashboard**: Main application interface displaying agents table
- **Sidebar**: Navigation menu with branding and menu items
- **AgentsTable**: Data table for displaying and managing agents
- **AudioControls**: Audio playback controls for agent interactions
- **UI Components**: Comprehensive set of reusable components from Shadcn/ui

### Backend Components
- **Storage Interface**: Abstraction layer for data operations
- **Memory Storage**: In-memory storage implementation for development
- **Route Registration**: Centralized route management system
- **Vite Integration**: Development server with HMR support

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests to backend API endpoints
2. **API Processing**: Express.js handles requests and validates data
3. **Database Operations**: Drizzle ORM executes database queries
4. **Response Handling**: Results are returned as JSON responses
5. **UI Updates**: TanStack Query manages cache updates and UI re-renders

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database driver
- **drizzle-orm**: TypeScript-first ORM for PostgreSQL
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Minimalist routing library
- **react-hook-form**: Form state management
- **zod**: TypeScript-first schema validation

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production
- **drizzle-kit**: Database migration toolkit

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: PostgreSQL via environment variable
- **Build Command**: `npm run dev`

### Production Environment
- **Frontend**: Static build via Vite to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: PostgreSQL connection via DATABASE_URL
- **Start Command**: `npm start`

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Centralized in `shared/schema.ts`
- **Push Command**: `npm run db:push`

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup