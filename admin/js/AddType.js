document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const jobForm = document.getElementById("jobForm");
  const jobTitleInput = document.getElementById("jobTitleInput");
  const jobsList = document.getElementById("jobsList");
  const submitJobButton = document.getElementById("submitJobButton");

  let editingJobId = null;

  const showToast = (icon, message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: message
    });
  };

  async function fetchJobs() {
    try {
      const response = await fetch("http://tjob.tryasp.net/api/Admin/RequestTypes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      jobsList.innerHTML = "";

      data.forEach(job => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";

        const jobTitleSpan = document.createElement("span");
        jobTitleSpan.textContent = job.name;
        listItem.appendChild(jobTitleSpan);

        const buttonGroup = document.createElement("div");

        const editButton = document.createElement("button");
        editButton.className = "btn btn-info btn-sm me-2";
        editButton.textContent = "تعديل";
        editButton.setAttribute("data-id", job.id);
        editButton.setAttribute("data-name", job.name);
        buttonGroup.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "حذف";
        deleteButton.setAttribute("data-id", job.id);
        buttonGroup.appendChild(deleteButton);

        listItem.appendChild(buttonGroup);
        jobsList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showToast("error", "حدث خطأ أثناء جلب الوظائف.");
    }
  }

  fetchJobs();

  jobForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const jobTitle = jobTitleInput.value.trim();

    if (!jobTitle) {
      showToast("warning", "الرجاء إدخال عنوان الوظيفة.");
      return;
    }

    let url = "http://tjob.tryasp.net/api/Admin/RequestTypes";
    let method = "POST";

    if (editingJobId) {
      url = `http://tjob.tryasp.net/api/Admin/RequestTypes/${editingJobId}`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: jobTitle })
      });

      if (response.ok) {
        showToast("success", editingJobId ? "تم تحديث الوظيفة!" : "تم إضافة الوظيفة!");
        jobTitleInput.value = "";
        editingJobId = null;
        submitJobButton.textContent = "إضافة وظيفة";
        fetchJobs();
      } else {
        const errorData = await response.json();
        showToast("error", `فشل ${editingJobId ? "تحديث" : "إضافة"} الوظيفة`);
        console.error("API Error:", errorData);
      }
    } catch (error) {
      showToast("error", "خطأ في الاتصال بالخادم.");
      console.error("Network Error:", error);
    }
  });

  jobsList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-danger")) {
      const jobId = event.target.getAttribute("data-id");

      const confirmResult = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تتمكن من التراجع بعد الحذف!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، احذفها",
        cancelButtonText: "إلغاء"
      });

      if (confirmResult.isConfirmed) {
        try {
          const response = await fetch(`http://tjob.tryasp.net/api/Admin/RequestTypes/${jobId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (response.ok) {
            showToast("success", "تم حذف الوظيفة!");
            fetchJobs();
          } else {
            const errorData = await response.json();
            showToast("error", "فشل حذف الوظيفة.");
            console.error("API Error:", errorData);
          }
        } catch (error) {
          showToast("error", "حدث خطأ في الاتصال بالخادم.");
          console.error("Network Error:", error);
        }
      }
    } else if (event.target.classList.contains("btn-info")) {
      editingJobId = event.target.getAttribute("data-id");
      const jobTitle = event.target.getAttribute("data-name");

      jobTitleInput.value = jobTitle;
      submitJobButton.textContent = "تحديث الوظيفة";
      jobTitleInput.focus();
    }
  });
});
