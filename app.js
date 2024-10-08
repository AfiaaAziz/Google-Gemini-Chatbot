const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeBtn = document.querySelector("#toggle-theme-btn");
const deleteChatBtn = document.querySelector("#delete-chat-btn");



let userMessage = null;
let isResponseGenerating = false;

const API_key = "AIzaSyCHI1QOm-8FA1IFEIqCfM7RDoLTOEx6IUs";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_key}`;


const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");

    const isLightmode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightmode);
    toggleThemeBtn.innerText = isLightmode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);

    chatList.scroll(0, chatList.scrollHeight);

}

loadLocalstorageData();

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(" ");
    let currentWordIndex = 0;

    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    const typingInterval = setInterval(() => {
        if (currentWordIndex === 0) {
            textElement.innerText += words[currentWordIndex++];
        } else {
            textElement.innerText += ' ' + words[currentWordIndex++];
        }


        chatList.scroll(0, chatList.scrollHeight);

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;

            incomingMessageDiv.querySelector(".icon").classList.remove("hide");


            localStorage.setItem("savedChats", chatList.innerHTML);

            chatList.scroll(0, chatList.scrollHeight);
        }
    }, 75);
};


const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: userMessage }]
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);


    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.chatList.add("error");


    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}; `1`



const showLoadingAnimation = () => {
    const html = ` <div class="message-content">
                <img src="images/Gemini icon.png" alt="Gemini Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onClick= "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");

    chatList.appendChild(incomingMessageDiv);
    chatList.scroll(0, chatList.scrollHeight);

    generateAPIResponse(incomingMessageDiv);
};


const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerHTML = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;
    isResponseGenerating = true;



    const html = ` <div class="message-content">
                <img src="images/user.png" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;

    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scroll(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500);
};


suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});


toggleThemeBtn.addEventListener("click", () => {
    const isLightmode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightmode ? "light_mode" : "darkmode")
    toggleThemeBtn.innerText = isLightmode ? "dark_mode" : "light_mode";

})


deleteChatBtn.addEventListener("click", () => {
    if (confirm("Are you sure you  want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }

})

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
});
