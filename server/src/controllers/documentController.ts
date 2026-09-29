// upload/list documents attached to an asset (receipts, repair records) —
// every route here is admin-only (enforced in assetRoutes.js), and actually
// viewing a file's contents goes through a minted one-time link rather than
// a permanent URL — see createDocumentAccessLink / serveOneTimeDocument.
import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db.js";
import { mintDocumentToken, consumeDocumentToken } from "../services/documentAccessTokens.js";

export async function uploadDocument(req: Request, res: Response) {
  try {
    const { asset_id } = req.params;
    const { document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const [assetRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM assets WHERE id = ?",
      [asset_id],
    );
    if (assetRows.length === 0) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Asset not found" });
    }

    const validTypes = ["receipt", "repair_record", "other"];
    const finalType = validTypes.includes(document_type)
      ? document_type
      : "other";

    // Stored internally so createDocumentAccessLink can resolve a real file
    // to mint a token for later — never returned to the client directly.
    const filePath = `/api/${req.file.path.replace(/\\/g, "/")}`;

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO asset_documents (asset_id, document_type, file_url, uploaded_by)
            VALUES (?, ?, ?, ?)`,
        [asset_id, finalType, filePath, req.user!.id],
      );

      return res.status(201).json({
        id: result.insertId,
        asset_id,
        document_type: finalType,
      });
    } catch (insertErr) {
      fs.unlink(req.file.path, () => {});
      throw insertErr;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error uploading document" });
  }
}

export async function getDocumentsForAsset(req: Request, res: Response) {
  try {
    const { asset_id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT d.id, d.asset_id, d.document_type, d.uploaded_by, d.created_at,
              u.full_name AS uploaded_by_name
        FROM asset_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.asset_id = ?
        ORDER BY d.created_at DESC`,
      [asset_id],
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error fetching documents" });
  }
}

// Mints a one-time link for a single document. Admin-only, same as every
// other route in this file — enforced in assetRoutes.js.
export async function createDocumentAccessLink(req: Request, res: Response) {
  try {
    const { doc_id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT file_url FROM asset_documents WHERE id = ?",
      [doc_id],
    );
    const document = rows[0];
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // file_url is stored as "/api/uploads/asset-documents/xyz.pdf" — strip
    // the "/api/" prefix to get the real path on disk, relative to the
    // server's working directory (same base express.static used to use).
    const onDiskPath = (document.file_url as string).replace(/^\/api\//, "");
    if (!fs.existsSync(path.resolve(process.cwd(), onDiskPath))) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    const token = mintDocumentToken(onDiskPath);
    return res.json({ url: `/api/uploads/one-time/${token}` });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error creating document link" });
  }
}

// The other end of createDocumentAccessLink — consumes the token (so it can
// never be used again, by anyone) and streams the file back exactly once.
export function serveOneTimeDocument(req: Request, res: Response) {
  const { token } = req.params;
  const filePath = consumeDocumentToken(String(token));

  if (!filePath) {
    return res
      .status(404)
      .json({ message: "This link is invalid or has already been used" });
  }

  return res.sendFile(filePath, { root: process.cwd() }, (err) => {
    if (err && !res.headersSent) {
      console.error(err);
      res.status(404).json({ message: "File missing on disk" });
    }
  });
}
