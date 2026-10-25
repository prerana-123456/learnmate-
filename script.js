document.addEventListener('DOMContentLoaded', () => {
  const chatArea = document.getElementById('chatArea');
  const studyForm = document.getElementById('studyForm');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const chips = document.querySelectorAll('.chip');

  let currentMode = 'tutor';

  // Switch study modes
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      updateInputPlaceholder(currentMode);
    });
  });

  // Quick prompts
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      userInput.value = chip.dataset.prompt;
      sendMessage();
    });
  });

  // Auto-resize input
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height =
      `${Math.min(userInput.scrollHeight, 120)}px`;
  });

  // Enter to send; Shift+Enter for a new line
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  studyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });

  function updateInputPlaceholder(mode) {
    const placeholders = {
      tutor: 'Ask a question or concept to explain...',
      summarize: 'Paste notes or an article to summarize...',
      quiz: 'Enter a topic to generate a practice quiz...',
      flashcards: 'Enter concepts to convert into flashcards...'
    };

    userInput.placeholder =
      placeholders[mode] || 'Type your message...';
  }

  async function sendMessage() {
    const text = userInput.value.trim();

    if (!text || sendBtn.disabled) return;

    appendMessage(text, 'user');

    userInput.value = '';
    userInput.style.height = 'auto';
    setLoadingState(true);

    const loaderId = appendLoader();

    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: text,
          mode: currentMode
        })
      });

      const data = await response.json();

      removeLoader(loaderId);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || 'Server error occurred.'
        );
      }

      appendMessage(data.reply, 'assistant');

    } catch (error) {
      removeLoader(loaderId);

      appendMessage(
        'Sorry! LearnMate could not connect to the AI server. ' +
        'Please check your internet connection or try again later.',
        'assistant'
      );

      console.error('LearnMate error:', error);

    } finally {
      setLoadingState(false);
    }
  }

  function appendMessage(text, sender) {
    const message = document.createElement('div');

    message.className = `message ${sender}-message`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    message.appendChild(bubble);
    chatArea.appendChild(message);

    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function appendLoader() {
    const id = `loader-${Date.now()}`;

    const message = document.createElement('div');
    message.className = 'message assistant-message';
    message.id = id;

    const bubble = document.createElement('div');
    bubble.className = 'bubble loading-dots';

    bubble.innerHTML =
      'Thinking <span>.</span><span>.</span><span>.</span>';

    message.appendChild(bubble);
    chatArea.appendChild(message);

    chatArea.scrollTop = chatArea.scrollHeight;

    return id;
  }

  function removeLoader(id) {
    const loader = document.getElementById(id);

    if (loader) {
      loader.remove();
    }
  }

  function setLoadingState(isLoading) {
    sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;

    if (!isLoading) {
      userInput.focus();
    }
  }
});