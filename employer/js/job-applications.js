document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  async function fetchApplications() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests/Application", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("فشل في جلب الطلبات");

      const data = await response.json();
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      data.forEach((app, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="text-black">${index + 1}</td>
          <td class="text-black">${app.userName}</td>
          <td class="text-black">${app.requestTitle}</td>
          <td class="text-black">${app.email}</td>
          <td class="text-black">${app.applyDate?.split("T")[0]}</td>
          <td>
            <a href="${app.cvUrl}" target="_blank" class="btn btn-sm btn-info text-white"><i class="fas fa-file-alt me-1"></i>السيرة الذاتية</a>
            <button class="btn btn-sm btn-success text-white" onclick="handleApplicationAction(${app.requestId}, '${app.userId}', 'accept')"><i class="fas fa-check me-1"></i>قبول</button>
            <button class="btn btn-sm btn-danger text-white" onclick="handleApplicationAction(${app.requestId}, '${app.userId}', 'reject')"><i class="fas fa-times me-1"></i>رفض</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error("فشل في تحميل الطلبات:", err);
    }
  }

  window.handleApplicationAction = async (requestId, userId, action) => {
    let url = "";
    if (action === "accept") {
      url = `http://tjob.tryasp.net/api/Employer/Requests/AcceptApplication?requestId=${requestId}&userId=${userId}`;
    } else if (action === "reject") {
      url = `http://tjob.tryasp.net/api/Employer/Requests/DeAcceptApplication?requestId=${requestId}&userId=${userId}`;
    }

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("فشل في تنفيذ الطلب");
      await fetchApplications(); // إعادة تحميل الطلبات بعد الإجراء
    } catch (error) {
      console.error("خطأ:", error);
    }
  };

  fetchApplications();
});
