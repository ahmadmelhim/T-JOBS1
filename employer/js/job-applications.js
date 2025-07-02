document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  async function fetchApplications() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests/Applications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("فشل في جلب الطلبات");

      const data = await response.json();
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      data.forEach((app, index) => {
        const isAccepted = app.status === "Accepted"; // شرط الحالة المقبولة

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="text-black">${index + 1}</td>
          <td class="text-black">${app.applicationUserFirstName} ${app.applicationUserLastName}</td>
          <td class="text-black">${app.requestTitle}</td>
          <td class="text-black">${app.applicationUserEmail}</td>
          <td class="text-black">${app.applyDateTime?.split("T")[0]}</td>
          <td>
            <a href="${app.applicationUserFile}" target="_blank" class="btn btn-sm btn-info text-white mb-1">
              <i class="fas fa-file-alt me-1"></i>السيرة الذاتية
            </a><br>
            <button class="btn btn-sm btn-success text-white mb-1" onclick="handleApplicationAction(${app.requestId}, '${app.applicationUserId}', 'accept')">
              <i class="fas fa-check me-1"></i>قبول
            </button>
            <button class="btn btn-sm btn-danger text-white mb-1" onclick="handleApplicationAction(${app.requestId}, '${app.applicationUserId}', 'reject')">
              <i class="fas fa-times me-1"></i>رفض
            </button>
            ${isAccepted ? `
              <br>
              <button class="btn btn-sm btn-secondary text-white mt-1" onclick="handleApplicationAction(${app.requestId}, '${app.applicationUserId}', 'complete')">
                <i class="fas fa-check-double me-1"></i>إنهاء العمل
              </button>
            ` : ""}
          </td>
        `;
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error("فشل في تحميل الطلبات:", err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "فشل في تحميل الطلبات",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  }

  window.handleApplicationAction = async (requestId, userId, action) => {
    let url = "";
    let successMessage = "";

    if (action === "accept") {
      url = `http://tjob.tryasp.net/api/Employer/Requests/AcceptApplication?requestId=${requestId}&userId=${userId}`;
      successMessage = "تم قبول الطلب";
    } else if (action === "reject") {
      url = `http://tjob.tryasp.net/api/Employer/Requests/DeAcceptApplication?requestId=${requestId}&userId=${userId}`;
      successMessage = "تم رفض الطلب";
    } else if (action === "complete") {
      url = `http://tjob.tryasp.net/api/Employer/Requests/CompleteApplication?requestId=${requestId}&userId=${userId}`;
      successMessage = "تم إنهاء العمل";
    }

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("فشل في تنفيذ الطلب");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: successMessage,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      await fetchApplications();
    } catch (error) {
      console.error("خطأ:", error);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "حدث خطأ أثناء تنفيذ العملية",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  fetchApplications();
});
