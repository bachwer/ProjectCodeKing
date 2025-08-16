async function updateCountdown() {
  try {
    const res = await fetch("http://172.26.112.1:3000/realtime");
    const data = await res.json();

    const timeStr = formatTime(data.realTime); // chuyển giây ➝ hh:mm:ss
    document.getElementById("countdown").innerText = timeStr;
  } catch (err) {
    console.error("❌ Error fetching countdown:", err);
  }
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Thêm số 0 nếu cần để đảm bảo định dạng 2 chữ số
  const hStr = hours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");

  return `${hStr}:${mStr}:${sStr}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);
