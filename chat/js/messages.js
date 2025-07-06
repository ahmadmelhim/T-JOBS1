document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const chatsList = document.querySelector("ul.list-unstyled");
  const chatBox = document.querySelector(".flex-grow-1.p-3");
  const form = document.querySelector("form");
  const input = form.querySelector("input");
  const userNameHeader = document.querySelector(".bg-primary h5");
  let currentUserId = null;

  // جلب قائمة المحادثات
  async function loadMyChats() {
    try {
      const res = await fetch("http://tjob.tryasp.net/api/Chat/MyChats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      chatsList.innerHTML = "";

      data.forEach(user => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action py-3 px-3 d-flex align-items-center";
        li.innerHTML = `
          <img src="${user.imageUrl || "https://randomuser.me/api/portraits/men/1.jpg"}" class="rounded-circle me-3 border border-2" width="55" height="55">
          <div class="flex-grow-1">
            <h6 class="mb-0 fw-semibold">${user.name}</h6>
          </div>
        `;
        li.addEventListener("click", () => loadConversation(user.id, user.name, user.imageUrl));
        chatsList.appendChild(li);
      });
    } catch (err) {
      console.error("فشل في تحميل المحادثات:", err);
    }
  }

  // جلب المحادثة مع مستخدم محدد
  async function loadConversation(userId, userName, imageUrl) {
    try {
      currentUserId = userId;
      userNameHeader.textContent = userName;
      document.querySelector(".bg-primary img").src = imageUrl || "https://randomuser.me/api/portraits/men/1.jpg";
      chatBox.innerHTML = "";

      const res = await fetch(`http://tjob.tryasp.net/api/Chat/GetConversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = await res.json();

      messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "d-flex mb-3 " + (msg.isSender ? "justify-content-end" : "justify-content-start");
        div.innerHTML = `<div class="${msg.isSender ? "bg-success text-white" : "bg-white"} rounded shadow-sm p-2 px-3">${msg.message}</div>`;
        chatBox.appendChild(div);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      console.error("فشل في تحميل المحادثة:", err);
    }
  }

  // إرسال رسالة
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message || !currentUserId) return;

    try {
      const res = await fetch("http://tjob.tryasp.net/api/Chat/Send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: new URLSearchParams({
          receiverId: currentUserId,
          message
        })
      });

      if (!res.ok) throw new Error("فشل في إرسال الرسالة");

      input.value = "";
      loadConversation(currentUserId, userNameHeader.textContent);
    } catch (err) {
      console.error("فشل في إرسال الرسالة:", err);
    }
  });

  loadMyChats();
});
