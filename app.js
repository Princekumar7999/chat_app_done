const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const authContainer = document.getElementById('auth-container');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const authButton = document.getElementById('auth-button');
const activeUsersContainer = document.getElementById('active-users');

let currentUser = null;

function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.email === currentUser.email ? 'self' : 'other');
    
    const emailElement = document.createElement('div');
    emailElement.classList.add('email');
    emailElement.textContent = message.email;
    
    const textElement = document.createElement('div');
    textElement.textContent = message.text;
    
    messageElement.appendChild(emailElement);
    messageElement.appendChild(textElement);
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text && currentUser) {
        const message = {
            email: currentUser.email,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        firebase.database().ref('messages').push(message);
        messageInput.value = '';
    }
}

function loadMessages() {
    messagesContainer.innerHTML = '';
    firebase.database().ref('messages').on('child_added', (snapshot) => {
        const message = snapshot.val();
        addMessage(message);
    });
}

function updateActiveUsers() {
    firebase.database().ref('users').on('value', (snapshot) => {
        const users = snapshot.val();
        activeUsersContainer.innerHTML = '<h2>Active Users</h2>';
        for (let userId in users) {
            const userElement = document.createElement('div');
            userElement.classList.add('user-item');
            userElement.textContent = users[userId].email;
            activeUsersContainer.appendChild(userElement);
        }
    });
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log('User signed in successfully');
        })
        .catch((error) => {
            // If user doesn't exist, create a new account
            if (error.code === 'auth/user-not-found') {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(() => {
                        console.log('New user created and signed in successfully');
                    })
                    .catch((error) => {
                        console.error('Error creating user:', error);
                    });
            } else {
                console.error('Error signing in:', error);
            }
        });
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        authContainer.style.display = 'none';
        document.querySelector('.app-container').style.display = 'flex';
        loadMessages();
        updateActiveUsers();
        
        // Update user's last active timestamp
        firebase.database().ref('users/' + user.uid).set({
            email: user.email,
            lastActive: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Remove user data when they disconnect
        firebase.database().ref('users/' + user.uid).onDisconnect().remove();
    } else {
        currentUser = null;
        authContainer.style.display = 'flex';
        document.querySelector('.app-container').style.display = 'none';
    }
});

// Initially hide the app container
document.querySelector('.app-container').style.display = 'none';