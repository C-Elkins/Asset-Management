-- Sample data for IT Asset Management System
-- This data will be loaded when the application starts in dev mode

-- Insert Categories
INSERT INTO categories (name, description, color_code, icon, active, sort_order, created_at, updated_at) VALUES
('Laptops', 'Portable computers and workstations', '#3b82f6', '💻', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Desktop Computers', 'Desktop PCs and workstations', '#6366f1', '🖥️', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Monitors', 'Display screens and monitors', '#8b5cf6', '📺', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Network Equipment', 'Routers, switches, and network devices', '#06b6d4', '🌐', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Printers', 'Printers and scanning equipment', '#10b981', '🖨️', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mobile Devices', 'Smartphones and tablets', '#f59e0b', '📱', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Servers', 'Server hardware and infrastructure', '#ef4444', '🖲️', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Software Licenses', 'Software licenses and subscriptions', '#8b5cf6', '💿', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Accessories', 'Keyboards, mice, cables, and accessories', '#6b7280', '⌨️', true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Audio/Video', 'Cameras, microphones, and AV equipment', '#ec4899', '🎥', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Users
INSERT INTO users (username, email, password, first_name, last_name, department, job_title, phone_number, role, active, created_at, updated_at) VALUES
-- Super Admin
('admin', 'admin@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'System', 'Administrator', 'IT', 'System Administrator', '555-0001', 'SUPER_ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- IT Admins
('jdoe', 'john.doe@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'John', 'Doe', 'IT', 'IT Manager', '555-0101', 'IT_ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sjohnson', 'sarah.johnson@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Sarah', 'Johnson', 'IT', 'Network Administrator', '555-0102', 'IT_ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Managers
('mwilson', 'mike.wilson@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Mike', 'Wilson', 'Engineering', 'Engineering Manager', '555-0201', 'MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lbrown', 'lisa.brown@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Lisa', 'Brown', 'Marketing', 'Marketing Manager', '555-0202', 'MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regular Users
('asmith', 'alice.smith@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Alice', 'Smith', 'Engineering', 'Software Developer', '555-0301', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rjones', 'robert.jones@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Robert', 'Jones', 'Engineering', 'Senior Developer', '555-0302', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('edavis', 'emily.davis@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Emily', 'Davis', 'Marketing', 'Marketing Specialist', '555-0303', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dgarcia', 'david.garcia@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'David', 'Garcia', 'Sales', 'Sales Representative', '555-0304', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('jrodriguez', 'jessica.rodriguez@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Jessica', 'Rodriguez', 'HR', 'HR Specialist', '555-0305', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('klee', 'kevin.lee@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Kevin', 'Lee', 'Finance', 'Financial Analyst', '555-0306', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mmartinez', 'maria.martinez@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Maria', 'Martinez', 'Operations', 'Operations Coordinator', '555-0307', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Assets
INSERT INTO assets (name, asset_tag, description, brand, model, serial_number, purchase_price, purchase_date, vendor, location, status, condition, warranty_expiry, next_maintenance, notes, category_id, created_at, updated_at) VALUES
-- Laptops
('MacBook Pro 16"', 'LT001', 'High-performance laptop for development work', 'Apple', 'MacBook Pro 16-inch', 'MP16-2023-001', 2499.00, '2023-01-15', 'Apple Store', 'Engineering Floor 2', 'ASSIGNED', 'EXCELLENT', '2025-01-15', '2024-07-15', 'Primary development machine', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dell XPS 13', 'LT002', 'Ultrabook for business users', 'Dell', 'XPS 13 9315', 'DXS13-2023-002', 1299.00, '2023-02-20', 'Dell Direct', 'Marketing Floor 1', 'ASSIGNED', 'GOOD', '2026-02-20', '2024-08-20', 'Marketing team laptop', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ThinkPad X1 Carbon', 'LT003', 'Business laptop with excellent keyboard', 'Lenovo', 'ThinkPad X1 Carbon Gen 11', 'TP-X1C-2023-003', 1599.00, '2023-03-10', 'Lenovo', 'Sales Floor 1', 'AVAILABLE', 'GOOD', '2026-03-10', '2024-09-10', 'Spare laptop for sales team', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Surface Laptop 5', 'LT004', 'Microsoft Surface laptop for creative work', 'Microsoft', 'Surface Laptop 5', 'SL5-2023-004', 1399.00, '2023-04-05', 'Microsoft Store', 'HR Floor 1', 'ASSIGNED', 'EXCELLENT', '2026-04-05', '2024-10-05', 'HR department laptop', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Desktop Computers
('iMac 24"', 'DT001', 'All-in-one desktop for design work', 'Apple', 'iMac 24-inch M1', 'IM24-2023-001', 1499.00, '2023-01-20', 'Apple Store', 'Marketing Floor 1', 'ASSIGNED', 'EXCELLENT', '2025-01-20', '2024-07-20', 'Design workstation', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dell OptiPlex 7090', 'DT002', 'Business desktop computer', 'Dell', 'OptiPlex 7090', 'DO7090-2023-002', 899.00, '2023-02-15', 'Dell Direct', 'Finance Floor 1', 'ASSIGNED', 'GOOD', '2026-02-15', '2024-08-15', 'Finance workstation', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HP EliteDesk 800', 'DT003', 'Compact desktop for office work', 'HP', 'EliteDesk 800 G9', 'ED800-2023-003', 799.00, '2023-03-01', 'HP Direct', 'Operations Floor 1', 'AVAILABLE', 'GOOD', '2026-03-01', '2024-09-01', 'Spare desktop', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Monitors
('Dell UltraSharp 27"', 'MN001', '4K monitor for development', 'Dell', 'U2720Q', 'DU27-2023-001', 599.00, '2023-01-25', 'Dell Direct', 'Engineering Floor 2', 'ASSIGNED', 'EXCELLENT', '2026-01-25', null, 'Developer monitor', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LG 32" 4K Monitor', 'MN002', 'Large 4K monitor for design work', 'LG', '32UP550-W', 'LG32-2023-002', 449.00, '2023-02-10', 'Best Buy', 'Marketing Floor 1', 'ASSIGNED', 'GOOD', '2025-02-10', null, 'Design monitor', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ASUS ProArt 24"', 'MN003', 'Color-accurate monitor', 'ASUS', 'ProArt PA248QV', 'PA24-2023-003', 329.00, '2023-03-15', 'Amazon', 'HR Floor 1', 'AVAILABLE', 'GOOD', '2025-03-15', null, 'Spare monitor', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Network Equipment
('Cisco Switch 48-port', 'NW001', 'Main network switch for office', 'Cisco', 'Catalyst 2960-48TT-L', 'CS2960-2023-001', 1299.00, '2023-01-10', 'CDW', 'Server Room', 'ASSIGNED', 'EXCELLENT', '2028-01-10', '2024-07-10', 'Main office switch', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UniFi Access Point', 'NW002', 'Wireless access point for Floor 2', 'Ubiquiti', 'UniFi AP AC Pro', 'UAP-2023-002', 149.00, '2023-02-05', 'Ubiquiti Store', 'Engineering Floor 2', 'ASSIGNED', 'GOOD', '2026-02-05', '2024-08-05', 'WiFi access point', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Firewall Router', 'NW003', 'Security firewall and router', 'SonicWall', 'TZ370', 'SW-TZ370-2023-003', 299.00, '2023-01-05', 'CDW', 'Server Room', 'ASSIGNED', 'EXCELLENT', '2026-01-05', '2024-07-05', 'Main firewall', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Printers
('HP LaserJet Pro', 'PR001', 'Office laser printer', 'HP', 'LaserJet Pro M404dn', 'HLP-2023-001', 229.00, '2023-01-30', 'Staples', 'Office Floor 1', 'ASSIGNED', 'GOOD', '2025-01-30', '2024-07-30', 'Main office printer', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Canon Color Printer', 'PR002', 'Color printer for marketing', 'Canon', 'imageCLASS MF743Cdw', 'CC-2023-002', 399.00, '2023-02-25', 'Best Buy', 'Marketing Floor 1', 'ASSIGNED', 'EXCELLENT', '2025-02-25', '2024-08-25', 'Marketing color printer', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mobile Devices
('iPhone 14 Pro', 'MB001', 'Company iPhone for manager', 'Apple', 'iPhone 14 Pro', 'IP14P-2023-001', 999.00, '2023-01-12', 'Verizon', 'Mobile', 'ASSIGNED', 'EXCELLENT', '2025-01-12', null, 'Manager mobile device', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('iPad Air', 'MB002', 'Tablet for presentations', 'Apple', 'iPad Air 5th Gen', 'IPA5-2023-002', 599.00, '2023-02-18', 'Apple Store', 'Sales Floor 1', 'ASSIGNED', 'GOOD', '2025-02-18', null, 'Sales presentation tablet', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Servers
('Dell PowerEdge Server', 'SV001', 'Main application server', 'Dell', 'PowerEdge R740', 'DPE-R740-2023-001', 4999.00, '2023-01-08', 'Dell Enterprise', 'Data Center', 'ASSIGNED', 'EXCELLENT', '2026-01-08', '2024-07-08', 'Production server', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Backup Server', 'SV002', 'Backup and storage server', 'HPE', 'ProLiant DL380', 'HPE-DL380-2023-002', 3499.00, '2023-01-15', 'HPE Direct', 'Data Center', 'ASSIGNED', 'GOOD', '2026-01-15', '2024-07-15', 'Backup server', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Asset Assignments (Many-to-Many relationship)
INSERT INTO asset_assignments (asset_id, user_id) VALUES
-- Laptops
(1, 6),  -- MacBook Pro to Alice Smith (Developer)
(2, 8),  -- Dell XPS to Emily Davis (Marketing)
(4, 10), -- Surface Laptop to Jessica Rodriguez (HR)
-- Desktops
(5, 8),  -- iMac to Emily Davis (Marketing - design work)
(6, 11), -- Dell OptiPlex to Kevin Lee (Finance)
-- Monitors
(8, 6),  -- Dell UltraSharp to Alice Smith
(9, 8),  -- LG 4K to Emily Davis
-- Network Equipment
(11, 2), -- Cisco Switch to John Doe (IT Manager)
(12, 3), -- UniFi AP to Sarah Johnson (Network Admin)
(13, 2), -- Firewall to John Doe (IT Manager)
-- Printers
(14, 2), -- HP LaserJet managed by John Doe
(15, 5), -- Canon Color managed by Lisa Brown (Marketing Manager)
-- Mobile Devices
(16, 4), -- iPhone to Mike Wilson (Engineering Manager)
(17, 9), -- iPad to David Garcia (Sales)
-- Servers
(18, 2), -- Dell Server managed by John Doe
(19, 3); -- Backup Server managed by Sarah Johnson

-- Insert Maintenance Records
INSERT INTO maintenance_records (maintenance_type, description, maintenance_date, completed_date, status, priority, performed_by, vendor, cost, next_maintenance_date, notes, parts_used, downtime_hours, asset_id, created_by_user_id, created_at, updated_at) VALUES
-- Completed Maintenance
('Software Update', 'macOS Ventura update and security patches', '2024-01-15', '2024-01-15', 'COMPLETED', 'MEDIUM', 'John Doe', 'Apple', 0.00, '2024-07-15', 'Update completed successfully', 'None', 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hardware Cleaning', 'Deep cleaning of server components', '2024-02-01', '2024-02-01', 'COMPLETED', 'LOW', 'Sarah Johnson', 'Internal', 0.00, '2024-08-01', 'Server cleaned and tested', 'Compressed air, cleaning cloths', 2, 18, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Printer Maintenance', 'Toner replacement and calibration', '2024-02-15', '2024-02-15', 'COMPLETED', 'MEDIUM', 'John Doe', 'HP', 89.99, '2024-08-15', 'New toner installed', 'HP 58A Toner Cartridge', 0, 14, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Scheduled Maintenance
('Security Patch', 'Windows security updates and patches', '2024-07-20', null, 'SCHEDULED', 'HIGH', 'John Doe', 'Microsoft', 0.00, '2025-01-20', 'Monthly security update', 'None', null, 6, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Network Maintenance', 'Firmware update for network equipment', '2024-07-25', null, 'SCHEDULED', 'MEDIUM', 'Sarah Johnson', 'Cisco', 0.00, '2025-01-25', 'Scheduled firmware update', 'None', null, 11, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Backup Testing', 'Monthly backup system verification', '2024-07-30', null, 'SCHEDULED', 'HIGH', 'Sarah Johnson', 'Internal', 0.00, '2024-08-30', 'Verify backup integrity', 'None', null, 19, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- In Progress Maintenance
('Hardware Upgrade', 'RAM upgrade for development laptop', '2024-07-10', null, 'IN_PROGRESS', 'MEDIUM', 'John Doe', 'Crucial', 159.99, '2025-01-10', 'Upgrading to 32GB RAM', '32GB DDR4 RAM Kit', null, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Overdue Maintenance (for testing)
('System Cleanup', 'Disk cleanup and performance optimization', '2024-06-01', null, 'SCHEDULED', 'LOW', 'John Doe', 'Internal', 0.00, '2024-12-01', 'Overdue maintenance task', 'None', null, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Critical Maintenance
('Power Supply Issue', 'Server power supply replacement', '2024-07-12', null, 'SCHEDULED', 'CRITICAL', 'Dell Support', 'Dell', 299.99, null, 'Critical hardware failure', 'Dell 750W Power Supply', null, 18, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mobile Device Maintenance
('iOS Update', 'Update to latest iOS version', '2024-03-01', '2024-03-01', 'COMPLETED', 'MEDIUM', 'Mike Wilson', 'Apple', 0.00, '2024-09-01', 'iOS updated successfully', 'None', 0, 16, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update asset statuses based on assignments and maintenance
UPDATE assets SET status = 'ASSIGNED' WHERE id IN (1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19);
UPDATE assets SET status = 'IN_MAINTENANCE' WHERE id = 1; -- MacBook Pro under maintenance
UPDATE assets SET status = 'AVAILABLE' WHERE id IN (3, 7, 10); -- Available assets