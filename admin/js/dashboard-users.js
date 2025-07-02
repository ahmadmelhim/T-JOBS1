document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("users-table-body");
  const token = localStorage.getItem("token");

  function showToast(icon, message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon,
      title: message
    });
  }

  async function fetchUsers() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Admin/Users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("فشل في جلب المستخدمين");

      const users = await response.json();
      tbody.innerHTML = "";

      users.forEach((user, index) => {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const role = user.roles?.[0] || "غير محدد";
        const isBlocked = user.isBlocked ?? false; // ✅ بدل isBanned

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="text-black-50">${index + 1}</td>
          <td class="text-black-50">${fullName || "غير معروف"}</td>
          <td class="text-black-50">${user.email}</td>
          <td class="text-black-50">${role}</td>
          <td>
            <span class="badge ${isBlocked ? "bg-danger" : "bg-success"} status-badge">
              ${isBlocked ? "محظور" : "نشط"}
            </span>
          </td>
          <td>
            <button class="btn btn-sm ${isBlocked ? "btn-success" : "btn-danger"} toggle-lock-btn" data-id="${user.id}" data-role="${role}">
              ${isBlocked ? "إلغاء الحظر" : "حظر"}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      addToggleLockEvent();
    } catch (err) {
      console.error(err);
      showToast("error", "حدث خطأ أثناء تحميل المستخدمين");
    }
  }

  function addToggleLockEvent() {
    document.querySelectorAll(".toggle-lock-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const userId = button.getAttribute("data-id");
        const role = button.getAttribute("data-role");

        if (role === "Admin" || role === "Super Admin") {
          showToast("warning", "لا يمكن حظر هذا المستخدم");
          return;
        }

        const confirmResult = await Swal.fire({
          title: "هل أنت متأكد؟",
          text: "سيتم تغيير حالة المستخدم",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "نعم",
          cancelButtonText: "إلغاء"
        });

        if (!confirmResult.isConfirmed) return;

        try {
          const res = await fetch(`http://tjob.tryasp.net/api/Admin/Users/LockUnLock/${userId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            showToast("success", "تم تنفيذ العملية بنجاح");
            await fetchUsers(); // ✅ إعادة التحميل لعرض الحالة الجديدة
          } else {
            showToast("error", "فشل تنفيذ الإجراء");
          }
        } catch (err) {
          console.error(err);
          showToast("error", "حدث خطأ في الاتصال بالخادم");
        }
      });
    });
  }

  fetchUsers();
});
