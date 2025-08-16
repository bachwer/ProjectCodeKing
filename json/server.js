// ===== server.js =====
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const os = require("os");

const app = express();
const port = 3000;

// ==== CORS + JSON ====
app.use(cors());
app.use(express.json()); // Chỉ gọi 1 lần
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  res.setHeader("Cache-Control", "no-store"); // Không cache
  next();
});

// ===== Đường dẫn file JSON =====
const DATA_FILE = path.join(__dirname, "./Data.json");

// ================== COUNTDOWN CONFIG ==================
let realTime = 10800; // 3 giờ = 10800 giây
let countdownInterval = null;
let contestStartTime = null; // thời điểm chính xác bắt đầu

function getMsUntilTargetTime(targetHour, targetMinute, timezoneOffset) {
  const now = new Date();
  const target = new Date();
  target.setUTCHours(targetHour - timezoneOffset, targetMinute, 0, 0);
  if (target < now) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target - now;
}

function startCountdown() {
  // const msUntilStart = getMsUntilTargetTime(21, 5, 7); // giờ bắt đầu
  const msUntilStart = 3000;
  contestStartTime = Date.now() + msUntilStart;

  console.log(
    `⏳ Countdown will start in ${Math.floor(msUntilStart / 1000)} seconds`
  );

  setTimeout(() => {
    console.log("▶ Countdown started at 23:50 ICT");
    countdownInterval = setInterval(() => {
      if (realTime > 0) {
        realTime--;
      } else {
        clearInterval(countdownInterval);
        console.log("✅ Countdown finished");
      }
    }, 1000);
  }, msUntilStart);
}
startCountdown();

app.get("/realtime", (req, res) => {
  let secondsUntilStart = 0;
  if (contestStartTime) {
    secondsUntilStart = Math.max(
      0,
      Math.floor((contestStartTime - Date.now()) / 1000)
    );
  }
  res.json({ realTime, secondsUntilStart });
});

// ================== SAVE HISTORY API ==================
app.post("/save-history", (req, res) => {
  let { submit, currentAccountId, description, problemName, maxPoints } =
    req.body;

  console.log("📥 Nhận dữ liệu từ client:", {
    submit,
    currentAccountId,
    description,
    problemName,
    maxPoints,
  });

  if (!submit || !currentAccountId || !description) {
    console.warn("⚠️ Thiếu dữ liệu từ client");
    return res.status(400).json({ error: "Missing data" });
  }

  // Nếu file chưa tồn tại → tạo file trống
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ Data: [] }, null, 2));
  }

  fs.readFile(DATA_FILE, "utf8", (err, jsonData) => {
    if (err) {
      console.error("❌ Lỗi đọc file JSON:", err);
      return res.status(500).json({ error: "Could not read JSON file" });
    }

    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseErr) {
      console.error("❌ Lỗi parse JSON:", parseErr);
      return res.status(500).json({ error: "Error parsing JSON" });
    }

    const newSubmit = {
      language: submit.language,
      problem: submit.problem,
      status: submit.status,
      summary: submit.summary,
      time: new Date().toISOString(),
      resultDescription: description,
      problemName,
      maxPoints,
    };

    let account = data.Data.find((a) => a.idData === currentAccountId);

    if (!account) {
      console.log("➕ Không tìm thấy tài khoản. Tạo mới.");
      account = {
        idData: currentAccountId,
        Points: maxPoints || 0,
        History: [newSubmit],
        RecentAttempts: [newSubmit],
      };
      data.Data.push(account);
    } else {
      console.log("✅ Tìm thấy tài khoản.");
      account.History.unshift(newSubmit);

      const existingIndex = account.RecentAttempts.findIndex(
        (att) => att.problem === newSubmit.problem
      );

      if (existingIndex !== -1) {
        account.RecentAttempts[existingIndex] = newSubmit;
      } else {
        account.RecentAttempts.push(newSubmit);
      }

      account.Points = account.RecentAttempts.reduce(
        (sum, curr) => sum + (curr.maxPoints || 0),
        0
      );
    }

    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error("❌ Lỗi ghi file:", err);
        return res.status(500).json({ error: "Could not write to file" });
      }
      console.log("✅ Ghi file thành công.");
      res.status(200).json({ message: "History saved successfully" });
    });
  });
});

// ================== LẤY IP LAN ==================
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// ================== START SERVER ==================
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server đang chạy tại http://${getLocalIP()}:${port}`);
});
