const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // Load environment variables
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Or SUPABASE_SERVICE_ROLE_KEY for server-side
const supabase = createClient(supabaseUrl, supabaseKey);



// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Paths (No longer used for Supabase, keeping for reference until removed)
const USERS_FILE = path.join(__dirname, "data", "users.json");
const SUBMISSIONS_FILE = path.join(__dirname, "data", "submissions.json");

// Helper Functions (No longer used for Supabase, will be removed)
const readData = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", file, err);
    return [];
  }
};

const writeData = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file:", file, err);
  }
};

// File Upload Config (Changing to memory storage for Supabase upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, role, email, image") // Select only necessary fields
      .eq("email", email) // Assume 'email' is the primary login identifier
      .eq("password", password) // Still using plain text password as per original logic. Hashing recommended.
      .limit(1);

    if (error) throw error;

    const user = users[0]; // Supabase returns an array

    if (user) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          userId: user.email, // Using email as userId for consistency
          image: user.image,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// 2. Create User (Super Admin Only)
app.post("/api/users", upload.single("image"), async (req, res) => {
  try {
    const { name, phone, userId, password, role } = req.body;

    // Validate required fields
    if (!name || !phone || !userId || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userId)
      .limit(1);

    if (checkError) throw checkError;
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User ID (email) already exists" });
    }

    let imageUrl = "";
    if (req.file) {
      const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads") // Name of your storage bucket
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          phone,
          email: userId, // Mapping userId to email field for consistency
          password,
          role,
          image: imageUrl,
        },
      ])
      .select(); // To return the newly created user

    if (insertError) throw insertError;

    res.json({
      success: true,
      message: "User created successfully",
      user: newUser[0], // Supabase returns an array
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ success: false, message: `Server error while creating user: ${error.message}` });
  }
});

// 2.1 Get All Users (Super Admin)
app.get("/api/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, phone, email, role, image, password"); // Supabase already returns these

    if (error) throw error;

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      userId: u.email, // Using email as userId for consistency
      role: u.role,
      image: u.image,
      password: u.password
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error getting all users:", error.message);
    res.status(500).json({ success: false, message: "Server error while getting users" });
  }
});

// 2.3 Update User (Super Admin)
app.put("/api/users/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, phone, userId, password, role } = req.body; // userId now refers to email

  try {
    // First, fetch the existing user to compare and get current image if not updating
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, image, name") // Added name to selection
      .eq("id", id)
      .limit(1);

    if (fetchError) throw fetchError;
    if (existingUsers.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const existingUser = existingUsers[0];

    // 1. Handle Email Change: Update supervisor_id in submissions
    if (userId && userId !== existingUser.email) {
      const { data: conflictUsers, error: conflictError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userId)
        .neq("id", id);

      if (conflictError) throw conflictError;
      if (conflictUsers.length > 0) {
        return res.status(400).json({ success: false, message: "User ID (email) already exists" });
      }
      
      // Update submissions to reflect the new email/userId
      const { error: submissionUpdateError } = await supabase
        .from("submissions")
        .update({ supervisor_id: userId })
        .eq("supervisor_id", existingUser.email);

      if (submissionUpdateError) console.error("Error updating submissions ID:", submissionUpdateError);
    }

    // 2. Handle Name Change: Update supervisor_name in submissions
    // We use the *new* userId if it changed, or the *old* email if it didn't.
    const currentId = userId || existingUser.email;
    
    if (name && name !== existingUser.name) {
        const { error: nameUpdateError } = await supabase
            .from("submissions")
            .update({ supervisor_name: name })
            .eq("supervisor_id", currentId);
            
        if (nameUpdateError) console.error("Error updating submissions Name:", nameUpdateError);
    }

    let imageUrl = existingUser.image; // Keep existing image if no new file
    if (req.file) {
      const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads") // Name of your storage bucket
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;

      // Optional: Delete old image from storage if it exists
      if (existingUser.image) {
        const oldFileName = existingUser.image.split("/").pop(); // Get filename from URL
        await supabase.storage.from("uploads").remove([oldFileName]);
      }
    }

    const { data: updatedUsers, error: updateError } = await supabase
      .from("users")
      .update({
        name: name,
        phone: phone,
        email: userId,
        password: password,
        role: role,
        image: imageUrl,
      })
      .eq("id", id)
      .select();

    if (updateError) throw updateError;

    res.json({ success: true, message: "User updated successfully", user: updatedUsers[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: `Server error while updating user: ${error.message}` });
  }
});

// 2.2 Delete User (Super Admin)
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // First, retrieve the user to get the image URL for deletion from storage
    const { data: userToDelete, error: fetchError } = await supabase
      .from("users")
      .select("image")
      .eq("id", id)
      .limit(1);

    if (fetchError) throw fetchError;
    if (userToDelete.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete user from database
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // If user had an image, delete it from Supabase Storage
    const imageUrl = userToDelete[0].image;
    if (imageUrl) {
      const fileName = imageUrl.split("/").pop(); // Extract filename from URL
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .remove([fileName]);
      if (storageError) console.error("Error deleting old image from storage:", storageError);
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting user" });
  }
});
// 3. Create Submission (Supervisor)
app.post("/api/submissions", upload.array("photos", 10), async (req, res) => {
  const {
    supervisorId,
    supervisorName,
    sugarQty,
    sugarPrice,
    saltQty,
    saltPrice,
  } = req.body;

  try {
    let photoUrls = [];
    
    // Upload photos if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const fileName = `evidence/${uuidv4()}${path.extname(file.originalname)}`;
          const { data, error } = await supabase.storage
            .from("uploads")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });
          
          if (error) {
            console.error("Supabase Storage Upload Error for file:", fileName, error);
            throw new Error(`Failed to upload ${fileName}: ${error.message}`);
          }
          
          const { data: publicUrlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(fileName);
            
          return publicUrlData.publicUrl;
        } catch (fileUploadError) {
          console.error("Error processing single file for upload:", fileUploadError);
          throw fileUploadError; // Re-throw to be caught by Promise.all
        }
      });
      
      photoUrls = await Promise.all(uploadPromises);
    }

    const newSubmission = {
      supervisor_id: supervisorId, 
      supervisor_name: supervisorName, 
      date: new Date().toISOString(),
      sugar_qty: parseFloat(sugarQty),
      sugar_price: parseFloat(sugarPrice),
      total_sugar: parseFloat(sugarQty) * parseFloat(sugarPrice),
      salt_qty: parseFloat(saltQty),
      salt_price: parseFloat(saltPrice),
      total_salt: parseFloat(saltQty) * parseFloat(saltPrice),
      grand_total:
        parseFloat(sugarQty) * parseFloat(sugarPrice) +
        parseFloat(saltQty) * parseFloat(saltPrice),
      status: "Pending",
      remarks: "",
      admin_remarks: "",
      evidence_photos: photoUrls // Store array of URLs
    };

    const { data, error } = await supabase
      .from("submissions")
      .insert([newSubmission])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw error;
    }

    res.json({ success: true, message: "Data submitted successfully", submission: data[0] });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ success: false, message: `Server error while creating submission: ${error.message}` });
  }
});
// 4. Get Submissions (Role based)
app.get("/api/submissions", async (req, res) => {
  const { role, userId, status } = req.query;

  try {
    let query = supabase.from("submissions").select("*");

    if (role === "supervisor") {
      // Supervisor sees only their own
      query = query.eq("supervisor_id", userId); // Use supervisor_id from Supabase schema
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data: submissions, error } = await query;

    if (error) throw error;

    // Add actionRequiredBy field dynamically (client side logic, keeping for now)
    const formattedSubmissions = submissions.map(s => {
      let actionRequiredBy = 'None';
      if (s.status === 'Pending') actionRequiredBy = 'Validator';
      else if (s.status === 'Rejected') actionRequiredBy = 'Supervisor';

      // Map Supabase snake_case to original camelCase if necessary for frontend
      return {
        id: s.id,
        supervisorId: s.supervisor_id,
        supervisorName: s.supervisor_name,
        date: s.date,
        sugarQty: s.sugar_qty,
        sugarPrice: s.sugar_price,
        totalSugar: s.total_sugar,
        saltQty: s.salt_qty,
        saltPrice: s.salt_price,
        totalSalt: s.total_salt,
        grandTotal: s.grand_total,
        status: s.status,
        remarks: s.remarks,
        adminRemarks: s.admin_remarks,
        evidencePhotos: s.evidence_photos || [], // Map evidence_photos to evidencePhotos
        actionRequiredBy: actionRequiredBy
      };
    });

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error getting submissions:", error.message);
    res.status(500).json({ success: false, message: "Server error while getting submissions" });
  }
});// 5. Validate Submission (Validator)
app.put("/api/submissions/:id/validate", async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body; // status: 'Approved' or 'Rejected'

  try {
    const updateData = { status: status };
    if (remarks) updateData.remarks = remarks;

    const { data, error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.json({ success: true, message: `Submission ${status}`, submission: data[0] });
  } catch (error) {
    console.error("Error validating submission:", error.message);
    res.status(500).json({ success: false, message: "Server error while validating submission" });
  }
});
// 6. Admin Remark (Normal Admin)
app.put("/api/submissions/:id/admin-remark", async (req, res) => {
  const { id } = req.params;
  const { adminRemarks } = req.body;

  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ admin_remarks: adminRemarks }) // Use admin_remarks for Supabase schema
      .eq("id", id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.json({ success: true, message: "Admin remark added", submission: data[0] });
  } catch (error) {
    console.error("Error adding admin remark:", error.message);
    res.status(500).json({ success: false, message: "Server error while adding admin remark" });
  }
});
// 7. Resubmit (Supervisor)
app.put("/api/submissions/:id", upload.array("photos", 10), async (req, res) => {
  const { id } = req.params;
  const { sugarQty, sugarPrice, saltQty, saltPrice } = req.body;

  try {
    const sugarQ = parseFloat(sugarQty);
    const sugarP = parseFloat(sugarPrice);
    const saltQ = parseFloat(saltQty);
    const saltP = parseFloat(saltPrice);

    // 1. Fetch existing submission to get current photos
    const { data: existingSub, error: fetchError } = await supabase
      .from("submissions")
      .select("evidence_photos")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      console.error("Supabase Fetch Error (Resubmit):", fetchError);
      throw fetchError;
    }

    let updatedPhotos = existingSub.evidence_photos || [];

    // 2. Upload new photos if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const fileName = `evidence/${uuidv4()}${path.extname(file.originalname)}`;
          const { data, error } = await supabase.storage
            .from("uploads")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });
          
          if (error) {
            console.error("Supabase Storage Upload Error (Resubmit) for file:", fileName, error);
            throw new Error(`Failed to upload ${fileName}: ${error.message}`);
          }
          
          const { data: publicUrlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(fileName);
            
          return publicUrlData.publicUrl;
        } catch (fileUploadError) {
          console.error("Error processing single file for resubmit upload:", fileUploadError);
          throw fileUploadError; // Re-throw to be caught by Promise.all
        }
      });
      
      const newPhotoUrls = await Promise.all(uploadPromises);
      updatedPhotos = [...updatedPhotos, ...newPhotoUrls];
    }

    const updateData = {
      sugar_qty: sugarQ,
      sugar_price: sugarP,
      total_sugar: sugarQ * sugarP,
      salt_qty: saltQ,
      salt_price: saltP,
      total_salt: saltQ * saltP,
      grand_total: (sugarQ * sugarP) + (saltQ * saltP),
      status: "Pending", // Reset to Pending
      evidence_photos: updatedPhotos
    };

    const { data, error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase Update Error (Resubmit):", error);
      throw error;
    }
    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.json({ success: true, message: "Resubmitted successfully", submission: data[0] });
  } catch (error) {
    console.error("Error resubmitting:", error);
    res.status(500).json({ success: false, message: `Server error while resubmitting: ${error.message}` });
  }
});
// 8. Stats (Super Admin Graphs & Dashboard)
app.get("/api/stats", async (req, res) => {
  try {
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("status, date, grand_total"); // Select only necessary fields

    if (submissionsError) throw submissionsError;

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id"); // Only need count, so just select ID

    if (usersError) throw usersError;

    // 1. Calculate Active Users
    const activeUsers = users.length;

    // 2. Calculate Pending Tasks
    const pendingTasks = submissions.filter(s => s.status === 'Pending').length;

    // 3. Group Sales by month
    const monthlySales = {};

    submissions.forEach((s) => {
      if (s.status === "Approved") {
        // Only count approved sales
        const date = new Date(s.date);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const key = `${month} ${year}`;

        if (!monthlySales[key]) monthlySales[key] = 0;
        monthlySales[key] += parseFloat(s.grand_total); // Ensure grand_total is numeric
      }
    });

    const chartData = Object.keys(monthlySales).map((key) => ({
      name: key,
      sales: monthlySales[key],
    }));

    res.json({
      chartData,
      activeUsers,
      pendingTasks
    });
  } catch (error) {
    console.error("Error getting stats:", error.message);
    res.status(500).json({ success: false, message: "Server error while getting stats" });
  }
});

// Export app for Netlify Functions
module.exports = app;

// Only start server if running locally (not required for serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
