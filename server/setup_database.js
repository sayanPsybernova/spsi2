require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // First, let's check what tables exist
    console.log("Checking existing tables...");
    const { data: existingTables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.error("Error checking tables:", tablesError);
    } else {
      console.log(
        "Existing tables:",
        existingTables?.map((t) => t.table_name) || []
      );
    }

    // Create users table using raw SQL
    console.log("\nCreating users table...");
    const { data: createResult, error: createError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          emp_id TEXT UNIQUE,
          phone TEXT,
          contact_email TEXT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );
        
        -- Enable Row Level Security
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for public access (for demo purposes)
        DROP POLICY IF EXISTS "Enable read access for all users" ON users;
        CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
        CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Enable update access for all users" ON users;
        CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
        
        DROP POLICY IF EXISTS "Enable delete access for all users" ON users;
        CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);
      `,
      }
    );

    if (createError) {
      console.error("Error creating users table:", createError);

      // Try alternative approach - use direct SQL
      console.log("Trying direct table creation...");
      const { data, error } = await supabase.from("users").insert([
        {
          name: "Test User",
          email: "test@test.com",
          password: "test",
          role: "admin",
          is_active: true,
        },
      ]);

      if (error && !error.message.includes("does not exist")) {
        console.log("Users table might already exist");
      }
    } else {
      console.log("Users table created successfully");
    }

    // Create submissions table
    console.log("\nCreating submissions table...");
    const { data: subResult, error: subError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
        CREATE TABLE IF NOT EXISTS submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          supervisor_id TEXT NOT NULL,
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
          evidence_photos TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );
        
        -- Enable Row Level Security
        ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for public access (for demo purposes)
        DROP POLICY IF EXISTS "Enable read access for all users" ON submissions;
        CREATE POLICY "Enable read access for all users" ON submissions FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Enable insert access for all users" ON submissions;
        CREATE POLICY "Enable insert access for all users" ON submissions FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Enable update access for all users" ON submissions;
        CREATE POLICY "Enable update access for all users" ON submissions FOR UPDATE USING (true);
      `,
      }
    );

    if (subError) {
      console.error("Error creating submissions table:", subError);
    } else {
      console.log("Submissions table created successfully");
    }

    // Test the tables
    console.log("\nTesting users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("count");
    if (usersError) {
      console.error("Users table test failed:", usersError);
    } else {
      console.log("Users table test passed");
    }

    console.log("\nTesting submissions table...");
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("count");
    if (submissionsError) {
      console.error("Submissions table test failed:", submissionsError);
    } else {
      console.log("Submissions table test passed");
    }
  } catch (err) {
    console.error("Database setup failed:", err);
  }
}

setupDatabase();
