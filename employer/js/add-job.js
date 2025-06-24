// ✅ إشعارات Toast
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

// ✅ تحميل أنواع الأعمال من API
async function loadRequestTypes() {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("error", "الرجاء تسجيل الدخول أولاً");
        return;
    }

    try {
        const response = await fetch("http://tjob.tryasp.net/api/Admin/RequestTypes", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const types = await response.json();
            const categorySelect = document.getElementById("category");
            categorySelect.innerHTML = '<option value="" disabled selected>اختر المجال</option>';

            types.forEach(type => {
                if (type.name?.trim()) {
                    const option = document.createElement("option");
                    option.value = type.id;
                    option.textContent = type.name;
                    categorySelect.appendChild(option);
                }
            });
        } else {
            showToast("error", "فشل في تحميل أنواع العمل");
        }
    } catch (error) {
        showToast("error", "خطأ في الاتصال بالسيرفر");
    }
}

// ✅ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadRequestTypes();

    const form = document.getElementById("postJobForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("error", "الرجاء تسجيل الدخول أولاً");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            if (role !== "Employer") {
                showToast("error", "هذا الحساب غير مصرح له بنشر وظائف");
                return;
            }
        } catch (err) {
            showToast("error", "تعذر التحقق من نوع المستخدم");
            return;
        }

        const formData = new FormData();
        formData.append("Title", document.getElementById("title").value.trim());
        formData.append("Description", document.getElementById("description").value.trim());
        formData.append("State", document.getElementById("state").value.trim());
        formData.append("City", document.getElementById("city").value.trim());
        formData.append("Street", document.getElementById("street").value.trim());
        formData.append("Home", document.getElementById("home").value.trim());

        const price = parseFloat(document.getElementById("payment").value);
        formData.append("Price", price.toString());

        const dateValue = document.getElementById("date").value;
        const dateTime = new Date(dateValue).toISOString();
        formData.append("DateTime", dateTime);

        const category = document.getElementById("category").value;
        if (!category) {
            showToast("error", "يرجى اختيار نوع العمل");
            return;
        }
        formData.append("RequestTypeId", category);

        const mainImgFile = document.getElementById("mainImg").files[0];
        if (mainImgFile) {
            formData.append("MainImg", mainImgFile);
        }

        try {
            const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                showToast("success", "تم نشر العمل بنجاح!");
                form.reset();
                setTimeout(() => {
                    window.location.href = "./employer-jobs.html";
                }, 2000);
            } else {
                showToast("error", "فشل في نشر العمل");
            }
        } catch (error) {
            showToast("error", "فشل الاتصال بالخادم");
        }
    });
});
 