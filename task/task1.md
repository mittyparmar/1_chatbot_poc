# Task 1: Foundation Setup

## Overview
This task focuses on setting up the foundational infrastructure for the chatbot application, including the microfrontend architecture, Kubernetes cluster, CI/CD pipeline, and basic database infrastructure.

## Objectives
- Configure microfrontend architecture with Module Federation
- Set up Kubernetes cluster and containerization
- Implement CI/CD pipeline with GitHub Actions
- Initialize database and caching infrastructure
- Establish basic project structure and development environment

## Detailed Steps

### 1.1 Project Structure Setup
```bash
# Create project directory structure
mkdir -p chatbot-app
cd chatbot-app

# Create main directories
mkdir -p frontend/{shell,auth,chat,admin,profile} shared-ui backend/{gateway,auth,chat,admin,personalization,data,ai} infrastructure docs

# Initialize git repository
git init
git add .
git commit -m "Initial project structure"
```

### 1.2 Frontend Microfrontend Setup

#### 1.2.1 Shell Application
```bash
cd frontend/shell
npm init -y
npm install react react-dom react-router-dom webpack webpack-cli webpack-dev-server @module-federation/webpack-plugin
npm install typescript @types/react @types/react-dom @types/react-router-dom --save-dev
```

**shell/webpack.config.js**:
```javascript
const { ModuleFederationPlugin } = require('@module-federation/webpack-plugin');
const deps = require('./package.json').dependencies;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        chat: 'chat@http://localhost:3002/remoteEntry.js',
        admin: 'admin@http://localhost:3003/remoteEntry.js',
        profile: 'profile@http://localhost:3004/remoteEntry.js',
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
      },
    }),
  ],
};
```

**shell/src/App.tsx**:
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <nav>
          <h1>Chatbot Application</h1>
        </nav>
        <main>
          <Routes>
            <Route path="/auth" element={<div>Loading Auth Module...</div>} />
            <Route path="/chat" element={<div>Loading Chat Module...</div>} />
            <Route path="/admin" element={<div>Loading Admin Module...</div>} />
            <Route path="/profile" element={<div>Loading Profile Module...</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
```

#### 1.2.2 Shared UI Components
```bash
cd shared-ui
npm init -y
npm install react react-dom typescript @types/react @types/react-dom --save-dev
```

**shared-ui/src/components/Button.tsx**:
```typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### 1.3 Backend Infrastructure Setup

#### 1.3.1 Docker Configuration
**backend/Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 1.3.2 Kubernetes Configuration
**infrastructure/k8s/namespace.yaml**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: chatbot-app
```

**infrastructure/k8s/configmap.yaml**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: chatbot-app
data:
  database-url: "postgresql://postgres:password@postgres:5432/chatbot"
  redis-url: "redis://redis:6379"
  jwt-secret: "your-secret-key-here"
```

### 1.4 CI/CD Pipeline Setup

#### 1.4.1 GitHub Actions Configuration
**.github/workflows/ci.yml**:
```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, backend]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        if [ "${{ matrix.service }}" = "frontend" ]; then
          cd frontend
          npm ci
        else
          cd backend
          npm ci
        fi
    
    - name: Run tests
      run: |
        if [ "${{ matrix.service }}" = "frontend" ]; then
          cd frontend
          npm test
        else
          cd backend
          npm test
        fi

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      run: |
        docker build -t chatbot-app:${{ github.sha }} .
        docker push chatbot-app:${{ github.sha }}
```

### 1.5 Database Infrastructure

#### 1.5.1 PostgreSQL Setup
**infrastructure/database/init.sql**:
```sql
-- Create database
CREATE DATABASE chatbot;
CREATE USER chatbot_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot TO chatbot_user;

-- Connect to chatbot database
\c chatbot;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "jsonb";

-- Create tables (basic structure)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    admin_id UUID REFERENCES users(id),
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_type VARCHAR(50) DEFAULT 'text'
);
```

#### 1.5.2 Redis Configuration
**infrastructure/redis/redis.conf**:
```conf
bind 0.0.0.0
port 6379
maxmemory 256mb
maxmemory-policy allkeys-lru
requirepass your-redis-password
```

### 1.6 Development Environment Setup

#### 1.6.1 VS Code Configuration
**.vscode/settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### 1.6.2 Environment Variables
**frontend/.env.example**:
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_AUTH_URL=http://localhost:3001
```

**backend/.env.example**:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/chatbot
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
```

## Deliverables

1. ✅ Complete project directory structure
2. ✅ Shell application with Module Federation configuration
3. ✅ Shared UI components library
4. ✅ Docker configuration for all services
5. ✅ Kubernetes namespace and ConfigMap
6. ✅ CI/CD pipeline with GitHub Actions
7. ✅ Database initialization scripts
8. ✅ Redis configuration
9. ✅ Development environment setup
10. ✅ Environment variable templates

## Success Criteria

- Microfrontend architecture can load remote modules
- Docker containers can be built successfully
- CI/CD pipeline runs without errors
- Database can be initialized and connected
- Development environment is properly configured

## Dependencies

- Node.js 18+
- Docker
- Kubernetes cluster (local or cloud)
- GitHub account for CI/CD
- PostgreSQL database
- Redis server

## Notes

- Use local Kubernetes cluster (minikube, kind) for development
- Ensure all services can communicate properly
- Test Module Federation loading in development
- Database migrations should be handled in subsequent tasks
- Security configurations will be enhanced in later tasks