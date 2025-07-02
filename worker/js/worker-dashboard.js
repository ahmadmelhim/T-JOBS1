document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const url = "http://tjob.tryasp.net/api/Worker/Home";

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("فشل في جلب البيانات");

    const data = await response.json();

    // تعبئة البطاقات الثلاث
    document.getElementById("sentCount").textContent = data.totalSentApplications ?? 0;
    document.getElementById("currentJobsCount").textContent = data.currentJobs?.length ?? 0;
    document.getElementById("completedJobsCount").textContent = data.completedJobs?.length ?? 0;


    // تعبئة الجدول (إذا فيه وظائف)
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = ""; // تفريغ محتوى الجدول

    data.lastJobs?.forEach((job, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${job.title}</td>
        <td><span class="badge ${job.status === 'جارية' ? 'bg-success' : 'bg-secondary'}">${job.status}</span></td>
        <td>${job.startDate?.split("T")[0] ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("خطأ في تحميل بيانات لوحة التحكم:", err);
  }
});
