document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgetPasswordForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailOrUserName = document.getElementById('emailOrUserName').value;

        if (emailOrUserName === '') {
            Swal.fire({
                icon: "error",
                title: "يرجى إدخال البريد الإلكتروني",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        try {
            const response = await fetch('http://tjob.tryasp.net/api/Accounts/ForgetPassword', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emailOrUserName: emailOrUserName.trim()
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => {
                    window.location.href = "reset-password.html";
                });
            } else {
                const resText = await response.text();
                Swal.fire({
                    icon: "error",
                    title: "فشل في إرسال الرابط",
                    text: resText || "حدث خطأ أثناء إرسال الطلب",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "خطأ في الاتصال بالخادم",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    });
});
