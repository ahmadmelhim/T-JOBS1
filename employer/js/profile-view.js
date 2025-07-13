document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id"); // ← نأخذ id وليس userId
  const token = localStorage.getItem("token");

  if (!userId) {
    alert("لم يتم تحديد المستخدم.");
    return;
  }

  try {
    const response = await fetch(`http://tjob.tryasp.net/api/Users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("فشل في التحميل");

    const user = await response.json();

    // الاسم
    document.getElementById("workerName").textContent = `${user.firstName} ${user.lastName}`;
    // الإيميل
    document.getElementById("workerEmail").textContent = user.email;
    // رقم الهاتف
    document.getElementById("workerPhone").textContent = user.phoneNumber;
    // نبذة
    document.getElementById("workerBio").textContent = user.brief?.description || "لا يوجد نبذة";
    // صورة الملف الشخصي
    document.getElementById("profileImage").src = user.img || "../assert/image/user-default.png";
    // المدينة والولاية والشارع
    document.getElementById("workerLocation").textContent = `${user.city}, ${user.state}, ${user.street}`;
    // الجنس
    document.getElementById("workerGender").textContent = user.gender === 0 ? "ذكر" : "أنثى";
    // تاريخ الميلاد
    document.getElementById("workerBirth").textContent = user.birthOfDate !== "0001-01-01" ? user.birthOfDate : "غير متوفر";
    // رقم الهوية
    document.getElementById("workerSSN").textContent = user.ssn;
    // التقييم
    document.getElementById("workerRate").textContent = user.avgRate || "--";
    // المهارات
    const skillList = document.getElementById("workerSkills");
    skillList.innerHTML = "";
    user.skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill.name;
      skillList.appendChild(li);
    });

    // السيرة الذاتية
    if (user.file) {
      const cvLink = document.getElementById("workerCv");
      cvLink.href = user.file;
      cvLink.classList.remove("d-none");
    }

  } catch (error) {
    console.error("فشل في تحميل بيانات العامل:", error);
    alert("حدث خطأ أثناء تحميل بيانات العامل.");
  }
});
