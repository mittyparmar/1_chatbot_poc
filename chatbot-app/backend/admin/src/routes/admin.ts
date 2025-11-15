import express from 'express';
import { ConversationManager } from '../services/ConversationManager';
import { MessageManager } from '../services/MessageManager';
import { UserManager } from '../services/UserManager';
import { ExportService } from '../services/ExportService';

const router = express.Router();

// Get all conversations with filtering
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = req.query;
    
    const conversations = await ConversationManager.getAll({
      page: Number(page),
      limit: Number(limit),
      userId: userId as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

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

    const messages = await MessageManager.findByConversationId(id);
    
    res.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign conversation to admin
router.post('/conversations/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    
    await ConversationManager.assignAdmin(id, adminId);
    
    res.json({ message: 'Conversation assigned successfully' });
  } catch (error) {
    console.error('Error assigning conversation:', error);
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

// Export conversation data
router.post('/conversations/export', async (req, res) => {
  try {
    const { conversationIds, format = 'json' } = req.body;
    
    const exportData = await ExportService.exportConversations(conversationIds, format);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=conversations.${format}`);
    
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user analytics
router.get('/analytics/users', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await UserManager.getAnalytics(startDate as string, endDate as string);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system metrics
router.get('/analytics/system', async (req, res) => {
  try {
    const metrics = await ExportService.getSystemMetrics();
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRoutes };