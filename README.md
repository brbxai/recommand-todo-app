# Todo App

A simple Todo application built with the Recommand Framework.

## Overview

This Todo app demonstrates how to build applications using the Recommand Framework. It provides a complete API for managing tasks with features for creating, reading, updating, and deleting todo items.

## Features

- Create new todo tasks
- List all tasks
- Mark tasks as completed
- Update task details
- Delete tasks
- Simple database schema with PostgreSQL

## Prerequisites

- [Recommand Framework](https://github.com/brbxai/recommand-framework) installed and configured
- [Recommand Framework Core](https://github.com/brbxai/recommand-core) installed and configured
- PostgreSQL database
- [Bun](https://bun.sh)

## Installation

```bash
# Install dependencies
bun install
```

## Database Setup

This app uses Drizzle ORM with PostgreSQL. The database schema is defined in `db/schema.ts`.

```bash
# Generate database migrations
bun run db:generate
```

## Application Structure

```
todo-app/
├── api/               # API endpoint definitions
│   └── tasks.ts       # Tasks API endpoints
├── app/               # Frontend components
├── db/                # Database configuration
│   ├── drizzle/       # Migration files
│   └── schema.ts      # Database schema for tasks
├── index.ts           # Main application entry point
└── tsconfig.json      # TypeScript configuration
```

## API Endpoints

The application provides the following API endpoints:

- `GET /api/todo-app/tasks` - List all tasks
- `POST /api/todo-app/tasks` - Create a new task
- `GET /api/todo-app/tasks/:id` - Get a specific task
- `PATCH /api/todo-app/tasks/:id` - Update a task
- `DELETE /api/todo-app/tasks/:id` - Delete a task

## Running the Application

The Todo app is automatically loaded and integrated when you run the Recommand Framework server:

```bash
# From the recommand-framework directory:
bun run dev
```

This will start both the server and client in development mode, and the Todo app will be available through the framework.