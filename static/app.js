function createMessageElement(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  const msgText = document.createElement("p");
  msgText.innerHTML = text;
  msgDiv.appendChild(msgText);
  return msgDiv;
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

// Voice Recognition
let isRecording = false;
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
        sendMessage();
    };
}

// Voice Selection
let maleVoice = null;
let femaleVoice = null;
let selectedGender = 'male';

function initializeVoices() {
    const voices = speechSynthesis.getVoices();
    
    // Find best male voice
    maleVoice = voices.find(voice => 
        voice.name.includes('Male') ||
        voice.name.includes('David') || 
        voice.name.includes('Alex')
    );
    
    // Find best female voice
    femaleVoice = voices.find(voice => 
        voice.name.includes('Female') ||
        voice.name.includes('Zira') || 
        voice.name.includes('Samantha')
    );

    // Set default from localStorage
    const savedGender = localStorage.getItem('voiceGender');
    if (savedGender) selectedGender = savedGender;
    document.getElementById('voiceGender').value = selectedGender;
}

document.getElementById('voiceGender').addEventListener('change', function() {
    selectedGender = this.value;
    localStorage.setItem('voiceGender', selectedGender);
});

speechSynthesis.onvoiceschanged = initializeVoices;

// Soft Text-to-Speech
function speakResponse(text) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Soft voice settings
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 0.8;

    // Select voice
    const selectedVoice = selectedGender === 'male' ? maleVoice : femaleVoice;
    if (selectedVoice) utterance.voice = selectedVoice;

    setTimeout(() => speechSynthesis.speak(utterance), 300);
}

// Voice Recording
function toggleVoiceRecording() {
    if (!recognition) {
        alert('Voice input not supported');
        return;
    }

    const recordButton = document.getElementById('recordButton');
    if (!isRecording) {
        recognition.start();
        recordButton.style.backgroundColor = '#ff4444';
        isRecording = true;
    } else {
        recognition.stop();
        recordButton.style.backgroundColor = '';
        isRecording = false;
    }
}

document.getElementById('recordButton').addEventListener('click', toggleVoiceRecording);

// Chat Functionality
function sendMessage() {
    const userInput = document.getElementById("user-input");
    const text = userInput.value.trim();
    if (!text) return;

    const chatBox = document.getElementById("chat-box");
    
    // Add user message
    chatBox.appendChild(createMessageElement(text, "user"));
    chatBox.scrollTop = chatBox.scrollHeight;
    userInput.value = "";

    // Get bot response
    fetch("/get_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
        let responseText = data.response;
        
        if (data.suggestion) {
            responseText += `<br/><small><em>Suggestion: ${data.suggestion}</em></small>`;
        }
        
        if (data.doctor_link) {
            responseText += `<br/><a href="${data.doctor_link}" target="_blank">Consult Doctor 🩺</a>`;
        }

        const botMessage = createMessageElement(responseText, "bot");
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Speak response
        speakResponse(data.response);
        if (data.suggestion) {
            setTimeout(() => speakResponse(`Suggestion: ${data.suggestion}`), 1000);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        chatBox.appendChild(createMessageElement("Connection error", "bot"));
    });
}