// Đảm bảo chạy sau khi DOM được tải
const currentAccount = JSON.parse(localStorage.getItem("UserData"));
const currentAccountId = currentAccount.ID;

let recentDatas = [];

async function displayAcceptedProblems(currentAccountId) {
  try {
    const res = await fetch("../json/Data.json");
    if (!res.ok) throw new Error("Không thể tải file JSON từ server");

    const data = await res.json();
    const account = data.Data.find((acc) => acc.idData === currentAccountId);
    if (account) {
      recentDatas = account.RecentAttempts;
    }
  } catch (err) {
    console.error("❌ Lỗi khi đọc dữ liệu:", err);
  }
}

// Hàm xử lý khi click vào bài toán
function openProblem(problemId) {
  localStorage.setItem("problemId", problemId);
  setTimeout(function () {
    window.location.href = "../PageUser/checking.html";
  }, 500);
}

// Hiệu ứng hover cho problem-item
document.addEventListener("mouseover", (e) => {
  const item = e.target.closest(".problem-item");
  if (item) item.style.transform = "translateX(4px)";
});
document.addEventListener("mouseout", (e) => {
  const item = e.target.closest(".problem-item");
  if (item) item.style.transform = "translateX(0)";
});

document.addEventListener("DOMContentLoaded", async () => {
  // Bước 1: Gọi hàm lấy dữ liệu bài làm đúng
  await displayAcceptedProblems(currentAccountId);

  // Bước 2: Fetch dữ liệu từ problem.json
  fetch("../json/problem.json")
    .then((response) => {
      if (!response.ok) throw new Error("Không thể tải file JSON");
      return response.json();
    })
    .then((data) => {
      // Hiển thị thông tin cuộc thi
      document.getElementById("contest-title").textContent =
        data.contest.contestName;
      document.getElementById("contest-date").textContent = data.contest.date;

      const contestProblems = data.contest.problems;
      const problemsList = document.getElementById("problemsList");

      contestProblems.forEach((problem) => {
        const div = document.createElement("div");
        div.className = "problem-item";
        div.setAttribute("onclick", `openProblem('${problem.id}')`);

        // Kiểm tra nếu bài đã được làm đúng (✅)
        const solved = recentDatas.find(
          (attempt) =>
            attempt.problem === problem.id &&
            attempt.resultDescription.startsWith("✅")
        );

        let letterColor = "problem-letter";

        if (solved) {
          div.classList.add("solved");
          letterColor = "problem-letter1";
        }

        div.innerHTML = `
          <div class="${letterColor}">${problem.id[0]}</div>
          <div class="problem-details">
            <h3>${problem.name}</h3>
            <p>${problem.description}</p>
          </div>
          <div class="problem-points">
            <div class="points-value">Points: ${problem.points}</div>
          </div>
        `;
        problemsList.appendChild(div);
      });
      const dateElement = document.getElementById("contest-date");
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;
      dateElement.textContent = formattedDate;

      let countTeams = 0;
      fetch("../json/Account.json")
        .then((res) => res.json())
        .then((data) => {
          countTeams = data.Users.length;
          console.log(countTeams);
          const contestTeams = document.getElementById("contest-teams");
          contestTeams.textContent = `${countTeams} Đội`;
        });

      fetch("../json/Data.json")
        .then((res) => res.json())
        .then((data) => {
          const currentAccountInfos = data.Data.find(
            (e) => e.idData === currentAccountId
          );
          console.log(currentAccountInfos);
          const attemptedCount = document.getElementById("attemptedCount");
          attemptedCount.textContent = currentAccountInfos.History.length;
          const points = document.getElementById("totalPoints");
          points.textContent = currentAccountInfos.Points;

          let solvedCount = 0;
          currentAccountInfos.RecentAttempts.forEach((e) => {
            if (e.resultDescription.startsWith("✅")) {
              solvedCount++;
            }
          });
          document.getElementById("solvedProblems").textContent = solvedCount;
          document.getElementById("unsolved").textContent = 12 - solvedCount;
        });
    })
    .catch((error) => {
      console.error("Lỗi khi đọc JSON:", error);

      // Nếu không đọc được JSON → hiển thị ngày hôm nay
    });
});
