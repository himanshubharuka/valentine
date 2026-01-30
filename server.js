const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();

// ======== MIDDLEWARE ========
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// ======== PASSWORD STORAGE ========
const PASSWORDS_FILE = path.join(__dirname, "passwords.json");
const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";

// Initialize passwords file if it doesn't exist
async function initPasswordsFile() {
  try {
    await fs.access(PASSWORDS_FILE);
  } catch {
    const defaultPasswords = {
      current: process.env.SECRET_PASSWORD || "hello",
      previous: [],
    };
    await fs.writeFile(
      PASSWORDS_FILE,
      JSON.stringify(defaultPasswords, null, 2),
    );
    console.log("Created passwords.json with default password");
  }
}

// Get current password
async function getCurrentPassword() {
  try {
    const data = await fs.readFile(PASSWORDS_FILE, "utf8");
    const passwords = JSON.parse(data);
    return passwords.current;
  } catch (error) {
    console.error("Error reading passwords:", error);
    return process.env.SECRET_PASSWORD || "hello";
  }
}

// Update password
async function updatePassword(newPassword, adminKey) {
  try {
    if (adminKey !== ADMIN_KEY) {
      throw new Error("Invalid admin key");
    }

    const data = await fs.readFile(PASSWORDS_FILE, "utf8");
    const passwords = JSON.parse(data);

    passwords.previous.unshift({
      password: passwords.current,
      changedAt: new Date().toISOString(),
    });

    if (passwords.previous.length > 5) {
      passwords.previous = passwords.previous.slice(0, 5);
    }

    passwords.current = newPassword;
    passwords.lastChanged = new Date().toISOString();

    await fs.writeFile(PASSWORDS_FILE, JSON.stringify(passwords, null, 2));
    console.log("Password updated successfully");
    return { success: true, message: "Password updated!" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: error.message };
  }
}

// ======== CLEAN URL ROUTES ========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/proposal', (req, res) => {
    // Check authentication via token in URL
    const token = req.query.token;
    if (!token || !token.startsWith('sess_')) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'views/proposal.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/admin.html'));
});

// ======== API ENDPOINTS ========

// 1. VALIDATE PASSWORD
app.post("/api/validate", async (req, res) => {
  const { password } = req.body;
  const currentPassword = await getCurrentPassword();

  if (password === currentPassword) {
    const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2);
    
    return res.json({
      success: true,
      message: "Access granted! 💖",
      redirectUrl: "/proposal?token=" + sessionId,
      sessionId: sessionId,
    });
  } else {
    return res.json({
      success: false,
      message: "Wrong password!",
    });
  }
});

// 2. CHANGE PASSWORD (Admin endpoint)
app.post("/api/change-password", async (req, res) => {
  const { newPassword, adminKey } = req.body;

  if (!newPassword || newPassword.length < 3) {
    return res.json({
      success: false,
      message: "Password must be at least 3 characters",
    });
  }

  const result = await updatePassword(newPassword, adminKey);
  res.json(result);
});

// 3. VERIFY TOKEN (for home.html protection)
app.post("/api/verify-token", (req, res) => {
  const { token } = req.body;
  
  if (token && token.startsWith('sess_')) {
    return res.json({
      success: true,
      message: "Token valid"
    });
  }
  
  return res.json({
    success: false,
    message: "Invalid token"
  });
});

// 4. Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Debug route to check static files
app.get('/debug-files', (req, res) => {
    const fs = require('fs');
    const publicPath = path.join(__dirname, 'public');
    const viewsPath = path.join(__dirname, 'views');
    
    try {
        const publicFiles = fs.readdirSync(publicPath, { recursive: true });
        const viewFiles = fs.readdirSync(viewsPath);
        
        res.json({
            publicPath: publicPath,
            viewsPath: viewsPath,
            publicFiles: publicFiles,
            viewFiles: viewFiles,
            cssExists: fs.existsSync(path.join(publicPath, 'styles', 'password.css')),
            jsExists: fs.existsSync(path.join(publicPath, 'scripts', 'password.js'))
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ======== START SERVER ========
const PORT = process.env.PORT || 3003;

async function startServer() {
  // Initialize passwords file BEFORE starting server
  await initPasswordsFile();

  app.listen(PORT, () => {
    console.log(`💖 Server running: http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/`);
    console.log(`💌 Proposal: http://localhost:${PORT}/proposal`);
    console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
    console.log(`📁 HTML files from: ${path.join(__dirname, 'views')}`);
    console.log(`✅ Test CSS: http://localhost:${PORT}/styles/password.css`);
  });
}

startServer().catch(console.error);