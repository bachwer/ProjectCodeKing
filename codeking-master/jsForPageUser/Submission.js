const tableBody = document.getElementById("tableSubmission");

// Lấy UID từ localStorage
// const data = localStorage.getItem("UserData");
// const tmp = JSON.parse(data);
// const targetUID = tmp.ID; // E.g., "U001"
// document.getElementById("name-team").innerHTML = tmp.name;

const targetUID = tmp.ID; // E.g., "U001"

console.log(tmp.ID);
fetch("../json/Data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then((jsonData) => {
    const userData = jsonData.Data.find((item) => item.idData === targetUID);
    console.log(jsonData);

    if (userData && userData.History.length > 0) {
      userData.History.forEach((sub) => {
        const row = document.createElement("tr");

        // Xác định class cho language (VD: cpp -> language-cpp)
        const languageClass = `language-${sub.language.toLowerCase()}`;

        // Xác định status class dựa vào resultDescription (✅ accepted, ❌ wrong, 🟠 partial)
        let statusClass = "status-partial";
        if (sub.resultDescription.includes("✅"))
          statusClass = "status-accepted";
        else if (sub.resultDescription.includes("❌"))
          statusClass = "status-wrong";

        // Format time từ ISO string sang ngày giờ dễ đọc
        const timeSubmit = new Date(sub.time).toLocaleString();

        row.innerHTML = `
                    <td>${sub.problemName}</td>
                    <td><span class="language-label ${languageClass}">${sub.language}</span></td>
                    <td>${sub.summary.max_time_ms} ms</td>
                    <td>${sub.summary.max_memory_kb} kb</td>
                    <td class="${statusClass}">${sub.resultDescription}</td>
                    <td>${timeSubmit}</td>
                `;

        tableBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6">Không có dữ liệu History</td>`;
      tableBody.appendChild(row);
    }
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
