document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "تنبيه",
      text: "يجب تسجيل الدخول أولاً",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
    });
    return;
  }

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Worker/Users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("فشل في جلب البيانات");
    const data = await res.json();

    const user = data.userResponse;
    const skillsData = data.userSkillsResponse;

    document.getElementById("Name").value = `${user.firstName || ""} ${user.lastName || ""}`;
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phoneNumber || "";
    document.getElementById("location").value = `${user.city || ""} - ${user.street || ""}`;
    document.getElementById("skills").value = (skillsData.skills || []).join(", ");
    document.getElementById("description").value = skillsData.description || "";

  } catch (err) {
    console.error("خطأ:", err);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "حدث خطأ أثناء تحميل البيانات",
    });
  }
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const fullName = document.getElementById("Name").value.trim();
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phone").value;
  const location = document.getElementById("location").value.trim();
  const skills = document.getElementById("skills").value.split(",").map(s => s.trim());
  const description = document.getElementById("description").value;

  const [firstName = "", lastName = ""] = fullName.split(" ");
  const [city = "", street = ""] = location.split(" - ");

  const body = {
    firstName,
    lastName,
    email,
    phoneNumber,
    state: "الضفة الغربية",
    city,
    street,
    ssn: "000000000",
    skillsOrInterests: skills,
    description
  };

  try {
    const res = await fetch("http://tjob.tryasp.net/api/Worker/Users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("فشل في تعديل البيانات");

    Swal.fire({
      icon: "success",
      title: "تم الحفظ",
      text: "تم تعديل البيانات بنجاح",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
    });

  } catch (error) {
    console.error("خطأ أثناء التعديل:", error);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "فشل في حفظ البيانات",
    });
  }
});
