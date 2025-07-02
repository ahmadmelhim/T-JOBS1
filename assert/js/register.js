const registerSubmit = document.getElementById('registerSubmit');

registerSubmit.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName = document.getElementById('userName').value;
  const email = document.getElementById('email').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const age = document.getElementById('age').value;
  const state = document.getElementById('state').value;
  const city = document.getElementById('city').value;
  const street = document.getElementById('street').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const userType = document.getElementById('userType').value;
  const ssn = document.getElementById('ssn').value; 

  // تحقق من كلمة المرور
  if (password.length < 6) {
    showToast("error", "يجب ان تتكون كلمة المرور من 6 أحرف على الأقل");
    return;
  }
  if (!/[A-Z]/.test(password)) {
    showToast("error", "يجب ان تحتوي كلمة المرور على حرف كبير واحد على الأقل");
    return;
  }
  if (!/[a-z]/.test(password)) {
    showToast("error", "يجب ان تحتوي كلمة المرور على حرف صغير واحد على الأقل");
    return;
  }
  if (!/[0-9]/.test(password)) {
    showToast("error", "يجب ان تحتوي كلمة المرور على رقم واحد على الأقل");
    return;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    showToast("error", "يجب أن تحتوي كلمة المرور على رمز خاص مثل * أو @ أو !");
    return;
  }
  if (password !== confirmPassword) {
    showToast("error", "كلمة المرور وتأكيدها غير متطابقين");
    return;
  }

  // تجهيز البيانات بصيغة JSON
  const data = {
    userName: userName,
    email: email,
    firstName: firstName,
    lastName: lastName,
    age: parseInt(age),
    password: password,
    confirmPassword: confirmPassword,
    userType: parseInt(userType),
    ssn: ssn,
    state: state,
    city: city,
    street: street
  };

  try {
    const response = await fetch('http://tjob.tryasp.net/api/Accounts/Register', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' // تحديد نوع المحتوى كـ JSON
      },
      body: JSON.stringify(data  ) // تحويل الكائن إلى سلسلة JSON
    });

    if (response.ok) {
      showToast("success", "تم إنشاء الحساب بنجاح").then(() => {
        window.location.href = 'login.html';
      });
    } else if (response.status === 400) {
      const errorData = await response.json(); // قراءة بيانات الخطأ من الاستجابة
      console.error("Server 400 response data:", errorData); // طباعة كائن الخطأ كاملاً للمساعدة في التصحيح

      let displayMessage = "فشل إنشاء الحساب، حاول مرة أخرى"; // رسالة افتراضية

      if (errorData) {
        if (errorData.errors) { // هذا شائع لأخطاء التحقق من الصحة (مثل ASP.NET Core Problem Details)
          const messages = Object.values(errorData.errors).flat();
          if (messages.length > 0) {
            displayMessage = messages.join(", "); // دمج جميع رسائل الأخطاء
          } else if (errorData.title) { // في حال وجود حقل عنوان للخطأ
            displayMessage = errorData.title;
          }
        } else if (Array.isArray(errorData)) { // <--- التعديل هنا: إذا كانت الاستجابة عبارة عن مصفوفة مباشرة
            const messages = errorData.map(err => {
                // حاول استخراج رسالة من خصائص شائعة مثل 'description' أو 'message'
                if (err && typeof err === 'object') {
                    if (err.description) return err.description;
                    if (err.message) return err.message;
                    // إذا لم يتم العثور على خاصية محددة، قم بتحويل الكائن إلى JSON string (للتصحيح)
                    try {
                        return JSON.stringify(err);
                    } catch (e) {
                        return "خطأ غير معروف";
                    }
                }
                return err; // إذا كان العنصر ليس كائنًا، استخدمه كما هو
            }).filter(Boolean); // إزالة أي قيم فارغة أو null
            
            if (messages.length > 0) {
                displayMessage = messages.join(", ");
            } else {
                displayMessage = "حدث خطأ في التحقق من الصحة (مصفوفة فارغة).";
            }
        } else if (errorData.message) { // شائع لرسائل الخطأ البسيطة
          displayMessage = errorData.message;
        } else if (errorData.title) { // حقل آخر شائع لعناوين الأخطاء
          displayMessage = errorData.title;
        } else if (typeof errorData === 'string') { // إذا كانت الاستجابة مجرد سلسلة نصية خطأ
          displayMessage = errorData;
        } else { // التعامل مع أي هيكل كائن آخر
          // محاولة استخراج أول قيمة من الكائن إذا كانت سلسلة نصية أو مصفوفة
          const firstValue = Object.values(errorData)[0];
          if (firstValue && (typeof firstValue === 'string' || Array.isArray(firstValue))) {
              displayMessage = Array.isArray(firstValue) ? firstValue.join(", ") : firstValue;
          } else {
              // إذا لم نتمكن من استخراج رسالة واضحة، قم بتحويل الكائن بالكامل إلى سلسلة نصية (للتصحيح)
              // ولكن تجنب عرض "[object Object]" للمستخدم
              try {
                  displayMessage = JSON.stringify(errorData);
              } catch (e) {
                  displayMessage = "حدث خطأ غير معروف في الخادم.";
              }
          }
        }
      }
      showToast("error", displayMessage); // عرض الرسالة المستخرجة
    } else {
      showToast("error", "فشل إنشاء الحساب، حاول مرة أخرى");
    }
  } catch (err) {
    console.error("فشل في إرسال البيانات:", err);
    showToast("error", "حدث خطأ أثناء إرسال البيانات");
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
