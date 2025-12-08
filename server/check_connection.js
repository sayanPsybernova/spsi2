const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log("Checking connection to:", supabaseUrl);

  // Try to access the 'lawyers' table mentioned in the hint
  console.log("Attempting to fetch from 'lawyers'...");
  const { data: lawyers, error: lawyersError } = await supabase
    .from("lawyers")
    .select("*")
    .limit(1);

  if (lawyersError) {
    console.error("Error fetching lawyers:", lawyersError.message);
  } else {
    console.log("Successfully fetched from 'lawyers'. Table exists!");
  }

  // Try to access 'app_users' again
  console.log("Attempting to fetch from 'app_users'...");
  const { data: users, error: usersError } = await supabase
    .from("app_users")
    .select("*")
    .limit(1);

  if (usersError) {
    console.error("Error fetching app_users:", usersError.message);
  } else {
    console.log("Successfully fetched from 'app_users'. Table exists!");
  }
}

checkConnection();
