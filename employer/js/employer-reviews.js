document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("reviewsContainer");
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://tjob.tryasp.net/api/Employer/Rates/ReceivedRatings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("فشل في جلب التقييمات");

    const ratings = await response.json();

    if (ratings.length === 0) {
      container.innerHTML = `<p class="text-center text-muted">لا توجد ملاحظات حتى الآن.</p>`;
      return;
    }

    container.innerHTML = "";
    ratings.forEach(rating => {
      const stars = "★".repeat(rating.rate) + "☆".repeat(5 - rating.rate);
      const date = new Date(rating.ratedAt).toLocaleDateString("ar-EG");
      const card = document.createElement("div");
      card.className = "col-md-6";
      card.innerHTML = `
        <div class="card shadow-lg border-0 rounded-4">
          <div class="card-body d-flex gap-3 align-items-start">
            <img src="${rating.workerImg}" alt="صورة العامل" class="rounded-circle border" style="width: 60px; height: 60px; object-fit: cover;">
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 text-primary">${rating.workerName || "عامل غير معروف"}</h5>
              <p class="mb-1 text-secondary"><strong>الوظيفة:</strong> ${rating.jobTitle || "غير محدد"}</p>
              <p class="mb-1"><strong>التقييم:</strong> <span style="color: gold;">${stars}</span></p>
              <p class="mb-2"><strong>الملاحظة:</strong> ${rating.note || "لا يوجد تعليق"}</p>
              <p class="text-muted small text-end">${date}</p>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("خطأ في تحميل التقييمات:", error);
    container.innerHTML = `<p class="text-danger text-center">حدث خطأ أثناء تحميل الملاحظات.</p>`;
  }
});
