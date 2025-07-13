document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");
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

    document.getElementById("workerName").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("workerEmail").textContent = user.email;
    document.getElementById("workerPhone").textContent = user.phoneNumber;
    document.getElementById("workerBio").textContent = user.brief?.description || "لا يوجد نبذة";
    document.getElementById("workerLocation").textContent = `${user.city}, ${user.state}, ${user.street}`;
    document.getElementById("workerRate").textContent = user.avgRate || "--";

    const skillList = document.getElementById("workerSkills");
    skillList.innerHTML = "";
    user.skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill.name;
      skillList.appendChild(li);
    });

  } catch (error) {
    console.error("فشل في تحميل بيانات العامل:", error);
    alert("حدث خطأ أثناء تحميل بيانات العامل.");
  }
});
