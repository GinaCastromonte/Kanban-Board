# Goals Board Application

## Overview

This is a personal goal tracking application built as a full-stack web application with a Kanban-style interface. The app allows users to create, organize, and track their goals across different columns (Todo, Doing, Done) with additional features like wins tracking, commenting, and drag-and-drop functionality. The application uses a modern tech stack with React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Drag & Drop**: @dnd-kit for Kanban board interactions
- **Forms**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for CRUD operations
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Type-safe database schemas with Zod validation
- **Tables**: boards, columns, goals, comments, users with proper relationships
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

### Authentication & Authorization
- **Session Management**: Prepared for connect-pg-simple session store
- **User System**: Basic user schema with username/password structure
- **Authorization**: Prepared infrastructure but not fully implemented

### Key Features
- **Kanban Board**: Drag-and-drop goal management across columns
- **Goal Types**: Support for short-term and long-term goals
- **Progress Tracking**: Subtask completion tracking with progress bars
- **Wins Section**: Special area for celebrating completed achievements
- **Commenting System**: Goal-specific commenting with real-time updates
- **Dark Theme**: Complete dark mode UI with custom color palette

### Development Workflow
- **Hot Reload**: Vite development server with HMR
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Database Management**: Drizzle kit for schema migrations
- **Error Handling**: Centralized error handling with user-friendly messages
- **Logging**: Request/response logging for API endpoints

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing
- **express**: Node.js web framework

### Database & ORM
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration tooling
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **@dnd-kit/***: Modern drag and drop toolkit for React
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for constructing className strings conditionally

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins

### Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation library

### Utility Libraries
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: Secure URL-friendly unique string ID generator
- **lucide-react**: Beautiful hand-crafted SVG icons for React