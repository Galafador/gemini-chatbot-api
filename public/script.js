const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Configure marked to use highlight.js for syntax highlighting
marked.setOptions({
  highlight: (code, lang) => {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'language-', // for CSS classes
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Display "thinking..." message
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

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
      // Render markdown to HTML and append it
      appendFormattedMessage('bot', data.reply);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    removeMessage(thinkingMessage);
    appendMessage('bot', 'Error: Could not retrieve response.');
  });
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function removeMessage(messageElement) {
    if (messageElement)
        chatBox.removeChild(messageElement);
}

function appendFormattedMessage(sender, markdownText) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  // Convert markdown to HTML
  msg.innerHTML = marked.parse(markdownText);

  // Append to DOM  first
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Highlight all <code> blocks inside the new message
  msg.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
  
  return msg;
}
