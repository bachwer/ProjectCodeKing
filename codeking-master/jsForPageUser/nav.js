// Đồng hồ đếm ngược

// Navigation tab active và chuyển trang
// document.querySelectorAll(".nav-link").forEach((link) => {
//   link.addEventListener("click", function () {
//     // Bỏ active
//     document
//       .querySelectorAll(".nav-link")
//       .forEach((l) => l.classList.remove("active"));
//     this.classList.add("active");

//     // Ẩn tất cả nội dung
//     document
//       .querySelectorAll(".tab-content")
//       .forEach((tab) => (tab.style.display = "none"));

//     // Xác định nội dung tương ứng
//     let id = this.id;
//     let contentId = "";

//     if (id === "leaderboard") contentId = "leaderboard-content";
//     else if (id === "submit-link") contentId = "submit-content";
//     else contentId = "dashboard-content";

//     // Hiện đúng nội dung
//     document.getElementById(contentId).style.display = "block";

//     // Cuộn về đầu nội dung hoặc trang
//     document.getElementById(contentId).scrollIntoView({ behavior: "smooth" });
//   });
// });

//Ten Doi
const data = localStorage.getItem("UserData");
const tmp = JSON.parse(data);
document.getElementById("name-team").innerHTML = tmp.name;

// chuyen trang
document.getElementById("submit-link").onclick = function () {
  window.location.href = "../PageUser/Submission.html";
};
document.getElementById("leaderboard").onclick = function () {
  window.location.href = "../PageUser/leaderboard.html";
};
document.getElementById("Dashboard").onclick = function () {
  window.location.href = "../PageUser/dashboard.html";
};
document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "../PageUser/dashboard.html";
});
