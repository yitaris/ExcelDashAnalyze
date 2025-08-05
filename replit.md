# Excel Data Analysis Dashboard

## Overview

This is a full-stack web application that provides Excel file upload, data analysis, and visualization capabilities. Users can upload Excel files (.xlsx, .xls), view statistical analysis of the data, and generate interactive charts and visualizations. The application features a modern React frontend with a comprehensive UI component library, powered by an Express.js backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** and **Vite** as the build tool. The application follows a component-based architecture with:

- **shadcn/ui component library** providing a complete set of accessible, customizable UI components built on Radix UI primitives
- **Tailwind CSS** for styling with a comprehensive design system including custom color variables
- **TanStack React Query** for server state management, caching, and data fetching
- **Wouter** as a lightweight client-side routing solution
- **Recharts** for data visualization and charting capabilities
- **React Hook Form** with Zod validation for form handling

The frontend is organized into logical directories:
- `/components` - Reusable UI components and business logic components
- `/pages` - Route-level components (Dashboard, NotFound)
- `/hooks` - Custom React hooks for file upload and mobile detection
- `/lib` - Utility functions, query client configuration, and helper libraries

### Backend Architecture
The server uses **Express.js** with **TypeScript** in an ESM module setup. Key architectural decisions include:

- **File upload handling** with Multer middleware supporting Excel file validation and size limits (10MB)
- **Excel processing** using the XLSX library to parse spreadsheet data and extract multiple sheets
- **Statistical analysis engine** that calculates comprehensive statistics for each column (mean, median, standard deviation, etc.)
- **RESTful API design** with proper error handling and request/response logging
- **Memory-based storage** implementation for development with interface abstraction for easy database migration

### Data Storage Solutions
The application uses **Drizzle ORM** with **PostgreSQL** (specifically Neon Database) for production data persistence:

- **Schema-first approach** with TypeScript types generated from database schema
- **Two main entities**: `excelFiles` for file metadata and `excelData` for processed sheet content
- **JSONB columns** for flexible storage of headers, data arrays, and statistical analysis results
- **Cascade deletion** ensuring data integrity when files are removed
- **Development fallback** to in-memory storage when database is unavailable

### Authentication and Authorization
Currently implements a **session-based approach** with:
- Session storage using `connect-pg-simple` for PostgreSQL session persistence
- Basic request validation and error handling
- No user authentication implemented (suitable for single-user or trusted environment)

## External Dependencies

### Database Services
- **Neon Database** (via `@neondatabase/serverless`) - Serverless PostgreSQL hosting
- **Drizzle ORM** - Type-safe database access layer with migration support

### File Processing
- **XLSX** - Excel file parsing and data extraction
- **Multer** - Express middleware for handling multipart/form-data file uploads

### Frontend Libraries
- **Radix UI** - Comprehensive set of accessible, unstyled UI primitives
- **Recharts** - React charting library built on D3
- **React Dropzone** - File drag-and-drop functionality
- **Date-fns** - Modern JavaScript date utility library

### Development Tools
- **Vite** - Fast build tool with HMR support
- **ESBuild** - Fast JavaScript bundler for production builds
- **TypeScript** - Static type checking across the entire stack
- **Tailwind CSS** - Utility-first CSS framework

### Replit Integration
- **Replit-specific plugins** for development environment integration
- **Runtime error overlay** for enhanced debugging experience
- **Cartographer** for enhanced development workflow within Replit