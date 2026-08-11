import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/asset-documents';

if (!fs.existsSync(uploadDir)) 
{
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage(
{
  destination: (req, file, cb) => {cb(null, uploadDir);},

  filename: (req, file, cb) =>
    {
        // path.basename strips any directory components (e.g. "../../etc/passwd")
        // that a crafted original filename could otherwise smuggle in.
        const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${Date.now()}-${safeName}`;
        cb(null, uniqueName);
    },
});

export class FileTypeError extends Error {}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    {
        const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext))
        {
            cb(null, true);
        }

        else
        {
            cb(new FileTypeError('Only PDF, PNG, and JPG files are allowed'));
        }
    },
});

export default upload;