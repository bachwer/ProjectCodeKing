document.addEventListener("DOMContentLoaded", () => {
  // ==================== Elements ====================
  const submitBtn = document.getElementById("submitBtn");
  const resultDiv = document.getElementById("result");
  const loading = document.getElementById("loading");
  const statusIndicator = document.getElementById("statusIndicator");
  const fileInput = document.getElementById("file-input");
  const mainContent = document.getElementById("mainContent");
  const sidebar = document.getElementById("sidebarCard");
  const langSelect = document.getElementById("programmingLanguage");

  // ==================== State ====================
  const currentAccount = JSON.parse(localStorage.getItem("UserData") || "{}");
  const currentAccountId = currentAccount?.ID ?? currentAccount?.idData ?? null;

  let activeProblemId = localStorage.getItem("problemId") || "A1";
  let problemName = "";
  let maxPoints = 0;
  let problemsIndex = []; // contest.problems
  let problemDetailsIndex = {}; // contest.problemDetails

  // ==================== Helpers ====================
  function setLoading(show) {
    if (!loading) return;
    loading.style.display = show ? "block" : "none";
    statusIndicator?.classList.toggle("displayNone", show);
    resultDiv?.classList.toggle("displayNone", show);
  }

  function setResult(text, color) {
    if (!resultDiv) return;
    resultDiv.textContent = text;
    resultDiv.style.color = color || "#111827";
  }

  // Verdict utilities
  const VERDICT_PRIORITY = ["CE", "RTE", "TLE", "MLE", "WA", "AC"]; // lower index = higher priority

  function colorFromVerdict(v) {
    switch (v) {
      case "AC":
        return "green";
      case "WA":
        return "#F59E0B"; // amber
      case "TLE":
      case "MLE":
      case "RTE":
        return "#EF4444"; // red
      case "CE":
        return "#DC2626"; // dark red
      default:
        return "#111827"; // neutral
    }
  }

  function summarizeVerdicts(verdicts) {
    const counts = { AC: 0, WA: 0, CE: 0, RTE: 0, TLE: 0, MLE: 0 };
    for (const r of verdicts || []) {
      const v = r?.verdict;
      if (v && v in counts) counts[v]++;
    }
    const total = verdicts?.length || 0;
    const passed = counts.AC;
    const final =
      VERDICT_PRIORITY.find((v) => counts[v] > 0) || (total ? "WA" : "WA");

    // First failing test detail

    let description;
    if (!total) {
      description = "⚠️ No test cases returned.";
    } else if (final === "AC" && passed === total) {
      description = `✅ AC — Passed all: ${passed}/${total}`;
    } else if (final === "CE") {
      description = `❌ CE (Lỗi Chương Trình)`;
    } else if (final === "RTE") {
      description = `❌ RTE — Runtime Error`;
    } else if (final === "TLE") {
      description = `❌ TLE — Time Limit Exceeded`;
    } else if (final === "MLE") {
      description = `❌ MLE — Memory Limit Exceeded`;
    } else if (final === "WA") {
      description = `❌ WA — Passed ${passed}/${total}`;
    } else {
      description = `Result: ${final} — Passed ${passed}/${total}`;
    }

    return { final, description, passed, total };
  }

  // ==================== Sidebar ====================
  function renderSidebar() {
    if (!sidebar) return;
    const html = `
      <div class="card-header"><div class="card-title">Contest Problems</div></div>
      <div class="card-content">
        <ul class="contest-list">
          ${problemsIndex
            .map(
              (p) => `
              <li class="contest-item ${p.id === activeProblemId ? "active" : ""}" data-problem-id="${p.id}">
                <a href="#" class="contest-link">${p.id[0]}. ${p.name}</a>
                <div class="contest-status"></div>
              </li>`
            )
            .join("")}
        </ul>
      </div>
    `;
    sidebar.innerHTML = html;

    sidebar.querySelectorAll(".contest-item").forEach((li) => {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        const pid = li.getAttribute("data-problem-id");
        if (!pid || pid === activeProblemId) return;
        activeProblemId = pid;
        localStorage.setItem("problemId", pid);

        sidebar
          .querySelectorAll(".contest-item")
          .forEach((i) => i.classList.remove("active"));
        li.classList.add("active");

        renderProblem();
        if (currentAccountId) {
          displayRecentResult(currentAccountId, activeProblemId);
        }
      });
    });
  }

  // ==================== Problem Content ====================
  function renderProblem() {
    const details = problemDetailsIndex[activeProblemId];
    if (!details) {
      console.warn("Problem ID not found:", activeProblemId);
      return;
    }
    const meta = problemsIndex.find((p) => p.id === activeProblemId);
    problemName = meta?.name || details.name || activeProblemId;
    maxPoints = meta?.points || 0;

    mainContent.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="problem-header">
        <div class="problem-title">
          <h1>${activeProblemId[0]}. ${problemName}</h1>
          <div class="difficulty-badge">Easy</div>
        </div>
        <div class="problem-meta">
          <span>Time: ${details.timeLimit}s</span>
          <span>Memory: ${details.memoryLimit}MB</span>
        </div>
      </div>

      <div class="problem-content">
        <div class="section"><h2>Problem Statement</h2><p>${details.problemStatement}</p></div>
        <div class="section"><h2>Input Format</h2><p>${details.inputFormat}</p></div>
        <div class="section"><h2>Output Format</h2><p>${details.outputFormat}</p></div>
        <div class="section"><h2>Constraints</h2><div class="constraints"><p>${details.constraints}</p></div></div>
        <div class="sample-table">
          <div class="sample-box">
            <div class="sample-header">Sample Input</div>
            <div class="sample-content">${details.sampleInput?.[0] ?? "No sample input"}</div>
          </div>
          <div class="sample-box">
            <div class="sample-header">Sample Output</div>
            <div class="sample-content">${details.sampleOutput?.[0] ?? "No sample output"}</div>
          </div>
        </div>
        <div class="section"><h2>Explanation</h2><p>${details.explanation}</p></div>
      </div>`;
    mainContent.appendChild(wrap);
  }

  // ==================== Global a[href] prevent (only hashes) ====================
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href === "#" || href === "" || href.startsWith("#")) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Debug: detect unloads
  window.addEventListener("beforeunload", () => {
    console.warn("⚠️ Trang sắp unload (có nơi nào đó đang điều hướng).");
  });

  // ==================== Submit ====================
  submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault(); // prevent default
    e.stopPropagation(); // stop bubbling

    setLoading(true);
    try {
      await handleFileSubmit(langSelect.value);
    } finally {
      // keep UX snappy; adjust if needed
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoading(false);
    }
  });

  async function handleFileSubmit(codeLanguage) {
    const file = fileInput?.files?.[0];
    if (!file) {
      alert("Vui lòng chọn file mã nguồn.");
      return;
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const expected = codeLanguage?.trim().toLowerCase();
    if (ext !== expected) {
      setResult(
        `🔸 Sai định dạng file: yêu cầu .${expected}, nhưng file là .${ext}`,
        "#DC2626"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("problemId", activeProblemId);
      formData.append("language", codeLanguage);
      formData.append("code", file);
      formData.append("IDUser", currentAccountId ?? "");

      const res = await fetch("http://172.26.112.1:8000/submit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setResult(`❌ Server error: HTTP ${res.status}`, "#DC2626");
        return;
      }

      const data = await res.json();

      // Server returns: { status, verdicts:[{verdict,time,memory,nx}], language, problem, summary }
      if (!data?.status) {
        const description = "❌ CE (Lỗi Chương Trình)";
        setResult(description, "#DC2626");
        if (currentAccountId) {
          await saveToHistory(
            data,
            currentAccountId,
            description,
            problemName,
            0
          );
        }
        return;
      }

      const verdicts = Array.isArray(data.verdicts) ? data.verdicts : [];
      const { final, description, passed, total } = summarizeVerdicts(verdicts);
      setResult(description, colorFromVerdict(final));

      const pointsAwarded = final === "AC" && passed === total ? maxPoints : 0;

      if (currentAccountId) {
        await saveToHistory(
          data,
          currentAccountId,
          description,
          problemName,
          pointsAwarded
        );
      }
    } catch (err) {
      console.error(err);
      setResult("⚠️ Không thể gửi yêu cầu tới server.", "#DC2626");
    }
  }

  // ==================== History ====================
  function saveToHistory(
    submit,
    currentAccountId,
    description,
    problemName,
    maxPoints
  ) {
    return fetch("http://172.26.112.1:3000/save-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submit,
        currentAccountId,
        description,
        problemName,
        maxPoints,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Save-history failed: ${r.status}`);
        return r.json();
      })
      .then((d) => console.log("✅ Kết quả:", d))
      .catch((e) => console.error("❌ Lỗi gửi request:", e));
  }

  // ==================== Recent result display ====================
  function displayRecentResult(currentAccountId, problemId) {
    fetch("../json/Data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải file JSON từ server");
        return res.json();
      })
      .then((data) => {
        const account = data.Data.find(
          (acc) => acc.idData === currentAccountId
        );
        if (!account) {
          setResult("None", "gray");
          return;
        }
        const recent = account.RecentAttempts.find(
          (att) => att.problem === problemId
        );
        if (!recent) {
          setResult("None", "gray");
          return;
        }
        setResult(
          recent.resultDescription,
          colorFromVerdict(
            ["AC", "WA", "CE", "RTE", "TLE", "MLE"].find((v) =>
              recent.resultDescription.includes(v)
            ) || ""
          )
        );
      })
      .catch((err) => {
        console.error("❌ Lỗi khi đọc dữ liệu:", err);
        setResult("Lỗi kết nối server", "#DC2626");
      });
  }

  // ==================== Upload UX ====================
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    const uploadArea = document.querySelector(".upload-area");
    if (!uploadArea) return;
    const uploadText = uploadArea.querySelector(".upload-text");
    if (file) {
      uploadText.textContent = `Selected: ${file.name}`;
      uploadArea.style.borderColor = "#10b981";
      uploadArea.style.backgroundColor = "#ecfdf5";
    } else {
      uploadText.textContent = "Click to upload or drag and drop";
      uploadArea.style.removeProperty("border-color");
      uploadArea.style.removeProperty("background-color");
    }
  });

  // ==================== Init ====================
  fetch("../json/problem.json")
    .then((r) => {
      if (!r.ok) throw new Error("Không thể tải file JSON");
      return r.json();
    })
    .then((data) => {
      problemsIndex = data?.contest?.problems || [];
      problemDetailsIndex = data?.contest?.problemDetails || {};

      if (
        !problemsIndex.some((p) => p.id === activeProblemId) &&
        problemsIndex[0]
      ) {
        activeProblemId = problemsIndex[0].id;
        localStorage.setItem("problemId", activeProblemId);
      }

      renderSidebar();
      renderProblem();

      if (currentAccountId) {
        displayRecentResult(currentAccountId, activeProblemId);
      }
    })
    .catch((err) => console.error("Lỗi khi đọc JSON:", err));
});
