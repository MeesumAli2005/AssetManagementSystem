# Asset Management and Tracking System

## Our Requirements

---

# 1. Problem Statement

Currently, there is no system in place for keeping records of the assets owned by the company. Although there might be some systems in place involving excel or manual book-keeping, these approaches do not allow for operations associated with assets, involving their management, delegation, records etc. Therefore, we need a digital system in place to cater to these problems. this is a tester line

The system should provide visibility into:

- Assets owned by the organization
- Assets assigned to employees
- Current asset status and condition
- Asset requests, returns, and repairs
- Complete asset history
- To some extent, insights dervied from assets' data

The system will have two primary interfaces:

1. Employee Interface
2. Administrator Interface

---

# 2. Authentication

The system should support:

- Login
- Signup or administrator-created accounts
- Password reset
- Logout
- Role-based access for employees and administrators

Users should be directed to the appropriate interface based on their role.

---

# 3. Employee Interface

The employee interface should allow employees to:

- View all assets assigned to them
- View the current status and condition of each asset
- View a summary of assigned assets (e.g., active, dormant, under repair)
- View the history of their assigned assets
- Mark an asset as active or dormant
- Report an asset as damaged or requiring repair
- Request additional assets
- Request the return of assets no longer required
- Acknowledge receipt of newly assigned assets
- View the status of submitted requests

Employee-submitted updates that affect official asset records should require administrator approval or verification.

---

# 4. Administrator Interface

The administrator interface should allow administrators to:

- View dashboard statistics and pending actions
- Manage employee accounts and profiles
- View all employees and their assigned assets
- Add, update, and manage assets
- View and manage the complete asset inventory
- Import assets through CSV or Excel files
- Generate and manage QR codes or barcodes for assets
- Assign assets to employees or departments
- Transfer assets between employees or departments
- Record and update asset status and condition
- Review and manage employee requests
- Approve or reject asset, repair, and return requests
- Confirm returned assets after physical verification
- Manage assets sent for repair
- Retire or dispose of assets while preserving history
- Search and filter assets
- View asset history
- View audit logs of administrative actions
- Generate reports

---

# 5. Asset Inventory

The inventory should contain all organizational assets.

Administrators should be able to:

- Search assets
- Filter assets
- View assigned and unassigned assets
- View assets by employee
- View assets by department
- View assets by category
- View assets by location
- View assets by status
- View purchase, assignment, repair, and return history
- Upload supporting documents such as receipts and repair records

Each asset should have a unique identifier.

---

# 6. Asset Requests

Employees should be able to request assets based on their work requirements.

Requests should consider:

- Employee department
- Job role
- Seniority
- Technical requirements
- Existing assigned assets
- Available inventory

The administrator will review the request and determine the appropriate asset assignment.

---

# 7. Asset Classification

Assets should be classified based on their specifications, quality, and condition.

This classification should assist administrators in:

- Comparing similar assets
- Selecting suitable assets for employees
- Making allocation decisions
- Matching assets to business and technical requirements

Asset allocation should primarily be based on job responsibilities and technical needs.

---

# 8. Core Workflows

## 8.1 Asset Registration

1. Administrator adds assets manually or through bulk import.
2. Asset information is validated.
3. QR code / barcode is generated.
4. Asset is added to the inventory.
5. Asset becomes available for assignment.

---

## 8.2 Asset Assignment

1. Administrator selects an available asset.
2. Asset is assigned to an employee or department.
3. Employee acknowledges receipt.
4. Assignment is recorded.

---

## 8.3 Asset Request

1. Employee submits an asset request.
2. Administrator reviews the request.
3. Administrator approves or rejects the request.
4. If approved, a suitable asset is assigned.
5. Assignment is recorded.

---

## 8.4 Asset Return

1. Employee submits a return request.
2. Administrator receives and inspects the asset.
3. Administrator confirms the return.
4. Asset status is updated.

---

## 8.5 Asset Transfer

1. Administrator initiates or approves an asset transfer.
2. Asset is reassigned to another employee or department.
3. Transfer is recorded.

---

## 8.6 Asset Repair

1. Employee submits a repair request.
2. Administrator reviews the request.
3. If approved, the asset is marked as under repair.
4. Repair details are recorded.
5. Asset is returned to the employee or inventory.

---

## 8.7 Asset Retirement

1. Administrator retires or disposes of an asset.
2. Asset is removed from active inventory.
3. Asset history is preserved.

---

# 9. Asset History and Audit Logs

The system should maintain a complete history of every asset, including:

- Purchase
- Assignment
- Transfer
- Return
- Repairs
- Status changes
- Condition changes
- Retirement or disposal

The system should also maintain audit logs that record administrative actions performed within the system.

---

# 10. Reports

The system should support generation of reports such as:

- Assets by employee
- Assets by department
- Assets by category
- Asset status
- Asset condition
- Repair history
- Purchase history
- Asset utilization
- Returned and retired assets

---

# 11. Initial Scope

The initial version of the system will include:

- Authentication (Login, Signup, Password Reset)
- Employee and Administrator roles
- Employee dashboard
- Administrator dashboard
- Employee management
- Asset registration
- Bulk asset import
- QR code / Barcode generation
- Asset inventory management
- Asset assignment
- Asset transfer
- Asset requests
- Asset return requests
- Repair requests
- Request approval workflow
- Asset status and condition management
- Asset classification
- Asset history
- Audit logs
- Search and filtering
- Reports