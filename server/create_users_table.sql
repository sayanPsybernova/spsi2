-- Create Users Table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emp_id TEXT UNIQUE NOT NULL, -- New field for Employee ID
  phone TEXT,
  contact_email TEXT, -- New field for optional contact email
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Storing as plain text per original app
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE, -- New field for active/inactive status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
