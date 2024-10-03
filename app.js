const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameContainer = document.getElementById('username-container');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const chatContainer = document.getElementById('chat-container');
const activeUsersContainer = document.getElementById('active-users');

let username = '';

function addMessage(message, isSelf) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSelf ? 'self' : 'other');
    
    const usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.textContent = message.username;
    
    const textElement = document.createElement('div');
    textElement.textContent = message.text;
    
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text) {
        const message = { username, text, timestamp: Date.now() };
        localStorage.setItem(`message_${message.timestamp}`, JSON.stringify(message));
        addMessage(message, true);
        messageInput.value = '';
    }
}

function loadMessages() {
    messagesContainer.innerHTML = '';
    const messages = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('message_')) {
            messages.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    messages.sort((a, b) => a.timestamp - b.timestamp);
    messages.forEach(message => addMessage(message, message.username === username));
}

function updateActiveUsers() {
    const users = new Set();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('message_')) {
            const message = JSON.parse(localStorage.getItem(key));
            users.add(message.username);
        }
    }
    activeUsersContainer.innerHTML = '<h2>Active Users</h2>';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.classList.add('user-item');
        userElement.textContent = user;
        activeUsersContainer.appendChild(userElement);
    });
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = usernameInput.value.trim();
    if (username) {
        usernameContainer.style.display = 'none';
        document.querySelector('.app-container').style.display = 'flex';
        loadMessages();
        updateActiveUsers();
        messageInput.focus();
    }
});

window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('message_')) {
        const message = JSON.parse(e.newValue);
        if (message.username !== username) {
            addMessage(message, false);
        }
        updateActiveUsers();
    }
});
setInterval(updateActiveUsers, 5000);
