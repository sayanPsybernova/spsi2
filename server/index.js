const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Local Data Management ---
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const FILES = {
  users: path.join(DATA_DIR, "users.json"),
  submissions: path.join(DATA_DIR, "submissions.json"),
  workOrders: path.join(DATA_DIR, "work_orders.json"),
  lineItems: path.join(DATA_DIR, "line_items.json"),
};

// Helper to read data safely
const readData = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

// Helper to write data safely
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Initialize files if empty
Object.values(FILES).forEach((file) => readData(file));

// Multer Config (Local Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Login
app.post("/api/login", (req, res) => {
  const { userId, password } = req.body; // userId is username/emp_id
  const users = readData(FILES.users);

  // Match against emp_id or email
  const user = users.find(
    (u) =>
      (u.emp_id === userId || u.email === userId || u.name === userId) &&
      u.password === password
  );

  if (user && user.active !== false) {
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        emp_id: user.emp_id,
        image: user.image,
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// 2. User Management (Admin)
app.get("/api/users", (req, res) => {
  const users = readData(FILES.users);
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post("/api/users", upload.single("image"), (req, res) => {
  const { name, emp_id, role, phone, email, password } = req.body;
  const users = readData(FILES.users);

  if (users.find((u) => u.emp_id === emp_id)) {
    return res.status(400).json({ success: false, message: "Employee ID already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    emp_id,
    role,
    phone,
    email,
    password, // Storing plain text as requested (demo)
    active: true,
    image: req.file ? `/uploads/${req.file.filename}` : "",
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  writeData(FILES.users, users);

  res.json({ success: true, message: "User created", user: newUser });
});

// 3. Master Data: Work Orders (Admin)
app.get("/api/work-orders", (req, res) => {
  const workOrders = readData(FILES.workOrders);
  res.json(workOrders);
});

app.post("/api/work-orders", (req, res) => {
  const { orderNumber } = req.body;
  const workOrders = readData(FILES.workOrders);

  if (workOrders.find((wo) => wo.order_number === orderNumber)) {
    return res.status(400).json({ success: false, message: "Work Order already exists" });
  }

  const newWO = {
    id: uuidv4(),
    order_number: orderNumber,
    created_at: new Date().toISOString(),
  };

  workOrders.push(newWO);
  writeData(FILES.workOrders, workOrders);
  res.json({ success: true, message: "Work Order created", workOrder: newWO });
});

// 4. Master Data: Line Items (Admin)
app.get("/api/line-items", (req, res) => {
  const { workOrderId } = req.query;
  let lineItems = readData(FILES.lineItems);

  if (workOrderId) {
    lineItems = lineItems.filter((li) => li.work_order_id === workOrderId);
  }
  res.json(lineItems);
});

app.post("/api/line-items", (req, res) => {
  const { workOrderId, name, uom, rate, standardManpower } = req.body;
  const lineItems = readData(FILES.lineItems);

  const newItem = {
    id: uuidv4(),
    work_order_id: workOrderId,
    name,
    uom,
    rate: parseFloat(rate), // Hidden from Supervisor in frontend
    standard_manpower: standardManpower,
    created_at: new Date().toISOString(),
  };

  lineItems.push(newItem);
  writeData(FILES.lineItems, lineItems);
  res.json({ success: true, message: "Line Item added", lineItem: newItem });
});

// 5. Submissions (Supervisor -> Validator -> Admin)
app.get("/api/submissions", (req, res) => {
  const { role, userId, status } = req.query; // userId is internal ID here
  let submissions = readData(FILES.submissions);
  const workOrders = readData(FILES.workOrders);
  const lineItems = readData(FILES.lineItems);

  // Join data for convenience
  let enrichedSubmissions = submissions.map((sub) => {
    const wo = workOrders.find((w) => w.id === sub.work_order_id);
    const li = lineItems.find((l) => l.id === sub.line_item_id);
    return {
      ...sub,
      work_order_number: wo ? wo.order_number : "Unknown",
      line_item_name: li ? li.name : "Unknown",
      uom: li ? li.uom : "",
      // Rate and Revenue logic depending on role
      rate: role === "supervisor" ? undefined : sub.snapshot_rate, // Hide from supervisor
      revenue: role === "supervisor" ? undefined : sub.revenue,   // Hide from supervisor
    };
  });

  if (role === "supervisor") {
    enrichedSubmissions = enrichedSubmissions.filter((s) => s.supervisor_id === userId);
  } else if (role === "admin") {
    enrichedSubmissions = enrichedSubmissions.filter((s) => s.status === "Approved");
  }
  
  // Validator sees all pending/rejected/approved

  if (status) {
    enrichedSubmissions = enrichedSubmissions.filter((s) => s.status === status);
  }

  // Sort by date desc
  enrichedSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(enrichedSubmissions);
});

app.post("/api/submissions", upload.array("photos"), (req, res) => {
  const {
    supervisorId,
    supervisorName,
    workOrderId,
    lineItemId,
    quantity,
    actualManpower,
    materialConsumed,
    existingPhotos,
    previousSubmissionId
  } = req.body;

  const lineItems = readData(FILES.lineItems);
  const selectedItem = lineItems.find((li) => li.id === lineItemId);

  if (!selectedItem) {
    return res.status(400).json({ success: false, message: "Invalid Line Item" });
  }

  const qty = parseFloat(quantity);
  const revenue = qty * selectedItem.rate;

  let finalPhotos = [];
  
  // 1. Add New Uploads
  if (req.files && req.files.length > 0) {
      finalPhotos = req.files.map((f) => `/uploads/${f.filename}`);
  }
  
  // 2. Add Existing Photos (passed as JSON string)
  if (existingPhotos) {
      try {
          const old = JSON.parse(existingPhotos);
          if (Array.isArray(old)) {
              finalPhotos = [...finalPhotos, ...old];
          }
      } catch(e) {
          console.error("Error parsing existingPhotos", e);
      }
  }

  const newSubmission = {
    id: uuidv4(),
    supervisor_id: supervisorId,
    supervisor_name: supervisorName,
    work_order_id: workOrderId,
    line_item_id: lineItemId,
    
    // Inputs
    quantity: qty,
    actual_manpower: actualManpower,
    material_consumed: materialConsumed || "",
    
    // Snapshots
    snapshot_rate: selectedItem.rate,
    snapshot_standard_manpower: selectedItem.standard_manpower,
    revenue: revenue, // Calculated
    
    status: "Pending Validation",
    remarks: "",
    admin_remarks: "",
    evidence_photos: finalPhotos,
    previous_submission_id: previousSubmissionId || null,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const submissions = readData(FILES.submissions);

  // If this is a resubmission, mark the old one as 'Resubmitted'
  if (previousSubmissionId) {
      const prevSub = submissions.find(s => s.id === previousSubmissionId);
      if (prevSub) {
          prevSub.status = "Resubmitted";
          prevSub.updated_at = new Date().toISOString();
      }
  }

  submissions.push(newSubmission);
  writeData(FILES.submissions, submissions);

  res.json({ success: true, message: "Submitted successfully", submission: newSubmission });
});

// 6. Validate Submission (Validator)
app.put("/api/submissions/:id/validate", (req, res) => {
  const { id } = req.params;
  const { status, remarks, quantity } = req.body; // Validator can edit quantity
  const submissions = readData(FILES.submissions);
  const subIndex = submissions.findIndex((s) => s.id === id);

  if (subIndex === -1) return res.status(404).json({ success: false, message: "Submission not found" });

  const submission = submissions[subIndex];
  
  // Update status
  submission.status = status;
  submission.updated_at = new Date().toISOString();

  // If rejected, add remarks
  if (status === "Rejected") {
    submission.remarks = remarks || "Rejected by Validator";
  } else if (status === "Approved") {
    submission.remarks = ""; // Clear rejection remarks if approved
  }

  // Validator Edit Logic: Can edit quantity
  if (quantity !== undefined && quantity !== null) {
      submission.quantity = parseFloat(quantity);
      // Recalculate revenue based on snapshot rate
      submission.revenue = submission.quantity * submission.snapshot_rate;
  }

  submissions[subIndex] = submission;
  writeData(FILES.submissions, submissions);

  res.json({ success: true, message: `Submission ${status}`, submission });
});

// 7. Resubmit (Supervisor)
app.put("/api/submissions/:id", upload.array("photos"), (req, res) => {
  const { id } = req.params;
  // Supervisor can edit these fields on resubmission
  const { quantity, actualManpower, materialConsumed } = req.body;
  
  const submissions = readData(FILES.submissions);
  const subIndex = submissions.findIndex((s) => s.id === id);

  if (subIndex === -1) return res.status(404).json({ success: false, message: "Submission not found" });

  const submission = submissions[subIndex];

  // Update fields
  if (quantity) {
    submission.quantity = parseFloat(quantity);
    submission.revenue = submission.quantity * submission.snapshot_rate; // Recalculate
  }
  if (actualManpower) submission.actual_manpower = actualManpower;
  if (materialConsumed) submission.material_consumed = materialConsumed;

  // Add new photos if any
  if (req.files && req.files.length > 0) {
    const newPhotos = req.files.map((f) => `/uploads/${f.filename}`);
    submission.evidence_photos = [...(submission.evidence_photos || []), ...newPhotos];
  }

  // Reset status to Pending Validation
  submission.status = "Pending Validation";
  submission.updated_at = new Date().toISOString();

  submissions[subIndex] = submission;
  writeData(FILES.submissions, submissions);

  res.json({ success: true, message: "Resubmitted successfully", submission });
});

// Export app for Netlify Functions (Optional, but good for structure)
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Local Data Mode: ON`);
    console.log(`Data Directory: ${DATA_DIR}`);
  });
}

