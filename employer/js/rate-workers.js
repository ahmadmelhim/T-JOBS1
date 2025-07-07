document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const form = document.getElementById("ratingForm");
  const ratingInput = document.getElementById("ratingValue");
  const stars = document.querySelectorAll("#starRating i");

  // استخراج المعرفات والبيانات من الرابط
  const params = new URLSearchParams(window.location.search);
  const workerId = params.get("userId");
  const requestId = params.get("requestId");
  const workerName = params.get("userName");
  const jobTitle = params.get("jobTitle");

  // عرض اسم العامل والوظيفة إن وجدوا
  if (workerName) {
    const nameElement = document.getElementById("workerName");
    if (nameElement) nameElement.textContent = workerName;
  }

  if (jobTitle) {
    const jobElement = document.getElementById("jobTitle");
    if (jobElement) jobElement.textContent = jobTitle;
  }

  // ✅ تغيير لون النجوم عند الضغط
  stars.forEach(star => {
    star.addEventListener("click", () => {
      const value = star.getAttribute("data-value");
      ratingInput.value = value;

      stars.forEach(s => {
        s.classList.remove("fa-solid", "text-warning");
        s.classList.add("fa-regular", "text-secondary");
      });

      for (let i = 0; i < stars.length; i++) {
        if (parseInt(stars[i].getAttribute("data-value")) <= value) {
          stars[i].classList.add("fa-solid", "text-warning");
          stars[i].classList.remove("fa-regular", "text-secondary");
        }
      }
    });
  });

  // إرسال التقييم
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const note = document.getElementById("comment").value;
    const rate = parseFloat(ratingInput.value);
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";
    if (!workerId || !requestId || isNaN(rate) || rate <= 0) {
      Swal.fire("خطأ", "يجب تعبئة جميع الحقول بشكل صحيح", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال التقييم";
      return;
    }

    try {
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Rates/RateWorker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workerId,
          requestId: parseInt(requestId),
          rate,
          note
        })
      });

      if (response.status === 400) {
        const text = await response.text();
        if (text.includes("تم التقييم") || text.includes("already rated")) {
          Swal.fire("تنبيه", "لقد قمت بتقييم هذا العامل مسبقًا.", "info");
        } else {
          Swal.fire("خطأ", text || "فشل في إرسال التقييم", "error");
        }
      } else if (!response.ok) {
        throw new Error("فشل في إرسال التقييم");
      } else {
        Swal.fire("تم", "تم إرسال التقييم بنجاح", "success").then(() => {
          window.location.href = "./accepted-workers.html";
        });
      }

    } catch (error) {
      console.error("❌ خطأ أثناء التقييم:", error);
      Swal.fire("خطأ", "حدث خطأ أثناء إرسال التقييم", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إرسال التقييم";
    }
  });
});
