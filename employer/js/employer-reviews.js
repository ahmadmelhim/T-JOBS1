document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const container = document.querySelector(".row.g-4");
  container.innerHTML = "";

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Rates/MyRatings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب التقييمات");

    const ratings = await res.json();

    if (!ratings || ratings.length === 0) {
      container.innerHTML = `<div class="text-center text-muted">لا يوجد تقييمات حتى الآن.</div>`;
      return;
    }

    ratings.forEach(rating => {
      const fullStars = Math.floor(rating.rate || 0);
      const emptyStars = 5 - fullStars;
      const starIcons = '<i class="fas fa-star text-warning"></i>'.repeat(fullStars) +
                        '<i class="far fa-star text-warning"></i>'.repeat(emptyStars);

      const imgSrc = rating.workerImg || "https://i.pravatar.cc/50?u=" + rating.workerName;

      const card = `
        <div class="col-md-6 col-lg-4">
          <div class="card border-0 shadow rounded-4 p-3">
            <div class="d-flex align-items-center mb-2">
              <img src="${imgSrc}" class="rounded-circle me-3" alt="avatar" width="50" height="50">
              <div>
                <h5 class="mb-0">${rating.workerName || "عامل مجهول"}</h5>
                <small class="text-muted">${rating.workerJob || ""}</small>
              </div>
            </div>
            <div class="mb-2 text-end">${starIcons}</div>
            <p class="bg-light rounded p-3 text-black-50">${rating.note || "بدون تعليق"}</p>
            <div class="text-end text-muted small">${rating.ratedAt || ""}</div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", card);
    });

  } catch (err) {
    console.error("❌ خطأ أثناء تحميل التقييمات:", err);
    container.innerHTML = `<div class="text-center text-danger">حدث خطأ أثناء تحميل التقييمات.</div>`;
  }
});
