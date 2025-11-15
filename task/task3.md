# Task 3: Frontend Development

## Overview
This task focuses on developing the frontend microfrontend components that form the user interface of the chatbot application. We'll build the Shell Application, Authentication Microfrontend, Chat Microfrontend, Admin Microfrontend, and Profile Microfrontend with Apple-inspired UI design.

## Objectives
- Build Shell Application with routing and navigation
- Develop Authentication Microfrontend with login/register forms
- Create Chat Microfrontend with real-time messaging interface
- Build Admin Microfrontend with dashboard and management tools
- Develop Profile Microfrontend with user settings
- Implement shared UI components and styling system
- Set up Apple-inspired design system

## Detailed Steps

### 3.1 Shell Application Development

#### 3.1.1 Enhanced Shell Setup
```bash
cd frontend/shell
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom react-query @tanstack/react-query socket.io-client
npm install axios react-hook-form @hookform/resolvers zod
```

**shell/src/App.tsx**:
```typescript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
      light: '#5AC8FA',
      dark: '#0051D5',
    },
    secondary: {
      main: '#FF3B30',
      light: '#FF6B6B',
      dark: '#D70015',
    },
    background: {
      default: '#F2F2F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="app">
        {user && <Navigation currentRoute={currentRoute} />}
        <main className="main-content">
          <Routes>
            <Route path="/auth" element={
              user ? <Navigate to="/chat" replace /> : <div className="remote-container" data-module="auth" />
            } />
            <Route path="/chat" element={
              user ? <div className="remote-container" data-module="chat" /> : <Navigate to="/auth" replace />
            } />
            <Route path="/admin" element={
              user && user.role === 'admin' ? <div className="remote-container" data-module="admin" /> : <Navigate to="/chat" replace />
            } />
            <Route path="/profile" element={
              user ? <div className="remote-container" data-module="profile" /> : <Navigate to="/auth" replace />
            } />
            <Route path="/" element={
              user ? <Navigate to="/chat" replace /> : <Navigate to="/auth" replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

#### 3.1.2 Navigation Component
**shell/src/components/Navigation.tsx**:
```typescript
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Chat as ChatIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  currentRoute: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    handleMenuClose();
  };

  const navItems = [
    { path: '/chat', label: 'Chat', icon: <ChatIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: <AdminIcon /> });
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chatbot Assistant
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                backgroundColor: currentRoute === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {user?.name}
          </Typography>
          <IconButton
            size="small"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
```

### 3.2 Authentication Microfrontend

#### 3.2.1 Auth Microfrontend Setup
```bash
cd frontend/auth
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom react-query axios react-hook-form @hookform/resolvers zod
npm install socket.io-client
```

**auth/src/App.tsx**:
```typescript
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { LoadingSpinner } from '../components/LoadingSpinner';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
    },
    secondary: {
      main: '#FF3B30',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
});

export const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Redirect to chat if already logged in
    return <Navigate to="/chat" replace />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <div className="auth-container">
              <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

#### 3.2.2 Login Form Component
**auth/src/components/LoginForm.tsx**:
```typescript
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearError();
    
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size={20} /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to forgot password
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to register
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
```

### 3.3 Chat Microfrontend

#### 3.3.1 Chat Microfrontend Setup
```bash
cd frontend/chat
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom react-query socket.io-client axios
npm install react-hook-form @hookform/resolvers zod
```

**chat/src/App.tsx**:
```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../contexts/ChatContext';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { FileAttachment } from '../components/FileAttachment';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormData = z.infer<typeof messageSchema>;

export const App: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    currentConversation,
    startNewConversation 
  } = useChat();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      // Add message to the conversation
      console.log('New message received:', data);
    };

    const handleUserTyping = (data: any) => {
      setIsTyping(data.typing);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket]);

  const handleSendMessage = async (data: MessageFormData) => {
    if (!currentConversation) {
      // Start new conversation
      await startNewConversation();
      return;
    }

    try {
      await sendMessage(data.content);
      reset();
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic
      console.log('File selected:', file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleSendMessage)();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Chat Header */}
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {currentConversation?.title?.charAt(0).toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {currentConversation?.title || 'New Conversation'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isConnected ? 'Online' : 'Connecting...'}
            </Typography>
          </Box>
          <IconButton>
            <MoreIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              <MessageBubble message={msg} />
              {index < messages.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input Area */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <form onSubmit={handleSubmit(handleSendMessage)}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <IconButton 
              color="primary" 
              onClick={() => fileInputRef.current?.click()}
              sx={{ p: 1 }}
            >
              <AttachFileIcon />
            </IconButton>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <TextField
              {...register('content')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              multiline
              maxRows={4}
              fullWidth
              variant="outlined"
              error={!!errors.content}
              helperText={errors.content?.message}
              disabled={isLoading || !isConnected}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <IconButton color="primary" sx={{ p: 1 }}>
              <EmojiIcon />
            </IconButton>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !isConnected || !message.trim()}
              sx={{ borderRadius: 2, minWidth: 'auto' }}
            >
              <SendIcon />
            </Button>
          </Box>
        </form>
      </Paper>

      {isLoading && (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};
```

#### 3.3.2 Message Bubble Component
**chat/src/components/MessageBubble.tsx**:
```typescript
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../types/Message';

interface MessageBubbleProps {
  message: Message;
  onDownload?: (attachment: any) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onDownload,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isUserMessage, setIsUserMessage] = React.useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (attachment: any) => {
    onDownload?.(attachment);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    handleMenuClose();
  };

  // Determine if message is from user (you would get this from context)
  // For now, we'll use a simple heuristic
  React.useEffect(() => {
    // This would be determined by your application logic
    setIsUserMessage(message.senderId === 'current-user-id');
  }, [message.senderId]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
      mb: 1,
    }}>
      {!isUserMessage && (
        <Avatar 
          sx={{ 
            mr: 1, 
            bgcolor: 'primary.main',
            width: 32, 
            height: 32 
          }}
        >
          {message.senderId?.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column' }}>
        {!isUserMessage && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ mb: 0.5, ml: 1 }}
          >
            {message.senderName || 'Support Agent'}
          </Typography>
        )}

        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: isUserMessage ? 'primary.main' : 'background.paper',
            color: isUserMessage ? 'white' : 'text.primary',
            position: 'relative',
          }}
        >
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>

          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {message.attachments.map((attachment, index) => (
                <FileAttachment 
                  key={index} 
                  attachment={attachment} 
                  onDownload={() => handleDownload(attachment)}
                />
              ))}
            </Box>
          )}

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: isUserMessage ? 'rgba(255,255,255,0.2)' : 'divider',
          }}>
            <Typography 
              variant="caption" 
              color={isUserMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
            >
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </Typography>

            {isUserMessage && (
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Paper>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {message.attachments?.map((attachment, index) => (
            <MenuItem key={index} onClick={() => handleDownload(attachment)}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Download {attachment.name}
            </MenuItem>
          ))}
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Message
          </MenuItem>
        </Menu>
      </Box>

      {isUserMessage && (
        <Avatar 
          sx={{ 
            ml: 1, 
            bgcolor: 'secondary.main',
            width: 32, 
            height: 32 
          }}
        >
          You
        </Avatar>
      )}
    </Box>
  );
};
```

### 3.4 Admin Microfrontend

#### 3.4.1 Admin Dashboard Setup
```bash
cd frontend/admin
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom react-query axios @tanstack/react-table
npm install recharts date-fns
```

**admin/src/App.tsx**:
```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ConversationList } from '../components/ConversationList';
import { UserAnalytics } from '../components/UserAnalytics';
import { SystemMetrics } from '../components/SystemMetrics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConversationClick = (conversation: any) => {
    setSelectedConversation(conversation);
    setConversationDialogOpen(true);
  };

  const handleCloseConversationDialog = () => {
    setConversationDialogOpen(false);
    setSelectedConversation(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Admin Header */}
      <Paper sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage conversations, users, and system analytics
        </Typography>
      </Paper>

      {/* Tab Navigation */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<ChatIcon />}
            iconPosition="start"
            label="Conversations"
            id="admin-tab-0"
            aria-controls="admin-tabpanel-0"
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Users"
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />
          <Tab
            icon={<AnalyticsIcon />}
            iconPosition="start"
            label="Analytics"
            id="admin-tab-2"
            aria-controls="admin-tabpanel-2"
          />
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="Settings"
            id="admin-tab-3"
            aria-controls="admin-tabpanel-3"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <ConversationList onConversationClick={handleConversationClick} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserAnalytics />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SystemMetrics />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure system-wide settings and preferences
            </Typography>
            {/* Settings content would go here */}
          </Paper>
        </TabPanel>
      </Box>

      {/* Conversation Detail Dialog */}
      <Dialog
        open={conversationDialogOpen}
        onClose={handleCloseConversationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Conversation Details
          {selectedConversation && (
            <Chip
              label={selectedConversation.status}
              size="small"
              sx={{ ml: 2 }}
              color={
                selectedConversation.status === 'active' 
                  ? 'success' 
                  : selectedConversation.status === 'ended' 
                    ? 'default' 
                    : 'warning'
              }
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedConversation && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1">
                    {selectedConversation.userEmail}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Started
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedConversation.startedAt), 'PPp')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1">
                    {selectedConversation.title || 'No title'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Messages
                  </Typography>
                  <Typography variant="body1">
                    {selectedConversation.messageCount || 0} messages
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConversationDialog}>Close</Button>
          {selectedConversation && (
            <>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
              <Button variant="contained">
                Assign Agent
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

### 3.5 Profile Microfrontend

#### 3.5.1 Profile Management Setup
```bash
cd frontend/profile
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom react-query axios react-hook-form @hookform/resolvers zod
npm install date-fns
```

**profile/src/App.tsx**:
```typescript
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  PrivacyTip as PrivacyIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  emailFrequency: z.enum(['immediate', 'daily', 'weekly']),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerNotifications,
    handleSubmit: handleNotificationsSubmit,
    watch,
    formState: { errors: notificationErrors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      emailFrequency: 'immediate',
    },
  });

  const emailNotifications = watch('emailNotifications');
  const pushNotifications = watch('pushNotifications');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileSubmit = (data: ProfileFormData) => {
    // Handle profile update
    console.log('Profile update:', data);
  };

  const handleNotificationsSubmit = (data: NotificationFormData) => {
    // Handle notification preferences
    console.log('Notification update:', data);
  };

  const handleExportData = () => {
    // Handle data export
    console.log('Exporting user data');
  };

  const handleDeleteAccount = () => {
    // Handle account deletion
    console.log('Deleting account');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              fontSize: '2rem',
              cursor: 'pointer',
            }}
            onClick={() => setAvatarDialogOpen(true)}
          >
            JD
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              John Doe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              john.doe@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since January 2024
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Profile Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Profile"
            id="profile-tab-0"
            aria-controls="profile-tabpanel-0"
          />
          <Tab
            icon={<NotificationsIcon />}
            iconPosition="start"
            label="Notifications"
            id="profile-tab-1"
            aria-controls="profile-tabpanel-1"
          />
          <Tab
            icon={<PrivacyIcon />}
            iconPosition="start"
            label="Privacy"
            id="profile-tab-2"
            aria-controls="profile-tabpanel-2"
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="History"
            id="profile-tab-3"
            aria-controls="profile-tabpanel-3"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Profile Tab */}
        <Box sx={{ p: 2 }} hidden={tabValue !== 0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <form onSubmit={handleSubmit(handleProfileSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('name')}
                    label="Full Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    {...register('email')}
                    label="Email Address"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained">
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>

        {/* Notifications Tab */}
        <Box sx={{ p: 2 }} hidden={tabValue !== 1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <form onSubmit={handleNotificationsSubmit(handleNotificationsSubmit)}>
              <FormControlLabel
                control={
                  <Switch
                    {...registerNotifications('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
              
              {emailNotifications && (
                <Box sx={{ mt: 2, ml: 2 }}>
                  <FormControl fullWidth sx={{ minWidth: 200 }}>
                    <InputLabel>Email Frequency</InputLabel>
                    <Select
                      {...registerNotifications('emailFrequency')}
                      label="Email Frequency"
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="daily">Daily Digest</MenuItem>
                      <MenuItem value="weekly">Weekly Summary</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    {...registerNotifications('pushNotifications')}
                  />
                }
                label="Push Notifications"
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 3 }}>
                <Button type="submit" variant="contained">
                  Save Preferences
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Privacy Tab */}
        <Box sx={{ p: 2 }} hidden={tabValue !== 2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Your data is encrypted and secure. You can control what information is collected and how it's used.
            </Alert>
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Allow personalization based on my activity"
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Share anonymous usage data to improve the service"
            />
            
            <FormControlLabel
              control={<Switch />}
              label="Allow third-party integrations"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{ mr: 2 }}
            >
              Export My Data
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteAccountDialogOpen(true)}
            >
              Delete Account
            </Button>
          </Paper>
        </Box>

        {/* History Tab */}
        <Box sx={{ p: 2 }} hidden={tabValue !== 3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversation History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View and manage your past conversations
            </Typography>
            
            {/* Conversation history would go here */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No conversation history available
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Avatar Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
              JD
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Click to upload a new profile picture
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountDialogOpen}
        onClose={() => setDeleteAccountDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            To confirm, type "DELETE" below:
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            placeholder="DELETE"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

## Deliverables

1. ✅ Shell Application with navigation and routing
2. ✅ Authentication Microfrontend with login/register forms
3. ✅ Chat Microfrontend with real-time messaging interface
4. ✅ Admin Microfrontend with dashboard and management tools
5. ✅ Profile Microfrontend with user settings
6. ✅ Shared UI components and styling system
7. ✅ Apple-inspired design system implementation
8. ✅ Responsive design for all components
9. ✅ Error handling and loading states
10. ✅ Form validation and user feedback

## Success Criteria

- All microfrontends load independently through the shell
- User authentication flows work correctly
- Real-time chat functionality is responsive
- Admin dashboard displays data properly
- Profile management saves user preferences
- Apple-inspired design is consistent across all components
- Responsive design works on different screen sizes
- Form validation provides good user feedback

## Dependencies

- Task 1 and Task 2 must be completed first
- Backend services must be running and accessible
- Database must be populated with test data
- WebSocket connection must be established for chat
- API Gateway must be routing requests correctly

## Notes

- Ensure proper CORS configuration for cross-origin requests
- Test all authentication flows thoroughly
- Validate WebSocket connections in different environments
- Implement proper error boundaries for each microfrontend
- Consider performance implications of multiple microfrontends
- Accessibility testing should be performed on all components
- Mobile responsiveness should be tested thoroughly