require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log("Checking available tables...");

    // Try to access the lawyers table that was hinted in the error
    console.log("\nTesting lawyers table...");
    const { data: lawyers, error: lawyersError } = await supabase
      .from("lawyers")
      .select("*")
      .limit(1);
    if (lawyersError) {
      console.error("Lawyers table error:", lawyersError);
    } else {
      console.log("Lawyers table exists. Sample data:", lawyers);
    }

    // Try to create a simple user in lawyers table to test if we can use it
    console.log("\nTrying to insert test user into lawyers table...");
    const { data: insertResult, error: insertError } = await supabase
      .from("lawyers")
      .insert([
        {
          name: "Test User",
          email: "test@test.com",
          password: "test",
          role: "admin",
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Insert successful:", insertResult);
    }

    // Check if we can query the inserted user
    console.log("\nQuerying inserted user...");
    const { data: users, error: queryError } = await supabase
      .from("lawyers")
      .select("*")
      .eq("email", "test@test.com");

    if (queryError) {
      console.error("Query error:", queryError);
    } else {
      console.log("Query successful:", users);
    }
  } catch (err) {
    console.error("Check tables failed:", err);
  }
}

checkTables();
