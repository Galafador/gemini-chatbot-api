const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage }),
  })
  .then(response => response.json())
  .then(data => {
    appendFormattedMessage(data.reply);
  })
  .catch(error => {
    console.error('Error:', error);
    appendMessage('bot', 'Error: Could not retrieve response.');
  })
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Creates a bot message with formatted HTML content
function appendFormattedMessage(htmlText) {
  const msg = document.createElement('div');
  // Use the correct structure for bot messages, including 'message' and 'bot' classes for CSS targeting
  msg.className = 'message bot';
  // append html from backend
  msg.innerHTML = htmlText;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return msg;
}


