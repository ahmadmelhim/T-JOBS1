document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailOrUserName = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://tjob.tryasp.net/api/Accounts/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emailOrUserName,
        password,
        rememberMe: true
      })
    });

    let redirectPage = "index.html";
    let userRole = "";

    if (response.ok) {
      showToast("success", "تم تسجيل الدخول بنجاح");

      const data = await response.json();
      console.log("API Response Data:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);

        try {
          const base64Url = data.token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const decodedToken = JSON.parse(jsonPayload);

          userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          console.log("User Role:", userRole);

          // حفظ نوع المستخدم والدور في localStorage
          localStorage.setItem("userType", userRole.toLowerCase());
          localStorage.setItem("userRole", userRole);

          // استخراج اسم المستخدم من التوكن (unique_name أو name)
          const userNameFromToken =
            decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || // أحيانًا الاسم هنا
            decodedToken["name"]  // أو هنا
            ;
          localStorage.setItem("userName", userNameFromToken);

        } catch (jwtError) {
          console.error("Error decoding JWT:", jwtError);
        }
      }

      // توجيه حسب الدور
      if (userRole === "Worker") {
        redirectPage = "index.html";
      } else if (userRole === "Employer") {
        redirectPage = "index.html";
      } else if (userRole === "SuperAdmin") {
        redirectPage = "index.html";
      }

      setTimeout(() => {
        window.location.href = redirectPage;
      }, 1500);

    } else {
      const result = await response.json();
      if (Array.isArray(result)) {
        result.forEach(err => {
          showToast("error", err.description || "خطأ في البيانات");
        });
      } else if (result.message) {
        showToast("error", result.message);
      } else {
        showToast("error", "فشل تسجيل الدخول. تأكد من صحة البريد وكلمة المرور.");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("error", "فشل الاتصال بالخادم.");
  }
});

function showToast(icon, title) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  return Toast.fire({ icon, title });
}
