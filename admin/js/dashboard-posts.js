document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("table tbody");

  try {
    // 1️⃣ جلب المستخدمين
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

    // 2️⃣ جلب المنشورات
    const res = await fetch("http://tjob.tryasp.net/api/Admin/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في تحميل المنشورات");

    const posts = await res.json();
    tbody.innerHTML = "";

    posts.forEach((post, index) => {
      const userId = post.applicationUserId;
      const userName = userMap[userId] || "غير معروف";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-black-50">${index + 1}</td>
        <td class="text-black-50">${userName}</td>
        <td class="text-black-50">${post.title}</td>
        <td class="text-black-50">${post.requestTypeName || "---"}</td>
        <td class="text-black-50">${post.publishDateTime?.split("T")[0]}</td>
        <td>
          <span class="badge ${post.isActive ? 'bg-success' : 'bg-danger'}">
            ${post.isActive ? 'نشط' : 'معطل'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary view-btn" data-id="${post.id}">
            <i class="fas fa-eye me-1"></i>عرض
          </button>
          <button class="btn btn-sm ${post.isActive ? 'btn-warning' : 'btn-success'} toggle-btn" data-id="${post.id}">
            <i class="fas ${post.isActive ? 'fa-ban' : 'fa-check'} me-1"></i>${post.isActive ? 'تعطيل' : 'تفعيل'}
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">
            <i class="fas fa-trash-alt me-1"></i>حذف
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // 🔘 زر عرض التفاصيل
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        window.location.href = `../worker/worker-job-details.html?id=${id}`;
      });
    });

    // 🔘 زر تفعيل / تعطيل
    document.querySelectorAll(".toggle-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const badge = btn.closest("tr").querySelector("td span.badge");

        try {
          const res = await fetch(`http://tjob.tryasp.net/api/Admin/Requests/DeAcceptRequest/${id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            const isNowActive = badge.classList.contains("bg-danger");
            badge.classList.remove("bg-danger", "bg-success");
            badge.classList.add(isNowActive ? "bg-success" : "bg-danger");
            badge.textContent = isNowActive ? "نشط" : "معطل";

            btn.classList.remove("btn-success", "btn-warning");
            btn.classList.add(isNowActive ? "btn-warning" : "btn-success");
            btn.innerHTML = `
              <i class="fas ${isNowActive ? 'fa-ban' : 'fa-check'} me-1"></i>
              ${isNowActive ? 'تعطيل' : 'تفعيل'}
            `;
          } else {
            alert("فشل في تحديث حالة المنشور");
          }
        } catch (err) {
          alert("فشل الاتصال بالخادم");
        }
      });
    });

    // 🔘 زر الحذف
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("هل أنت متأكد من حذف المنشور؟")) return;

        try {
          const res = await fetch(`http://tjob.tryasp.net/api/Admin/Requests/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            btn.closest("tr").remove();
          } else {
            alert("فشل في حذف المنشور");
          }
        } catch {
          alert("فشل الاتصال بالخادم");
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-danger">فشل في تحميل البيانات</td></tr>';
  }
});
