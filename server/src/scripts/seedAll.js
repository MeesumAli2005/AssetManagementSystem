// Populates every table in the database with a small, consistent set of
// sample data so the app has something to click through / test against.
// Safe to re-run — every section checks for existing rows first and skips
// them, so nothing gets duplicated.
//
// Run with: node src/scripts/seedAll.js  (from the server/ directory)

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

dotenv.config();

const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Marketing'];

const USERS = [
  { full_name: 'Ayesha Khan', email: 'admin@eyratech.com', password: 'Admin@12345', role: 'administrator', departments: [] },
  { full_name: 'Bilal Ahmed', email: 'bilal.ahmed@eyratech.com', password: 'Employee@123', role: 'employee', departments: ['Engineering'] },
  { full_name: 'Sara Malik', email: 'sara.malik@eyratech.com', password: 'Employee@123', role: 'employee', departments: ['Sales'] },
  { full_name: 'Usman Tariq', email: 'usman.tariq@eyratech.com', password: 'Employee@123', role: 'employee', departments: ['HR'] },
  { full_name: 'Hina Riaz', email: 'hina.riaz@eyratech.com', password: 'Employee@123', role: 'employee', departments: ['Marketing', 'Engineering'] },
];

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

const ASSETS = [
  {
    asset_tag: 'LAP-001',
    name: 'Dell Latitude 5420',
    category: 'laptop',
    condition: 'good',
    assignedTo: 'bilal.ahmed@eyratech.com',
    specs: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel i7', 'Operating System': 'Windows 11' },
    document: { document_type: 'receipt', file_url: '/uploads/seed-lap-001-receipt.pdf' },
  },
  {
    asset_tag: 'LAP-002',
    name: 'MacBook Pro 14"',
    category: 'laptop',
    condition: 'new',
    assignedTo: null,
    specs: { RAM: '16GB', Storage: '1TB SSD' },
  },
  {
    asset_tag: 'MON-001',
    name: 'Dell UltraSharp 27"',
    category: 'monitor',
    condition: 'good',
    assignedTo: null,
    specs: { 'Screen Size': '27in', Resolution: '2560x1440' },
  },
  {
    asset_tag: 'CHR-001',
    name: 'Ergo Office Chair',
    category: 'desk_chair',
    condition: 'good',
    assignedTo: 'sara.malik@eyratech.com',
    specs: { 'Has Headrest': 'true', 'Adjustable Height': 'true' },
  },
  {
    asset_tag: 'PHN-001',
    name: 'iPhone 13',
    category: 'phone',
    condition: 'fair',
    assignedTo: null,
    specs: { Storage: '128GB', IMEI: '356938035643809' },
  },
];

async function seedDepartments(connection) {
  const ids = {};
  for (const name of DEPARTMENTS) {
    const [existing] = await connection.query('SELECT id FROM departments WHERE name = ?', [name]);
    if (existing.length > 0) {
      ids[name] = existing[0].id;
      continue;
    }
    const [result] = await connection.query('INSERT INTO departments (name, is_active) VALUES (?, 1)', [name]);
    ids[name] = result.insertId;
    console.log(`Created department "${name}"`);
  }
  return ids;
}

async function seedUsers(connection, departmentIds) {
  const ids = {};
  for (const user of USERS) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length > 0) {
      ids[user.email] = existing[0].id;
      continue;
    }

    const password_hash = await bcrypt.hash(user.password, 10);
    const [result] = await connection.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [user.full_name, user.email, password_hash, user.role]
    );
    ids[user.email] = result.insertId;
    console.log(`Created user "${user.email}" (${user.role})`);

    for (const deptName of user.departments) {
      await connection.query(
        'INSERT INTO employee_departments (employee_id, department_id) VALUES (?, ?)',
        [result.insertId, departmentIds[deptName]]
      );
    }
  }
  return ids;
}

async function seedCategories(connection) {
  const categoryIds = {};
  const specIds = {}; // specIds['laptop']['RAM'] = 5

  for (const category of CATEGORIES) {
    const [existing] = await connection.query('SELECT id FROM categories WHERE name = ?', [category.name]);
    if (existing.length > 0) {
      categoryIds[category.name] = existing[0].id;
      const [existingSpecs] = await connection.query(
        'SELECT id, spec_name FROM category_specs WHERE category_id = ?',
        [existing[0].id]
      );
      specIds[category.name] = {};
      for (const spec of existingSpecs) specIds[category.name][spec.spec_name] = spec.id;
      continue;
    }

    const [catResult] = await connection.query('INSERT INTO categories (name) VALUES (?)', [category.name]);
    categoryIds[category.name] = catResult.insertId;
    specIds[category.name] = {};

    for (const spec of category.specs) {
      const [specResult] = await connection.query(
        `INSERT INTO category_specs (category_id, spec_name, spec_type, is_required)
         VALUES (?, ?, ?, ?)`,
        [catResult.insertId, spec.spec_name, spec.spec_type, spec.is_required]
      );
      specIds[category.name][spec.spec_name] = specResult.insertId;
    }
    console.log(`Created category "${category.name}" with ${category.specs.length} specs`);
  }

  return { categoryIds, specIds };
}

async function seedAssets(connection, categoryIds, specIds, userIds, adminId) {
  for (const asset of ASSETS) {
    const [existing] = await connection.query('SELECT id FROM assets WHERE asset_tag = ?', [asset.asset_tag]);
    if (existing.length > 0) continue;

    const categoryId = categoryIds[asset.category];
    const assigneeId = asset.assignedTo ? userIds[asset.assignedTo] : null;
    const status = assigneeId ? 'assigned' : 'available';

    const [result] = await connection.query(
      `INSERT INTO assets
       (asset_tag, name, category_id, purchase_date, purchase_cost, status, \`condition\`, current_assignee_id)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [asset.asset_tag, asset.name, categoryId, 899.0, status, asset.condition, assigneeId]
    );
    const assetId = result.insertId;

    for (const [specName, value] of Object.entries(asset.specs)) {
      const categorySpecId = specIds[asset.category][specName];
      await connection.query(
        `INSERT INTO asset_spec_values (asset_id, category_spec_id, value) VALUES (?, ?, ?)`,
        [assetId, categorySpecId, value]
      );
    }

    await connection.query(
      `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
       VALUES (?, 'purchase', ?, ?)`,
      [adminId, `Asset "${asset.name}" (${asset.asset_tag}) added to inventory`, assetId]
    );

    if (assigneeId) {
      await connection.query(
        `INSERT INTO asset_history (performed_by, event_type, description, asset_id)
         VALUES (?, 'status_change', ?, ?)`,
        [adminId, `Assigned to ${asset.assignedTo}`, assetId]
      );
    }

    if (asset.document) {
      await connection.query(
        `INSERT INTO asset_documents (asset_id, document_type, file_url, uploaded_by)
         VALUES (?, ?, ?, ?)`,
        [assetId, asset.document.document_type, asset.document.file_url, adminId]
      );
    }

    console.log(`Created asset "${asset.asset_tag}" (${status})`);
  }
}

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const departmentIds = await seedDepartments(connection);
    const userIds = await seedUsers(connection, departmentIds);
    const { categoryIds, specIds } = await seedCategories(connection);
    await seedAssets(connection, categoryIds, specIds, userIds, userIds['admin@eyratech.com']);

    await connection.commit();
    console.log('Seeding complete.');
  } catch (err) {
    await connection.rollback();
    console.error('Seeding failed:', err);
  } finally {
    connection.release();
    pool.end();
  }
}

seed();
