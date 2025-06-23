 const toggleBtn = document.getElementById("toggleMenu");
const sidebar = document.getElementById("sidebarMenu");
const body = document.getElementById('Body');


  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("d-none");
  });

  function handleResize() {
    if (window.innerWidth >= 768) {
      sidebar.classList.remove("d-none");
      body.style.marginRight='260px';
    } else {
      sidebar.classList.add("d-none");
      body.style.marginRight='0';
    }
  }

  handleResize();
  window.addEventListener("resize", handleResize);