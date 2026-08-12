// there is no separate "employees" table in our
// database. Employees are just rows in the "users" table where
// role = 'employee'. So all the functions below are really just querying
// the "users" table, but filtering/labeling things as "employee" stuff.
//
// Departments are connected through a separate table called
// "employee_departments" (this is a "join table" - it just links an
// employee_id to a department_id, since one employee could technically
// belong to more than one department).


import bcrypt from 'bcrypt';
import pool from '../config/db.js';


// these are the self service functions
export async function getMyProfile(req, res) {
  try 
  {
        // req.user.id comes from the JWT - it's whoever is currently logged in
        const myId = req.user.id;
    
        const [users] = await pool.query(
        `
        SELECT id, full_name, email, role, is_active, created_at, updated_at
        FROM users WHERE id = ? `, [myId] );
    
        if (users.length === 0) 
        {
            // this really shouldn't happen it would mean their token is valid
            // but their user row got deleted
            return res.status(404).json({ message: 'User not found' });
        }
    
        const myProfile = users[0];
    
        // depts I am assigned to
        const [departments] = await pool.query(
        `
        SELECT d.id, d.name
        FROM departments d
        JOIN employee_departments ed ON d.id = ed.department_id
        WHERE ed.employee_id = ? `,[myId]);
    
        // assets assigned to me
        const [assignedAssets] = await pool.query(
        `
        SELECT id, asset_tag, name, status, \`condition\`
        FROM assets
        WHERE current_assignee_id = ? `,[myId]);
    
        myProfile.departments = departments;
        myProfile.assigned_assets = assignedAssets;
    
        return res.json(myProfile);
    } 
    
    catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching your profile' });
    }
}


// GET ALL EMPLOYEES (admin view of all employees)
// Supports optional search via ?search=something in the URL
// Also supports filtering by department via ?department_id=3

export async function getAllEmployees(req, res) 
{
  try 
    {

        const search = req.query.search;
        const departmentId = req.query.department_id;
    
        // Step 2: we will build up the SQL query and its values step by step,
        // starting with the base query that always runs.
        let sqlQuery = `
        SELECT
            u.id,u.full_name,u.email,
            u.role,u.is_active,u.created_at

        FROM users u WHERE u.role = 'employee'`;
    
        // This array holds the actual values that go where the "?" marks are
        // in the query - keeping values separate from the query will prevent sql injection
        const queryValues = [];
    
        // if a search term was given, add a filter
        if (search) 
        {
            sqlQuery += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
            queryValues.push(`%${search}%`, `%${search}%`);
        }
    
        //if filtering by department, we need to also look inside the employee_departments
        if (departmentId) 
        {
            sqlQuery += `
            AND u.id IN (
            SELECT employee_id FROM employee_departments WHERE department_id = ?
            )`;
            queryValues.push(departmentId);
        }
    
        sqlQuery += ' ORDER BY u.full_name ASC';
    
        const [employees] = await pool.query(sqlQuery, queryValues);
    
        // for each employee, also grab which department(s) they belong to.
        // We do this as a separate loop rather than one giant JOIN query
        for (let i = 0; i < employees.length; i++) 
        {
        
            const [departments] = await pool.query(`
            SELECT d.id, d.name
            FROM departments d
            JOIN employee_departments ed ON d.id = ed.department_id
            WHERE ed.employee_id = ?
            `,
            [employees[i].id]
            );
            employees[i].departments = departments;
        }
        return res.json(employees);
    } 
  
  catch (err) 
    {
      console.error(err);
        return res.status(500).json({ message: 'Server error fetching employees' });
    }
}
 
/////////////// get employee details

export async function getEmployeeById(req, res) 
{
  try 
  {
        const employeeId = req.params.id;
    
        const [users] = await pool.query(
        `
        SELECT id, full_name, email, role, is_active, created_at, updated_at
        FROM users
        WHERE id = ? AND role = 'employee'
        `,[employeeId]);
    
        if (users.length === 0) 
        {
            return res.status(404).json({ message: 'Employee not found' });
        }
    
        const employee = users[0];
    
        const [departments] = await pool.query(
        `
        SELECT d.id, d.name
        FROM departments d
        JOIN employee_departments ed ON d.id = ed.department_id
        WHERE ed.employee_id = ? `,[employeeId]);
    
        //get the assets currently assigned to them

        const [assignedAssets] = await pool.query(
        `
        SELECT id, asset_tag, name, status, \`condition\`
        FROM assets
        WHERE current_assignee_id = ?`,[employeeId]);
    
        employee.departments = departments;
        employee.assigned_assets = assignedAssets;
        return res.json(employee);
    } 
  
  catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error fetching employee' });
    }
}
 

/////////////////////
// PROFILE UPDATION
///////////////////////
export async function updateMyProfile(req, res)
{
    try
    {
        const myId = req.user.id;
        const fullName = req.body.full_name;
        if(!fullName)
        {
            return res.status(400).json({ message: 'full_name is required' });
        }
        await pool.query(
            'UPDATE users SET full_name = ? WHERE id = ?',
            [fullName, myId]
        );

        return res.json({ message: 'Profile updated successfully' });
 
    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json({message:"profile updation error on the server side"})
    }
}



// UPDATE AN EMPLOYEE'S PROFILE
// This handles: changing name, and reassigning departments
export async function updateEmployee(req, res)
{
  const connection = await pool.getConnection();
  try
    {
        const employeeId = req.params.id;
        const fullName = req.body.full_name;
        const departmentIds = req.body.department_ids; // expects an array, e.g. [1, 3]

        // check if it exists
        const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE id = ? AND role = ?',
        [employeeId, 'employee']
        );

        if (existingUsers.length === 0)
        {
        return res.status(404).json({ message: 'Employee not found' });
        }

        const currentEmployee = existingUsers[0];

        const newFullName = fullName !== undefined ? fullName : currentEmployee.full_name;

        if (departmentIds !== undefined && !Array.isArray(departmentIds))
        {
            return res.status(400).json({ message: 'department_ids must be an array' });
        }

        await connection.beginTransaction();

        await connection.query(
        'UPDATE users SET full_name = ? WHERE id = ?',
        [newFullName, employeeId]
        );

        if (departmentIds !== undefined)
        {
            if (departmentIds.length > 0)
            {
                const [validDepartments] = await connection.query(
                'SELECT id FROM departments WHERE id IN (?)',
                [departmentIds]
                );

                if (validDepartments.length !== new Set(departmentIds).size)
                {
                    await connection.rollback();
                    return res.status(400).json({ message: 'One or more department_ids do not exist' });
                }
            }

            await connection.query('DELETE FROM employee_departments WHERE employee_id = ?', [employeeId]);

            for (const departmentId of departmentIds)
            {
                await connection.query(
                'INSERT INTO employee_departments (employee_id, department_id) VALUES (?, ?)',
                [employeeId, departmentId]
                );
            }
        }

        await connection.commit();
        return res.json({ message: 'Employee updated successfully' });
    }

  catch (err)
  {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: 'Server error updating employee' });
  }

  finally
  {
    connection.release();
  }
}
 
// ACTIVATE OR DEACTIVATE AN EMPLOYEE

export async function setEmployeeActiveStatus(req, res) 
{
  try 
  {
        const employeeId = req.params.id;
        const isActive = req.body.is_active; // expects true or false
    
        if (isActive === undefined) 
        {
            return res.status(400).json({ message: 'is_active (true or false) is required' });
        }
    
        const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [employeeId, 'employee']);
    
        if (existingUsers.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
        }
    
        await pool.query(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive, employeeId] );
    
        const statusWord = isActive ? 'activated' : 'deactivated';
        return res.json({ message: `Employee has been ${statusWord}` });
    } 
    
    catch (err) 
    {
        console.error(err);
        return res.status(500).json({ message: 'Server error changing employee status' });
    }
}
