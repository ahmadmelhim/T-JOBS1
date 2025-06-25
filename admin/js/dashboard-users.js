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
        const isBanned = user.isBanned ?? false;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="text-black-50">${index + 1}</td>
          <td class="text-black-50">${fullName || "غير معروف"}</td>
          <td class="text-black-50">${user.email}</td>
          <td class="text-black-50">${role}</td>
          <td>
            <span class="badge ${isBanned ? "bg-danger" : "bg-success"} status-badge">
              ${isBanned ? "محظور" : "نشط"}
            </span>
          </td>
          <td>
            <button class="btn btn-sm ${isBanned ? "btn-success" : "btn-danger"} toggle-lock-btn" data-id="${user.id}" data-role="${role}">
              ${isBanned ? "إلغاء الحظر" : "حظر"}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

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

              // تحديث الحالة في نفس الصف مباشرةً
              const row = button.closest("tr");
              const badge = row.querySelector(".status-badge");
              const wasBanned = badge.classList.contains("bg-danger");

              // تحديث الشارة
              badge.classList.remove("bg-danger", "bg-success");
              badge.classList.add(wasBanned ? "bg-success" : "bg-danger");
              badge.textContent = wasBanned ? "نشط" : "محظور";

              // تحديث الزر
              button.classList.remove("btn-danger", "btn-success");
              button.classList.add(wasBanned ? "btn-danger" : "btn-success");
              button.textContent = wasBanned ? "حظر" : "إلغاء الحظر";
            } else {
              showToast("error", "فشل تنفيذ الإجراء");
            }
          } catch (err) {
            console.error(err);
            showToast("error", "حدث خطأ في الاتصال بالخادم");
          }
        });
      });

    } catch (err) {
      console.error(err);
      showToast("error", "حدث خطأ أثناء تحميل المستخدمين");
    }
  }

  fetchUsers();
});
