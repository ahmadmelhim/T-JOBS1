document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("jobsContainer");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Worker/Requests/CurrentJobs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("فشل في تحميل الوظائف");

    const result = await res.json();
    const jobs = result.currentJobs || [];

    console.log("الوظائف المحمّلة:", jobs);

    container.innerHTML = "";

    if (jobs.length === 0) {
      container.innerHTML = `<p class="text-center">لا توجد وظائف متاحة حاليًا.</p>`;
      return;
    }

    jobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "col-12 col-md-6 col-lg-4";
     card.innerHTML = `
  <div class="card h-100 shadow-lg border-0">
    <div class="card-body">
      <h5 class="card-title text-primary"><i class="fa-solid fa-briefcase me-2"></i>${job.title}</h5>
      <p class="card-text text-secondary"><strong>تاريخ النشر:</strong> ${job.publishDateTime?.split("T")[0] || "-"}</p>
      <p class="card-text text-secondary"><strong>صاحب العمل:</strong> ${job.employeerName ?? "غير معروف"}</p>
      <p class="mb-1"><strong>البريد للتواصل:</strong> <a href="mailto:${job.contactEmail}">${job.contactEmail}</a></p>
      <div class="mt-3 text-center">
        <a href="worker-job-details.html?id=${job.requestId || ""}" class="btn btn-primary w-100">عرض التفاصيل</a>
      </div>
    </div>
  </div>
`;

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger text-center">حدث خطأ أثناء تحميل الوظائف.</p>`;
  }
});
