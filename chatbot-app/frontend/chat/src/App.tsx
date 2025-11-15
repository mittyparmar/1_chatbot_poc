import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from '@shared-ui';
import { ChatInterface } from './components/ChatInterface';
import { ConversationList } from './components/ConversationList';
import { io, Socket } from 'socket.io-client';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3002', {
      transports: ['websocket'],
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }
  };

  const handleLeaveConversation = () => {
    if (socket && currentConversation) {
      socket.emit('leave-conversation', currentConversation);
      setCurrentConversation(null);
    }
  };

  return (
    <ConfigProvider>
      <Router>
        <div className="chat-app h-screen flex bg-gray-50">
          <div className="flex flex-col w-full h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Conversation List */}
              <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                <ConversationList 
                  onSelectConversation={handleSelectConversation}
                  selectedConversation={currentConversation}
                />
              </div>

              {/* Chat Interface */}
              <div className="flex-1 flex flex-col">
                {currentConversation ? (
                  <ChatInterface
                    conversationId={currentConversation}
                    socket={socket}
                    onLeaveConversation={handleLeaveConversation}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;