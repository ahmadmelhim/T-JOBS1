document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  async function fetchPastProjects() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests/PastProject", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("فشل في جلب سجل المشاريع");

      const data = await response.json();
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      data.forEach((project, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td class="text-black">${project.userName}</td>
          <td class="text-black">${project.requestTitle}</td>
          <td class="text-black">${project.email}</td>
          <td class="text-black">${project.acceptDate?.split("T")[0]}</td>
          <td>
            <a href="../worker/worker-profile.html?id=${project.userId}" class="btn btn-sm btn-primary text-white">
              <i class="fa-solid fa-eye me-1"></i>عرض الصفحة
            </a>
          </td>
          <td>
            <a href="./rate-workers.html?userId=${project.userId}&requestId=${project.requestId}" class="btn btn-sm btn-warning text-white">
              <i class="fa-solid fa-star me-1"></i>قيّم العامل
            </a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("حدث خطأ أثناء تحميل المشاريع:", error);
    }
  }

  fetchPastProjects();
});
