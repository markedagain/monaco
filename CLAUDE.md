# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs Vite build)
- **Preview production build**: `npm run preview`

## Project Architecture

This is a vanilla JavaScript web application that demonstrates Monaco SQL Languages functionality. The project is a website/demo for the monaco-sql-languages library.

### Key Components

- **main.js**: Application entry point that initializes the editor
- **editor.js**: Monaco editor setup and configuration
  - Creates the editor instance with SQL language support
  - Handles language switching between SQL dialects
  - Implements SQL validation and parsing functionality
- **src/languages/**: SQL language configuration and setup
  - Configures multiple SQL dialects (Flink, Spark, Hive, MySQL, Trino, PostgreSQL, Impala)
  - Handles custom DTStack parameter preprocessing (`@@{componentParams}`, `${taskCustomParams}`)
  - Sets up completion services and language features
- **config.js**: Language configuration and constants

### Architecture Notes

- Monaco Editor (v0.31.0) for code editing
- Monaco SQL Languages (v0.15.1) for SQL language support
- Vite for build tooling
- Pure JavaScript - no TypeScript
- No framework dependencies - ready for migration to Vue.js or other frameworks
- Completely standalone project with no parent directory dependencies

### Build Output

- Production builds output to `dist` directory (default Vite behavior)
- Base path set to `/` for deployment

### Package Manager

- Uses npm for package management
- Node.js >=18 required