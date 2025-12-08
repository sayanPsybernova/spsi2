require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");
    console.log("URL:", supabaseUrl);
    console.log("Key exists:", !!supabaseKey);

    // Test if we can connect to Supabase
    const { data, error } = await supabase.from("users").select("count");

    if (error) {
      console.error("Error connecting to users table:", error);

      // Try to list all tables
      console.log("\nTrying to check what tables exist...");
      const { data: tables, error: tablesError } = await supabase.rpc(
        "get_table_names"
      );
      if (tablesError) {
        console.error("Error listing tables:", tablesError);
      } else {
        console.log("Available tables:", tables);
      }
    } else {
      console.log("Successfully connected to users table");
      console.log("Data:", data);
    }

    // Try app_users table as well
    console.log("\nTrying app_users table...");
    const { data: appUsersData, error: appUsersError } = await supabase
      .from("app_users")
      .select("count");

    if (appUsersError) {
      console.error("Error connecting to app_users table:", appUsersError);
    } else {
      console.log("Successfully connected to app_users table");
      console.log("Data:", appUsersData);
    }
  } catch (err) {
    console.error("Connection test failed:", err);
  }
}

testConnection();
