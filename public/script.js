const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const chatBox = document.getElementById('chat-box');
const imageButton = document.getElementById('image-button');
const imageInput = document.getElementById('image-input');
const documentButton = document.getElementById('document-button');
const documentInput = document.getElementById('document-input');
const audioButton = document.getElementById('audio-button');
const audioInput = document.getElementById('audio-input');
const filePreviews = document.querySelector('.file-previews');


// sets the API endpoint links
const CHAT_API = '/api/chat';
const IMAGE_API = '/api/generate-from-image';
const DOCUMENT_API = '/api/generate-from-document';
const AUDIO_API = '/api/generate-from-audio';

// defaults to CHAT at first
let currentAPI = CHAT_API;

/**
 * Creates a preview for a selected file.
 * @param {File} file The file to preview.
 * @param {HTMLInputElement} inputElement The input element the file came from.
 */
function createFilePreview(file, inputElement) {
  filePreviews.innerHTML = '';
  input.value = ''; // Clear prompt text

  if (!file) return;

  const previewContainer = document.createElement('div');
  previewContainer.className = 'relative inline-block p-2 bg-stone-800 rounded-lg';

  // Create specific preview content based on file type
  if (file.type.startsWith('image/')) {
    input.value = 'Describe this image:';
    const img = document.createElement('img');
    img.className = 'w-24 h-24 object-cover rounded-md';
    img.alt = 'Image preview';
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.readAsDataURL(file);
    previewContainer.appendChild(img);
  } else {
    // Generic preview for non-image files (documents, audio)
    const fileInfo = document.createElement('div');
    fileInfo.className = 'w-48 h-24 flex flex-col justify-center items-center text-sm text-stone-300 p-2';
    let iconSVG = '';
    if (file.type.startsWith('audio/')) {
      input.value = 'Transcribe this audio:';
      iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`;
    } else { // Assume document
      input.value = 'Summarize this document:';
      iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
    }
    fileInfo.innerHTML = `${iconSVG}<span class="truncate w-full text-center">${file.name}</span>`;
    previewContainer.appendChild(fileInfo);
  }

  // Create and add the remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-700 transition-colors';
  removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
  removeBtn.setAttribute('aria-label', 'Remove file');
  removeBtn.onclick = () => {
    filePreviews.innerHTML = '';
    inputElement.value = '';
    input.value = ''; // Also clear the prompt
  };

  previewContainer.appendChild(removeBtn);
  filePreviews.appendChild(previewContainer);
}

// Add click listeners to the attachment buttons to trigger file inputs
imageButton.addEventListener('click', () => imageInput.click());
documentButton.addEventListener('click', () => documentInput.click());
audioButton.addEventListener('click', () => audioInput.click());

// Add change listeners to file inputs to handle previews
imageInput.addEventListener('change', () => {
  documentInput.value = '';
  audioInput.value = '';
  createFilePreview(imageInput.files[0], imageInput);
});

documentInput.addEventListener('change', () => {
  imageInput.value = '';
  audioInput.value = '';
  createFilePreview(documentInput.files[0], documentInput);
});

audioInput.addEventListener('change', () => {
  imageInput.value = '';
  documentInput.value = '';
  createFilePreview(audioInput.files[0], audioInput);
});


// add event listener to form so that users can submit by pressing ctrl+enter or command+enter
input.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'Enter' || e.metaKey && e.key === 'Enter') {
    e.preventDefault();
      form.dispatchEvent(new Event('submit'));
  }
});

// add event listener to input so that it adjusts its height based on text content
input.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = `${this.scrollHeight}px`;
});


form.addEventListener('submit', function (e) {
  e.preventDefault();
  const userMessage = input.value.trim();
  const imageFile = imageInput.files[0];
  const documentFile = documentInput.files[0];
  const audioFile = audioInput.files[0];

  if (!userMessage && !imageFile && !documentFile && !audioFile) {
    return;
  }

  let apiEndpoint = CHAT_API;
  let body;
  const headers = {};

  const hasFile = imageFile || documentFile || audioFile;

  if (hasFile) {
    const formData = new FormData();
    formData.append('message', userMessage);
    if (imageFile) {
      apiEndpoint = IMAGE_API;
      formData.append('image', imageFile);
    } else if (documentFile) {
      apiEndpoint = DOCUMENT_API;
      formData.append('document', documentFile);
    } else if (audioFile) {
      apiEndpoint = AUDIO_API;
      formData.append('audio', audioFile);
    }
    body = formData;
  } else {
    // Text-only message
    apiEndpoint = CHAT_API;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ message: userMessage });
  }

  // Display user message in chat if it exists
  if (userMessage || hasFile) {
    appendUserMessage(userMessage);
  }
  
  // Clear inputs and previews
  input.value = '';
  filePreviews.innerHTML = ''; // Clear preview on submit
  imageInput.value = '';
  documentInput.value = '';
  audioInput.value = '';

  // Display "thinking..." message
  const thinkingMessage = appendBotMessage('Thinking...');

  // Send prompt
  fetch(apiEndpoint, {
    method: 'POST',
    headers,
    body,
  })
  .then(response => response.json())
  .then(data => {
    // Remove "thinking..." message and display actual reply
    removeMessage(thinkingMessage);
    if (data.reply) {
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
  msgContainer.className = 'message bot flex w-full max-w-2xl gap-3 mb-3';
  const msg = document.createElement('div');
  msg.className = 'w-full p-4 rounded-lg self-center text-gray-300';
  // append html from backend
  msg.innerHTML = htmlText;
  // Append the message to the container, then the container to the chatbox
  msgContainer.appendChild(msg);
  chatBox.appendChild(msgContainer);

  chatBox.scrollTop = chatBox.scrollHeight;
  return msgContainer;
}
