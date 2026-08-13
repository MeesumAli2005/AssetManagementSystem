import pool from '../config/db.js';

// new department creation
//only admin can do this

export async function createDepartment(req, res)
{
    try
    {
        const name = req.body.name;

        if(!name)
        {
            return res.status(400).json({message: "department name is required"});
        }

        const [existingDepartments] = await pool.query('SELECT id FROM departments WHERE name = ?', [name]);

        if(existingDepartments.length > 0)
        {
            return res.status(409).json({ message: 'A department with this name already exists' });
        }

        const [result] = await pool.query(
        'INSERT INTO departments (name, is_active) VALUES (?, ?)',
        [name, true]);

        return res.status(201).json(
            {id: result.insertId, name: name,is_active: true,});
    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json({message: "server side err creating dept"});
    }

}


//get all dept, this is open to both admin and employees cuz
// employees need to work cross department

export async function getAllDepartments(req, res)
{
    try
    {
        const [departments] = await pool.query(
            'SELECT * FROM departments ORDER BY name ASC'
        );

        return res.json(departments);

    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json({message: "server side err getting all depts"});
    }
}

// department updation

export async function updateDepartment(req, res)
{
    try
    {
        const deptId = req.params.id;
        const name = req.body.name;
        const isActive = req.body.is_active;

        if (name === undefined || isActive === undefined) {
            return res.status(400).json({
                message: 'name and is_active are required'
            });
        }


        // checking if the department exists or not:

        const [existingDepartments] = await pool.query('SELECT * FROM departments WHERE id= ?' , [deptId]);
        if(existingDepartments.length === 0)
        {
            return res.status(404).json({message: "department was not found"});
        }

        //updation

        await pool.query(
            'UPDATE departments SET name =? , is_active=? WHERE id =?', [name, isActive, deptId]
        );

        return res.json({
            message: 'Department updated successfully'
        });

    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json(
            {
                message: "server side err updating the department"
            }
        );
    }
}

// department deletion
// blocked if any employee assigned to it

export async function deleteDepartment(req, res)
{
    try
    {
        const deptId = req.params.id;

        const [assignedEmployees] = await pool.query(
            'SELECT id FROM employee_departments WHERE department_id = ? LIMIT 1',
            [deptId]
        );

        if (assignedEmployees.length > 0)
        {
            return res.status(409).json({ message: 'Cannot delete a department that has employees assigned to it' });
        }

        const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [deptId]);

        if (result.affectedRows === 0)
        {
            return res.status(404).json({ message: 'department was not found' });
        }

        return res.json({ message: 'Department deleted successfully' });
    }

    catch(err)
    {
        console.error(err);
        return res.status(500).json(
            {
                message: "server side err deleting the department"
            }
        );
    }
}
