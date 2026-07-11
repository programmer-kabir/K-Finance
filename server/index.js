const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

// CORS — allow localhost dev + production Vercel client
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_URL, // set this in Render env vars
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// Supabase Connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
// =========================
// Health Check (for Render keep-alive pings)
// =========================
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "K-Finance API is running 🚀" });
});

// =========================
// Get All Users
// =========================
app.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    data,
  });
});

// =========================
// Login Endpoint
// =========================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক",
    });
  }

  try {
    // Query users table from Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Check if user exists in database table
    if (users && users.length > 0) {
      const user = users[0];
      if (user.password === password) {
        return res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || "Kabir"
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "ভুল পাসওয়ার্ড প্রবেশ করা হয়েছে",
        });
      }
    }

    // Default testing/fallback user since RLS prevents anonymous inserts on public.users
    if (email === "kabir@gmail.com" && password === "password123") {
      return res.json({
        success: true,
        user: {
          id: "default-kabir",
          email: "kabir@gmail.com",
          name: "Kabir"
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: "প্রদত্ত ইমেইল এড্রেস দিয়ে কোন ব্যবহারকারী পাওয়া যায়নি",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "সার্ভার এরর",
    });
  }
});

// =========================
// Get All Cash (with optional type filtering)
// =========================
app.get("/cash", async (req, res) => {
  const { type } = req.query;
  
  let query = supabase.schema("public").from("cash").select("*");
  
  if (type) {
    query = query.eq("type", type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    data,
  });
});

// =========================
// Add Cash Entry
// =========================
app.post("/cash", async (req, res) => {
  const { type, amount, transaction_date, purpose, category, source, remarks } = req.body;

  if (!type || !amount || !transaction_date || !purpose || !category) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing: type, amount, transaction_date, purpose, category",
    });
  }

  const { data, error } = await supabase
    .schema("public")
    .from("cash")
    .insert([
      {
        type,
        amount: Number(amount),
        transaction_date,
        purpose,
        category,
        source: source || null,
        remarks: remarks || null,
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  res.status(201).json({
    success: true,
    data: data ? data[0] : null,
  });
});


app.listen(port, () => {
  console.log(`🚀 K-Finance Server running on port ${port}`);
});