import fs from 'fs';
import pool from '../config/db.js';

export async function uploadDocument(req, res)
{
  try
    {
        const { asset_id } = req.params;
        const { document_type } = req.body;

        if (!req.file)
        {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const [assetRows] = await pool.query('SELECT id FROM assets WHERE id = ?', [asset_id]);
        if (assetRows.length === 0)
        {
            fs.unlink(req.file.path, () => {});
            return res.status(404).json({ message: 'Asset not found' });
        }

        const validTypes = ['receipt', 'repair_record', 'other'];
        const finalType = validTypes.includes(document_type) ? document_type : 'other';

        const filePath = `/${req.file.path.replace(/\\/g, '/')}`;

        try
        {
            const [result] = await pool.query(
            `INSERT INTO asset_documents (asset_id, document_type, file_url, uploaded_by)
            VALUES (?, ?, ?, ?)`,
            [asset_id, finalType, filePath, req.user.id]
            );

            return res.status(201).json({
            id: result.insertId,
            asset_id,
            document_type: finalType,
            file_url: filePath,
            });
        }
        catch (insertErr)
        {
            fs.unlink(req.file.path, () => {});
            throw insertErr;
        }
    }

  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error uploading document' });
  }
}

export async function getDocumentsForAsset(req, res) 
{
  try 
    {
        const { asset_id } = req.params;
        const [rows] = await pool.query(
        `SELECT d.*, u.full_name AS uploaded_by_name
        FROM asset_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.asset_id = ?
        ORDER BY d.created_at DESC`,
        [asset_id]
        );
        return res.json(rows);
    } 
    
catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching documents' });
    }
}