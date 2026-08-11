import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

const CATEGORIES = [
  {
    name: 'laptop',
    specs: [
      { spec_name: 'RAM', spec_type: 'text', is_required: true },
      { spec_name: 'Storage', spec_type: 'text', is_required: true },
      { spec_name: 'Processor', spec_type: 'text', is_required: false },
      { spec_name: 'Operating System', spec_type: 'dropdown', is_required: false },
    ],
  },
  {
    name: 'monitor',
    specs: [
      { spec_name: 'Screen Size', spec_type: 'text', is_required: true },
      { spec_name: 'Resolution', spec_type: 'text', is_required: false },
    ],
  },
  {
    name: 'desk_chair',
    specs: [
      { spec_name: 'Has Headrest', spec_type: 'boolean', is_required: false },
      { spec_name: 'Adjustable Height', spec_type: 'boolean', is_required: false },
    ],
  },
  {
    name: 'phone',
    specs: [
      { spec_name: 'Storage', spec_type: 'text', is_required: true },
      { spec_name: 'IMEI', spec_type: 'text', is_required: true },
    ],
  },
];

async function seed() 
{
  const connection = await pool.getConnection();
  try 
    {
        for (const category of CATEGORIES) 
        {
            const [existing] = await connection.query('SELECT id FROM categories WHERE name = ?', [category.name]);

            if (existing.length > 0)    
            {
                console.log(`Skipping "${category.name}" — already exists`);
                continue;
            }

            await connection.beginTransaction();

            const [catResult] = await connection.query('INSERT INTO categories (name) VALUES (?)', [category.name]);
            const categoryId = catResult.insertId;

            for (const spec of category.specs)  
            {
                await connection.query(
                `INSERT INTO category_specs (category_id, spec_name, spec_type, is_required)
                VALUES (?, ?, ?, ?)`,
                [categoryId, spec.spec_name, spec.spec_type, spec.is_required]
                );
            }

            await connection.commit();
            console.log(`Created "${category.name}" with ${category.specs.length} specs`);
        }

        console.log('Seeding complete.');
    }     
  
  catch (err) 
    {
        await connection.rollback();
        console.error('Seeding failed:', err);
    }
  
    finally 
    {
        connection.release();
        pool.end();
    }
}

seed();