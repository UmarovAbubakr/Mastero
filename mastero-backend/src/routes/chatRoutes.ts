import { Router } from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  startConversation,
  editMessage,
  deleteMessage,
  toggleReaction
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Messaging and conversation API
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Chats]
 *     responses:
 *       200:
 *         description: List of conversations
 *   post:
 *     summary: Start a new conversation
 *     tags: [Chats]
 *     responses:
 *       201:
 *         description: Conversation started
 */

router.get('/', getConversations);
router.get('/:id', getMessages);
router.post('/', startConversation);
router.post('/messages', sendMessage);
router.patch('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/messages/reaction', toggleReaction);

export default router;
