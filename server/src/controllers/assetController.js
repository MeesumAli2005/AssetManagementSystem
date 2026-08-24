import pool from '../config/db.js';

//valid statuses for a given asset

const VALID_STATUSES = ['available', 'assigned', 'under_repair', 'retired'];

export const VALID_CONDITIONS = ['new', 'good', 'fair', 'damaged'];

const VALID_USAGE_STATES = ['active', 'dormant'];


//Linker function to help route the 3 tables (categories, -> category_specs,-> asset_spec_values) linked together

async function validateAndWriteSpecValues(connection, assetId, categoryId, specValues) 
{
  const [categorySpecs] = await connection.query(
    'SELECT id, spec_name, is_required FROM category_specs WHERE category_id = ?',
    [categoryId]);
  
  const validSpecIds = categorySpecs.map((s) => s.id);
  const providedIds = (specValues || []).map((sv) => sv.category_spec_id);

  for (const sv of specValues || []) 
    {
        if (!validSpecIds.includes(sv.category_spec_id)) 
        {
            throw new Error(`category_spec_id ${sv.category_spec_id} does not belong to this asset's category`);
        }
    }

  const missingRequired = categorySpecs.filter((s) => s.is_required && !providedIds.includes(s.id));
  
  if (missingRequired.length > 0) 
    {
        const names = missingRequired.map((s) => s.spec_name).join(', ');
        throw new Error(`Missing required spec(s): ${names}`);
    }

  await connection.query('DELETE FROM asset_spec_values WHERE asset_id = ?', [assetId]);

  for (const sv of specValues || []) 
    {
        await connection.query(
        `INSERT INTO asset_spec_values (asset_id, category_spec_id, value)
        VALUES (?, ?, ?)`,
        [assetId, sv.category_spec_id, String(sv.value)]);
    }
}


// Writes an assignment event: the asset_history entry plus the
// asset_assignments record (close out the previous holder, open a fresh
// unacknowledged record for the new one). This is what the employee's
// acknowledgement and "My Assets" views actually read from — the freeform
// history log is just a human-readable trail. Shared by updateAsset's
// manual reassignment path and requestController.assignAssetToRequest
// (fulfilling an approved request), so there's one place that knows how an
// assignment gets recorded instead of two.
export async function recordAssignmentEvent(connection, { assetId, performedBy, previousAssigneeId, newAssigneeId, newAssigneeName })
{
    const description = newAssigneeId === null
        ? 'Asset unassigned'
        : `Assigned to ${newAssigneeName}`;

    await connection.query(
        `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
        VALUES (?, 'assignment', ?, ?)`,
        [performedBy, description, assetId]
    );

    if (previousAssigneeId !== null)
    {
        await connection.query(
            `UPDATE asset_assignments SET returned_at = NOW(), is_active = 0
            WHERE asset_id = ? AND is_active = 1`,
            [assetId]
        );
    }

    if (newAssigneeId !== null)
    {
        await connection.query(
            `INSERT INTO asset_assignments (asset_id, employee_id, assigned_by, assigned_at, is_active)
            VALUES (?, ?, ?, NOW(), 1)`,
            [assetId, newAssigneeId, performedBy]
        );
    }
}


//asset creation part
export async function createAsset(req, res)
{
  const connection = await pool.getConnection();
  try 
    {

        const {
        asset_tag,
        name,
        category_id,
        purchase_date,
        purchase_cost,
        condition,
        spec_values,
        } = req.body;

        if (!asset_tag || !name)
        {
            return res.status(400).json({ message: 'asset_tag and name are required' });
        }

        if (!category_id)
        {
            return res.status(400).json({ message: 'category_id is required' });
        }

        if (condition && !VALID_CONDITIONS.includes(condition))
        {
            return res.status(400).json({ message: `condition must be one of: ${VALID_CONDITIONS.join(', ')}` });
        }

        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id FROM assets WHERE asset_tag = ?', [asset_tag]);
        if (existing.length > 0) 
        {
            await connection.rollback();
            return res.status(409).json({ message: 'An asset with this asset_tag already exists' });
        }

        const [result] = await connection.query(
        `INSERT INTO assets
        (asset_tag, name, category_id, purchase_date, purchase_cost, status, \`condition\`, current_assignee_id)
        VALUES (?, ?, ?, ?, ?, 'available', ?, NULL)`,

        [asset_tag, name, category_id || null, purchase_date || null, purchase_cost || null, condition || 'new']);
        const assetId = result.insertId;

        if (category_id) 
        {
            await validateAndWriteSpecValues(connection, assetId, category_id, spec_values || []);
        }

        await connection.query(
        `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
        VALUES (?, 'purchase', ?, ?)`, [req.user.id, `Asset "${name}" (${asset_tag}) added to inventory`, assetId]);

        await connection.commit();
        return res.status(201).json({ id: assetId, asset_tag, name });
    } 
    
    catch (err) 
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error creating asset' });
    } 
    
    finally 
    {
        connection.release();
    }
}


// ================================================================ 
/// GET ALL ASSETS //
//  ================================================================ //
// // Supports: 
// // GET /api/assets 
// // GET /api/assets?status=available // 
// // GET /api/assets?category_id=2 //
// // GET /api/assets?search=laptop // 
// // GET /api/assets?status=available&category_id=2 // 
// ================================================================

export async function getAllAssets(req, res) 
{

    try 
    {
        const search = req.query.search;
        const category_id = req.query.category_id;
        const status = req.query.status;
        const condition = req.query.condition;
        const department_id = req.query.department_id;
        const assignee_id = req.query.assignee_id;
        const assigned = req.query.assigned; // 'true' | 'false' | undefined

        // req.query values are always strings, so a bad/missing page/limit
        // just falls back to a sane default instead of crashing.
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const offset = (page - 1) * limit;

        const conditions = [];


        // This array will contain the actual values
        // that replace the ? placeholders in SQL.

        const values = [];

        if (search)
        {

            conditions.push
            (
                '(a.name LIKE ? OR a.asset_tag LIKE ?)'
            );

            values.push(
                `%${search}%`,
                `%${search}%`
            );

        }

        if (category_id)
        {

            conditions.push(
                'a.category_id = ?'
            );

            values.push(category_id);

        }

        if (status)
        {
            conditions.push(
                'a.status = ?'
            );

            values.push(status);
        }

        if (condition)
            {

            conditions.push(
                'a.`condition` = ?'
            );

            values.push(condition);

        }

        if (assignee_id)
        {
            conditions.push('a.current_assignee_id = ?');
            values.push(assignee_id);
        }

        if (department_id)
        {
            // assets don't have a department column — department is a
            // property of whoever the asset is assigned to, so this goes
            // through employee_departments via a subquery instead of a
            // JOIN (a JOIN would duplicate a row for every department an
            // employee belongs to).
            conditions.push(
                'a.current_assignee_id IN (SELECT employee_id FROM employee_departments WHERE department_id = ?)'
            );
            values.push(department_id);
        }

        if (assigned === 'true')
        {
            conditions.push('a.current_assignee_id IS NOT NULL');
        }
        else if (assigned === 'false')
        {
            conditions.push('a.current_assignee_id IS NULL');
        }


        let whereClause = '';

        if (conditions.length > 0)
            {

            whereClause ='WHERE ' + conditions.join(' AND ');

        }

        // Same WHERE clause, no LIMIT — this is what "page 3 of 7" is
        // computed from, so it has to count the full filtered set, not
        // just the 10 rows we're about to return.
        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total FROM assets a ${whereClause}`,
            values
        );
        const total = countRows[0].total;

        const [assets] = await pool.query
        (
            `SELECT
                a.*,
                c.name AS category_name,
                u.full_name AS current_assignee_name

            FROM assets a

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN users u
                ON a.current_assignee_id = u.id

            ${whereClause}

            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        return res.json({
            data: assets,
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Server error fetching assets'
        });

    }
}

// ================================================================
// GET ONE ASSET
// ================================================================
//
// it shall return:
// 1. Asset info
// 2. Asset history
// 3. Asset docs
// ================================================================

export async function getAssetById(req, res) {

    try {

        // id comes from the url
        ///

        const id = req.params.id;

        const assetResult = await pool.query(
            `SELECT
                a.*,
                c.name AS category_name,
                u.full_name AS current_assignee_name

            FROM assets a

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN users u
                ON a.current_assignee_id = u.id

            WHERE a.id = ?`,
            [id]
        );


        const assetRows = assetResult[0];

        if (assetRows.length === 0) 
        {

            return res.status(404).json({
                message: 'Asset not found'
            });

        }

        const asset = assetRows[0];

        // Admins can view any asset. Employees can only view one they
        // currently or previously had assigned to them — otherwise this
        // endpoint would leak every other employee's assignment history and
        // purchase cost. asset_assignments (any row, active or not) is the
        // source of truth for "had this asset at some point".
        if (req.user.role !== 'administrator')
        {
            const [assignmentRows] = await pool.query(
                `SELECT id AS assignment_id, acknowledged_at, assigned_at, is_active
                FROM asset_assignments WHERE asset_id = ? AND employee_id = ? ORDER BY assigned_at DESC`,
                [id, req.user.id]
            );

            const hasAccess = assignmentRows.length > 0 || asset.current_assignee_id === req.user.id;
            if (!hasAccess)
            {
                return res.status(403).json({ message: 'You do not have access to this asset' });
            }

            // Exposes whether the requester has a pending (unacknowledged)
            // assignment of this exact asset, so the frontend can offer an
            // "Acknowledge receipt" action without a second round trip.
            asset.my_assignment = assignmentRows.find((a) => a.is_active === 1) || null;
        }

        // ------------------------------------------------------------
        // asset history. Admins see the full log. Employees only see the
        // slice that happened during their own assignment window(s) —
        // joining against their asset_assignments rows for this asset and
        // keeping only history entries that fall inside at least one of
        // those [assigned_at, returned_at-or-now) windows. Not the full
        // audit trail — just "what happened while I had it".
        let history;
        if (req.user.role === 'administrator')
        {
            const historyResult = await pool.query(
                `SELECT
                    h.*,
                    u.full_name AS performed_by_name

                FROM asset_history h

                LEFT JOIN users u
                    ON h.performed_by = u.id

                WHERE h.asset_id = ?

                ORDER BY h.created_at DESC`,
                [id]
            );

            history = historyResult[0];
        }
        else
        {
            const historyResult = await pool.query(
                `SELECT DISTINCT
                    h.*,
                    u.full_name AS performed_by_name

                FROM asset_history h

                JOIN asset_assignments aa
                    ON aa.asset_id = h.asset_id AND aa.employee_id = ?
                    AND h.created_at >= aa.assigned_at
                    AND (aa.returned_at IS NULL OR h.created_at <= aa.returned_at)

                LEFT JOIN users u
                    ON h.performed_by = u.id

                WHERE h.asset_id = ?

                ORDER BY h.created_at DESC`,
                [req.user.id, id]
            );

            history = historyResult[0];
        }

        //asset docs
        const [documents] = await pool.query( `SELECT d.*, u.full_name AS uploaded_by_name
        FROM asset_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.asset_id = ?
        ORDER BY d.created_at DESC`,[id]);

        const [specValues] = await pool.query(
        `SELECT sv.id, sv.category_spec_id, sv.value, cs.spec_name, cs.spec_type
        FROM asset_spec_values sv
        JOIN category_specs cs ON sv.category_spec_id = cs.id
        WHERE sv.asset_id = ?`,
        [id]
        );

        return res.json({
        ...assetRows[0],history,documents,spec_values: specValues,});
    }

    catch (error) 
    {
        console.error(error);

        return res.status(500).json
        ({
            message: 'Server error fetching asset detail'
        });

    }
}

//asset updation
export async function updateAsset(req, res) 
{
  const connection = await pool.getConnection();
  try 
    {
        const { id } = req.params;
        const { name, category_id, purchase_date, purchase_cost, status, condition, spec_values, assignee_id } = req.body;

        const [existingRows] = await connection.query('SELECT * FROM assets WHERE id = ?', [id]);

        if (existingRows.length === 0)
        {
            return res.status(404).json({ message: 'Asset not found' });
        }
        const existing = existingRows[0];

        if (status && !VALID_STATUSES.includes(status))
        {
            return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
        }

        if (condition && !VALID_CONDITIONS.includes(condition))
        {
            return res.status(400).json({ message: `condition must be one of: ${VALID_CONDITIONS.join(', ')}` });
        }

        // "assigned" isn't a status you can set directly — it only ever
        // comes from actually assigning the asset to someone (i.e. this
        // same request also sending assignee_id). This is the real
        // enforcement behind "status can't be changed during assignment,
        // and assignment can't be used to sneak in an arbitrary status."
        if (status === 'assigned' && assignee_id === undefined)
        {
            return res.status(400).json({ message: 'status "assigned" can only be set by assigning the asset to an employee' });
        }

        // assignee_id is optional and tri-state: absent (undefined) means
        // "don't touch it", null means "unassign", a number means "assign
        // to this user" — that's why this can't use `?? existing...` like
        // the other fields, since `??` treats null the same as undefined.
        let finalAssigneeId = existing.current_assignee_id;
        let assigneeName = null;

        if (assignee_id !== undefined)
        {
            if (assignee_id === null)
            {
                finalAssigneeId = null;
            }
            else
            {
                const [assigneeRows] = await connection.query('SELECT id, full_name FROM users WHERE id = ?', [assignee_id]);
                if (assigneeRows.length === 0)
                {
                    return res.status(400).json({ message: 'assignee_id does not refer to an existing user' });
                }
                finalAssigneeId = assignee_id;
                assigneeName = assigneeRows[0].full_name;
            }
        }

        // Status is derived, not client-chosen, whenever this call is
        // touching the assignment (assignee_id present) — that's what
        // keeps status from drifting out of sync with current_assignee_id,
        // and it's the actual enforcement behind "status can't be changed
        // during assignment." Outside of an assignment call, status is a
        // plain manual field (used for under_repair / retired / back to
        // available).
        let finalStatus;
        if (assignee_id !== undefined)
        {
            if (finalAssigneeId !== null)
            {
                finalStatus = 'assigned';
            }
            else
            {
                // Unassigning only snaps back to "available" if assignment
                // is what made it unavailable in the first place —
                // under_repair / retired survive an unassign.
                finalStatus = existing.status === 'assigned' ? 'available' : existing.status;
            }
        }
        else
        {
            finalStatus = status ?? existing.status;
        }

        // Belt-and-suspenders: structurally this should already be
        // unreachable given the checks above, but it's cheap insurance
        // against a future change reintroducing the bug this originally
        // fixed (status "assigned" with no assignee).
        if (finalStatus === 'assigned' && finalAssigneeId === null)
        {
            return res.status(400).json({ message: 'Cannot set status to "assigned" without an assignee' });
        }

        const finalCategoryId = category_id ?? existing.category_id;

        // A fresh assignment (to someone new, including from unassigned)
        // always starts out "active" — it shouldn't inherit whatever
        // active/dormant state the previous assignee left it in.
        const isNewAssignment = assignee_id !== undefined
            && finalAssigneeId !== existing.current_assignee_id
            && finalAssigneeId !== null;
        const finalUsageState = isNewAssignment ? 'active' : existing.usage_state;

        await connection.beginTransaction();

        await connection.query(
        `UPDATE assets
        SET name = ?, category_id = ?, purchase_date = ?, purchase_cost = ?, status = ?, \`condition\` = ?, current_assignee_id = ?, usage_state = ?
        WHERE id = ?`,
        [
            name ?? existing.name,
            finalCategoryId,
            purchase_date ?? existing.purchase_date,
            purchase_cost ?? existing.purchase_cost,
            finalStatus,
            condition ?? existing.condition,
            finalAssigneeId,
            finalUsageState,
            id,
        ]
        );

        if (spec_values !== undefined) 
        {

            if (!finalCategoryId) 
            {
                throw new Error('Cannot set spec_values on an asset with no category_id');
            }

            await validateAndWriteSpecValues(connection, id, finalCategoryId, spec_values);
        }

        
        // Only log a separate status_change entry for status moves made
        // through the general status field (assignee_id absent) — a status
        // flip that's purely a side effect of assigning/unassigning is
        // already captured by the 'assignment' entry below, so logging
        // both would just be noise.
        if (assignee_id === undefined && finalStatus !== existing.status)
        {
            await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'status_change', ?, ?)`,
            [req.user.id, `Status changed from "${existing.status}" to "${finalStatus}"`, id]);
        }


        if (condition && condition !== existing.condition)
        {
            await connection.query(
                `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
                VALUES (?, 'condition_change', ?, ?)`,
                [req.user.id, `Condition changed from "${existing.condition}" to "${condition}"`, id]
            );
        }

        if (assignee_id !== undefined && finalAssigneeId !== existing.current_assignee_id)
        {
            await recordAssignmentEvent(connection, {
                assetId: id,
                performedBy: req.user.id,
                previousAssigneeId: existing.current_assignee_id,
                newAssigneeId: finalAssigneeId,
                newAssigneeName: assigneeName,
            });
        }

        await connection.commit();
        return res.json({ message: 'Asset updated' });
    }
    
    catch (err)
    {
        await connection.rollback();
        console.error(err);
        return res.status(400).json({ message: err.message || 'Server error updating asset' });
    } 
    
    finally 
    {
        connection.release();
    }
}


// ================================================================
// RETIRE ASSET
// ================================================================
// no deletion, cuz we want its history
export async function retireAsset(req, res)
{
    const connection = await pool.getConnection();

    try {

        const id = req.params.id;
        const reason = req.body.reason;


        // ------------------------------------------------------------
        // CHECK THAT ASSET EXISTS
        // ------------------------------------------------------------

        const result = await connection.query(
            'SELECT * FROM assets WHERE id = ?',
            [id]
        );


        const existingAssets = result[0];


        if (existingAssets.length === 0) {

            return res.status(404).json({
                message: 'Asset not found'
            });

        }

        await connection.beginTransaction();

        // ------------------------------------------------------------
        // CHANGE STATUS TO RETIRED
        // ------------------------------------------------------------

        await connection.query(
            `UPDATE assets
             SET status = 'retired'
             WHERE id = ?`,
            [id]
        );


        // ------------------------------------------------------------
        // ADD RETIREMENT TO HISTORY
        // ------------------------------------------------------------

        // If the user didn't provide a reason,
        // use "Asset retired".

        let retirementReason = reason;

        if (!retirementReason) {
            retirementReason = 'Asset retired';
        }


        await connection.query(
            `INSERT INTO asset_history
            (
                performed_by,
                event_type,
                description,
                asset_id
            )
            VALUES (?, 'retirement', ?, ?)`,
            [
                req.user.id,
                retirementReason,
                id
            ]
        );

        await connection.commit();

        return res.json({
            message: 'Asset retired'
        });

    }

    catch (error) {

        await connection.rollback();
        console.error(error);

        return res.status(500).json({
            message: 'Server error retiring asset'
        });

    }

    finally {
        connection.release();
    }
}

// ================================================================
// DISPOSE ASSET
// ================================================================
// Distinct from retire: retired means pulled from service but still
// around; disposed means physically gone for good. Same row, no separate
// table — just a terminal status plus disposed_at, same pattern as
// retireAsset above.
export async function disposeAsset(req, res)
{
    const connection = await pool.getConnection();

    try {

        const id = req.params.id;
        const reason = req.body.reason;

        const [existingAssets] = await connection.query(
            'SELECT * FROM assets WHERE id = ?',
            [id]
        );

        if (existingAssets.length === 0) {

            return res.status(404).json({
                message: 'Asset not found'
            });

        }

        await connection.beginTransaction();

        await connection.query(
            `UPDATE assets
             SET status = 'disposed', disposed_at = NOW()
             WHERE id = ?`,
            [id]
        );

        const disposalReason = reason || 'Asset disposed of';

        await connection.query(
            `INSERT INTO asset_history
            (
                performed_by,
                event_type,
                description,
                asset_id
            )
            VALUES (?, 'disposal', ?, ?)`,
            [
                req.user.id,
                disposalReason,
                id
            ]
        );

        await connection.commit();

        return res.json({
            message: 'Asset disposed of'
        });

    }

    catch (error) {

        await connection.rollback();
        console.error(error);

        return res.status(500).json({
            message: 'Server error disposing of asset'
        });

    }

    finally {
        connection.release();
    }
}

// ================================================================
// MY ASSETS (employee self-service)
// ================================================================
// Everything currently assigned to the logged-in user, plus a bucketed
// summary. "under_repair" always wins the bucket over usage_state — an
// asset being repaired isn't meaningfully "active" or "dormant" right now.
export async function getMyAssignedAssets(req, res)
{
    try
    {
        const myId = req.user.id;

        const [assets] = await pool.query(
            `SELECT
                a.id, a.asset_tag, a.name, a.status, a.condition, a.usage_state,
                c.name AS category_name,
                aa.acknowledged_at, aa.assigned_at

            FROM assets a

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN asset_assignments aa
                ON aa.asset_id = a.id AND aa.is_active = 1

            WHERE a.current_assignee_id = ?
            ORDER BY a.name`,
            [myId]
        );

        const summary = { active: 0, dormant: 0, under_repair: 0 };
        for (const asset of assets)
        {
            if (asset.status === 'under_repair') summary.under_repair += 1;
            else if (asset.usage_state === 'dormant') summary.dormant += 1;
            else summary.active += 1;
        }

        return res.json({ data: assets, summary });
    }

    catch (error)
    {
        console.error(error);
        return res.status(500).json({ message: 'Server error fetching your assets' });
    }
}

// ================================================================
// PENDING ACKNOWLEDGEMENTS (employee self-service)
// ================================================================
// Assignments made to the logged-in user that they haven't acknowledged
// receipt of yet.
export async function getPendingAcknowledgements(req, res)
{
    try
    {
        const myId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                aa.id AS assignment_id, aa.assigned_at,
                a.id AS asset_id, a.asset_tag, a.name, a.condition,
                c.name AS category_name,
                u.full_name AS assigned_by_name

            FROM asset_assignments aa

            JOIN assets a
                ON aa.asset_id = a.id

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN users u
                ON aa.assigned_by = u.id

            WHERE aa.employee_id = ? AND aa.is_active = 1 AND aa.acknowledged_at IS NULL
            ORDER BY aa.assigned_at DESC`,
            [myId]
        );

        return res.json(rows);
    }

    catch (error)
    {
        console.error(error);
        return res.status(500).json({ message: 'Server error fetching pending acknowledgements' });
    }
}

// ================================================================
// MY ACKNOWLEDGEMENTS (employee self-service — full history)
// ================================================================
// Every assignment event the employee has ever had, acknowledged or not —
// this is the "click one to see its details" list, as opposed to
// getPendingAcknowledgements above which is only the ones still needing
// action.
export async function getMyAcknowledgements(req, res)
{
    try
    {
        const myId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                aa.id AS assignment_id, aa.assigned_at, aa.acknowledged_at, aa.returned_at, aa.is_active,
                a.id AS asset_id, a.asset_tag, a.name, a.condition,
                c.name AS category_name,
                u.full_name AS assigned_by_name

            FROM asset_assignments aa

            JOIN assets a
                ON aa.asset_id = a.id

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN users u
                ON aa.assigned_by = u.id

            WHERE aa.employee_id = ?
            ORDER BY aa.assigned_at DESC`,
            [myId]
        );

        return res.json(rows);
    }

    catch (error)
    {
        console.error(error);
        return res.status(500).json({ message: 'Server error fetching your acknowledgements' });
    }
}

// ================================================================
// ACKNOWLEDGEMENT DETAIL (employee self-service — a single assignment event)
// ================================================================
export async function getAcknowledgementById(req, res)
{
    try
    {
        const { id } = req.params; // assignment id
        const myId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                aa.id AS assignment_id, aa.assigned_at, aa.acknowledged_at, aa.returned_at, aa.is_active, aa.employee_id,
                a.id AS asset_id, a.asset_tag, a.name, a.condition, a.status AS asset_status,
                c.name AS category_name,
                u.full_name AS assigned_by_name

            FROM asset_assignments aa

            JOIN assets a
                ON aa.asset_id = a.id

            LEFT JOIN categories c
                ON a.category_id = c.id

            LEFT JOIN users u
                ON aa.assigned_by = u.id

            WHERE aa.id = ?`,
            [id]
        );

        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Acknowledgement not found' });
        }

        if (rows[0].employee_id !== myId)
        {
            return res.status(403).json({ message: 'This is not your acknowledgement' });
        }

        return res.json(rows[0]);
    }

    catch (error)
    {
        console.error(error);
        return res.status(500).json({ message: 'Server error fetching acknowledgement' });
    }
}

// ================================================================
// ACKNOWLEDGE ASSIGNMENT (employee self-service)
// ================================================================
export async function acknowledgeAssignment(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params; // asset id
        const myId = req.user.id;

        const [rows] = await connection.query(
            `SELECT * FROM asset_assignments
            WHERE asset_id = ? AND employee_id = ? AND is_active = 1 AND acknowledged_at IS NULL
            ORDER BY assigned_at DESC LIMIT 1`,
            [id, myId]
        );

        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'No pending assignment to acknowledge for this asset' });
        }

        await connection.beginTransaction();

        await connection.query(
            'UPDATE asset_assignments SET acknowledged_at = NOW() WHERE id = ?',
            [rows[0].id]
        );

        await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'acknowledgement', 'Employee acknowledged receipt of this asset', ?)`,
            [myId, id]
        );

        await connection.commit();
        return res.json({ message: 'Assignment acknowledged' });
    }

    catch (error)
    {
        await connection.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Server error acknowledging assignment' });
    }

    finally
    {
        connection.release();
    }
}

// ================================================================
// SET USAGE STATE — active / dormant (employee self-service)
// ================================================================
// Only the current assignee can toggle this, and only while the asset is
// actually assigned — under_repair/retired/available assets don't have a
// meaningful active/dormant state.
export async function setUsageState(req, res)
{
    const connection = await pool.getConnection();
    try
    {
        const { id } = req.params;
        const { usage_state } = req.body;
        const myId = req.user.id;

        if (!VALID_USAGE_STATES.includes(usage_state))
        {
            return res.status(400).json({ message: `usage_state must be one of: ${VALID_USAGE_STATES.join(', ')}` });
        }

        const [rows] = await connection.query('SELECT * FROM assets WHERE id = ?', [id]);
        if (rows.length === 0)
        {
            return res.status(404).json({ message: 'Asset not found' });
        }
        const asset = rows[0];

        if (asset.current_assignee_id !== myId)
        {
            return res.status(403).json({ message: 'You can only update the usage state of assets assigned to you' });
        }

        if (asset.status !== 'assigned')
        {
            return res.status(400).json({ message: 'Usage state can only be changed while the asset is assigned' });
        }

        if (usage_state === asset.usage_state)
        {
            return res.json({ message: 'Usage state unchanged' });
        }

        await connection.beginTransaction();

        await connection.query('UPDATE assets SET usage_state = ? WHERE id = ?', [usage_state, id]);

        await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'usage_state_change', ?, ?)`,
            [myId, `Marked as ${usage_state} by employee`, id]
        );

        await connection.commit();
        return res.json({ message: `Marked as ${usage_state}` });
    }

    catch (error)
    {
        await connection.rollback();
        console.error(error);
        return res.status(400).json({ message: error.message || 'Server error updating usage state' });
    }

    finally
    {
        connection.release();
    }
}