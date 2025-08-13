# Overview

This is a comprehensive legal office management system built with modern web technologies. The application provides a complete solution for managing legal cases, clients, documents, tasks, and users in a law firm environment. The system features a bilingual interface with Arabic RTL support and role-based access control for administrators, lawyers, and secretaries.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a modern React-based architecture with TypeScript for type safety. The application is built with Vite for fast development and optimized production builds. The UI leverages Radix UI components styled with shadcn/ui design system and Tailwind CSS for responsive styling. State management is handled through TanStack Query (React Query) for server state, with React Hook Form and Zod for form validation. Client-side routing is implemented using Wouter for lightweight navigation.

## Backend Architecture
The server runs on Node.js with Express.js framework, utilizing TypeScript and ES modules. The RESTful API design includes comprehensive CRUD operations for all entities (users, clients, cases, tasks, documents). Authentication is implemented using Passport.js with local strategy and session-based authentication. File uploads are handled through Multer middleware with disk storage configuration. The server includes role-based access control middleware and audit logging capabilities.

## Database Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and schema management. The database schema includes comprehensive tables for users, clients, cases, tasks, documents, and audit logs with proper relationships and constraints. Database migrations are managed through Drizzle Kit, and the system is configured to work with Neon serverless PostgreSQL.

## Authentication & Authorization
The system implements session-based authentication with encrypted password storage using Node.js crypto module. Role-based access control supports three user types: admin, lawyer, and secretary, each with appropriate permissions. Session management includes memory store for development with configurable session expiry and security settings.

## File Management
Document management includes support for multiple file types (PDF, DOC, DOCX, TXT, images) with file size limits and type validation. Files are stored locally with unique naming conventions and organized by upload date. The system includes document categorization by type and association with cases or clients.

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL serverless database hosting
- **Drizzle ORM**: Type-safe database operations and migrations

## UI & Styling Libraries
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component system
- **Lucide React**: Icon library

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation

## Authentication & Security
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **bcrypt/crypto**: Password hashing and encryption

## File Handling
- **Multer**: File upload middleware
- **File System**: Local file storage

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Date & Internationalization
- **date-fns**: Date formatting and manipulation with Arabic locale support