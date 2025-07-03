document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

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
    const res = await fetch("http://tjob.tryasp.net/api/Worker/Requests/sent-requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("فشل في جلب الطلبات");

    const data = await res.json();
    const listContainer = document.querySelector(".list-group");
    listContainer.innerHTML = "";

    if (!data || data.length === 0) {
      listContainer.innerHTML = `<li class="list-group-item text-center text-muted">لا يوجد طلبات حالياً</li>`;
      return;
    }

    data.forEach(request => {
      const status = getStatusBadge(request.status);
      const item = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>مسمى الوظيفة:</strong> ${request.title || "غير محدد"}<br/>
            <small>التاريخ: ${request.date?.split("T")[0] || "غير متوفر"}</small>
          </div>
          <span class="badge ${status.class} rounded-pill">${status.label}</span>
        </li>
      `;
      listContainer.innerHTML += item;
    });

  } catch (error) {
    console.error("خطأ أثناء جلب الطلبات:", error);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "حدث خطأ أثناء تحميل الطلبات",
    });
  }
});

function getStatusBadge(status) {
  switch (status) {
    case "Pending":
    case "قيد المراجعة":
      return { label: "قيد المراجعة", class: "bg-warning text-dark" };
    case "Accepted":
    case "مقبول":
      return { label: "مقبول", class: "bg-success" };
    case "Rejected":
    case "مرفوض":
      return { label: "مرفوض", class: "bg-danger" };
    default:
      return { label: " منتهية", class: "bg-secondary" };
  }
}
