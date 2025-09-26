-- Tailored seed data: Office Supplies and Printers
-- Loaded in dev profile via spring.sql.init.* settings

-- Categories (minimal set for this demo)
INSERT INTO categories (name, description, color_code, icon, active, sort_order, created_at, updated_at) VALUES
('Printers', 'Printers and scanning equipment', '#10b981', '🖨️', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Accessories', 'Label makers, scanners, small office devices', '#6b7280', '🧰', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Demo/sample users removed for production
('opsmanager', 'ops.manager@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Olivia', 'Perez', 'Operations', 'Operations Manager', '555-0401', 'MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('reception', 'reception@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Riley', 'Nguyen', 'Facilities', 'Front Desk', '555-0402', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('marketingmgr', 'marketing.manager@company.com', '$2a$10$V6Jd8Oq1LqPXm5u4GXnzQeLLqNvZvGvJ9QJk6dN8E5Xb7Zz4N5p2K', 'Maya', 'Chen', 'Marketing', 'Marketing Manager', '555-0403', 'MANAGER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assets (printers + office devices)
-- Assume auto-increment IDs start at 1; category_id: Printers=1, Accessories=2
INSERT INTO assets (name, asset_tag, description, brand, model, serial_number, purchase_price, purchase_date, vendor, location, status, condition, warranty_expiry, next_maintenance, notes, category_id, created_at, updated_at) VALUES
('HP LaserJet Pro M404dn', 'PR-001', 'Main office monochrome laser printer', 'HP', 'LaserJet Pro M404dn', 'HP-LJ-M404-0001', 229.00, '2024-01-30', 'Staples', 'Front Office', 'ASSIGNED', 'GOOD', '2026-01-30', '2025-01-30', 'Networked printer for general use', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Canon imageCLASS MF743Cdw', 'PR-002', 'Color laser all-in-one for marketing', 'Canon', 'imageCLASS MF743Cdw', 'CAN-MF743-0001', 399.00, '2024-02-25', 'Best Buy', 'Marketing Area', 'ASSIGNED', 'EXCELLENT', '2026-02-25', '2025-02-25', 'Duplex color printing and scanning', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Brother HL-L3270CDW', 'PR-003', 'Compact color laser printer', 'Brother', 'HL-L3270CDW', 'BR-HLL3270-0001', 279.00, '2024-03-15', 'Amazon', 'Operations Bay', 'AVAILABLE', 'GOOD', '2026-03-15', '2025-03-15', 'Wireless printing enabled', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Epson EcoTank ET-4760', 'PR-004', 'Ink tank color printer for low cost per page', 'Epson', 'EcoTank ET-4760', 'EP-ET4760-0001', 499.00, '2024-04-05', 'Epson Store', 'Executive Suite', 'ASSIGNED', 'EXCELLENT', '2026-04-05', '2025-04-05', 'High-capacity refillable tanks', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DYMO LabelWriter 550', 'AC-001', 'USB label printer for shipping and file tags', 'DYMO', 'LabelWriter 550', 'DY-LW550-0001', 149.00, '2024-02-10', 'Office Depot', 'Shipping Station', 'ASSIGNED', 'GOOD', '2025-02-10', null, 'Thermal labels; no ink required', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fujitsu ScanSnap iX1600', 'AC-002', 'High-speed document scanner', 'Fujitsu', 'ScanSnap iX1600', 'FJ-IX1600-0001', 419.00, '2024-03-05', 'CDW', 'Records Room', 'ASSIGNED', 'EXCELLENT', '2026-03-05', '2024-10-05', 'Wi-Fi enabled; batch scanning', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign assets to users
-- asset_id: 1..6 in insertion order; user_id: 1..4 in insertion order
INSERT INTO asset_assignments (asset_id, user_id) VALUES
(1, 2), -- HP LaserJet -> opsmanager
(2, 4), -- Canon MF743 -> marketing manager
(4, 1), -- Epson EcoTank -> admin (executive suite)
(5, 3), -- DYMO LabelWriter -> reception
(6, 2); -- ScanSnap -> opsmanager

-- Maintenance records for printers
INSERT INTO maintenance_records (maintenance_type, description, maintenance_date, completed_date, status, priority, performed_by, vendor, cost, next_maintenance_date, notes, parts_used, downtime_hours, asset_id, created_by_user_id, created_at, updated_at) VALUES
('Toner Replacement', 'Replaced HP 58A toner cartridge', '2025-01-15', '2025-01-15', 'COMPLETED', 'MEDIUM', 'John Doe', 'HP', 89.99, '2025-07-15', 'Printer calibrated after replacement', 'HP 58A', 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Calibration', 'Color calibration and firmware update', '2025-02-10', null, 'SCHEDULED', 'LOW', 'Sarah Johnson', 'Canon', 0.00, '2025-08-10', 'Schedule during off-hours', 'None', null, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Roller Cleaning', 'Cleaned paper rollers to prevent jams', '2025-03-05', '2025-03-05', 'COMPLETED', 'LOW', 'Olivia Perez', 'Internal', 0.00, '2025-09-05', 'Jams reduced significantly', 'Cleaning kit', 0, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Ensure statuses are consistent
UPDATE assets SET status = 'ASSIGNED' WHERE id IN (1,2,4,5,6);
UPDATE assets SET status = 'AVAILABLE' WHERE id IN (3);
