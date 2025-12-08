require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log("Creating test user in lawyers table...");

    // First, let's see what columns are available by getting all
    const { data: sampleData, error: sampleError } = await supabase
      .from("lawyers")
      .select("*")
      .limit(1);
    if (sampleError) {
      console.error("Error getting sample data:", sampleError);
      return;
    }

    console.log("Sample lawyers data structure:", sampleData);

    // Try to insert a test user with available columns
    const { data: insertResult, error: insertError } = await supabase
      .from("lawyers")
      .insert([
        {
          email: "pradhansayan2@gmail.com",
          phone: "0000000000",
          is_active: true,
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Test user created successfully:", insertResult);
    }

    // Now try to query the user
    const { data: userData, error: queryError } = await supabase
      .from("lawyers")
      .select("*")
      .eq("email", "pradhansayan2@gmail.com")
      .eq("is_active", true);

    if (queryError) {
      console.error("Query error:", queryError);
    } else {
      console.log("User query successful:", userData);
    }
  } catch (err) {
    console.error("Create test user failed:", err);
  }
}

createTestUser();
