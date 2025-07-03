document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebarMenu");
  const body = document.getElementById("Body");

  // تأكد أن العناصر موجودة
  if (toggleBtn && sidebar && body) {
    // زر التبديل لإظهار/إخفاء القائمة الجانبية
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("d-none");
    });

    // دالة لضبط الحالة بناءً على حجم الشاشة
    function handleResize() {
      if (window.innerWidth >= 768) {
        sidebar.classList.remove("d-none");
        body.style.marginRight = "260px";
      } else {
        sidebar.classList.add("d-none");
        body.style.marginRight = "0";
      }
    }

    // تنفيذ الدالة مرة واحدة أولاً
    handleResize();

    // تحديث عند تغيير حجم الشاشة
    window.addEventListener("resize", handleResize);
  }
});
