import pool from '../config/db.js';
import { recordAssignmentEvent } from './assetController.js';

const REQUEST_TYPES = ['asset', 'return', 'repair'];

// repair_details is the admin's private diagnosis/plan note, set when
// approving a repair — never shown to the employee. Strip it before any
// response an employee can read; admin-facing endpoints keep it as-is.
function stripPrivateFields(row) {
    const { repair_details, ...rest } = row;
    return rest;
}

// ================================================================
// CREATE REQUEST (employee)
// ================================================================
// - "asset": needs category_id. We also look up how much inventory is
//   currently available in that category so the employee (and later the
//   admin) can see up front whether this is likely a quick fulfillment or
//   not — it's informational, not a block, since the admin still decides.
// - "return" / "repair": needs asset_id, and it must be one currently
//   assigned to the requester — same ownership check used elsewhere
//   (e.g. getMyAssignedAssets).
export async function createRequest(req, res)
{
    try
    {
        const { request_type, category_id, asset_id, reason } = req.body;
        const myId = req.user.id;

        if (!REQUEST_TYPES.includes(request_type))
        {
            return res.status(400).json({ message: `request_type must be one of: ${REQUEST_TYPES.join(', ')}` });
        }

        if (!reason)
        {
            return res.status(400).json({ message: 'reason is required' });
        }

        if (request_type === 'asset')
        {
            if (!category_id)
            {
                return res.status(400).json({ message: 'category_id is required for an asset request' });
            }

            const [categoryRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
            if (categoryRows.length === 0)
            {
                return res.status(400).json({ message: 'category_id does not refer to an existing category' });
            }

            const [[{ available_count }]] = await pool.query(
                `SELECT COUNT(*) AS available_count FROM assets WHERE category_id = ? AND status = 'available'`,
                [category_id]
            );

            const [result] = await pool.query(
                `INSERT INTO requests (request_type, employee_id, category_id, reason, status)
                VALUES ('asset', ?, ?, ?, 'pending')`,
                [myId, category_id, reason]
            );

            return res.status(201).json({ id: result.insertId, message: 'Request submitted', available_count });
        }

        // return or repair — must target an asset currently assigned to the requester
        if (!asset_id)
        {
            return res.status(400).json({ message: `asset_id is required for a ${request_type} request` });
        }

        const [assetRows] = await pool.query('SELECT id, current_assignee_id FROM assets WHERE id = ?', [asset_id]);
        if (assetRows.length === 0)
        {
            return res.status(400).json({ message: 'asset_id does not refer to an existing asset' });
        }

        if (assetRows[0].current_assignee_id !== myId)
        {
            return res.status(403).json({ message: 'You can only request a return or repair for an asset assigned to you' });
        }

        const [result] = await pool.query(
            `INSERT INTO requests (request_type, employee_id, asset_id, reason, status)
            VALUES (?, ?, ?, ?, 'pending')`,
            [request_type, myId, asset_id, reason]
        );

        return res.status(201).json({ id: result.insertId, message: 'Request submitted' });
    }

    catch (err)
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error creating request' });
    }
}

// ================================================================
// MY REQUESTS (employee self-service — status tracking)
// ================================================================
export async function getMyRequests(req, res)
{
    try
    {
        const [rows] = await pool.query(
            `SELECT
                r.*,
                c.name AS category_name,
                a.name AS asset_name,
                a.asset_tag,
                u.full_name AS reviewed_by_name

            FROM requests r

            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN assets a ON r.asset_id = a.id
            LEFT JOIN users u ON r.reviewed_by = u.id

            WHERE r.employee_id = ?
            ORDER BY r.created_at DESC`,
            [req.user.id]
        );

        return res.json(rows.map(stripPrivateFields));
    }

    catch (err)
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching your requests' });
    }
}

// ================================================================
// REQUEST QUEUE (admin)
// ================================================================
// Supports ?status=pending (defaults to showing everything if omitted).
export async function getAllRequests(req, res)
{
    try
    {
        const { status } = req.query;
        const values = [];
        let whereClause = '';

        if (status)
        {
            whereClause = 'WHERE r.status = ?';
            values.push(status);
        }

        const [rows] = await pool.query(
            `SELECT
                r.*,
                e.full_name AS employee_name,
                c.name AS category_name,
                a.name AS asset_name,
                a.asset_tag,
                u.full_name AS reviewed_by_name

            FROM requests r

            JOIN users e ON r.employee_id = e.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN assets a ON r.asset_id = a.id
            LEFT JOIN users u ON r.reviewed_by = u.id

            ${whereClause}
            ORDER BY r.created_at DESC`,
            values
        );

        return res.json(rows);
    }

    catch (err)
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching requests' });
    }
}

// ================================================================
// REQUEST DETAIL (admin) — everything about a single request
// ================================================================
export async function getRequestById(req, res)
{
    try
    {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT
                r.*,
                e.full_name AS employee_name,
                e.email AS employee_email,
                c.name AS category_name,
                a.name AS asset_name,
                a.asset_tag,
                a.status AS asset_status,
                u.full_name AS reviewed_by_name,
                ra.name AS resulting_asset_name,
                ra.asset_tag AS resulting_asset_tag

            FROM requests r

            JOIN users e ON r.employee_id = e.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN assets a ON r.asset_id = a.id
            LEFT JOIN users u ON r.reviewed_by = u.id
            LEFT JOIN assets ra ON r.resulting_asset_id = ra.id

            WHERE r.id = ?`,
            [id]
        );

        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (req.user.role !== 'administrator' && rows[0].employee_id !== req.user.id)
        {
            return res.status(403).json({ message: 'This is not your request' });
        }

        return res.json(req.user.role === 'administrator' ? rows[0] : stripPrivateFields(rows[0]));
    }

    catch (err)
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching request' });
    }
}

// ================================================================
// REVIEW REQUEST — approve or reject (admin)
// ================================================================
// review_notes is optional on both approve and reject, for every type — a
// note from the admin that's shown to the employee on the request. It's
// separate from repair_details, which stays admin-only (see getRequestById
// and getMyRequests, which strip it out for non-admin viewers).
//
// Rejecting always just closes the request out, for every type, with no
// side effects — the asset (if any) was never touched.
//
// Approving behaves differently by type:
//   - "asset": no specific asset attached yet, so approval just flips
//     status to "approved" — a separate call to assignAssetToRequest picks
//     the actual asset and completes it.
//   - "return": approving immediately pulls the asset out of the
//     employee's registry (unassigned, back to "available") — that's the
//     real-world meaning of "the admin has agreed to take this back".
//     Request lands on "approved"; a separate call to completeReturn
//     closes it out once the asset is physically back in hand.
//   - "repair": approving immediately puts the asset into "under_repair"
//     and moves the request straight to "sent_for_repair" (skipping the
//     generic "approved" state — there's nothing left to decide, the asset
//     is now literally sent for repair). A separate call to completeRepair
//     closes it out once the repair is done.
export async function reviewRequest(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const { status, repair_details, review_notes } = req.body;

        if (!['approved', 'rejected'].includes(status))
        {
            return res.status(400).json({ message: 'status must be "approved" or "rejected"' });
        }

        const [rows] = await connection.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = rows[0];

        if (request.status !== 'pending')
        {
            return res.status(400).json({ message: `Request has already been ${request.status}` });
        }

        await connection.beginTransaction();

        if (status === 'rejected')
        {
            await connection.query(
                'UPDATE requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ? WHERE id = ?',
                ['rejected', req.user.id, review_notes || null, id]
            );
            await connection.commit();
            return res.json({ message: 'Request rejected' });
        }

        if (request.request_type === 'asset')
        {
            await connection.query(
                'UPDATE requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ? WHERE id = ?',
                ['approved', req.user.id, review_notes || null, id]
            );
            await connection.commit();
            return res.json({ message: 'Request approved — assign an asset to complete it' });
        }

        // return / repair — act on the already-known asset now
        const [assetRows] = await connection.query('SELECT * FROM assets WHERE id = ?', [request.asset_id]);
        if (assetRows.length === 0)
        {
            await connection.rollback();
            return res.status(404).json({ message: 'The asset for this request no longer exists' });
        }
        const asset = assetRows[0];

        if (asset.current_assignee_id !== request.employee_id)
        {
            await connection.rollback();
            return res.status(400).json({ message: 'This asset is no longer assigned to the requesting employee' });
        }

        if (request.request_type === 'return')
        {
            await connection.query(
                `UPDATE assets SET status = 'available', current_assignee_id = NULL, usage_state = 'active' WHERE id = ?`,
                [asset.id]
            );
            await recordAssignmentEvent(connection, {
                assetId: asset.id,
                performedBy: req.user.id,
                previousAssigneeId: request.employee_id,
                newAssigneeId: null,
                newAssigneeName: null,
            });
            await connection.query(
                'UPDATE requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ? WHERE id = ?',
                ['approved', req.user.id, review_notes || null, id]
            );
            await connection.commit();
            return res.json({ message: "Return approved — asset removed from the employee's registry. Mark it completed once physically received." });
        }

        // repair
        await connection.query(`UPDATE assets SET status = 'under_repair' WHERE id = ?`, [asset.id]);
        await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'repair', ?, ?)`,
            [
                req.user.id,
                repair_details
                    ? `Repair approved — sent for repair: ${repair_details}`
                    : `Repair approved via request #${id} — sent for repair`,
                asset.id,
            ]
        );
        await connection.query(
            'UPDATE requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(), repair_details = ?, review_notes = ? WHERE id = ?',
            ['sent_for_repair', req.user.id, repair_details || null, review_notes || null, id]
        );
        await connection.commit();
        return res.json({ message: 'Repair approved — asset sent for repair' });
    }

    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error reviewing request' });
    }

    finally
    {
        connection.release();
    }
}

// ================================================================
// ASSIGN ASSET AGAINST AN APPROVED REQUEST (admin)
// ================================================================
// Only meaningful for "asset"-type requests that have already been
// approved. The admin picks a specific available asset — it must belong to
// the category the request asked for.
export async function assignAssetToRequest(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const { asset_id } = req.body;

        if (!asset_id)
        {
            return res.status(400).json({ message: 'asset_id is required' });
        }

        const [requestRows] = await connection.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (requestRows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = requestRows[0];

        if (request.request_type !== 'asset')
        {
            return res.status(400).json({ message: 'Only "asset"-type requests can be fulfilled this way' });
        }

        if (request.status !== 'approved')
        {
            return res.status(400).json({ message: 'Request must be approved before an asset can be assigned to it' });
        }

        const [assetRows] = await connection.query('SELECT * FROM assets WHERE id = ?', [asset_id]);
        if (assetRows.length === 0)
        {
            return res.status(400).json({ message: 'asset_id does not refer to an existing asset' });
        }
        const asset = assetRows[0];

        if (asset.status !== 'available')
        {
            return res.status(400).json({ message: 'This asset is not currently available' });
        }

        if (asset.category_id !== request.category_id)
        {
            return res.status(400).json({ message: 'This asset does not belong to the requested category' });
        }

        const [employeeRows] = await connection.query('SELECT full_name FROM users WHERE id = ?', [request.employee_id]);
        const employeeName = employeeRows[0]?.full_name || 'employee';

        await connection.beginTransaction();

        await connection.query(
            `UPDATE assets SET status = 'assigned', current_assignee_id = ?, usage_state = 'active' WHERE id = ?`,
            [request.employee_id, asset_id]
        );

        await recordAssignmentEvent(connection, {
            assetId: asset_id,
            performedBy: req.user.id,
            previousAssigneeId: null,
            newAssigneeId: request.employee_id,
            newAssigneeName: employeeName,
        });

        await connection.query(
            'UPDATE requests SET status = ?, resulting_asset_id = ? WHERE id = ?',
            ['completed', asset_id, id]
        );

        await connection.commit();
        return res.json({ message: `Asset assigned to ${employeeName}, request completed` });
    }

    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error assigning asset to request' });
    }

    finally
    {
        connection.release();
    }
}

// ================================================================
// COMPLETE RETURN (admin) — asset physically received back
// ================================================================
// The asset was already pulled out of the employee's registry at approval
// time; this just closes the request out once it's actually back in hand.
// The employee still needs to acknowledge it via acknowledgeReturn.
export async function completeReturn(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const { notes } = req.body;

        const [rows] = await connection.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = rows[0];

        if (request.request_type !== 'return')
        {
            return res.status(400).json({ message: 'Only "return"-type requests can be completed this way' });
        }

        if (request.status !== 'approved')
        {
            return res.status(400).json({ message: 'Request must be approved before it can be marked completed' });
        }

        await connection.beginTransaction();

        await connection.query(
            'UPDATE requests SET status = ?, completion_notes = ? WHERE id = ?',
            ['completed', notes || null, id]
        );

        if (notes)
        {
            await connection.query(
                `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
                VALUES (?, 'return', ?, ?)`,
                [req.user.id, `Return marked complete: ${notes}`, request.asset_id]
            );
        }

        await connection.commit();
        return res.json({ message: "Return marked complete — waiting for the employee to acknowledge they've sent it back" });
    }

    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error completing return' });
    }

    finally
    {
        connection.release();
    }
}

// ================================================================
// ACKNOWLEDGE RETURN (employee)
// ================================================================
// Confirms the employee has physically handed the asset back. There's no
// asset_assignments record to hook this into (unlike acknowledging receipt
// of something) since the employee no longer holds anything, so this is
// tracked directly on the request itself via requests.acknowledged_at.
export async function acknowledgeReturn(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const myId = req.user.id;

        const [rows] = await connection.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = rows[0];

        if (request.employee_id !== myId)
        {
            return res.status(403).json({ message: 'This is not your request' });
        }

        if (request.request_type !== 'return' || request.status !== 'completed')
        {
            return res.status(400).json({ message: 'This return is not ready to be acknowledged' });
        }

        if (request.acknowledged_at !== null)
        {
            return res.status(400).json({ message: 'Already acknowledged' });
        }

        await connection.beginTransaction();

        await connection.query('UPDATE requests SET acknowledged_at = NOW() WHERE id = ?', [id]);
        await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'acknowledgement', 'Employee confirmed the asset was sent back', ?)`,
            [myId, request.asset_id]
        );

        await connection.commit();
        return res.json({ message: 'Return acknowledged' });
    }

    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error acknowledging return' });
    }

    finally
    {
        connection.release();
    }
}

// ================================================================
// COMPLETE REPAIR (admin) — repair finished, asset back with the employee
// ================================================================
// The asset never left the employee's registry (current_assignee_id was
// untouched through the repair), so this just flips it back to "assigned"
// and reopens a fresh, unacknowledged assignment record via
// recordAssignmentEvent — the same mechanism used everywhere else an
// employee needs to confirm receipt.
export async function completeRepair(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const { repair_notes } = req.body;

        const [rows] = await connection.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = rows[0];

        if (request.request_type !== 'repair')
        {
            return res.status(400).json({ message: 'Only "repair"-type requests can be completed this way' });
        }

        if (request.status !== 'sent_for_repair')
        {
            return res.status(400).json({ message: 'Request must be sent for repair before it can be completed' });
        }

        const [assetRows] = await connection.query('SELECT * FROM assets WHERE id = ?', [request.asset_id]);
        if (assetRows.length === 0)
        {
            return res.status(404).json({ message: 'The asset for this request no longer exists' });
        }
        const asset = assetRows[0];

        const [employeeRows] = await connection.query('SELECT full_name FROM users WHERE id = ?', [request.employee_id]);
        const employeeName = employeeRows[0]?.full_name || 'employee';

        await connection.beginTransaction();

        await connection.query(`UPDATE assets SET status = 'assigned', usage_state = 'active' WHERE id = ?`, [asset.id]);

        await recordAssignmentEvent(connection, {
            assetId: asset.id,
            performedBy: req.user.id,
            previousAssigneeId: request.employee_id,
            newAssigneeId: request.employee_id,
            newAssigneeName: employeeName,
        });

        await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'repair', ?, ?)`,
            [req.user.id, repair_notes ? `Repair completed: ${repair_notes}` : 'Repair completed, returned to employee', asset.id]
        );

        await connection.query(
            'UPDATE requests SET status = ?, completion_notes = ? WHERE id = ?',
            ['completed', repair_notes || null, id]
        );

        await connection.commit();
        return res.json({ message: `Repair completed — returned to ${employeeName}, awaiting their acknowledgement` });
    }

    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error completing repair' });
    }

    finally
    {
        connection.release();
    }
}
