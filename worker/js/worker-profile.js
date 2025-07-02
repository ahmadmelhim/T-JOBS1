
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
   document.getElementById('countJob').textContent = data.postedJobsCount || 0;
document.getElementById('rating').textContent = data.avgRating || 0;


    const user = data.userResponse;
    const skillsData = data.userSkillsResponse;
    console.log(user)
    document.getElementById("Name").value = `${user.firstName || ""} ${user.lastName || ""}`;
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phoneNumber || "";
    document.getElementById("location").value = `${user.city || ""} - ${user.street || ""}`;
    document.getElementById("skills").value = (skillsData.skills || []).join(", ");
    document.getElementById("description").value = skillsData.description || "";
    const profileImge = document.getElementById('companyImagePreview');

    profileImge.src = user.img
    // عرض الصورة الشخصية من الـ API
    if (user.profileImageUrl) {
      document.getElementById("companyImagePreview").src = user.profileImageUrl;
    }

    // ✅ عرض رابط تحميل CV إن وُجد
if (user.file && user.file.startsWith("http")) {
  const cvContainer = document.getElementById("cvDownloadContainer");
  const cvLink = document.getElementById("cvDownloadLink");
  cvLink.href = user.file;
  cvLink.setAttribute("target", "_blank");
  cvContainer.style.display = "block";
}
  } catch (err) {
    console.error("خطأ:", err);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "حدث خطأ أثناء تحميل البيانات",
    });
  }
});

document.getElementById("editBtn").addEventListener("click", () => {
  document.querySelectorAll("#profileForm input, #profileForm textarea").forEach(el => {
    el.disabled = false;
  });

  document.getElementById("editBtn").classList.add("d-none");
  document.getElementById("saveBtn").classList.remove("d-none");
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const fullName = document.getElementById("Name").value.trim();
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phone").value;
  const location = document.getElementById("location").value.trim();
  const skills = document.getElementById("skills").value.split(",").map(s => s.trim());
  const description = document.getElementById("description").value;
  const profileImage = document.getElementById("profileImageInput").files[0];
  const cvFile = document.getElementById("cvInput").files[0];



  const [firstName = "", lastName = ""] = fullName.split(" ");
  const [city = "", street = ""] = location.split(" - ");

  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Email", email);
  formData.append("PhoneNumber", phoneNumber);
  formData.append("State", "الضفة الغربية");
  formData.append("City", city);
  formData.append("Street", street);
  formData.append("SSN", "000000000");
  skills.forEach(skill => formData.append("SkillsOrInterests", skill));
  formData.append("Description", description);
  formData.append("Img", profileImage || new File([""], "empty.jpg"));
  formData.append("CV", cvFile || new File([""], "empty.pdf"));
  console.log(profileImage)
  try {
    const res = await fetch("http://tjob.tryasp.net/api/Worker/Users", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
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

    document.querySelectorAll("#profileForm input, #profileForm textarea").forEach(el => {
      el.disabled = true;
    });
    document.getElementById("editBtn").classList.remove("d-none");
    document.getElementById("saveBtn").classList.add("d-none");

  } catch (error) {
    console.error("خطأ أثناء التعديل:", error);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "فشل في حفظ البيانات",
    });
  }
});

// عرض الصورة المختارة مباشرة
document.getElementById("profileImageInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("companyImagePreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});
