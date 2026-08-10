# Asset Management and Tracking System

---

# PART A — ORGANIZED REQUIREMENTS

## 1. Problem Statement

Currently, there is no system in place for keeping records of the assets owned by the company.
Although there might be some systems in place involving Excel or manual book-keeping, these
approaches do not allow for operations associated with assets, involving their management,
delegation, records etc. Therefore, we need a digital system in place to cater to these problems.

The system should provide visibility into:

- Assets owned by the organization
- Assets assigned to employees
- Current asset status and condition
- Asset requests, returns, and repairs
- Complete asset history
- To some extent, insights derived from assets' data

The system will have two primary interfaces:

1. Employee Interface
2. Administrator Interface

---

## 2. Authentication

The system should support:

- Login
- Signup or administrator-created accounts
- Password reset
- Logout
- Role-based access for employees and administrators

Users should be directed to the appropriate interface based on their role.

---

## 3. Employee Interface

The employee interface should allow employees to:

**View**

- View all assets assigned to them
- View the current status and condition of each asset
- View a summary of assigned assets (e.g., active, dormant, under repair)
- View the history of their assigned assets
- View the status of submitted requests

**Act**

- Mark an asset as active or dormant
- Acknowledge receipt of newly assigned assets
- Report an asset as damaged or requiring repair
- Request additional assets
- Request the return of assets no longer required

Employee-submitted updates that affect official asset records should require administrator approval
or verification.

---

## 4. Administrator Interface

The administrator interface should allow administrators to:

**Dashboard**

- View dashboard statistics and pending actions

**Employee Management**

- Manage employee accounts and profiles
- View all employees and their assigned assets

**Asset Management**

- Add, update, and manage assets
- View and manage the complete asset inventory
- Import assets through CSV or Excel files
- Assign assets to employees or departments
- Record and update asset status and condition
- Manage assets sent for repair
- Retire or dispose of assets while preserving history

**Requests**

- Review and manage employee requests
- Approve or reject asset, repair, and return requests
- Confirm returned assets after physical verification

**Visibility**

- Search and filter assets
- View asset history
- View audit logs of administrative actions

---

## 5. Asset Inventory

The inventory should contain all organizational assets. Each asset should have a unique identifier.

Administrators should be able to:

**Find**

- Search assets
- Filter assets

**Group and view**

- View assigned and unassigned assets
- View assets by employee
- View assets by department
- View assets by category
- View assets by status

**Records**

- View purchase, assignment, repair, and return history
- Upload supporting documents such as receipts and repair records

---

## 6. Asset Requests

Employees should be able to request assets based on their work requirements.

Requests should consider:

- Employee department
- Existing assigned assets
- Available inventory

The administrator will review the request and determine the appropriate asset assignment.

---

## 7. Core Workflows

### 7.1 Asset Registration

1. Administrator adds assets manually or through bulk import.
2. Asset information is validated.
3. Asset is added to the inventory.
4. Asset becomes available for assignment.

### 7.2 Asset Assignment

1. Administrator selects an available asset.
2. Asset is assigned to an employee or department.
3. Employee acknowledges receipt.
4. Assignment is recorded.

### 7.3 Asset Request

1. Employee submits an asset request.
2. Administrator reviews the request.
3. Administrator approves or rejects the request.
4. If approved, a suitable asset is assigned.
5. Assignment is recorded.

### 7.4 Asset Return

1. Employee submits a return request.
2. Administrator receives and inspects the asset.
3. Administrator confirms the return.
4. Asset status is updated.

### 7.5 Asset Repair

1. Employee submits a repair request.
2. Administrator reviews the request.
3. If approved, the asset is marked as under repair.
4. Repair details are recorded.
5. Asset is returned to the employee or inventory.

### 7.6 Asset Retirement

1. Administrator retires or disposes of an asset.
2. Asset is removed from active inventory.
3. Asset history is preserved.

---

## 8. Asset History and Audit Logs

The system should maintain a complete history of every asset, including:

- Purchase
- Assignment
- Return
- Repairs
- Status changes
- Condition changes
- Retirement or disposal

The system should also maintain audit logs that record administrative actions performed within the
system.

---

## 9. Initial Scope

The initial version of the system will include:

- Authentication (Login, Signup, Password Reset)
- Employee and Administrator roles
- Employee dashboard
- Administrator dashboard
- Employee management
- Asset registration
- Bulk asset import
- Asset inventory management
- Asset assignment
- Asset requests
- Asset return requests
- Repair requests
- Request approval workflow
- Asset status and condition management
- Asset history
- Audit logs
- Search and filtering

---

# PART B — TWO-WEEK DELIVERY PLAN

Each day is one self-contained area. All operations belonging to the same entity or workflow are
kept together on a single day rather than split across the plan. Every day depends only on the days
before it.

## Week 1 — Foundation, Employees and Assets

### Day 1 — Foundation and Data Model
- Project setup, environments, base configuration.
- Database schema for all entities: users and roles, employees, departments, categories, assets,
  assignments, requests, repairs, documents, asset history, audit logs.

### Day 2 — Authentication and Access Control
- Login, logout, password reset.
- Signup and/or administrator-created accounts.
- Role-based access control for employee and administrator.
- Role-based routing and the application shell for both interfaces.

### Day 3 — Asset Management
- Asset create, update, view, and manage.
- Categories, unique identifier, status and condition fields.
- Asset detail view.
- Supporting document upload (receipts, repair records).


### Day 4 — Employee Management
- Employee create, update, activate/deactivate, and profile management.
- Departments.
- Employee listing, search, and detail view.
- Administrator view of all employees.

### Day 5 — Inventory and Bulk Import
- Inventory listing with search, filter, and pagination.
- Views by employee, department, category, status, and assigned/unassigned.
- CSV/Excel bulk import with row validation and an import error report. (TBD)

## Week 2 — Lifecycle Workflows and Release

### Day 6 — Asset Assignment
- Assign an asset to an employee or department; record the assignment.
- Employee acknowledgement of receipt.
- Employee "My Assets" view with status, condition, and summary (active, dormant, under repair).
- Administrator view of each employee's assigned assets.

### Day 7 — Asset Requests
- Employee submits an asset request, considering department, existing assets, and available
  inventory.
- Administrator request queue: review, approve, or reject.
- Assign an asset against an approved request.
- Request status tracking, visible to the employee.

### Day 8 — Returns and Repairs
- Return request, administrator inspection, confirmation, and status update.
- Repair request, administrator review, under-repair state, repair details, and return to employee
  or inventory.
- Administrator records and updates asset status and condition.

### Day 9 — Retirement, History and Audit Logs
- Retire or dispose of an asset; removed from active inventory with history preserved.
- Asset history timeline: purchase, assignment, return, repairs, status and condition changes,
  retirement.
- Employee view of the history of their assigned assets.
- Audit log capture of administrative actions.

### Day 10 — Dashboards, Validation and Release
- Administrator dashboard: asset statistics and pending actions.
- Employee dashboard.
- Validation, error handling, and permission review across all interfaces.