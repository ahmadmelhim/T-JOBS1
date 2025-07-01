document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // استخراج القيم من الرابط
  const params = new URLSearchParams(window.location.search);
  const workerIdParam = params.get("workerId");
  const requestIdParam = params.get("requestId");

  if (workerIdParam) document.getElementById("workerId").value = workerIdParam;
  if (requestIdParam) document.getElementById("requestId").value = requestIdParam;

  // تفعيل التقييم بالنجوم
  document.querySelectorAll("#starRating i").forEach(star => {
    star.addEventListener("click", () => {
      const value = parseInt(star.dataset.value);
      document.getElementById("ratingValue").value = value;

      document.querySelectorAll("#starRating i").forEach(s => {
        s.classList.remove("fa-solid", "text-warning");
        s.classList.add("fa-regular", "text-secondary");
        if (parseInt(s.dataset.value) <= value) {
          s.classList.remove("fa-regular", "text-secondary");
          s.classList.add("fa-solid", "text-warning");
        }
      });
    });
  });

  // إرسال التقييم
  document.getElementById("ratingForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const workerId = document.getElementById("workerId").value.trim();
    const requestId = parseInt(document.getElementById("requestId").value);
    const rate = parseFloat(document.getElementById("ratingValue").value);
    const note = document.getElementById("comment").value.trim();

    try {
      const res = await fetch("http://tjob.tryasp.net/api/Employer/Rates/RateWorker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ workerId, requestId, rate, note })
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم الإرسال",
          text: "تم إرسال التقييم بنجاح",
          confirmButtonText: "حسناً",
          position: "top-end",
          toast: true,
          timer: 3000,
          showConfirmButton: false,
        });

        document.getElementById("ratingForm").reset();
        document.querySelectorAll("#starRating i").forEach(star => {
          star.classList.remove("fa-solid", "text-warning");
          star.classList.add("fa-regular", "text-secondary");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل الإرسال",
          text: "حدث خطأ أثناء إرسال التقييم"
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تعذر الاتصال بالخادم"
      });
    }
  });
});
