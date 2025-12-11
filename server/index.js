const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const nodemailer = require("nodemailer");
const dns = require("dns").promises; // Import DNS for hostname lookup
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the proxy to get the real IP address (Critical for Vercel/Heroku/AWS)
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Email Configuration (Nodemailer) ---
// For Gmail, you need to use an "App Password", not your regular password.
// Guide: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pradhansayan222@gmail.com", // Your email
    pass: "asbc foni rvtr qnjf", // REPLACE THIS WITH YOUR APP PASSWORD
  },
});

// Store pending verifications in memory
// Structure: { [uuid]: { status: 'pending' | 'email_verified' | 'approved' | 'denied', user: userObj, timestamp: number, otp: string } }
const pendingVerifications = {};

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock SMS Sender (Replace with real API like Twilio/MSG91)
const sendSMS = async (phone, otp) => {
  console.log(`\n--- 📱 SMS SIMULATION ---`);
  console.log(`To: ${phone}`);
  console.log(`Message: Your SPSI Security OTP is: ${otp}`);
  console.log(`-------------------------\n`);
  // In a real app, you would await smsProvider.send({ to: phone, body: ... })
};

// Helper to make User-Agent readable
const parseUserAgent = (ua) => {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Detect OS
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Detect Browser
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome"; // Check Chrome before Safari
  else if (ua.includes("Safari")) browser = "Safari";

  return `${browser} on ${os}`;
};

const sendLoginNotification = async (email, time, ip, userAgent, verificationId, otp) => {
  try {
    let location = "Unknown";
    let isp = "Unknown ISP";
    let hostname = "N/A";

    // 1. Fetch Location & ISP from IP-API
    try {
      // Basic check for localhost
      if (ip === "::1" || ip === "127.0.0.1" || ip.includes("192.168.")) {
        location = "Localhost / Internal Network";
        isp = "Local Network";
        hostname = "localhost";
      } else {
        const res = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await res.json();
        if (data.status === "success") {
          location = `${data.city}, ${data.regionName}, ${data.country}`;
          isp = data.isp || data.org || "Unknown";
        }
      }
    } catch (locErr) {
      console.error("Failed to fetch location:", locErr);
    }

    // 2. Try Reverse DNS (Hostname) - Best effort
    if (ip !== "::1" && ip !== "127.0.0.1" && !ip.includes("192.168.")) {
        try {
            const hostnames = await dns.reverse(ip);
            if (hostnames && hostnames.length > 0) {
                hostname = hostnames[0];
            }
        } catch (dnsErr) {
            // DNS lookup failed (common for residential IPs), ignore
        }
    }

    const baseUrl = "http://localhost:5000"; // Adjust if deployed
    const approveLink = `${baseUrl}/api/verify-login?id=${verificationId}&answer=yes`;
    const denyLink = `${baseUrl}/api/verify-login?id=${verificationId}&answer=no`;

    const friendlyDevice = parseUserAgent(userAgent);

    const mailOptions = {
      from: '"SPSI Security" <pradhansayan222@gmail.com>',
      to: email,
      subject: "Security Code: " + otp + " - Verify Login",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb;">New Login Attempt</h2>
          <p>Hello Super Admin,</p>
          <p>We detected a login attempt to your SPSI Management Dashboard.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password (OTP)</p>
                <h1 style="margin: 5px 0; font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
             </div>
             <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
            <p style="margin: 5px 0;"><strong>ISP:</strong> ${isp}</p>
            <p style="margin: 5px 0;"><strong>Hostname:</strong> ${hostname}</p>
            <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
            <p style="margin: 5px 0;"><strong>Device:</strong> ${friendlyDevice}</p>
          </div>

          <p style="font-size: 16px; font-weight: bold;">Step 1: Is this you?</p>
          <p>Click "Yes" below to approve the device. You will then be asked to enter the OTP above.</p>

          <div style="margin: 25px 0;">
            <a href="${approveLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 15px; font-weight: bold;">Yes, It's Me</a>
            <a href="${denyLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">No, Deny Access</a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Link expires in 10 minutes. If you click "No", the login attempt will be blocked immediately.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Login verification email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

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
    // Check for Super Admin Login Verification
    if (user.email === "pradhansayan222@gmail.com") {
      const loginTime = new Date().toLocaleString();
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
      const userAgent = req.headers["user-agent"] || "Unknown Device";
      
      const verificationId = uuidv4();
      const otp = generateOTP();
      
      // Store in memory
      pendingVerifications[verificationId] = {
        status: 'pending',
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          emp_id: user.emp_id,
          image: user.image,
        },
        otp: otp,
        timestamp: Date.now()
      };

      // Send verification email
      sendLoginNotification(user.email, loginTime, ip, userAgent, verificationId, otp);

      // Send SMS (Simulation)
      sendSMS("+917584045922", otp);

      // Return special response telling frontend to wait
      return res.json({
        success: true,
        requireVerification: true,
        verificationId: verificationId,
        message: "Verification email and SMS sent. Please approve login."
      });
    }

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

// 1a. Handle Email Verification Click
app.get("/api/verify-login", (req, res) => {
  const { id, answer } = req.query;
  const verification = pendingVerifications[id];

  if (!verification) {
    return res.status(404).send("<h1>Expired or Invalid Link</h1><p>Please try logging in again.</p>");
  }

  if (answer === 'yes') {
    verification.status = 'email_verified'; // Update to intermediate status
    res.send(`
      <div style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h1 style="color: green;">Device Approved</h1>
        <p>Please enter the OTP sent to your mobile/email in the application to complete login.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </div>
    `);
  } else {
    verification.status = 'denied';
    res.send(`
      <div style="font-family: Arial; text-align: center; margin-top: 50px;">
        <h1 style="color: red;">Login Denied</h1>
        <p>The login attempt has been blocked.</p>
      </div>
    `);
  }
});

// 1b. Check Verification Status (Frontend Poll)
app.get("/api/auth/status", (req, res) => {
  const { verificationId } = req.query;
  const verification = pendingVerifications[verificationId];

  if (!verification) {
    return res.json({ status: 'expired' });
  }

  if (verification.status === 'email_verified') {
    return res.json({ status: 'email_verified' });
  }

  if (verification.status === 'approved') {
    // Only return user if fully approved (should happen via /verify-otp usually, but safety net)
    const user = verification.user;
    delete pendingVerifications[verificationId]; 
    return res.json({ status: 'approved', user });
  }

  if (verification.status === 'denied') {
    delete pendingVerifications[verificationId]; 
    return res.json({ status: 'denied' });
  }

  // Still pending
  res.json({ status: 'pending' });
});

// 1c. Verify OTP (Final Step)
app.post("/api/verify-otp", (req, res) => {
  const { verificationId, otp } = req.body;
  const verification = pendingVerifications[verificationId];

  if (!verification) {
    return res.status(400).json({ success: false, message: "Session expired" });
  }

  if (verification.status !== 'email_verified') {
     // User tried to skip email step
    return res.status(400).json({ success: false, message: "Please approve the login via email first." });
  }

  if (verification.otp === otp) {
    verification.status = 'approved';
    const user = verification.user;
    delete pendingVerifications[verificationId]; // Cleanup
    return res.json({ success: true, user });
  } else {
    return res.json({ success: false, message: "Invalid OTP" });
  }
});

// 2. User Management (Admin)
app.get("/api/users", (req, res) => {
  const users = readData(FILES.users);
  // Return full user object including password as requested for Super Admin
  res.json(users);
});

app.post("/api/users", upload.single("image"), (req, res) => {
  const { id, name, emp_id, role, phone, email, password } = req.body;
  const users = readData(FILES.users);

  if (id) {
    // UPDATE EXISTING USER
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Update fields
    users[userIndex].name = name;
    users[userIndex].emp_id = emp_id;
    users[userIndex].role = role;
    users[userIndex].phone = phone;
    users[userIndex].email = email;
    if (password) users[userIndex].password = password; // Only update if provided
    if (req.file) users[userIndex].image = `/uploads/${req.file.filename}`;

    writeData(FILES.users, users);
    return res.json({
      success: true,
      message: "User updated",
      user: users[userIndex],
    });
  } else {
    // CREATE NEW USER
    if (users.find((u) => u.emp_id === emp_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID already exists" });
    }
    if (users.find((u) => u.email === email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const newUser = {
      id: uuidv4(),
      name,
      emp_id,
      role,
      phone,
      email,
      password,
      active: true,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    writeData(FILES.users, users);
    res.json({ success: true, message: "User created", user: newUser });
  }
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  // Prevent Super Admin deletion
  if (id === "admin-uuid-001") {
    return res.status(403).json({
      success: false,
      message: "Super Admin account cannot be deleted",
    });
  }

  let users = readData(FILES.users);
  const initialLength = users.length;
  users = users.filter((u) => u.id !== id);

  if (users.length === initialLength) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  writeData(FILES.users, users);
  res.json({ success: true, message: "User deleted" });
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
    return res
      .status(400)
      .json({ success: false, message: "Work Order already exists" });
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
  const users = readData(FILES.users); // Load users to get supervisor details

  // Join data for convenience
  let enrichedSubmissions = submissions.map((sub) => {
    const wo = workOrders.find((w) => w.id === sub.work_order_id);
    const li = lineItems.find((l) => l.id === sub.line_item_id);

    // Find supervisor: Try ID first, then Name fallback
    let supervisor = users.find((u) => u.id === sub.supervisor_id);
    if (!supervisor && sub.supervisor_name) {
      supervisor = users.find(
        (u) => u.name.toLowerCase() === sub.supervisor_name.toLowerCase()
      );
    }

    return {
      ...sub,
      work_order_number: wo ? wo.order_number : "Unknown",
      line_item_name: li ? li.name : "Unknown",
      uom: li ? li.uom : "",
      // Enrich with full supervisor details
      supervisor_name: supervisor ? supervisor.name : sub.supervisor_name, // Fallback to existing if not found
      supervisor_email: supervisor ? supervisor.email : "N/A",
      supervisor_emp_id: supervisor ? supervisor.emp_id : "N/A",
      // Rate and Revenue logic depending on role
      rate: role === "supervisor" ? undefined : sub.snapshot_rate, // Hide from supervisor
      revenue: role === "supervisor" ? undefined : sub.revenue, // Hide from supervisor
    };
  });

  if (role === "supervisor") {
    enrichedSubmissions = enrichedSubmissions.filter(
      (s) => s.supervisor_id === userId
    );
  } else if (role === "admin") {
    // By default admin sees Approved, but if view=all is passed (for tracking), show all
    if (req.query.view !== "all") {
      enrichedSubmissions = enrichedSubmissions.filter(
        (s) => s.status === "Approved"
      );
    }
  }

  // Validator sees all pending/rejected/approved

  if (status) {
    enrichedSubmissions = enrichedSubmissions.filter(
      (s) => s.status === status
    );
  }

  // Sort by date desc
  enrichedSubmissions.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

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
    previousSubmissionId,
  } = req.body;

  const lineItems = readData(FILES.lineItems);
  const selectedItem = lineItems.find((li) => li.id === lineItemId);

  if (!selectedItem) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Line Item" });
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
    } catch (e) {
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
    const prevSub = submissions.find((s) => s.id === previousSubmissionId);
    if (prevSub) {
      prevSub.status = "Resubmitted";
      prevSub.updated_at = new Date().toISOString();
    }
  }

  submissions.push(newSubmission);
  writeData(FILES.submissions, submissions);

  res.json({
    success: true,
    message: "Submitted successfully",
    submission: newSubmission,
  });
});

// 6. Validate Submission (Validator)
app.put("/api/submissions/:id/validate", (req, res) => {
  const { id } = req.params;
  const { status, remarks, quantity } = req.body; // Validator can edit quantity
  const submissions = readData(FILES.submissions);
  const subIndex = submissions.findIndex((s) => s.id === id);

  if (subIndex === -1)
    return res
      .status(404)
      .json({ success: false, message: "Submission not found" });

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

  if (subIndex === -1)
    return res
      .status(404)
      .json({ success: false, message: "Submission not found" });

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
    submission.evidence_photos = [
      ...(submission.evidence_photos || []),
      ...newPhotos,
    ];
  }

  // Reset status to Pending Validation
  submission.status = "Pending Validation";
  submission.updated_at = new Date().toISOString();

  submissions[subIndex] = submission;
  writeData(FILES.submissions, submissions);

  res.json({ success: true, message: "Resubmitted successfully", submission });
});

// 8. Dashboard Stats (Admin)
app.get("/api/stats", (req, res) => {
  const submissions = readData(FILES.submissions);
  const users = readData(FILES.users); // Need users for detailed stats

  // 1. Total Revenue (Approved only)
  const totalRevenue = submissions
    .filter((s) => s.status === "Approved")
    .reduce((sum, s) => sum + (s.revenue || 0), 0);

  // 1b. Revenue Breakdown by Work Order
  const revenueByWO = {};
  submissions
    .filter((s) => s.status === "Approved")
    .forEach((s) => {
      const wo = s.work_order_number || "Unknown";
      revenueByWO[wo] = (revenueByWO[wo] || 0) + (s.revenue || 0);
    });
  const revenueBreakdown = Object.entries(revenueByWO)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 2. Status Breakdown (All)
  const statusCounts = submissions.reduce((acc, s) => {
    const status = s.status === "Pending Validation" ? "Pending" : s.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusBreakdown = [
    {
      name: "Approved",
      value: statusCounts["Approved"] || 0,
      color: "#10b981",
    },
    { name: "Pending", value: statusCounts["Pending"] || 0, color: "#f59e0b" },
    {
      name: "Rejected",
      value: statusCounts["Rejected"] || 0,
      color: "#ef4444",
    },
  ];

  // 3. Daily Revenue (Last 7 Days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailyRevenue = last7Days.map((date) => {
    const rev = submissions
      .filter((s) => s.status === "Approved" && s.created_at.startsWith(date))
      .reduce((sum, s) => sum + (s.revenue || 0), 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      revenue: rev,
    };
  });

  // 3b. Monthly Revenue (Last 6 Months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(today.getMonth() - i);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), // Dec 25
      key: d.toISOString().slice(0, 7), // 2025-12
    };
  }).reverse();

  const monthlyRevenue = last6Months.map((m) => {
    const rev = submissions
      .filter((s) => s.status === "Approved" && s.created_at.startsWith(m.key))
      .reduce((sum, s) => sum + (s.revenue || 0), 0);
    return { date: m.label, revenue: rev };
  });

  // 3c. Yearly Revenue (Last 5 Years)
  const last5Years = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setFullYear(today.getFullYear() - i);
    return d.getFullYear().toString();
  }).reverse();

  const yearlyRevenue = last5Years.map((year) => {
    const rev = submissions
      .filter((s) => s.status === "Approved" && s.created_at.startsWith(year))
      .reduce((sum, s) => sum + (s.revenue || 0), 0);
    return { date: year, revenue: rev };
  });

  // 4. Top Supervisors & User Performance
  const supervisorStats = {};
  submissions
    .filter((s) => s.status === "Approved")
    .forEach((s) => {
      if (!supervisorStats[s.supervisor_name]) {
        supervisorStats[s.supervisor_name] = 0;
      }
      supervisorStats[s.supervisor_name] += s.revenue || 0;
    });

  const topSupervisors = Object.entries(supervisorStats)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Enrich Top Performer with User Details
  let topPerformerDetails = null;
  if (topSupervisors.length > 0) {
    const topName = topSupervisors[0].name;
    // Try to find by name (fallback if ID link is loose)
    const userObj = users.find((u) => u.name === topName);
    if (userObj) {
      topPerformerDetails = {
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        emp_id: userObj.emp_id,
        image: userObj.image,
        role: userObj.role,
        total_revenue: topSupervisors[0].revenue,
      };
    }
  }

  // 5. All User Performance (for "Approved Jobs" click)
  const userPerformance = users.map((u) => {
    // Count approved submissions for this user
    // Note: older submissions might not have supervisor_id correctly set if created before ID system, so fallback to name match if needed, but ID is safer.
    const approvedSubs = submissions.filter(
      (s) =>
        s.status === "Approved" &&
        (s.supervisor_id === u.id || s.supervisor_name === u.name)
    );

    const revenueGenerated = approvedSubs.reduce(
      (acc, s) => acc + (s.revenue || 0),
      0
    );

    return {
      id: u.id,
      name: u.name,
      role: u.role,
      emp_id: u.emp_id,
      image: u.image,
      approved_count: approvedSubs.length,
      revenue_generated: revenueGenerated,
    };
  });

  res.json({
    totalRevenue,
    revenueBreakdown, // New
    statusBreakdown,
    dailyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    topSupervisors,
    topPerformerDetails, // New
    userPerformance, // New
  });
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
