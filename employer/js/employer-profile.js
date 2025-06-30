document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // بيانات الملف الشخصي
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب البيانات");

    const data = await res.json();

    document.getElementById("Name").value = `${data.firstName || ""} ${data.lastName || ""}`;
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phoneNumber || "";
    document.getElementById("location").value = `${data.city || ""} ${data.street || ""}`;
    document.getElementById("description").value = data.description || "";

    const interests = data.skillsOrInterests || [];
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = interests.includes(cb.value);
    });

    // تعطيل الحقول
    document.querySelectorAll("input, textarea").forEach(el => el.setAttribute("disabled", true));

  } catch (err) {
    console.error("حدث خطأ أثناء تحميل البيانات:", err);
    Swal.fire({
      icon: "error",
      title: "فشل التحميل",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  }

  // جلب عدد الوظائف المنشورة
  try {
    const jobRes = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!jobRes.ok) throw new Error("فشل تحميل الوظائف");

    const jobs = await jobRes.json();
    const count = Array.isArray(jobs) ? jobs.length : 0;
    document.getElementById("jobsCount").textContent = `${count} وظيفة`;
  } catch (err) {
    console.error("خطأ في تحميل الوظائف:", err);
    document.getElementById("jobsCount").textContent = "0 وظيفة";
  }
});

// تفعيل التعديل
document.getElementById("editBtn").addEventListener("click", () => {
  document.querySelectorAll("input, textarea").forEach(el => el.removeAttribute("disabled"));
  document.getElementById("editBtn").classList.add("d-none");
  document.getElementById("saveBtn").classList.remove("d-none");
});

// الحفظ
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return;

  const nameParts = document.getElementById("Name").value.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const locationParts = document.getElementById("location").value.trim().split(" ");
  const city = locationParts[0] || null;
  const street = locationParts.slice(1).join(" ") || null;

  const body = {
    firstName,
    lastName,
    email: document.getElementById("email").value.trim(),
    phoneNumber: document.getElementById("phone").value.trim(),
    state: null,
    city,
    street,
    ssn: null,
    skillsOrInterests: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
    description: document.getElementById("description").value.trim()
  };

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error();

    Swal.fire({
      icon: "success",
      title: "تم الحفظ",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });

    document.querySelectorAll("input, textarea").forEach(el => el.setAttribute("disabled", true));
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("saveBtn").classList.add("d-none");

  } catch (err) {
    console.error("خطأ أثناء الحفظ:", err);
    Swal.fire({
      icon: "error",
      title: "فشل الحفظ",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  }
});
