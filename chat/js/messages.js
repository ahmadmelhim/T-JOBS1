const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://tjob.tryasp.net/chatHub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        // setTimeout(start, 5000);
    }
};

connection.onclose(async () => {
    await start();
});

// Start the connection.
start();
const urlParams = new URLSearchParams(window.location.search);
let ReceiverId = urlParams.get('id');
const token = localStorage.getItem('token');
let firstName = urlParams.get('FirstName');
let lastName = urlParams.get('LastName');
const chatForm = document.querySelector("form");

function getSenderUserId(token) {  // برجع الاي دي للمرسل
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
}

const senderId = getSenderUserId(token);
document.addEventListener('DOMContentLoaded', () => {
    console.log(firstName);
    const titleChat = document.getElementById('titleChat');

    if (firstName != null && lastName != null) {
        document.querySelector(".col-md-8 .fw-bold").textContent = `${firstName} ${lastName}`;
        document.getElementById('chatImage').src = 'https://www.gravatar.com/avatar/?d=mp';
        titleChat.classList.remove('d-none');
        chatForm.classList.remove('d-none')
    } else {
        titleChat.classList.add('d-none');
        chatForm.classList.add('d-none');
    }

    getRecevierChat();
    getMyChat(ReceiverId);
});



connection.on("ReceiveMessage", (senderId, message) => {   /// استلام رسالة   
    console.log('وصلت رسالة ')
    if (senderId === ReceiverId) {  // اذا الرسالة بعتها اليوزر الي فاتح محادثته اظهرلي الرسالة في chat
        addMessageToChat(message, "start");
    } else {
        console.log("وصلت رسالة من :", senderId);
    }
});
async function getRecevierChat() {

    const response = await fetch('http://tjob.tryasp.net/api/Chat/MyChats', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const chats = await response.json()
    console.log(chats)
    displayChatList(chats);
}
function displayChatList(chats) {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';
    function timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffDays < 1) {
            if (diffHrs < 1) {
                return "الآن";
            } else {
                return `قبل ${diffHrs} ساعة`;
            }
        } else if (diffDays < 7) {
            return `قبل ${diffDays} يوم`;
        } else if (diffWeeks < 3) {
            return `قبل ${diffWeeks} أسبوع${diffWeeks > 1 ? 'ين' : ''}`;
        } else {
            return date.toLocaleDateString('ar-EG');
        }
    }

    chats.forEach((chat) => {
        const li = document.createElement('li');
        li.className = "list-group-item list-group-item-action py-3 px-3 d-flex align-items-center";
        li.style.cursor = "pointer";
        const time = timeAgo(chat.sentAt);
        console.log(time)
        li.innerHTML = `
      <img src="${chat.img || 'https://www.gravatar.com/avatar/?d=mp'}" class="rounded-circle me-3 border border-1" width="55" height="55">
      <div class="flex-grow-1">
        <h6 class="mb-1 fw-semibold">${chat.userName}</h6>
        <div class="d-flex justify-content-between">
          <p class="mb-0 text-truncate" style="max-width: 200px;">${chat.message || ''}</p>
          <p class="text-muted ms-2" style="font-size: 0.7rem;">${time}</p>
        </div>
      </div>
    `;
        li.addEventListener("click", () => {

            console.log(firstName, lastName)
            ReceiverId = chat.userId;
                    titleChat.classList.add('d-flex');
                    titleChat.classList.remove('d-none');
                    chatForm.classList.remove('d-none')

            document.querySelector(".col-md-8 .fw-bold").textContent = chat.userName;
            document.getElementById('chatImage').src = `${chat.img || 'https://www.gravatar.com/avatar/?d=mp'}`;
            document.getElementById("chatBox").innerHTML = "";
            getMyChat(chat.userId);
        });

        chatList.append(li);
    });


}
async function getMyChat(userId) {  // عرض محادثة معينة
    const response = await fetch(`http://tjob.tryasp.net/api/Chat/GetConversation/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const chats = await response.json()
    console.log('محادثة كاملة بين شخصين', chats)

    if (response.ok) {
        chats.forEach(msg => {
            console.log(senderId)
            const side = msg.senderId == senderId ? "start" : "end";
            addMessageToChat(msg.message, side);
        });
    }
}

function addMessageToChat(text, side) {

    const chatBox = document.getElementById("chatBox");
    const messageDiv = document.createElement("div");
    messageDiv.className = `d-flex justify-content-${side} mb-3`;

    const innerDiv = document.createElement("div");
    innerDiv.className = side === "end"
        ? "bg-primary  text-white rounded shadow-sm p-2 px-3 message-bubble"
        : "bg-white rounded shadow-sm p-2 px-3 message-bubble";

    innerDiv.textContent = text;  //اضافة الرسالة
    messageDiv.appendChild(innerDiv);  /// message اضافة ديف inner جواا ديف
    chatBox.appendChild(messageDiv);  /// chatBox اضافة ديف message جواا 

    chatBox.scrollTop = chatBox.scrollHeight;
}



// إرسال رسالة
const chatInput = document.getElementById("chatInput");

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = chatInput.value;
    console.log('ارسال رسالة :', message);

    if (!message || !ReceiverId) {
        return;
    }
    // إضافة الرسالة مباشرة ع المحادثة 
    addMessageToChat(message, "start");
    chatInput.value = "";

    try {

        // // إرسال عن طريق SignalR
        await connection.invoke("SendMessage", senderId, ReceiverId, message);
    } catch (err) {
        console.error(err);
    }
    const response = await fetch('http://tjob.tryasp.net/api/Chat/Send', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            receiverId: ReceiverId,
            message: message
        })
    })
    console.log(response)
    if (response.ok) {
        console.log('تم ارسال الرسالة بنجاح')
        getRecevierChat();

    }

});