document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://tjob.tryasp.net/api/Admin/Home", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("فشل في جلب البيانات");

    const data = await response.json();

    // عرض البيانات في العناصر
    document.getElementById("userCount").textContent = data.totalNumberOfUsers ?? "--";
    document.getElementById("jobCount").textContent = data.totalNumberOfRequests ?? "--";
    document.getElementById("applicationCount").textContent = data.totalNumberOfApplications ?? "--";
    document.getElementById("bannedCount").textContent = data.totalNumberOfBlockedUsers ?? "--";

  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء تحميل بيانات لوحة التحكم");
  }
});
