let teams = [];
let nameTeams = [];
const problemsList = [
  "A1",
  "B1",
  "C1",
  "D1",
  "E1",
  "F1",
  "G1",
  "H1",
  "I1",
  "J1",
  "K1",
  "L1",
];
const problemColumns = problemsList;

fetch("../json/Account.json")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    data.Users.forEach((e) => {
      nameTeams.push(e);
    });
  });

fetch("../json/Data.json")
  .then((res) => res.json())
  .then((data) => {
    teams = data.Data.map((team) => {
      const tmp = {};

      // Initialize tmp with problem statuses
      problemsList.forEach((p) => {
        tmp[p] = {
          status: "none",
          attempts: 0,
          time: 0,
        };
      });

      // Log team for debugging
      console.log("Processing team:", team);

      // Safely iterate over team.History
      if (Array.isArray(team.History)) {
        team.History.forEach((e) => {
          const prob = e.problem;
          if (tmp[prob]) {
            // Ensure prob exists in tmp
            if (tmp[prob].time === 0) {
              tmp[prob].time = e.summary.max_time_ms;
            } else if (tmp[prob].time > e.summary.max_time_ms) {
              tmp[prob].time = e.summary.max_time_ms;
            }
            tmp[prob].attempts += 1;
          }
        });
      } else {
        console.warn(
          `team.History is undefined or not an array for team:`,
          team
        );
      }

      // Safely iterate over team.RecentAttempts
      if (Array.isArray(team.RecentAttempts)) {
        team.RecentAttempts.forEach((e) => {
          const prob = e.problem;
          if (tmp[prob]) {
            // Ensure prob exists in tmp
            const isSolved = e.resultDescription.includes("✅");
            const notSolve = e.resultDescription.includes("❌");
            if (isSolved && tmp[prob].status !== "solved") {
              tmp[prob].status = "solved";
            }
            if (notSolve && tmp[prob].status === "none") {
              tmp[prob].status = "wrong";
            }
            if (tmp[prob].time === 0) {
              tmp[prob].time = 1;
            }
          }
        });
      } else {
        console.warn(
          `team.RecentAttempts is undefined or not an array for team:`,
          team
        );
      }

      const solvedCount = Object.values(tmp).filter(
        (p) => p.status === "solved"
      ).length;

      return {
        rank: 0,
        name: findTeamNameById(team.idData),
        solved: solvedCount,
        score: team.Points,
        problems: tmp,
      };
    });

    // Sort teams by score in descending order and assign ranks
    teams.sort((a, b) => b.score - a.score);
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });

    populateLeaderboard();
  })
  .catch((error) => {
    console.error("Error fetching or processing data:", error);
  });

function generateProblemCell(problem) {
  const attemptsHtml = `<div class="problem-attempts-try">${problem.attempts} ${problem.attempts === 1 ? "try" : "tries"}</div>`;
  const timeHtml = `<div class="problem-attempts">${problem.time}ms</div>`;

  if (problem.status === "solved") {
    return `<div class="problem-cell solved">${attemptsHtml}${timeHtml}</div>`;
  } else if (problem.status === "wrong") {
    return `<div class="problem-cell wrong">${attemptsHtml}${timeHtml}</div>`;
  } else {
    return `<div class="problem-cell none">—</div>`;
  }
}
//TIM TEN
function findTeamNameById(id) {
  const team = nameTeams.find((t) => t.ID === id);
  return team ? team.name : id; // Nếu không tìm thấy thì trả về chính ID
}

function populateLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  console.log(teams);
  teams.forEach((team) => {
    const row = document.createElement("tr");

    let problemCells = "";
    problemColumns.forEach((col) => {
      problemCells += `<td>${generateProblemCell(team.problems[col])}</td>`;
    });

    row.innerHTML = `
      <td>${team.rank}</td>
      <td><strong>${team.name}</strong></td>
      <td><span class="solved-count">${team.score}</span> </td>
      ${problemCells}
    `;

    tbody.appendChild(row);
  });
}

//

function buildTeamObject(userData) {
  const problemsMap = {}; // object bài tập kiểu A, B, C...

  // gom theo mã bài: { A1: [...], B1: [...] }
  const grouped = {};
  userData.History.forEach((entry) => {
    const pid = entry.problem;
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(entry);
  });

  const problemLabels = "ABCDEFGHIJKL"; // giả sử A <-> A1, B <-> B1,...

  let solvedCount = 0;
  let totalScore = 0;

  problemLabels.split("").forEach((label, index) => {
    const problemId = label + "1"; // ví dụ: "A1"
    const submissions = grouped[problemId] || [];

    if (submissions.length === 0) {
      problemsMap[label] = {
        status: "none",
        attempts: 0,
        time: null,
      };
      return;
    }

    let solved = false;
    let attempts = 0;
    let firstCorrectTime = null;
    let firstSubmitTime = new Date(submissions[0].time).getTime();

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      attempts++;
      if (sub.resultDescription.includes("✅")) {
        solved = true;
        const correctTime = new Date(sub.time).getTime();
        firstCorrectTime = Math.floor((correctTime - firstSubmitTime) / 1000); // giây
        break;
      }
    }

    if (solved) {
      solvedCount++;
      totalScore += 1000 - attempts * 20 + Math.max(0, 300 - firstCorrectTime); // ví dụ cách tính điểm
      problemsMap[label] = {
        status: "solved",
        attempts: attempts,
        time: firstCorrectTime,
      };
    } else {
      problemsMap[label] = {
        status: "wrong",
        attempts: attempts,
        time: null,
      };
    }
  });

  return {
    name: userData.idData,
    solved: solvedCount,
    score: totalScore,
    problems: problemsMap,
  };
}

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("vi-VN");
  const timeDiv = document.querySelector(".header-time");
  if (timeDiv) {
    timeDiv.textContent = `⏱ ${timeString}`;
  }
}

// đổi màu user

const currentUser = JSON.parse(localStorage.getItem("UserData"));

function populateLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  console.log(teams);

  teams.forEach((team) => {
    const row = document.createElement("tr");

    let problemCells = "";
    problemColumns.forEach((col) => {
      problemCells += `<td>${generateProblemCell(team.problems[col])}</td>`;
    });

    row.innerHTML = `
      <td>${team.rank}</td>
      <td><strong>${team.name}</strong></td>
      <td><span class="solved-count">${team.score}</span> </td>
      ${problemCells}
    `;

    // Nếu là user hiện tại => thêm class highlight
    if (currentUser && team.name === currentUser.name) {
      row.classList.add("highlight-row");
    }

    tbody.appendChild(row);
  });
}
