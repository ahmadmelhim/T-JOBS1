document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  async function fetchPastProjects() {
    const tbody = document.querySelector("tbody");
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests/PastProject", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("فشل في جلب سجل المشاريع");

      const data = await response.json();
      tbody.innerHTML = "";

      data.forEach((project, index) => {
        const workerName = `${project.applicationUserFirstName} ${project.applicationUserLastName}`;
        const jobTitle = project.requestTitle;
        const hasRated = project.isRated === true;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td class="text-black">${workerName}</td>
          <td class="text-black">${jobTitle}</td>
          <td class="text-black">${project.applicationUserEmail}</td>
          <td class="text-black">${project.applyDateTime?.split("T")[0]}</td>
          <td>
            <a href="profile-view.html?id=${project.userId}" class="btn btn-sm btn-info text-white">
              <i class="fa-solid fa-eye me-1"></i> عرض الملف
            </a>
          </td>
          <td>
            ${hasRated
              ? "<span class='text-success'>تم التقييم</span>"
              : `<a href="rate-workers.html?requestId=${project.requestId}&userId=${project.userId}&userName=${encodeURIComponent(workerName)}&jobTitle=${encodeURIComponent(jobTitle)}" class="btn btn-sm btn-warning text-white">
                  <i class="fa fa-star me-1"></i> تقييم
                </a>`
            }
          </td>
        `;

        tbody.appendChild(tr);
      });

    } catch (error) {
      console.error("خطأ أثناء تحميل الوظائف:", error);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7">حدث خطأ أثناء تحميل البيانات.</td></tr>`;
      }
    }
  }

  fetchPastProjects();
});
