document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("الرجاء تسجيل الدخول أولاً");

  try {
    // 🟦 الطلب الأول: الإحصائيات
    const statsRes = await fetch("http://tjob.tryasp.net/api/Employer/Home", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!statsRes.ok) throw new Error("فشل تحميل الإحصائيات");
    const stats = await statsRes.json();
    document.getElementById("publishedCount").textContent = stats.totalNumberOfRequests || 0;
    document.getElementById("applicationsCount").textContent = stats.totalNumberOfResponses || 0;
    document.getElementById("completedCount").textContent = stats.totalNumberOfCompletedRequests || 0;


    // 🟦 الطلب الثاني: الوظائف
    const jobsRes = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!jobsRes.ok) throw new Error("فشل تحميل الوظائف");
    const jobs = await jobsRes.json();

    // 🟦 عرض آخر 3 وظائف
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    const latestJobs = jobs.slice(-3).reverse();

    latestJobs.forEach((job, index) => {
      const status = getStatusBadge(job.requestStatus);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-black">${index + 1}</td>
        <td class="text-black">${job.title}</td>
        <td class="text-black">${job.city}</td>
        <td class="text-black">
          <span class="badge ${status.class}">${status.text}</span>
        </td>
        <td class="text-black">${job.publishDateTime?.split("T")[0] || "-"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("حدث خطأ أثناء تحميل البيانات:", err);
    alert("تعذر تحميل البيانات من الخادم.");
  }

  // ✅ دالة الحالة
  function getStatusBadge(status) {
    switch (status) {
      case 0: return { text: "متاحة", class: "bg-primary" };
      case 1: return { text: "مقبولة", class: "bg-success" };
      case 2: return { text: "مرفوضة", class: "bg-danger" };
      case 3: return { text: "مكتملة", class: "bg-secondary" };
      default: return { text: "منتهية", class: "bg-danger" };
    }
  }
});
