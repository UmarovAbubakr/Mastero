"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// --- ROUTES ---
app.use('/api/auth', authRoutes_1.default);
app.use('/api/workers', workerRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
// Health check
app.get('/', (req, res) => {
    res.json({ message: "Mastero API is running! 🚀" });
});
// Start server
app.listen(PORT, () => {
    console.log(`✅ Mastero Server started: http://localhost:${PORT}`);
});
