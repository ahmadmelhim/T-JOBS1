document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const homeUrl = "http://tjob.tryasp.net/api/Worker/Home";
  const endedJobsUrl = "http://tjob.tryasp.net/api/Worker/Requests/EndedJobs";

  try {
    //  جلب بيانات لوحة التحكم
    const homeRes = await fetch(homeUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!homeRes.ok) throw new Error("فشل في جلب بيانات لوحة التحكم");

    const homeData = await homeRes.json();

    document.getElementById("sentCount").textContent = homeData.sentApplications ?? 0;
    document.getElementById("currentJobsCount").textContent = homeData.currentJobs ?? 0;
    document.getElementById("completedJobsCount").textContent = homeData.completedJobs ?? 0;

    //  جلب الوظائف المنتهية
    const endedRes = await fetch(endedJobsUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!endedRes.ok) throw new Error("فشل في جلب الوظائف المنتهية");

    const endedData = await endedRes.json();
    const endedJobs = endedData.endedJobs ?? [];

    //  دمج البيانات
    const combinedJobs = [];

    (homeData.requiredJobs || []).forEach(job => {
      combinedJobs.push({
        title: job.title || "-",
        employerName: "-", 
        status: job.status || "-",
        date: job.startDate || "-"
      });
    });

    endedJobs.forEach(job => {
      combinedJobs.push({
        title: job.title || "-",
        employerName: job.employerName || "-",
        status: "منتهية",
        date: job.endDate || "-"
      });
    });

    //  ترتيب حسب التاريخ وأخذ آخر 3
    const latestJobs = combinedJobs
      .filter(j => j.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    //  عرض في الجدول
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    latestJobs.forEach((job, index) => {
      const badgeClass =
        job.status === "جارية" ? "bg-success" :
        job.status === "مكتملة" ? "bg-secondary" :
        job.status === "منتهية" ? "bg-dark" : "bg-secondary";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${job.title}</td>
        <td>${job.employerName}</td>
        <td><span class="badge ${badgeClass}">${job.status}</span></td>
        <td>${job.date?.split("T")[0] ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("خطأ في تحميل بيانات لوحة التحكم:", err);
  }
});
