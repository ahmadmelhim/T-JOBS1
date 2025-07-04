document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("id");

  if (!jobId) {
    Swal.fire({
      title: "خطأ",
      text: "لم يتم تحديد الوظيفة.",
      icon: "error",
      position: "top-end",
      toast: true,
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://tjob.tryasp.net/api/Worker/Requests/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في تحميل بيانات الوظيفة");

    const job = await res.json();

    // استخراج اسم الملف من رابط الصورة
    let imgPath = "";
    if (job.mainImg) {
      const filename = job.mainImg.split(/[/\\]/).pop();
      imgPath = `http://tjob.tryasp.net/images/${filename}`;
    }

    // تعبئة البيانات في الصفحة
    const jobImage = document.getElementById("jobImage");
    const loader = document.getElementById("imageLoader");
    jobImage.onload = () => {
      loader.style.display = "none";
      jobImage.hidden = false;
    };
    jobImage.onerror = () => {
      loader.innerHTML = `<div class="text-danger small">فشل تحميل الصورة</div>`;
    };
    jobImage.src = imgPath;
    document.getElementById("jobEmployer").textContent = `${job.applicationUserFirstName} ${job.applicationUserLastName}`;
    document.getElementById("employerRate").textContent = `${job.applicationUserAvgRate} / 5`;
    document.getElementById("modalFullImage").src = imgPath;
    document.getElementById("jobTitle").textContent = job.title;
    document.getElementById("jobDescription").textContent = job.description;
    document.getElementById("jobLocation").textContent = `${job.city} - ${job.street}`;
    document.getElementById("jobDate").textContent = job.dateTime.split("T")[0];
    document.getElementById("jobPrice").textContent = `${job.price} شيقل / يوم`;
    document.getElementById("jobType").textContent = job.requestTypeName;

  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "خطأ",
      text: "حدث خطأ أثناء تحميل البيانات.",
      icon: "error",
      position: "top-end",
      toast: true,
      timer: 3000,
      showConfirmButton: false
    });
  }

  // التقديم على الوظيفة
  document.getElementById("applyBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تنبيه",
        text: "يرجى تسجيل الدخول أولاً",
        icon: "warning",
        position: "top-end",
        toast: true,
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const formData = new FormData();
    formData.append("RequestId", jobId);

    try {
      const res = await fetch(`http://tjob.tryasp.net/api/Worker/Requests/ApplyJob?RequestId=${jobId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("فشل في إرسال الطلب");

      Swal.fire({
        title: "تم التقديم!",
        text: "تم إرسال طلبك بنجاح",
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء التقديم",
        icon: "error",
        position: "top-end",
        toast: true,
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
});
