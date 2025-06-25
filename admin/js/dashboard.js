document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  try {
    // 1. عدد المستخدمين
    const usersRes = await fetch("http://tjob.tryasp.net/api/Admin/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const users = await usersRes.json();
    document.getElementById("userCount").textContent = users.length;

    // 2. الوظائف المنشورة
    const jobsRes = await fetch("http://tjob.tryasp.net/api/Admin/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const jobs = await jobsRes.json();
    document.getElementById("jobCount").textContent = jobs.length;

    // 3. طلبات التقديم
    let totalApplications = 0;
    jobs.forEach(job => totalApplications += job.applicationsCount || 0);
    document.getElementById("applicationCount").textContent = totalApplications;

    // 4. حسابات محظورة
    const banned = users.filter(u => u.lockoutEnabled || u.isBanned);
    document.getElementById("bannedCount").textContent = banned.length;

  } catch (err) {
    console.error("خطأ في تحميل بيانات لوحة التحكم:", err);
  }
});
