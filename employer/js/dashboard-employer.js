document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("الرجاء تسجيل الدخول أولاً");

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل تحميل الوظائف");

    const jobs = await res.json();

    // الوظائف المنشورة
    document.querySelector(".card-title.mt-2").nextElementSibling.textContent = jobs.length;

    // الطلبات الواردة + الإحصائيات
    let totalApplications = 0;
    let accepted = 0;
    let rejected = 0;

    jobs.forEach(job => {
      totalApplications += job.applicationsCount || 0;

      accepted += job.acceptedCount || 0;
      rejected += job.rejectedCount || 0;
    });

    document.querySelectorAll(".card-title.mt-2")[1].nextElementSibling.textContent = totalApplications;

    const statCard = document.querySelectorAll(".card-title.mt-2")[2].parentElement;
    statCard.querySelectorAll("p")[0].textContent = `مقبولة: ${accepted}`;
    statCard.querySelectorAll("p")[1].textContent = `مرفوضة: ${rejected}`;

    // عرض آخر وظيفتين
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // مسح الموجود مسبقًا

    const latestJobs = jobs.slice(-5).reverse(); // آخر وظيفتين
    latestJobs.forEach((job, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="text-black">${index + 1}</td>
        <td class="text-black">${job.title}</td>
        <td class="text-black">${job.applicationsCount || 0}</td>
        <td class="text-black"><span class="badge ${job.requestStatus === 0 ? 'bg-success' : 'bg-danger'}">
          ${job.requestStatus === 0 ? "نشطة" : "منتهية"}</span></td>
        <td class="text-black">${job.publishDateTime?.split("T")[0] || ""}</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء تحميل البيانات.");
  }
});
