const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');


form.addEventListener('submit', function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendUserMessage(userMessage);
  input.value = '';

  // Display "thinking..." message
  const thinkingMessage = appendBotMessage('Thinking...');

  fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage }),
  })
  .then(response => response.json())
  .then(data => {
    // Remove "thinking..." message and display actual reply
    removeMessage(thinkingMessage);
    if (data.reply) {
      // Get an already HTML formatted text from backend and append
      appendFormattedMessage(data.reply);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    removeMessage(thinkingMessage);
    appendBotMessage('Error: Could not retrieve response.');
  });
});

function appendUserMessage(text) {
  const msgContainer = document.createElement('div');
  msgContainer.className = 'flex w-full items-end gap-3 justify-end max-w-2xl text-end mb-3';
  const msg = document.createElement('div');
  msg.className = 'bg-blue-700 p-4 rounded-lg max-w-lg text-white';
  msg.textContent = text;
  msgContainer.appendChild(msg);
  chatBox.appendChild(msgContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgContainer;
}
// Creates a simple bot message (e.g., "Thinking...", "Error...")
function appendBotMessage(text) {
  const msgContainer = document.createElement('div');
  // Use the correct structure for bot messages
  msgContainer.className = 'message bot flex w-full max-w-2xl gap-3 mb-3';
  const msg = document.createElement('div');
  msg.className = 'w-full p-4 rounded-lg self-center text-gray-300';
  msg.textContent = text;
  msgContainer.appendChild(msg);
  chatBox.appendChild(msgContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgContainer;
}
function removeMessage(messageElement) {
    if (messageElement && messageElement.parentNode === chatBox) {
        chatBox.removeChild(messageElement);
    }
}
// Creates a bot message with formatted HTML content
function appendFormattedMessage(htmlText) {
  const msgContainer = document.createElement('div');
  // Use the correct structure for bot messages, including 'message' and 'bot' classes for CSS targeting
  msgContainer.className = 'message bot flex w-full max-w-2xl gap-3 pb-3';
  const msg = document.createElement('div');
  msg.className = 'w-full p-4 rounded-lg self-center text-gray-300';
  // append html from backend
  msg.innerHTML = htmlText;
  // Append the message to the container, then the container to the chatbox
  msgContainer.appendChild(msg);
  chatBox.appendChild(msgContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
  // Highlight all <code> blocks inside the new message
  msg.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  
  return msgContainer;
}
