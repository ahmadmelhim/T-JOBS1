document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetPasswordForm");

    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const emailFromUrl = decodeURIComponent(getQueryParam("email") || '');
    const codeFromUrl = decodeURIComponent(getQueryParam("code") || '');

    const emailInput = document.getElementById("email");
    const codeInput = document.getElementById("code");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    if (emailInput && emailFromUrl) {
        emailInput.value = emailFromUrl;
    }
    if (codeInput && codeFromUrl) {
        codeInput.value = codeFromUrl;
    }

    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const code = codeInput.value;
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

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

        if (password.length < 6) {
            Toast.fire({ icon: "error", title: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" });
            return;
        }

        if (!/[A-Z]/.test(password)) {
            Toast.fire({ icon: "error", title: "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل" });
            return;
        }

        if (!/[a-z]/.test(password)) {
            Toast.fire({ icon: "error", title: "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل" });
            return;
        }

        if (!/[0-9]/.test(password)) {
            Toast.fire({ icon: "error", title: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل" });
            return;
        }

        if (password !== confirmPassword) {
            Toast.fire({ icon: "error", title: "كلمة المرور وتأكيدها غير متطابقين" });
            return;
        }

        try {
            const response = await fetch("http://tjob.tryasp.net/api/Accounts/ConfirmResetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                } )
            });

            if (response.ok) {
                Toast.fire({ icon: "success", title: "تم إعادة تعيين كلمة المرور بنجاح" }).then(() => {
                    window.location.href = "login.html";
                });
            } else {
                const errorData = await response.json(); 
                console.log("Server response data:", errorData);

                let errorMessage = "الطلب فشل";
                if (errorData) {
                    if (errorData.errors) {
                        const errorMessages = Object.values(errorData.errors).flat();
                        if (errorMessages.length > 0) {
                            errorMessage = errorMessages.join(", ");
                        }
                    } else if (errorData.title) {
                        errorMessage = errorData.title;
                    } else if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    }
                }
                Toast.fire({ icon: "error", title: errorMessage });
            }

        } catch (error) {
            console.error("فشل الاتصال بالخادم:", error);
            Toast.fire({ icon: "error", title: "فشل الاتصال بالخادم" });
        }
    });
});
