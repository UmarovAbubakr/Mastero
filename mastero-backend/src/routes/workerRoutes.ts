import { Router } from 'express';
import { 
  registerWorker, 
  getAllWorkers, 
  getWorkerById, 
  getWorkersByIds,
  getWorkerReviews,
  addWork,
  deleteWork,
  updateWorkerProfile,
  getTopWorkers
} from '../controllers/workerController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Worker:
 *       type: object
 *       required:
 *         - skills
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the worker
 *         skills:
 *           type: string
 *           description: List of worker skills
 *         price:
 *           type: string
 *           description: Hourly rate
 *         category:
 *           type: string
 *           description: Worker specialization category
 *         about:
 *           type: string
 *           description: Information about the worker
 *         rating:
 *           type: number
 *           description: Average rating from reviews
 *         completedOrders:
 *           type: integer
 *         totalEarnings:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: The workers managing API
 */

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Returns the list of all the workers
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: The list of the workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Worker'
 */

router.post('/upload', authMiddleware, upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

router.get('/', getAllWorkers);
router.get('/top', getTopWorkers);
router.get('/batch', getWorkersByIds);
router.get('/:id', getWorkerById);
router.get('/:id/reviews', getWorkerReviews);
router.post('/register', authMiddleware, registerWorker);
router.patch('/profile', authMiddleware, updateWorkerProfile);
router.post('/works', authMiddleware, addWork);
router.delete('/works/:id', authMiddleware, deleteWork);

export default router;

