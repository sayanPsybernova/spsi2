-- Users Table (Updated)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emp_id TEXT UNIQUE NOT NULL, -- Added Emp ID
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'validator')),
  phone TEXT,
  email TEXT,
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Work Orders (Master Data)
DROP TABLE IF EXISTS work_orders CASCADE;
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- e.g., WO-001
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Line Items (Master Data)
DROP TABLE IF EXISTS line_items CASCADE;
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., Excavation
  uom TEXT NOT NULL, -- e.g., cubic meter
  rate NUMERIC NOT NULL, -- Hidden from Supervisor
  standard_manpower TEXT, -- e.g., "1 Supervisor + 4 Labor"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Submissions (Transactional)
DROP TABLE IF EXISTS submissions CASCADE;
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID REFERENCES users(id),
  supervisor_name TEXT, -- Cache for display
  work_order_id UUID REFERENCES work_orders(id),
  line_item_id UUID REFERENCES line_items(id),
  
  -- Inputs
  quantity NUMERIC NOT NULL,
  actual_manpower TEXT,
  material_consumed TEXT,
  
  -- Snapshots/Calculated (Good practice to snapshot rates in case they change later)
  snapshot_rate NUMERIC, 
  snapshot_uom TEXT,
  
  -- Status
  status TEXT DEFAULT 'Pending Validation', -- Pending Validation, Approved, Rejected
  
  -- Validation
  validator_id UUID REFERENCES users(id),
  validator_name TEXT,
  remarks TEXT, -- Reason for rejection
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Admin (Password: admin123)
-- You might want to remove this if you already have users, or handle it in code
INSERT INTO users (name, emp_id, role, password, active)
VALUES ('Super Admin', 'ADMIN001', 'admin', 'admin123', TRUE)
ON CONFLICT (emp_id) DO NOTHING;
