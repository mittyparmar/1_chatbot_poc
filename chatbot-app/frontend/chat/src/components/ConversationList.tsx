import React, { useState, useEffect } from 'react';
import { Button, Input, Typography, Avatar, Badge } from '@shared-ui';

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isActive?: boolean;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversation: string | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching conversations
    const fetchConversations = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockConversations: Conversation[] = [
        {
          id: '1',
          title: 'John Doe',
          lastMessage: 'Hello, how can I help you today?',
          lastMessageTime: '2 min ago',
          unreadCount: 2,
          isActive: true,
        },
        {
          id: '2',
          title: 'Jane Smith',
          lastMessage: 'Thanks for your help!',
          lastMessageTime: '1 hour ago',
          unreadCount: 0,
          isActive: false,
        },
        {
          id: '3',
          title: 'Support Team',
          lastMessage: 'Your issue has been resolved',
          lastMessageTime: '3 hours ago',
          unreadCount: 1,
          isActive: false,
        },
        {
          id: '4',
          title: 'Alex Johnson',
          lastMessage: 'Can you send me the documents?',
          lastMessageTime: 'Yesterday',
          unreadCount: 0,
          isActive: false,
        },
        {
          id: '5',
          title: 'Sarah Wilson',
          lastMessage: 'Looking forward to our meeting',
          lastMessageTime: '2 days ago',
          unreadCount: 0,
          isActive: false,
        },
      ];
      
      setConversations(mockConversations);
      setIsLoading(false);
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation: Conversation) =>
    conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timeString: string) => {
    const time = new Date();
    const messageTime = new Date(timeString);
    const diffInHours = Math.floor((time.getTime() - messageTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => console.log('Start new chat')}
        >
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <Typography variant="body" className="text-gray-500">
              No conversations found
            </Typography>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="relative">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${conversation.title}&background=3B82F6&color=fff`}
                    alt={conversation.title}
                    size="md"
                  />
                  {conversation.isActive && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Typography
                      variant="subtitle"
                      className="font-medium text-gray-900 truncate"
                    >
                      {conversation.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-xs text-gray-500 flex-shrink-0 ml-2"
                    >
                      {formatTime(conversation.lastMessageTime || '2 min ago')}
                    </Typography>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <Typography
                      variant="body"
                      className="text-sm text-gray-500 truncate"
                    >
                      {conversation.lastMessage}
                    </Typography>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <Badge
                        count={conversation.unreadCount}
                        color="blue"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};