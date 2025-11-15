import { Server as SocketIOServer, Socket } from 'socket.io';
import { ConversationManager } from '../services/ConversationManager';
import { MessageManager } from '../services/MessageManager';

export const socketHandler = (socket: Socket, io: SocketIOServer) => {
  const conversationManager = new ConversationManager();
  const messageManager = new MessageManager();

  // Join conversation
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation
  socket.on('leave-conversation', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send-message', async (data: {
    conversationId: string;
    content: string;
    messageType: string;
    attachments?: any[];
  }) => {
    try {
      const { conversationId, content, messageType, attachments } = data;
      
      // Save message to database
      const message = await MessageManager.createMessage({
        conversationId,
        senderId: socket.id,
        content,
        messageType,
        attachments: attachments || []
      });

      // Emit message to conversation participants
      io.to(conversationId).emit('new-message', {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        attachments: message.attachments,
        createdAt: message.createdAt
      });

      // Emit typing indicator
      socket.to(conversationId).emit('user-typing', {
        userId: socket.id,
        typing: false
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; typing: boolean }) => {
    const { conversationId, typing } = data;
    socket.to(conversationId).emit('user-typing', {
      userId: socket.id,
      typing
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};