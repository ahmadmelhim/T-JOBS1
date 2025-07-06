document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("completedJobsTableBody");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "تنبيه",
      text: "يجب تسجيل الدخول أولاً",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
    });
    return;
  }

  try {
    const response = await fetch("http://tjob.tryasp.net/api/Worker/Requests/EndedJobs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("فشل في جلب الوظائف");

    const result = await response.json();
    const jobs = result.endedJobs || [];
    tbody.innerHTML = "";

    if (jobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">لا توجد وظائف منتهية حالياً.</td></tr>`;
      return;
    }

    jobs.forEach((job, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${job.title || "-"}</td>
        <td>${job.employerName || "-"}</td>
        <td>${job.employerEmail || "-"}</td>
        <td>${job.endDate?.split("T")[0] || "-"}</td>
        <td>
          ${
            job.employerRate > 0
              ? "<span class='text-success'>تم التقييم</span>"
              : `<a href="rate-employers.html?requestId=${job.requestId}&userId=${job.employerId}&userName=${encodeURIComponent(job.employerName)}&jobTitle=${encodeURIComponent(job.title)}" class="btn btn-sm btn-warning">
                  <i class="fa fa-star me-1"></i> تقييم
                </a>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("خطأ أثناء تحميل الوظائف:", error);
    tbody.innerHTML = `<tr><td colspan="7">حدث خطأ أثناء تحميل البيانات.</td></tr>`;
  }
});
