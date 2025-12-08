require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSchemaUpdate() {
  try {
    const sqlPath = path.join(__dirname, "new_schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing SQL schema update...");
    
    // Attempt to run via RPC (if exec_sql function exists)
    const { data, error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("Error executing SQL via RPC:", error);
      console.log("\nIMPORTANT: If the 'exec_sql' function does not exist, you must run the SQL manually in the Supabase SQL Editor.");
      console.log("SQL File: server/new_schema.sql");
    } else {
      console.log("Schema update executed successfully!");
    }

  } catch (err) {
    console.error("Script failed:", err);
  }
}

runSchemaUpdate();
