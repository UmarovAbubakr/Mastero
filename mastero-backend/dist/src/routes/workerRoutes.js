"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workerController_1 = require("../controllers/workerController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload', auth_1.authMiddleware, upload_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});
router.get('/', workerController_1.getAllWorkers);
router.get('/batch', workerController_1.getWorkersByIds);
router.get('/:id', workerController_1.getWorkerById);
router.post('/register', auth_1.authMiddleware, workerController_1.registerWorker);
router.patch('/profile', auth_1.authMiddleware, workerController_1.updateWorkerProfile);
router.post('/works', auth_1.authMiddleware, workerController_1.addWork);
router.delete('/works/:id', auth_1.authMiddleware, workerController_1.deleteWork);
exports.default = router;
