import express from 'express';
import { ConversationManager } from '../services/ConversationManager';
import { MessageManager } from '../services/MessageManager';

const router = express.Router();

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await ConversationManager.findByUserId(userId);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation details
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await ConversationManager.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { userId, title, metadata } = req.body;
    
    const conversation = await ConversationManager.create({
      userId,
      title,
      metadata
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await MessageManager.findByConversationId(conversationId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create message
router.post('/messages', async (req, res) => {
  try {
    const { conversationId, senderId, content, messageType, attachments } = req.body;
    
    const message = await MessageManager.createMessage({
      conversationId,
      senderId,
      content,
      messageType,
      attachments: attachments || []
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update conversation status
router.patch('/conversations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await ConversationManager.updateStatus(id, status);
    
    res.json({ message: 'Conversation status updated successfully' });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as chatRoutes };