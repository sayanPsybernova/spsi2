require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLawyersStructure() {
  try {
    console.log("Checking lawyers table structure...");

    // Get all data to see the structure
    const { data: lawyers, error: lawyersError } = await supabase
      .from("lawyers")
      .select("*")
      .limit(1);
    if (lawyersError) {
      console.error("Error accessing lawyers table:", lawyersError);
      return;
    }

    console.log("Lawyers table data:", lawyers);

    // Try to get column information by attempting to select common columns
    const commonColumns = [
      "id",
      "name",
      "email",
      "password",
      "role",
      "phone",
      "emp_id",
      "is_active",
    ];

    for (const column of commonColumns) {
      try {
        const { data, error } = await supabase
          .from("lawyers")
          .select(column)
          .limit(1);
        if (error) {
          console.log(`Column '${column}': NOT AVAILABLE`);
        } else {
          console.log(`Column '${column}': AVAILABLE`);
        }
      } catch (err) {
        console.log(`Column '${column}': ERROR - ${err.message}`);
      }
    }

    // Try to insert a test user with minimal fields
    console.log("\nTrying to insert minimal test user...");
    const { data: insertResult, error: insertError } = await supabase
      .from("lawyers")
      .insert([
        {
          email: "test@test.com",
          password: "test",
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Insert successful:", insertResult);
    }
  } catch (err) {
    console.error("Check lawyers structure failed:", err);
  }
}

checkLawyersStructure();
