-- Insert test users from the original JSON data
INSERT INTO users (name, emp_id, phone, contact_email, email, password, role, is_active) VALUES
('Super Admin', 'super-admin-001', '0000000000', 'pradhansayan2@gmail.com', 'pradhansayan2@gmail.com', 'Sayan@0306', 'superadmin', TRUE),
('supervisor', 'ddf2eccd-f0fd-4c10-895f-0cd2d4e76221', '455', 'supervisor@gmail.com', 'supervisor@gmail.com', 'supervisor@0306', 'supervisor', TRUE),
('validator', 'd5c70a42-5126-41ad-a28f-f0248fb45aef', '123', 'validator@gmail.com', 'validator@gmail.com', 'validator@0306', 'validator', TRUE),
('Admin', 'b4750d61-beb3-424e-b21f-a5b57ae347ef', '456', 'admin@gmail.com', 'admin@gmail.com', 'admin@0306', 'admin', TRUE),
('indrasis', 'c8ea439b-3d0d-46f2-b533-d4eca33bc080', '45455', 'supervisor3@gmail.com', 'supervisor3@gmail.com', 'supervisor@0306', 'supervisor', TRUE);