const express = require("express");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = 3000;

app.use(express.json());
console.log(process.env.SUPABASE_ANON_KEY)

// Supabase Connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
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
// Get All Cash
// =========================
app.get("/cash", async (req, res) => {
  const { data, error } = await supabase
    .from("cash")
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
// Dashboard
// =========================
app.get("/dashboard", async (req, res) => {
  const [usersResult, cashResult] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("cash").select("*"),
  ]);

  if (usersResult.error || cashResult.error) {
    return res.status(500).json({
      success: false,
      usersError: usersResult.error?.message,
      cashError: cashResult.error?.message,
    });
  }

  res.json({
    success: true,
    totalUsers: usersResult.data.length,
    totalTransactions: cashResult.data.length,
    users: usersResult.data,
    cash: cashResult.data,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});