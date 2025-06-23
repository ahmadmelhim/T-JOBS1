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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("postJobForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("Title", document.getElementById("title").value.trim());
        formData.append("Description", document.getElementById("description").value.trim());
        formData.append("State", document.getElementById("state").value.trim());
        formData.append("City", document.getElementById("city").value.trim());
        formData.append("Street", document.getElementById("street").value.trim());
        formData.append("Home", document.getElementById("home").value.trim());
        formData.append("Type", document.getElementById("category").value);

        const price = parseFloat(document.getElementById("payment").value);
        formData.append("Price", price.toString());

        const dateValue = document.getElementById("date").value;
        const dateTime = new Date(dateValue).toISOString();
        formData.append("DateTime", dateTime);

        formData.append("RequestTypeId", "1"); // عدل الرقم إذا لزم

        const mainImgFile = document.getElementById("mainImg").files[0];
        if (mainImgFile) {
            formData.append("MainImg", mainImgFile);
        }

        // قراءة التوكن
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("error", "الرجاء تسجيل الدخول أولاً");
            return;
        }

        // 🟢 طباعة محتوى البيانات
        console.log("📤 إرسال البيانات إلى API:");
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
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
                const errorText = await response.text();
                console.error("خطأ:", errorText);
                showToast("error", `فشل في نشر العمل: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error("فشل الاتصال بالخادم:", error);
            showToast("error", "فشل الاتصال بالخادم");
        }
    });
});
