document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("users-table-body");

  // دالة عرض التوست
  function showToast(icon, message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: message
    });
  }

  async function fetchUsers() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Admin/Users");
      if (!response.ok) throw new Error("فشل في جلب المستخدمين");

      const users = await response.json();
      tbody.innerHTML = "";

      users.forEach((user, index) => {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const role = user.roles?.[0] || "غير محدد";
        const isBanned = user.isBanned ?? false;
        const userId = user.id;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="text-black-50">${index + 1}</td>
          <td class="text-black-50">${fullName || "غير معروف"}</td>
          <td class="text-black-50">${user.email}</td>
          <td class="text-black-50">${role}</td>
          <td>
            <span class="badge ${isBanned ? "bg-danger" : "bg-success"}">
              ${isBanned ? "محظور" : "نشط"}
            </span>
          </td>
          <td>
            <button class="btn btn-sm ${isBanned ? "btn-success" : "btn-danger"} toggle-lock-btn" data-id="${userId}">
              ${isBanned ? "إلغاء الحظر" : "حظر"}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.querySelectorAll(".toggle-lock-btn").forEach(button => {
        button.addEventListener("click", async () => {
          const userId = button.getAttribute("data-id");
          if (!userId) {
            showToast("error", "لا يوجد معرف للمستخدم");
            return;
          }

          try {
            const res = await fetch(`http://tjob.tryasp.net/api/Admin/Users/LockUnLock/${userId}`, {
              method: "PATCH"
            });

            if (res.ok) {
              showToast("success", "تم تنفيذ العملية بنجاح");
              fetchUsers();
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
