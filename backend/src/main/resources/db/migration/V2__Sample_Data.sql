-- Sample initial data for IT Asset Management System
-- This inserts essential categories and basic setup data

-- Insert default asset categories
INSERT INTO categories (name, description, color_code, icon, active, sort_order) VALUES
('Computers', 'Desktop computers, workstations, and servers', '#1E40AF', 'desktop-computer', true, 1),
('Laptops', 'Portable computers and notebooks', '#7C3AED', 'laptop', true, 2),
('Mobile Devices', 'Smartphones, tablets, and mobile accessories', '#059669', 'device-mobile', true, 3),
('Networking', 'Routers, switches, access points, and network equipment', '#DC2626', 'globe-alt', true, 4),
('Monitors', 'Display screens and projectors', '#2563EB', 'desktop-computer', true, 5),
('Printers', 'Printers, scanners, and imaging devices', '#7C2D12', 'printer', true, 6),
('Storage', 'External drives, NAS, and storage systems', '#374151', 'server', true, 7),
('Audio/Video', 'Speakers, cameras, microphones, and AV equipment', '#BE185D', 'speaker-wave', true, 8),
('Accessories', 'Keyboards, mice, cables, and other peripherals', '#65A30D', 'cog', true, 9),
('Software', 'Software licenses and digital assets', '#0891B2', 'code-bracket', true, 10);

-- Note: Admin user will be created automatically by AdminInitializer for production
-- or DevAdminInitializer for development environment
