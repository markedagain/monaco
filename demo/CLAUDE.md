# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs Vite build)
- **Preview production build**: `npm run preview`

## Project Architecture

This is a Vue 3 web application that demonstrates Monaco SQL Languages functionality. The project is a website/demo for the monaco-sql-languages library.

### Key Components

- **src/main.js**: Vue 3 application entry point that creates and mounts the app
- **src/App.vue**: Main Vue component containing application state and logic
  - Manages Monaco editor instance and SQL language service
  - Handles language switching between SQL dialects  
  - Implements SQL validation and parsing functionality
- **src/components/MonacoEditor.vue**: Vue component wrapping Monaco editor
  - Creates the editor instance with SQL language support
  - Handles editor lifecycle and content changes
- **src/components/LanguageSelector.vue**: Language selection dropdown component
- **src/components/OutputPanel.vue**: Output display component for validation and parse results
- **src/languages/**: SQL language configuration and setup
  - Configures multiple SQL dialects (Flink, Spark, Hive, MySQL, Trino, PostgreSQL, Impala)
  - Handles custom DTStack parameter preprocessing (`@@{componentParams}`, `${taskCustomParams}`)
  - Sets up completion services and language features
- **src/config.js**: Language configuration and constants

### Architecture Notes

- Vue 3 (v3.5.18) with Composition API for reactive UI components
- Monaco Editor (v0.50.0) for code editing
- Monaco SQL Languages (v0.15.1) for SQL language support
- Vite for build tooling with Vue plugin support
- Component-based architecture with clear separation of concerns
- Pure JavaScript - no TypeScript
- Demo project that showcases monaco-sql-languages library features

### Build Output

- Production builds output to `dist` directory (default Vite behavior)
- Base path set to `/` for deployment

### Package Manager

- Uses npm for package management
- Node.js >=18 required