document.addEventListener("DOMContentLoaded", () => {
    // عناصر DOM
    const jobsContainer = document.getElementById("jobsContainer");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");
    const noJobsMessage = document.getElementById("noJobsMessage");
    const paginationContainer = document.getElementById("paginationContainer");
    
    // عناصر الفلاتر
    const typeFilter = document.getElementById("typeFilter");
    const cityFilter = document.getElementById("cityFilter");
    const dateFilter = document.getElementById("dateFilter");
    const applyFiltersBtn = document.getElementById("applyFilters");

    // متغيرات التصفح
    let currentPage = 1;
    let jobsPerPage = 10;
    let allJobs = [];
    let filteredJobs = [];

    // دالة لعرض رسائل Toast
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

    // دالة لتنسيق التاريخ
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return "قبل يوم";
        } else if (diffDays <= 3) {
            return `قبل ${diffDays} أيام`;
        } else if (diffDays <= 7) {
            return "قبل أسبوع";
        } else if (diffDays <= 14) {
            return "قبل أسبوعين";
        } else if (diffDays <= 30) {
            return "قبل شهر";
        } else {
            return "قبل أكثر من شهر";
        }
    }

    // دالة لإنشاء بطاقة وظيفة
    function createJobCard(job) {
        const location = `${job.city}, ${job.state}`;
        const publishDate = formatDate(job.publishDateTime);
        
        return `
            <div class="col-md-12 bg-mainColor rounded-4">
                <div class="p-3 shadow-sm rounded job-card">
                    <h5 class="mb-1 fw-bold">${job.title}</h5>
                    <p class="mb-1">${location} | تم النشر: ${publishDate}</p>
                    <p class="mb-1"><strong>النوع:</strong> ${job.type}</p>
                    <p class="mb-1"><strong>السعر:</strong> ${job.price} شيقل</p>
                    <p class="mb-2">${job.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-sm mt-2 bg-blueColor" onclick="viewJobDetails(${job.id})">
                            عرض التفاصيل
                        </button>
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            ${job.street}, ${job.home}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    // دالة لعرض الوظائف
    function displayJobs(jobs) {
        if (jobs.length === 0) {
            jobsContainer.innerHTML = "";
            noJobsMessage.classList.remove("d-none");
            paginationContainer.classList.add("d-none");
            return;
        }

        noJobsMessage.classList.add("d-none");
        
        // حساب الوظائف للصفحة الحالية
        const startIndex = (currentPage - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const jobsToShow = jobs.slice(startIndex, endIndex);

        // إنشاء HTML للوظائف
        const jobsHTML = jobsToShow.map(job => createJobCard(job)).join("");
        jobsContainer.innerHTML = jobsHTML;

        // إنشاء التصفح
        createPagination(jobs.length);
    }

    // دالة لإنشاء التصفح
    function createPagination(totalJobs) {
        const totalPages = Math.ceil(totalJobs / jobsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.classList.add("d-none");
            return;
        }

        paginationContainer.classList.remove("d-none");
        
        let paginationHTML = "";
        
        // زر السابق
        if (currentPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link text-black" href="#" onclick="changePage(${currentPage - 1})">السابق</a></li>`;
        } else {
            paginationHTML += `<li class="page-item disabled"><a class="page-link text-black" href="#">السابق</a></li>`;
        }

        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<li class="page-item active"><a class="page-link text-black" href="#" onclick="changePage(${i})">${i}</a></li>`;
            } else {
                paginationHTML += `<li class="page-item"><a class="page-link text-black" href="#" onclick="changePage(${i})">${i}</a></li>`;
            }
        }

        // زر التالي
        if (currentPage < totalPages) {
            paginationHTML += `<li class="page-item"><a class="page-link text-black" href="#" onclick="changePage(${currentPage + 1})">التالي</a></li>`;
        } else {
            paginationHTML += `<li class="page-item disabled"><a class="page-link text-black" href="#">التالي</a></li>`;
        }

        document.querySelector(".pagination").innerHTML = paginationHTML;
    }

    // دالة لتغيير الصفحة
    window.changePage = function(page) {
        currentPage = page;
        displayJobs(filteredJobs);
        // التمرير إلى أعلى قائمة الوظائف
        document.getElementById("jobsContainer").scrollIntoView({ behavior: "smooth" });
    };

    // دالة لعرض تفاصيل الوظيفة
    window.viewJobDetails = function(jobId) {
        // يمكنك تخصيص هذه الدالة حسب احتياجاتك
        // مثلاً، فتح صفحة تفاصيل الوظيفة أو عرض modal
        window.location.href = `./worker/worker-job-details.html?id=${jobId}`;
    };

    // دالة لتطبيق الفلاتر
    function applyFilters() {
        const typeValue = typeFilter.value.toLowerCase();
        const cityValue = cityFilter.value.toLowerCase();
        const dateValue = dateFilter.value;

        filteredJobs = allJobs.filter(job => {
            // فلتر النوع
            const typeMatch = !typeValue || job.type.toLowerCase().includes(typeValue);
            
            // فلتر المدينة
            const cityMatch = !cityValue || job.city.toLowerCase().includes(cityValue);
            
            // فلتر التاريخ
            let dateMatch = true;
            if (dateValue) {
                const jobDate = new Date(job.publishDateTime);
                const now = new Date();
                const diffTime = Math.abs(now - jobDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateValue) {
                    case "today":
                        dateMatch = diffDays <= 1;
                        break;
                    case "3days":
                        dateMatch = diffDays <= 3;
                        break;
                    case "week":
                        dateMatch = diffDays <= 7;
                        break;
                    default:
                        dateMatch = true;
                }
            }

            return typeMatch && cityMatch && dateMatch;
        });

        currentPage = 1; // إعادة تعيين الصفحة إلى الأولى
        displayJobs(filteredJobs);
    }

    // دالة لجلب الوظائف من API
    async function fetchJobs() {
        try {
            // إظهار مؤشر التحميل
            loadingIndicator.classList.remove("d-none");
            errorMessage.classList.add("d-none");
            jobsContainer.innerHTML = "";
            noJobsMessage.classList.add("d-none");
            paginationContainer.classList.add("d-none");

            const response = await fetch("http://tjob.tryasp.net/api/Employer/Requests");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jobs = await response.json();
           
            // إخفاء مؤشر التحميل
            loadingIndicator.classList.add("d-none");

            // تخزين الوظائف
            allJobs = jobs;
            filteredJobs = jobs;

            // عرض الوظائف
            displayJobs(filteredJobs);


        } catch (error) {
            console.error("خطأ في جلب الوظائف:", error);
            
            // إخفاء مؤشر التحميل
            loadingIndicator.classList.add("d-none");
            
            // إظهار رسالة الخطأ
            errorText.textContent = `حدث خطأ أثناء تحميل الوظائف: ${error.message}`;
            errorMessage.classList.remove("d-none");
            
            // إظهار رسالة خطأ في Toast
            showToast("error", "فشل في تحميل الوظائف");
        }
    }

    // إضافة مستمعي الأحداث
    applyFiltersBtn.addEventListener("click", applyFilters);

    // تطبيق الفلاتر عند تغيير القيم
    typeFilter.addEventListener("change", applyFilters);
    cityFilter.addEventListener("change", applyFilters);
    dateFilter.addEventListener("change", applyFilters);

    // تحميل الوظائف عند تحميل الصفحة
    fetchJobs();
});
