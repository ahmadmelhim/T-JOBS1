document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const listGroup = document.querySelector(".list-group");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "تنبيه",
      text: "يجب تسجيل الدخول أولاً",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
    });
    return;
  }

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Notifications", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب الإشعارات");

    const notifications = await res.json();
    listGroup.innerHTML = "";

    if (!notifications || notifications.length === 0) {
      listGroup.innerHTML = `<li class="list-group-item text-center text-muted">لا توجد إشعارات</li>`;
      return;
    }

    notifications.forEach(n => {
      const isRead = n.isRead;
      const iconClass = isRead ? "fa-check text-success" : "fa-bell text-warning";
      const badgeClass = isRead ? "bg-success" : "bg-danger";
      const badgeText = isRead ? "مقروء" : "غير مقروء";

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span class="text-black">
          <i class="fa-solid ${iconClass} me-2"></i> ${n.message}
        </span>
        <span class="badge ${badgeClass} rounded-pill">${badgeText}</span>
      `;

      // عند الضغط على إشعار غير مقروء: يتم تعليمه كمقروء
      if (!isRead) {
        li.style.cursor = "pointer";
        li.addEventListener("click", async () => {
          await fetch(`http://tjob.tryasp.net/api/Notifications/MarkAsRead/${n.id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          li.querySelector("i").className = "fa-solid fa-check text-success me-2";
          li.querySelector(".badge").className = "badge bg-success rounded-pill";
          li.querySelector(".badge").textContent = "مقروء";
        });
      }

      listGroup.appendChild(li);
    });

  } catch (err) {
    console.error("خطأ:", err);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "فشل في تحميل الإشعارات",
    });
  }
});
