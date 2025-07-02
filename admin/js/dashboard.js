document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://tjob.tryasp.net/api/Admin/Home", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("فشل في جلب البيانات");

    const data = await response.json();

    document.getElementById("userCount").textContent = data.totalNumberOfUsers ?? "--";
    document.getElementById("jobCount").textContent = data.totalNumberOfRequests ?? "--";
    document.getElementById("applicationCount").textContent = data.totalNumberOfApplications ?? "--";
    document.getElementById("bannedCount").textContent = data.totalNumberOfBlockedUsers ?? "--";

    const ctx = document.getElementById("adminChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["المستخدمين", "الوظائف", "الطلبات", "المحظورين"],
        datasets: [{
          label: "الإحصائيات",
          data: [
            data.totalNumberOfUsers,
            data.totalNumberOfRequests,
            data.totalNumberOfApplications,
            data.totalNumberOfBlockedUsers
          ],
          backgroundColor: [
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f6c23e"
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.formattedValue} عنصر`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { family: 'Cairo', size: 14 }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5,
              font: { family: 'Cairo', size: 13 }
            }
          }
        }
      }
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  }
});
