document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب البيانات");

    const data = await res.json();
    const user = data.userResponse;
    const interests = data.userInterestsResponse;

    document.getElementById("Name").value = `${user.firstName || ""} ${user.lastName || ""}`;
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phoneNumber || "";
    document.getElementById("location").value = `${user.city || ""} ${user.street || ""}`;
    document.getElementById("description").value = interests?.description || "";
    document.getElementById("jobsCount").textContent = `${data.postedJobsCount || 0} وظيفة`;
    document.querySelector(".card-text.fs-4.fw-bold").textContent = `${data.avgRating || 0} / 5`;

    if (user.img) {
      document.getElementById("companyImagePreview").src = user.img;
    }

    document.querySelectorAll("input, textarea").forEach(el => el.setAttribute("disabled", true));
  } catch (err) {
    console.error("❌ خطأ أثناء تحميل البيانات:", err);
    Swal.fire({
      icon: "error",
      title: "فشل التحميل",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  }
});

document.getElementById("editBtn").addEventListener("click", () => {
  document.querySelectorAll("input, textarea").forEach(el => el.removeAttribute("disabled"));
  document.getElementById("editBtn").classList.add("d-none");
  document.getElementById("saveBtn").classList.remove("d-none");
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return;

  const nameParts = document.getElementById("Name").value.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const locationParts = document.getElementById("location").value.trim().split(" ");
  const city = locationParts[0] || "";
  const street = locationParts.slice(1).join(" ") || "";

  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!firstName || !lastName || !email || !phone || !description) {
    Swal.fire({
      icon: "warning",
      title: "تنبيه",
      text: "يرجى تعبئة جميع الحقول قبل الحفظ",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
    return;
  }

  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Email", email);
  formData.append("PhoneNumber", phone);
  formData.append("State", "");
  formData.append("City", city);
  formData.append("Street", street);
  formData.append("SSN", "");
  formData.append("Description", description);

  const imgFile = document.getElementById("profileImageInput")?.files[0];
  const cvFile = document.getElementById("cvInput")?.files[0];

  if (imgFile) formData.append("Img", imgFile);
  if (cvFile) formData.append("CV", cvFile);

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Users", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
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
    console.error("❌ خطأ أثناء الحفظ:", err);
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
