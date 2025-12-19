# IMS Dashboard

A modern IoT alarm management and monitoring dashboard with AI-powered chat interface for refrigeration device analytics.

## Overview

IMS Dashboard is a comprehensive monitoring solution for IoT refrigeration devices. It provides real-time alarm management, visual flow-based configuration editing, and an AI-powered chat interface for analyzing device data and generating insights.

## Features

- **AI Chat Interface** - Natural language interaction for device analytics with CSV file upload support
- **Flow Editor** - Visual React Flow-based alarm pattern configuration
- **Alarm Management** - Real-time monitoring and management of device alarms
- **Authentication** - Secure user authentication with Appwrite
- **Real-time Updates** - Live data synchronization via Appwrite Realtime
- **Responsive Design** - Modern glass-morphism UI optimized for all screen sizes

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework with concurrent features |
| TypeScript | 5.6 | Type-safe development |
| Vite | 6.0 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| TanStack Query | 5.x | Server state management |
| React Flow | 11.x | Visual flow editor |
| Appwrite | 17.x | Backend-as-a-Service (Auth, Database, Storage, Functions) |
| GSAP | 3.x | Animations |
| React Router | 7.x | Client-side routing |

## Project Structure

```
src/
├── api/                    # API layer
│   ├── middleware/         # API client utilities and error handling
│   └── services/           # Service modules (auth, chat, alarms)
├── assets/                 # Static assets (images, icons)
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface components
│   │   ├── core/           # Main chat container
│   │   ├── messages/       # Message display components
│   │   ├── input/          # Input and file upload
│   │   ├── display/        # Data visualization (graphs, tables)
│   │   └── feedback/       # Loading states, errors
│   ├── common/             # Shared/reusable components
│   ├── explore/            # Exploration features
│   ├── flow/               # React Flow editor components
│   └── layout/             # Layout components (MainLayout, Sidebar)
├── config/                 # Configuration files
├── constants/              # Application constants
├── context/                # React Context providers
├── errors/                 # Custom error classes
├── hooks/                  # Custom React hooks
├── lib/                    # Third-party library configurations
├── pages/                  # Page components
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure the following variables in `.env`:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance/v1
VITE_APPWRITE_PROJECT_ID=your-project-id

# Function IDs
VITE_FN_ALARM_MANAGEMENT=fn-alarm-management
VITE_FN_CHAT_API=fn-chat-api
VITE_FN_CHAT_PROCESSOR=fn-chat-processor
VITE_FN_VECTOR_SEARCH=fn-vector-search
VITE_FN_JOB_WORKER=fn-job-worker

# Storage and Database
VITE_STORAGE_BUCKET=refrigeration-files
VITE_DATABASE_ID=iot_alarm_management
VITE_COLLECTION_MESSAGES=messages
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Appwrite instance (cloud or self-hosted)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd IMS_Trojan_horse
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see Environment Setup above)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## Contributing

1. Create a feature branch from `dev`
2. Make your changes following the existing code style
3. Ensure all linting passes: `npm run lint`
4. Build successfully: `npm run build`
5. Submit a pull request to `dev`

### Code Style Guidelines

- Use TypeScript for all new files
- Follow existing component patterns and folder structure
- Use path aliases (`@components/`, `@hooks/`, etc.) for imports
- Prefer named exports with barrel files (index.ts)

## License

Proprietary - All rights reserved
