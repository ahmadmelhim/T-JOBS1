document.addEventListener("DOMContentLoaded", () => {
  const jobsTableBody = document.getElementById("jobsTableBody");
  const editForm = document.getElementById("editJobForm");
  const editModal = new bootstrap.Modal(document.getElementById("editJobModal"));

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  function translateStatus(status) {
    switch (status) {
      case 0: return { text: "متاحة", class: "bg-primary" };
      case 1: return { text: "مقبولة", class: "bg-success" };
      case 2: return { text: "مرفوضة", class: "bg-danger" };
      case 3: return { text: "مكتملة", class: "bg-secondary" };
      default: return { text: "غير معروفة", class: "bg-dark" };
    }
  }

  async function loadEmployerJobs() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("فشل في تحميل الوظائف");

      const jobs = await response.json();
      jobsTableBody.innerHTML = "";

      if (jobs.length === 0) {
        jobsTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">لا توجد وظائف منشورة</td></tr>`;
        return;
      }

      jobs.forEach((job, index) => {
        const status = translateStatus(job.requestStatus);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="text-black-50">${index + 1}</td>
          <td class="text-black-50">${job.title}</td>
          <td class="text-black-50">${job.requestTypeName || "غير محدد"}</td>
          <td class="text-black-50">${formatDate(job.dateTime)}</td>
          <td class="text-black-50">${job.city}</td>
          <td>
            <span class="badge ${status.class}">${status.text}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editJob(${job.id})">تعديل</button>
            <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">حذف</button>
          </td>
        `;
        jobsTableBody.appendChild(row);
      });

    } catch (error) {
      console.error("خطأ في تحميل الوظائف:", error);
      jobsTableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">فشل في تحميل الوظائف</td></tr>`;
    }
  }

  window.editJob = async function (id) {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://tjob.tryasp.net/api/Requests/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return Swal.fire({ icon: "error", title: "فشل في جلب بيانات الوظيفة", toast: true, position: "top-end", timer: 3000, showConfirmButton: false });

    const job = await res.json();

    const typesRes = await fetch("http://tjob.tryasp.net/api/Admin/RequestTypes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (typesRes.ok) {
      const types = await typesRes.json();
      const select = document.getElementById("editRequestTypeId");
      select.innerHTML = `<option value="">اختر المجال</option>`;
      types.forEach(type => {
        const option = document.createElement("option");
        option.value = type.id;
        option.textContent = type.name;
        if (type.id === job.requestTypeId) option.selected = true;
        select.appendChild(option);
      });
    }

    editForm.setAttribute("data-id", id);
    document.getElementById("editTitle").value = job.title;
    document.getElementById("editPrice").value = job.price;
    document.getElementById("editDate").value = formatDate(job.dateTime);
    document.getElementById("editState").value = job.state;
    document.getElementById("editCity").value = job.city;
    document.getElementById("editStreet").value = job.street;
    document.getElementById("editHome").value = job.home;
    document.getElementById("editDescription").value = job.description;

    editModal.show();
  };

  window.deleteJob = function (id) {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://tjob.tryasp.net/api/Employer/Requests/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "تم الحذف بنجاح",
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false
          });
          loadEmployerJobs();
        } else {
          Swal.fire({
            icon: "error",
            title: "فشل في الحذف",
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false
          });
        }
      }
    });
  };

  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const jobId = this.getAttribute("data-id");

    const formData = new FormData();
    formData.append("Title", document.getElementById("editTitle").value);
    formData.append("Price", document.getElementById("editPrice").value);

    const rawDate = document.getElementById("editDate").value;
    const fullDate = `${rawDate}T00:00:00.000Z`;
    formData.append("DateTime", fullDate);

    formData.append("State", document.getElementById("editState").value);
    formData.append("City", document.getElementById("editCity").value);
    formData.append("Street", document.getElementById("editStreet").value);
    formData.append("Home", document.getElementById("editHome").value);
    formData.append("RequestTypeId", document.getElementById("editRequestTypeId").value);
    formData.append("Description", document.getElementById("editDescription").value);

    const file = document.getElementById("editMainImg").files[0];
    if (file) formData.append("MainImg", file);

    const res = await fetch(`http://tjob.tryasp.net/api/Employer/Requests/${jobId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "تم تعديل الوظيفة",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
      editModal.hide();
      loadEmployerJobs();
    } else {
      Swal.fire({
        icon: "error",
        title: "فشل في تعديل الوظيفة",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
    }
  });

  loadEmployerJobs();
});
