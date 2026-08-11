import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

import categoryRoutes from './src/routes/categoryRoutes.js';
import assetRoutes from './src/routes/assetRoutes.js';
import { requireAuth } from './src/middleware/auth.js';
import { FileTypeError } from './src/middleware/upload.js';
import swaggerSpec from './src/config/swagger.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded documents (receipts, repair records) may contain sensitive info —
// require a valid login before serving any file back.
app.use('/uploads', requireAuth, express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec)); // raw spec, e.g. for Postman's "Import from link"

app.get('/', (req, res) => res.json({ status: 'API running' }));

// Centralized error handler — without this, thrown errors (e.g. multer's
// fileFilter rejection) fall through to Express's default handler, which
// returns an HTML page with a full stack trace instead of JSON.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err instanceof FileTypeError) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));