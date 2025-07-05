const chatForm = document.getElementById('chatForm');
const chatBox = document.getElementById('chatBox');
const show = (text, sender) => {
    const div = document.createElement('div');
    div.classList.add('message');

    let bgColor = sender === 'bot' ? 'botMessage' : 'bg-secondary text-white';

    div.innerHTML = `
    <div class="p-3 ${bgColor}  rounded-3 shadow-sm">
      ${text}
    </div>
  `;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;
}

const API_KEY = 'AIzaSyDnezvY1-PvtsZgjbBZ7PaB_0oFbpTy-hM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const generateAPIRespone = async (userMessage) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        console.log(data);
        const responseMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1');
        console.log(responseMessage);

        show(responseMessage, 'bot');
    } catch (err) {
        console.error(err);
        show("حدث خطأ يرجى المحاولة مرة اخرى", 'bot');
    }
}

const handleGoingMessage = () => {
    const userMessage = document.getElementById("chatInput").value
    if (!userMessage) return;
    show(userMessage, 'user');
    generateAPIRespone(userMessage);
    chatForm.reset();
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGoingMessage();
});