const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
  console.log("Attempting to seed admin user...");
  
  const newUser = {
    name: 'System Admin', 
    emp_id: 'ADMIN001', 
    phone: '0000000000', 
    contact_email: 'pradhansayan2@gmail.com', 
    email: 'pradhansayan2@gmail.com', 
    password: 'Sayan@0306', 
    role: 'admin', 
    is_active: true
  };

  const { data, error } = await supabase
    .from("users")
    .insert([newUser])
    .select();

  if (error) {
    console.error("Error seeding admin:", error);
  } else {
    console.log("Admin user seeded successfully:", data);
  }
}

seedAdmin();
