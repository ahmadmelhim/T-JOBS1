document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("الرجاء تسجيل الدخول أولاً");

  try {
    // الطلب الأول: إحضار إحصائيات من /api/Employer/Home
    const statsRes = await fetch("http://tjob.tryasp.net/api/Employer/Home", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!statsRes.ok) throw new Error("فشل تحميل الإحصائيات");

    const stats = await statsRes.json();

    // عرض الإحصائيات
    document.getElementById("publishedCount").textContent = stats.totalNumberOfRequests || 0;
    document.getElementById("applicationsCount").textContent = stats.totalNumberOfResponses || 0;
    document.getElementById("acceptedCount").textContent = stats.totalNumberOfAcceptedRequests || 0;
    document.getElementById("rejectedCount").textContent = stats.totalNumberOfNotAcceptedRequests || 0;

    // الطلب الثاني: إحضار تفاصيل الوظائف
    const jobsRes = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!jobsRes.ok) throw new Error("فشل تحميل الوظائف");

    const jobs = await jobsRes.json();

    // عرض آخر 3 وظائف
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    const latestJobs = jobs.slice(-3).reverse();

    latestJobs.forEach((job, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-black">${index + 1}</td>
        <td class="text-black">${job.title}</td>
        <td class="text-black">${job.applicationsCount || 0}</td>
        <td class="text-black">
          <span class="badge ${job.requestStatus === 0 ? 'bg-success' : 'bg-danger'}">
            ${job.requestStatus === 0 ? "نشطة" : "منتهية"}
          </span>
        </td>
        <td class="text-black">${job.publishDateTime?.split("T")[0] || "-"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("حدث خطأ أثناء تحميل البيانات:", err);
    alert("تعذر تحميل البيانات من الخادم.");
  }
});
