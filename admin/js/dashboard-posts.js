document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("table tbody");

  try {
    // ⿡ جلب المستخدمين
    const usersRes = await fetch("http://tjob.tryasp.net/api/Admin/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const users = await usersRes.json();

    // إنشاء map باستخدام applicationUserId
    const userMap = {};
    users.forEach(user => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      userMap[user.id] = fullName || "غير معروف";
    });

    // ⿢ جلب المنشورات
    const res = await fetch("http://tjob.tryasp.net/api/Admin/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في تحميل المنشورات");

    const posts = await res.json();
    tbody.innerHTML = "";

    posts.forEach((post, index) => {
      const userId = post.applicationUserId;
      const userName = userMap[userId] || "غير معروف";

      //  تحديد حالة المنشور بناءً على requestStatus
      let statusText = "غير محددة";
      let badgeClass = "bg-warning";
      if (post.requestStatus === 1) {
        statusText = "متاحة";
        badgeClass = "bg-success";
      } else if (post.requestStatus === 4) {
        statusText = "منتهية";
        badgeClass = "bg-secondary";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-black-50">${index + 1}</td>
        <td class="text-black-50">${userName}</td>
        <td class="text-black-50">${post.title}</td>
        <td class="text-black-50">${post.requestTypeName || "---"}</td>
        <td class="text-black-50">${post.publishDateTime?.split("T")[0]}</td>
        <td>
          <span class="badge ${badgeClass}">
            ${statusText}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary view-btn" data-id="${post.id}">
            <i class="fas fa-eye me-1"></i>عرض
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">
            <i class="fas fa-trash-alt me-1"></i>حذف
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    //  زر عرض التفاصيل
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        window.location.href = `../worker/worker-job-details.html?id=${id}`;
      });
    });

    //  زر الحذف
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        Swal.fire({
          title: "هل أنت متأكد؟",
          text: "لن تتمكن من استرجاع المنشور بعد حذفه!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "نعم، احذفه!",
          cancelButtonText: "إلغاء",
          reverseButtons: true
        }).then(async (result) => {
          if (!result.isConfirmed) return;

          try {
            const res = await fetch(`http://tjob.tryasp.net/api/Admin/Requests/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              btn.closest("tr").remove();
              Swal.fire({
                icon: "success",
                title: "تم الحذف",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "فشل في حذف المنشور",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
              });
            }
          } catch {
            Swal.fire({
              icon: "error",
              title: "فشل الاتصال بالخادم",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }
        });
      });
    });


  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-danger">فشل في تحميل البيانات</td></tr>';
    Swal.fire({
      icon: "error",
      title: "خطأ في تحميل البيانات",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
});
