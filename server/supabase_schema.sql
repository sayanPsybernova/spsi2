-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Storing as plain text per original app (recommend hashing in production)
  role TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id TEXT NOT NULL, -- keeping as text to match legacy IDs or link to users.id
  supervisor_name TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  sugar_qty NUMERIC,
  sugar_price NUMERIC,
  total_sugar NUMERIC,
  salt_qty NUMERIC,
  salt_price NUMERIC,
  total_salt NUMERIC,
  grand_total NUMERIC,
  status TEXT DEFAULT 'Pending',
  remarks TEXT,
  admin_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (Optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- For this demo, we will create a policy to allow full access to the API (Service Role)
-- or public access if you just want it to work quickly without specific Auth setup.
-- UNCOMMENT THE LINES BELOW IF YOU ENCOUNTER PERMISSION ISSUES AND DON'T HAVE SERVICE ROLE SET UP
-- CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);

-- CREATE POLICY "Enable read access for all users" ON submissions FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON submissions FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON submissions FOR UPDATE USING (true);

-- Storage Bucket Setup (You need to create this in the Supabase Dashboard manually usually, but here is SQL if supported)
-- INSERT INTO storage.buckets (id, name) VALUES ('uploads', 'uploads');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'uploads' ); 
-- CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'uploads' );
