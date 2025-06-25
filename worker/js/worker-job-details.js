document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");

  if (!jobId) {
    alert("لم يتم تحديد الوظيفة.");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://tjob.tryasp.net/api/Requests/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في تحميل بيانات الوظيفة");

    const job = await res.json();

    // مسار الصورة
    let imgPath = "../assert/image/original.avif"; // مسار بديل في حال عدم وجود صورة

    if (job.mainImg) {
      const match = job.mainImg.match(/images[\\/](.*\.jpg)/i);
      if (match && match[1]) {
        imgPath = `http://tjob.tryasp.net/images/${match[1]}`;
      }
    }

    // تعبئة البيانات في الصفحة
    document.getElementById("jobImage").src = imgPath;
    document.getElementById("modalFullImage").src = imgPath;
    document.getElementById("jobTitle").textContent = job.title;
    document.getElementById("jobDescription").textContent = job.description;
    document.getElementById("jobLocation").textContent = `${job.city} - ${job.street}`;
    document.getElementById("jobDate").textContent = job.dateTime.split("T")[0];
    document.getElementById("jobPrice").textContent = `${job.price} شيقل / يوم`;
    document.getElementById("jobType").textContent = job.requestTypeName;

  } catch (err) {
    console.error(err);
    alert("خطأ أثناء تحميل البيانات.");
  }
});
