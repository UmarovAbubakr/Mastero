import { Router } from 'express';
import * as jobController from '../controllers/jobController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Job Request routes
router.post('/requests', authMiddleware, jobController.createJobRequest);
router.get('/requests', authMiddleware, jobController.getJobRequests);
router.get('/requests/my', authMiddleware, jobController.getMyJobRequests);
router.get('/requests/:id', authMiddleware, jobController.getJobRequestById);

// Proposal routes
router.post('/proposals', authMiddleware, jobController.createProposal);
router.post('/proposals/:proposalId/accept', authMiddleware, jobController.acceptProposal);

export default router;
