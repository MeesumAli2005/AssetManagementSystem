import pool from '../config/db.js';

const VALID_SPEC_TYPES = ['text', 'number', 'boolean', 'dropdown'];

export async function createCategory(req, res)
{
    // we need to make sure the transactions(filling up the category and its specs) are atomic
    const connection = await pool.getConnection();
    try
    {
        const {name, specs} = req.body;

        if(!name)
        {
            return res.status(400).json({message: "Category field is required"});
        }

        if(specs)
        {
            for (const spec of specs)
            {
                if(!spec.spec_name)
                {
                    return res.status(400).json({message: "Spec Name is required for each spec"});
                }

                if(spec.spec_type && !VALID_SPEC_TYPES.includes(spec.spec_type))
                {
                    return res.status(400).json({message: `The spec must be of one of these types: ${VALID_SPEC_TYPES.join(', ')}`});
                }
            }
        }

        await connection.beginTransaction();
        const [existing] = await connection.query('SELECT id FROM categories WHERE name =?' , [name]);

        if(existing.length>0)
        {
            await connection.rollback();
            return res.status(409).json({message: "Category already exists"});
        }

        const [categoryResult] = await connection.query('INSERT INTO categories (name) VALUES (?)', [name]);
        const categoryId = categoryResult.insertId;

        const createdSpecs =[];

        if(specs && specs.length>0)
        {
            for(const spec of specs)
            {
                const [specResult] = await connection.query(`INSERT INTO category_specs (category_id, spec_name, spec_type, is_required)
                VALUES (?, ?, ?, ?)`,[categoryId, spec.spec_name, spec.spec_type || 'text', !!spec.is_required] );

                createdSpecs.push({id: specResult.insertId, ...spec});
            }
        }

        await connection.commit();

        return res.status(201).json({id: categoryId, name, specs: createdSpecs});

    }

    catch(err)
    {
        await connection.rollback();
        console.error(err);

        return res.status(500).json({message: "Server side err creating the required category"});
    }

    finally
    {
        connection.release();
    }
}

export async function getAllCategories(req, res)
{
    try
    {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
        const [specs] = await pool.query('SELECT * FROM category_specs ORDER BY id');
    
        const result = categories.map((cat) => ({
            ...cat, specs: specs.filter((s) => s.category_id === cat.id),
        }));

        return res.json(result);

    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json({message: 'Server err fetching categories'});
    }
}

export async function getCategoryById(req, res)
{
    try
    {
        const {id} = req.params;
        const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id =?', [id]);

        if(categoryRows.length === 0)
        {
            return res.status(404).json({message: "Category not found"});
        }

        const [specs] = await pool.query('SELECT * FROM category_specs WHERE category_id =?', [id]);

        return res.json({...categoryRows[0], specs});
    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json({message: ' Server err fetching category'})
    }
}

export async function updateCategory(req, res) 
{
  try 
   {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required' });
    
        const [result] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
        }
        return res.json({ id, name });
   }  
   catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error updating category' });
    }
}
 
export async function deleteCategory(req, res) 
{
  try 
    {
        const { id } = req.params;
    
        const [assetsUsingIt] = await pool.query('SELECT id FROM assets WHERE category_id = ? LIMIT 1', [id]);
        if (assetsUsingIt.length > 0) {
        return res.status(409).json({ message: 'Cannot delete a category that has assets assigned to it' });
        }
        const connection = await pool.getConnection();

        try 
        {
            await connection.beginTransaction();
            await connection.query('DELETE FROM category_specs WHERE category_id = ?', [id]);
            const [result] = await connection.query('DELETE FROM categories WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) 
            {
                await connection.rollback();
                return res.status(404).json({ message: 'Category not found' });
            
            }
            await connection.commit();
            return res.json({ message: 'Category and its specs deleted' });
        } 
        
        finally {
        connection.release();
        }
    } 
    
    catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting category' });
  }
}
 
// ---------------------------------------------------------------------
export async function addSpecToCategory(req, res) 
{

    try 
    {
        const { id } = req.params; 
        const { spec_name, spec_type, is_required } = req.body;
    
        if (!spec_name) return res.status(400).json({ message: 'spec_name is required' });
        
        if (spec_type && !VALID_SPEC_TYPES.includes(spec_type)) 
        {
            return res.status(400).json({ message: `spec_type must be one of: ${VALID_SPEC_TYPES.join(', ')}` });
        }
    
        const [categoryRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
        
        if (categoryRows.length === 0) return res.status(404).json({ message: 'Category not found' });
    
        const [result] = await pool.query(
        `INSERT INTO category_specs (category_id, spec_name, spec_type, is_required)
        VALUES (?, ?, ?, ?)`, [id, spec_name, spec_type || 'text', !!is_required]);
    
        return res.status(201).json({ id: result.insertId, category_id: id, spec_name, spec_type: spec_type || 'text', is_required: !!is_required });
    }
   
   catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error adding spec' });
    }
}
 
export async function deleteSpec(req, res) 
{
  try 
    {
      const { specId } = req.params;
        const [result] = await pool.query('DELETE FROM category_specs WHERE id = ?', [specId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Spec not found' });
        return res.json({ message: 'Spec deleted' });
    } 
  
    catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error deleting spec' });
    }
}