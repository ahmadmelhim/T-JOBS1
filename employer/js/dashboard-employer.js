document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("الرجاء تسجيل الدخول أولاً");

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("فشل تحميل الوظائف");

    const jobs = await res.json();

    // تحديث عدد الوظائف المنشورة
    document.getElementById("publishedCount").textContent = jobs.length;

    // حساب الطلبات ومقبولة ومرفوضة
    let totalApplications = 0;
    let accepted = 0;
    let rejected = 0;

    jobs.forEach(job => {
      totalApplications += job.applicationsCount || 0;
      accepted += job.acceptedCount || 0;
      rejected += job.rejectedCount || 0;
    });

    document.getElementById("applicationsCount").textContent = totalApplications;
    document.getElementById("acceptedCount").textContent = accepted;
    document.getElementById("rejectedCount").textContent = rejected;

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
