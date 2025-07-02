document.addEventListener("DOMContentLoaded", () => {
    // عناصر الصفحة المستخدمة في التحكم والعرض
    const jobsContainer = document.getElementById("jobsContainer");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");
    const noJobsMessage = document.getElementById("noJobsMessage");
    const paginationContainer = document.getElementById("paginationContainer");

    const typeFilter = document.getElementById("typeFilter");
    const cityFilter = document.getElementById("cityFilter");
    const dateFilter = document.getElementById("dateFilter");
    const applyFiltersBtn = document.getElementById("applyFilters");

    let currentPage = 1;
    let jobsPerPage = 5;
    let allJobs = [];
    let filteredJobs = [];

    // دالة لعرض رسالة Toast
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

    //  لتحويل التاريخ إلى نص مثل قبل يوم أو قبل أسبوع
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "قبل يوم";
        else if (diffDays <= 3) return `قبل ${diffDays} أيام`;
        else if (diffDays <= 7) return "قبل أسبوع";
        else if (diffDays <= 14) return "قبل أسبوعين";
        else if (diffDays <= 30) return "قبل شهر";
        else return "قبل أكثر من شهر";
    }

    // دالة لإنشاء كرت عرض الوظيفة بتنسيق HTML
    function createJobCard(job) {
        const location = `${job.city}, ${job.state}`;
        const publishDate = formatDate(job.publishDateTime);

        return `
            <div class="col-md-12 bg-secColor rounded-4 mb-2">
                <div class="p-3 shadow-sm rounded job-card">
                    <h5 class="mb-1 fw-bold">${job.title}</h5>
                    <p class="mb-1">${location} | تم النشر: ${publishDate}</p>
                    <p class="mb-1"><strong>النوع:</strong> ${job.requestTypeName || "غير محدد"}</p>
                    <p class="mb-1"><strong>السعر:</strong> ${job.price} شيقل</p>
                    <p class="mb-2">${job.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="./worker/worker-job-details.html?id=${job.id}" class="btn btn-sm mt-2 bg-blueColor">
                            عرض التفاصيل
                        </a>
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            ${job.street}, ${job.home}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    // دالة لعرض قائمة الوظائف المفلترة حسب الصفحة الحالية
    function displayJobs(jobs) {
        if (jobs.length === 0) {
            jobsContainer.innerHTML = "";
            noJobsMessage.classList.remove("d-none");
            paginationContainer.classList.add("d-none");
            return;
        }

        noJobsMessage.classList.add("d-none");
        const startIndex = (currentPage - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const jobsToShow = jobs.slice(startIndex, endIndex);
        const jobsHTML = jobsToShow.map(job => createJobCard(job)).join("");
        jobsContainer.innerHTML = jobsHTML;
        createPagination(jobs.length);
    }

    // دالة لإنشاء عناصر التنقل بين الصفحات
    function createPagination(totalJobs) {
        const totalPages = Math.ceil(totalJobs / jobsPerPage);
        if (totalPages <= 1) {
            paginationContainer.classList.add("d-none");
            return;
        }

        paginationContainer.classList.remove("d-none");
        let paginationHTML = "";

        paginationHTML += currentPage > 1
            ? `<li class="page-item"><a class="page-link text-black" href="#" onclick="changePage(${currentPage - 1})">السابق</a></li>`
            : `<li class="page-item disabled"><a class="page-link text-black" href="#">السابق</a></li>`;

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link text-black" href="#" onclick="changePage(${i})">${i}</a></li>`;
        }

        paginationHTML += currentPage < totalPages
            ? `<li class="page-item"><a class="page-link text-black" href="#" onclick="changePage(${currentPage + 1})">التالي</a></li>`
            : `<li class="page-item disabled"><a class="page-link text-black" href="#">التالي</a></li>`;

        document.querySelector(".pagination").innerHTML = paginationHTML;
    }

    // دالة تغيير الصفحة عند التنقل
    window.changePage = function (page) {
        currentPage = page;
        displayJobs(filteredJobs);
        document.getElementById("jobsContainer").scrollIntoView({ behavior: "smooth" });
    };

    // دالة لتطبيق الفلاتر على الوظائف حسب النوع والمدينة والتاريخ
    function applyFilters() {
        const typeValue = typeFilter.value.toLowerCase();
        const cityValue = cityFilter.value.toLowerCase();
        const dateValue = dateFilter.value;

        filteredJobs = allJobs.filter(job => {
            const typeMatch = !typeValue || (job.requestTypeName && job.requestTypeName.toLowerCase().includes(typeValue));
            const cityMatch = !cityValue || job.city.toLowerCase().includes(cityValue);

            let dateMatch = true;
            if (dateValue) {
                const jobDate = new Date(job.publishDateTime);
                const now = new Date();
                const diffDays = Math.ceil(Math.abs(now - jobDate) / (1000 * 60 * 60 * 24));

                switch (dateValue) {
                    case "today": dateMatch = diffDays <= 1; break;
                    case "3days": dateMatch = diffDays <= 3; break;
                    case "week": dateMatch = diffDays <= 7; break;
                    default: dateMatch = true;
                }
            }

            return typeMatch && cityMatch && dateMatch;
        });

        currentPage = 1;
        displayJobs(filteredJobs);
    }

    // دالة لجلب الوظائف من الـ API وعرضها
    async function fetchJobs() {
        try {
            loadingIndicator.classList.remove("d-none");
            errorMessage.classList.add("d-none");
            jobsContainer.innerHTML = "";
            noJobsMessage.classList.add("d-none");
            paginationContainer.classList.add("d-none");

            const response = await fetch("http://tjob.tryasp.net/api/Requests");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const jobs = await response.json();

            loadingIndicator.classList.add("d-none");
            allJobs = jobs;
            filteredJobs = jobs;
            displayJobs(filteredJobs);
        } catch (error) {
            console.error("خطأ في جلب الوظائف:", error);
            loadingIndicator.classList.add("d-none");
            errorText.textContent = `حدث خطأ أثناء تحميل الوظائف: ${error.message}`;
            errorMessage.classList.remove("d-none");
            showToast("error", "فشل في تحميل الوظائف");
        }
    }

    // دالة لجلب أنواع الوظائف (المجالات) من الـ API ووضعها في قائمة الفلترة
    async function loadRequestTypes() {
    try {
        const token = localStorage.getItem("token"); // ✅ جلب التوكن من التخزين المحلي
        const response = await fetch("http://tjob.tryasp.net/api/Admin/RequestTypes", {
            headers: {
                Authorization: `Bearer ${token}` // ✅ تمرير التوكن في الطلب
            }
        });

        if (!response.ok) throw new Error("فشل في جلب أنواع الطلبات");

        const types = await response.json();
        typeFilter.innerHTML = `<option value="">الكل</option>`;
        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type.name.toLowerCase();
            option.textContent = type.name;
            typeFilter.appendChild(option);
        });
    } catch (error) {
        console.error("خطأ في تحميل أنواع الطلبات:", error);
        showToast("error", "فشل في تحميل أنواع المجالات");
    }
}


    // ربط الأحداث مع الفلاتر
    applyFiltersBtn.addEventListener("click", applyFilters);
    typeFilter.addEventListener("change", applyFilters);
    cityFilter.addEventListener("change", applyFilters);
    dateFilter.addEventListener("change", applyFilters);

    // تحميل الأنواع والوظائف عند تحميل الصفحة
    loadRequestTypes();
    fetchJobs();
});
