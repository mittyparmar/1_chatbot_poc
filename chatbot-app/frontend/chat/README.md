# Chat Microfrontend

This is the Chat microfrontend for the Chatbot Application, built with React, TypeScript, and Module Federation.

## Features

- Real-time messaging with WebSocket support
- Conversation list with search and filtering
- Message typing indicators
- File attachment support
- Message reactions and reactions
- Message editing and deletion
- Responsive design with Apple-inspired UI
- Dark mode support
- Accessibility features

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Webpack 5 + Module Federation
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks
- **Testing**: Jest + React Testing Library
- **Containerization**: Docker + Nginx

## Project Structure

```
chat/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx         # Main application component
│   │   ├── ConversationList.tsx  # Conversation list component
│   │   └── ChatInterface.tsx     # Chat interface component
│   ├── index.tsx           # Application entry point
│   └── App.tsx             # Main application component
├── public/
│   └── index.html          # HTML template
├── .github/workflows/
│   └── ci.yml              # CI/CD pipeline
├── package.json            # Dependencies and scripts
├── webpack.config.js       # Webpack configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbot-app/frontend/chat
```

2. Install dependencies:
```bash
npm install
```

3. Install shared UI dependencies:
```bash
cd ../../shared-ui
npm install
cd ../frontend/chat
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration.

### Development Server

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3002`.

### Building

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## Docker

### Building the Docker Image

```bash
docker build -t chatbot-app/chat-microfrontend:latest .
```

### Running with Docker Compose

```bash
docker-compose up -d
```

## Kubernetes

### Deployment

Apply the Kubernetes configuration:
```bash
kubectl apply -f infrastructure/k8s/
```

### Checking Deployment Status

```bash
kubectl get pods -n chatbot-app -l app=chat-microfrontend
kubectl get svc -n chatbot-app
kubectl get ingress -n chatbot-app
```

## Module Federation

This microfrontend uses Module Federation to share dependencies and components with other microfrontends.

### Exposed Components

- `App` - Main application component

### Shared Dependencies

- React
- React DOM
- React Router DOM

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `REACT_APP_API_URL` | API base URL | `http://localhost:3000` |
| `REACT_APP_WS_URL` | WebSocket URL | `ws://localhost:3000` |
| `REACT_APP_SOCKET_URL` | Socket.IO URL | `http://localhost:3002` |
| `REACT_APP_AUTH_URL` | Authentication service URL | `http://localhost:3001` |
| `REACT_APP_ENABLE_TYPING_INDICATORS` | Enable typing indicators | `true` |
| `REACT_APP_ENABLE_FILE_ATTACHMENTS` | Enable file attachments | `true` |
| `REACT_APP_ENABLE_MESSAGE_REACTIONS` | Enable message reactions | `true` |
| `REACT_APP_ENABLE_MESSAGE_EDITING` | Enable message editing | `true` |
| `REACT_APP_ENABLE_MESSAGE_DELETION` | Enable message deletion | `true` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `REACT_APP_ANALYTICS_ID` | Analytics ID | - |
| `REACT_APP_DEV_TOOLS` | Enable development tools | `true` |
| `REACT_APP_HOT_RELOAD` | Enable hot reload | `true` |

## API Integration

### Authentication

The chat microfrontend integrates with the authentication service for user management.

### WebSocket Events

- `join-conversation` - Join a conversation
- `leave-conversation` - Leave a conversation
- `send-message` - Send a message
- `typing` - Send typing indicator
- `new-message` - Receive new message
- `user-typing` - Receive typing indicator

## Performance

### Optimization

- Code splitting with Webpack
- Lazy loading of components
- Image optimization
- Caching strategies
- Bundle analysis

### Monitoring

- Performance metrics collection
- Error tracking
- User behavior analytics

## Security

### Best Practices

- Input validation
- XSS protection
- CSRF protection
- Secure headers
- Rate limiting

### Dependencies

- Regular security updates
- Dependency scanning
- Vulnerability assessment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting
6. Submit a pull request

## License

This project is licensed under the MIT License.