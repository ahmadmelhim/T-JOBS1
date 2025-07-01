document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Employer/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب البيانات");

    const data = await res.json();
    console.log("📦 بيانات المستخدم الراجعة من API:", data);

    const user = data.userResponse;
    const interests = data.userInterestsResponse;

    console.log("✅ userResponse:", user);
    console.log("✅ userInterestsResponse:", interests);

    if (
      (!user.firstName && !user.lastName && !user.email && !user.phoneNumber) &&
      (!interests || interests.skills.length === 0)
    ) {
      Swal.fire({
        icon: "info",
        title: "تنبيه",
        text: "البيانات المستلمة من الخادم فارغة.",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false
      });
    }

    document.getElementById("Name").value = `${user.firstName || ""} ${user.lastName || ""}`;
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phoneNumber || "";
    document.getElementById("location").value = `${user.city || ""} ${user.street || ""}`;
    document.getElementById("description").value = interests.description || "";

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = (interests.skills || []).includes(cb.value);
    });

    document.querySelectorAll("input, textarea").forEach(el => el.setAttribute("disabled", true));

    document.getElementById("jobsCount").textContent = `${data.postedJobsCount || 0} وظيفة`;
    document.querySelector(".card-text.fs-4.fw-bold").textContent = `${data.avgRating || 0} / 5`;

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

  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const description = document.getElementById("description").value.trim();
  const skills = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

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

  const body = {
    firstName,
    lastName,
    email,
    phoneNumber: phone,
    state: null,
    city,
    street,
    ssn: null,
    skillsOrInterests: skills,
    description
  };

  console.log("📤 إرسال البيانات المعدلة:", body);

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
