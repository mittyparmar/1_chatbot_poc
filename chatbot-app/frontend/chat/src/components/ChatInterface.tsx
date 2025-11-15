import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Typography, Avatar, Badge, Space } from '@shared-ui';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  messageType: 'text' | 'file' | 'system';
  attachments?: any[];
}

interface ChatInterfaceProps {
  conversationId: string;
  socket: Socket | null;
  onLeaveConversation: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  socket,
  onLeaveConversation,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate initial messages
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        senderId: 'bot',
        senderName: 'Support Bot',
        timestamp: new Date().toISOString(),
        messageType: 'text',
      },
      {
        id: '2',
        content: 'Hi! I need help with my account settings.',
        senderId: 'user',
        senderName: 'You',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        messageType: 'text',
      },
      {
        id: '3',
        content: 'I can help you with account settings. What specific issue are you experiencing?',
        senderId: 'bot',
        senderName: 'Support Bot',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        messageType: 'text',
      },
    ];

    setMessages(mockMessages);
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('new-message', (message: Message) => {
        setMessages((prev: Message[]) => [...prev, message]);
        setIsTyping(false);
      });

      // Listen for typing indicators
      socket.on('user-typing', (data: { userId: string; typing: boolean }) => {
        if (data.userId !== socket.id) {
          setIsTyping(data.typing);
        }
      });

      // Listen for connection status
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      // Join conversation
      socket.emit('join-conversation', conversationId);

      return () => {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('connect');
        socket.off('disconnect');
        socket.emit('leave-conversation', conversationId);
      };
    }
  }, [socket, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: socket.id,
        senderName: 'You',
        timestamp: new Date().toISOString(),
        messageType: 'text',
      };

      // Emit message to server
      socket.emit('send-message', {
        conversationId,
        content: message.content,
        messageType: message.messageType,
      });

      // Add message to local state immediately for better UX
      setMessages((prev: Message[]) => [...prev, message]);
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === socket?.id;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar
            src={`https://ui-avatars.com/api/?name=Support&background=10B981&color=fff`}
            alt="Support"
            size="sm"
          />
          <div>
            <Typography variant="subtitle" className="font-medium text-gray-900">
              Support Team
            </Typography>
            <Typography variant="caption" className="text-xs text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </Typography>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveConversation}
          >
            Leave
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${isOwnMessage(message.senderId) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage(message.senderId)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {!isOwnMessage(message.senderId) && (
                <Typography
                  variant="caption"
                  className="block text-xs opacity-75 mb-1"
                >
                  {message.senderName}
                </Typography>
              )}
              <Typography variant="body" className="text-sm">
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                className={`block text-xs mt-1 ${
                  isOwnMessage(message.senderId) ? 'opacity-75' : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty space for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewMessage(e.target.value);
                if (socket) {
                  socket.emit('typing', {
                    conversationId,
                    typing: e.target.value.length > 0,
                  });
                }
              }}
              onKeyPress={handleKeyPress}
              className="resize-none"
              multiline
              rows={1}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};