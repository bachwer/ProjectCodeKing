const data = localStorage.getItem("UserData");
const tmp = JSON.parse(data);

document.getElementById("UserName").innerHTML = "Team: " + tmp.name;

const startBtn = document.getElementById("startContest");

function updateButtonState() {
  fetch("http://26.244.56.27:3000/realtime")
    .then((res) => res.json())
    .then((data) => {
      let secondsLeft = Number(data.secondsUntilStart);
      if (isNaN(secondsLeft)) secondsLeft = 0; // tránh NaN

      if (secondsLeft <= 0) {
        startBtn.disabled = false;
        startBtn.textContent = "Start Contest";
      } else {
        startBtn.disabled = true;
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        startBtn.textContent = `Wait ${mins}m ${secs}s`;
      }
    })
    .catch((err) => {
      console.error("❌ Lỗi fetch:", err);
      startBtn.textContent = "Error";
    });
}

setInterval(updateButtonState, 1000);
updateButtonState();

startBtn.addEventListener("click", () => {
  if (!startBtn.disabled) {
    setTimeout(() => {
      location.href = "./dashboard.html";
    }, 800);
  }
});
