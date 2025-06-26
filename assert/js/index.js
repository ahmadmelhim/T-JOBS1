// 🔒 إخفاء أزرار التسجيل إذا كان المستخدم مسجل دخول
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    const registerNowBtn = document.getElementById("registerNowBtn");
    const registerFreeBtn = document.getElementById("registerFreeBtn");

    if (registerNowBtn) registerNowBtn.style.display = "none";
    if (registerFreeBtn) registerFreeBtn.style.display = "none";
  }
});

// 🔍 البحث عن وظائف
document.getElementById("searchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return Swal.fire("أدخل كلمة للبحث");

  try {
    const response = await fetch(`http://tjob.tryasp.net/api/Home/Search?search=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error("فشل في جلب البيانات");

    const results = await response.json();
    console.log("نتائج البحث:", results);

    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    if (Array.isArray(results) && results.length > 0) {
      results.forEach(job => {
        let imgSrc = "https://placehold.co/400x250";

        if (job.mainImg) {
          if (job.mainImg.startsWith("http")) {
            imgSrc = job.mainImg;
          } else {
            const filename = job.mainImg.split("\\").pop().split("/").pop();
            imgSrc = `http://tjob.tryasp.net/images/${filename}`;
          }
        }

        const card = `
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card shadow-sm border-0 h-100 text-center" style="height: 100%; min-height: 420px;">
              <img src="${imgSrc}" class="card-img-top img-fluid" alt="${job.title}" style="height: 200px; object-fit: cover; object-position: center;">
              <div class="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 class="card-title fw-bold">${job.title}</h5>
                  <p class="card-text text-muted">${job.description || ""}</p>
                  <p class="card-text text-muted">السعر: ${job.price} شيكل</p>
                  <p class="card-text"><i class="fas fa-map-marker-alt"></i> ${job.city || ""} - ${job.street || ""}</p>
                  <p class="card-text"><i class="fas fa-calendar-alt"></i> ${job.dateTime?.split("T")[0] || ""}</p>
                </div>
                <a href="./worker/worker-job-details.html?id=${job.id}" class="btn btn-sm bg-blueColor mt-3">عرض التفاصيل</a>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += card;
      });
    } else {
      container.innerHTML = `<div class="text-center text-muted">لا توجد نتائج مطابقة</div>`;
    }

  } catch (err) {
    console.error("حدث خطأ:", err);
    Swal.fire("فشل في تنفيذ البحث");
  }
});

// 📦 تحميل أحدث الأعمال عند فتح الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("recentRequestsContainer");
  try {
    const res = await fetch("http://tjob.tryasp.net/api/Home/RecentRequests");
    if (!res.ok) throw new Error("فشل في تحميل الأعمال الحديثة");

    const jobs = await res.json();
    container.innerHTML = "";

    jobs.forEach(job => {
      let imgSrc = "https://placehold.co/400x250";

      if (job.mainImg) {
        if (job.mainImg.startsWith("http")) {
          imgSrc = job.mainImg;
        } else {
          const filename = job.mainImg.split("\\").pop().split("/").pop();
          imgSrc = `http://tjob.tryasp.net/images/${filename}`;
        }
      }

      const card = `
        <div class="col-12 col-sm-6 col-md-4">
          <div class="card shadow-sm border-0 h-100 text-center" style="height: 100%; min-height: 420px;">
            <img src="${imgSrc}" class="card-img-top img-fluid" alt="${job.title}" style="height: 200px; object-fit: cover; object-position: center;">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title fw-bold">${job.title}</h5>
                <p class="card-text text-muted">${job.description || ""}</p>
                <p class="card-text text-muted">السعر: ${job.price} شيكل</p>
                <p class="card-text"><i class="fas fa-map-marker-alt"></i> ${job.city || ""} - ${job.street || ""}</p>
                <p class="card-text"><i class="fas fa-calendar-alt"></i> ${job.dateTime?.split("T")[0] || ""}</p>
              </div>
              <a href="./worker/worker-job-details.html?id=${job.id}" class="btn btn-sm bg-blueColor mt-3">عرض التفاصيل</a>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });

  } catch (err) {
    console.error("خطأ في تحميل الأعمال:", err);
    container.innerHTML = `<div class="text-center text-muted">حدث خطأ أثناء التحميل</div>`;
  }
});
