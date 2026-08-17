import pool from '../config/db.js';

//valid statuses for a given asset

const VALID_STATUSES = ['available', 'assigned', 'under_repair', 'retired'];

const VALID_CONDITIONS = ['new', 'good', 'fair', 'damaged'];


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

        // ------------------------------------------------------------
        // asset history
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


        const history = historyResult[0];

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

        // "assigned" is meaningless without someone to assign it to — this
        // is the actual source of truth (the frontend also blocks this,
        // but that's just UX; this is what stops it for real, e.g. if the
        // API is called directly).
        const finalStatus = status ?? existing.status;
        if (finalStatus === 'assigned' && finalAssigneeId === null)
        {
            return res.status(400).json({ message: 'Cannot set status to "assigned" without an assignee' });
        }

        const finalCategoryId = category_id ?? existing.category_id;

        await connection.beginTransaction();

        await connection.query(
        `UPDATE assets
        SET name = ?, category_id = ?, purchase_date = ?, purchase_cost = ?, status = ?, \`condition\` = ?, current_assignee_id = ?
        WHERE id = ?`,
        [
            name ?? existing.name,
            finalCategoryId,
            purchase_date ?? existing.purchase_date,
            purchase_cost ?? existing.purchase_cost,
            status ?? existing.status,
            condition ?? existing.condition,
            finalAssigneeId,
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

        
        if (status && status !== existing.status) 
        {
            await connection.query(
            `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
            VALUES (?, 'status_change', ?, ?)`,
            [req.user.id, `Status changed from "${existing.status}" to "${status}"`, id]);
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
            const description = finalAssigneeId === null
                ? 'Asset unassigned'
                : `Assigned to ${assigneeName}`;

            await connection.query(
                `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
                VALUES (?, 'assignment', ?, ?)`,
                [req.user.id, description, id]
            );
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