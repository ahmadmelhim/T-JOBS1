const userType = localStorage.getItem("userType");
const userRole = localStorage.getItem("userRole") || "المستخدم";
const userName = localStorage.getItem("userName") || "المستخدم";

let dashboardLink = "#";
if (userType === "superadmin") {
  dashboardLink = "/admin/dashboard.html";
} else if (userType === "employer") {
  dashboardLink = "/employer/dashboard-employer.html";
} else if (userType === "worker") {
  dashboardLink = "/worker/worker-dashboard.html";
}

let navbarHTML = `
  <div class="container-fluid px-4 py-2 d-flex justify-content-between align-items-center">
    <a class="navbar-brand d-flex align-items-center gap-2" href="/index.html">
      <img src="./assert/image/logo.png" alt="شعار الموقع" height="40" />
    </a>

    ${userType === null
      ? `
      <div class="d-flex gap-3">
        <a class="btn btn-light btn-sm" href="/login.html">تسجيل دخول</a>
        <a class="btn btn-success btn-sm" href="/register.html">إنشاء حساب</a>
      </div>
      `
      : `
      <div class="d-flex align-items-center gap-3">
        <a class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" href="/index.html">
          <i class="fas fa-home"></i> الصفحة الرئيسية
        </a>
        <a class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" href="/jobs.html">
          <i class="fas fa-briefcase"></i> الوظائف
        </a>
        <div class="dropdown">
          <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user-circle fs-4"></i>
            <span class="fw-bold">${userName}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end text-end">
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="${dashboardLink}">
                <i class="fas fa-th-large text-secondary"></i> لوحة التحكم
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item text-danger d-flex align-items-center gap-2" href="#" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
              </a>
            </li>
          </ul>
        </div>
      </div>
      `}
  </div>
`;

document.getElementById("navbar").innerHTML = navbarHTML;

async function logout() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://tjob.tryasp.net/api/Accounts/Logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });

      Toast.fire({
        icon: 'success',
        title: 'تم تسجيل الخروج بنجاح'
      });

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login.html";
      }, 2000);
    } else {
      Swal.fire({
        icon: "error",
        title: "فشل تسجيل الخروج",
        text: await response.text()
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "خطأ في الاتصال",
      text: "حدث خطأ أثناء محاولة تسجيل الخروج"
    });
  }
}
