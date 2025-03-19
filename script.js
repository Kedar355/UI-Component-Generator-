const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainer = document.querySelector(".chats");
const suggestionItems = document.querySelectorAll(".suggests__item");
const frameworkSelector = document.getElementById("frameworkSelector");

const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById("deleteButton");

// State variables
let currentUserMessage = null;
let isGeneratingResponse = false;
let selectedFramework = "tailwind"; // Default framework

// API Keys - Replace with your own API key
const OPENAI_API_KEY = "api key";
const API_REQUEST_URL = "https://api.openai.com/v1/chat/completions";

// Load saved data from local storage
const loadSavedChatHistory = () => {
  const savedConversations =
    JSON.parse(localStorage.getItem("saved-ui-generator-chats")) || [];
  const isLightTheme = localStorage.getItem("themeColor") === "light_mode";

  document.body.classList.toggle("light_mode", isLightTheme);
  themeToggleButton.innerHTML = isLightTheme
    ? '<i class="bx bx-moon"></i>'
    : '<i class="bx bx-sun"></i>';

  chatHistoryContainer.innerHTML = "";

  // Iterate through saved chat history and display messages
  savedConversations.forEach((conversation) => {
    // Display the user's message
    const userMessageHtml = `
      <div class="message__content">
        <img class="message__avatar" src="assets/profile.png" alt="User avatar">
        <p class="message__text">${conversation.userMessage}</p>
        <p class="message__framework">Framework: ${conversation.framework}</p>
      </div>
    `;

    const outgoingMessageElement = createChatMessageElement(
      userMessageHtml,
      "message--outgoing"
    );
    chatHistoryContainer.appendChild(outgoingMessageElement);

    // Display the API response
    const responseText =
      conversation.apiResponse?.choices?.[0]?.message?.content;
    const parsedApiResponse = marked.parse(responseText); // Convert to HTML
    const rawApiResponse = responseText; // Plain text version

    const responseHtml = `
      <div class="message__content">
        <img class="message__avatar" src="assets/ai.svg" alt="AI avatar">
        <p class="message__text"></p>
        <div class="message__loading-indicator hide">
          <div class="message__loading-bar"></div>
          <div class="message__loading-bar"></div>
          <div class="message__loading-bar"></div>
        </div>
      </div>
      <span onClick="copyMessageToClipboard(this)" class="message__icon hide"><i class='bx bx-copy-alt'></i></span>
    `;

    const incomingMessageElement = createChatMessageElement(
      responseHtml,
      "message--incoming"
    );
    chatHistoryContainer.appendChild(incomingMessageElement);

    const messageTextElement =
      incomingMessageElement.querySelector(".message__text");

    // Display saved chat without typing effect
    showTypingEffect(
      rawApiResponse,
      parsedApiResponse,
      messageTextElement,
      incomingMessageElement,
      true
    ); // 'true' skips typing
  });

  document.body.classList.toggle("hide-header", savedConversations.length > 0);
};

// Create a new chat message element
const createChatMessageElement = (htmlContent, ...cssClasses) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", ...cssClasses);
  messageElement.innerHTML = htmlContent;
  return messageElement;
};

// Show typing effect
const showTypingEffect = (
  rawText,
  htmlText,
  messageElement,
  incomingMessageElement,
  skipEffect = false
) => {
  const copyIconElement =
    incomingMessageElement.querySelector(".message__icon");
  copyIconElement.classList.add("hide"); // Initially hide copy button

  if (skipEffect) {
    // Display content directly without typing
    messageElement.innerHTML = htmlText;
    hljs.highlightAll();
    addCopyButtonToCodeBlocks();
    copyIconElement.classList.remove("hide"); // Show copy button
    isGeneratingResponse = false;
    return;
  }

  const wordsArray = rawText.split(" ");
  let wordIndex = 0;

  const typingInterval = setInterval(() => {
    messageElement.innerText +=
      (wordIndex === 0 ? "" : " ") + wordsArray[wordIndex++];
    if (wordIndex === wordsArray.length) {
      clearInterval(typingInterval);
      isGeneratingResponse = false;
      messageElement.innerHTML = htmlText;
      hljs.highlightAll();
      addCopyButtonToCodeBlocks();
      copyIconElement.classList.remove("hide");
    }
  }, 50);
};

// Generate a prompt based on the framework selected
const generatePrompt = (userMessage, framework) => {
  const frameworkPromptsMap = {
    bootstrap: `You are a UI component generator for Bootstrap 5. Create a component based on this description: "${userMessage}". 
    Respond with HTML and CSS code with Bootstrap classes. Include any necessary JavaScript. 
    Format your response in markdown with code blocks. Focus ONLY on the code, don't include explanations.`,

    mui: `You are a UI component generator for Material UI (React). Create a component based on this description: "${userMessage}". 
    Respond with React component code that uses Material UI components. Include any necessary imports and styling. 
    Format your response in markdown with code blocks. Focus ONLY on the code, don't include explanations.`,

    tailwind: `You are a UI component generator for Tailwind CSS. Create a component based on this description: "${userMessage}". 
    Respond with HTML code using Tailwind CSS classes. Include any necessary JavaScript. 
    Format your response in markdown with code blocks. Focus ONLY on the code, don't include explanations.`,
  };

  return frameworkPromptsMap[framework] || frameworkPromptsMap.tailwind;
};

// Fetch API response based on user input
const requestApiResponse = async (incomingMessageElement) => {
  const messageTextElement =
    incomingMessageElement.querySelector(".message__text");

  try {
    const prompt = generatePrompt(currentUserMessage, selectedFramework);

    const response = await fetch(API_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that generates UI components based on user specifications.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const responseData = await response.json();
    if (!response.ok)
      throw new Error(responseData.error?.message || "API request failed");

    const responseText = responseData?.choices?.[0]?.message?.content;
    if (!responseText) throw new Error("Invalid API response.");

    const parsedApiResponse = marked.parse(responseText);
    const rawApiResponse = responseText;

    showTypingEffect(
      rawApiResponse,
      parsedApiResponse,
      messageTextElement,
      incomingMessageElement
    );

    // Save conversation in local storage
    let savedConversations =
      JSON.parse(localStorage.getItem("saved-ui-generator-chats")) || [];
    savedConversations.push({
      userMessage: currentUserMessage,
      framework: selectedFramework,
      apiResponse: responseData,
    });
    localStorage.setItem(
      "saved-ui-generator-chats",
      JSON.stringify(savedConversations)
    );
  } catch (error) {
    isGeneratingResponse = false;
    messageTextElement.innerText = `Error: ${
      error.message || "Something went wrong"
    }`;
    messageTextElement.closest(".message").classList.add("message--error");
  } finally {
    incomingMessageElement.classList.remove("message--loading");
  }
};

// Add copy button to code blocks
const addCopyButtonToCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll("pre");
  codeBlocks.forEach((block) => {
    const codeElement = block.querySelector("code");
    let language =
      [...codeElement.classList]
        .find((cls) => cls.startsWith("language-"))
        ?.replace("language-", "") || "Text";

    const languageLabel = document.createElement("div");
    languageLabel.innerText =
      language.charAt(0).toUpperCase() + language.slice(1);
    languageLabel.classList.add("code__language-label");
    block.appendChild(languageLabel);

    const copyButton = document.createElement("button");
    copyButton.innerHTML = `<i class='bx bx-copy'></i>`;
    copyButton.classList.add("code__copy-btn");
    block.appendChild(copyButton);

    const previewButton = document.createElement("button");
    previewButton.innerHTML = `<i class='bx bx-show'></i>`;
    previewButton.classList.add("code__preview-btn");
    block.appendChild(previewButton);

    copyButton.addEventListener("click", () => {
      navigator.clipboard
        .writeText(codeElement.innerText)
        .then(() => {
          copyButton.innerHTML = `<i class='bx bx-check'></i>`;
          setTimeout(
            () => (copyButton.innerHTML = `<i class='bx bx-copy'></i>`),
            2000
          );
        })
        .catch((err) => {
          console.error("Copy failed:", err);
          alert("Unable to copy text!");
        });
    });

    previewButton.addEventListener("click", () => {
      const codeToPreview = codeElement.innerText;
      showCodePreview(codeToPreview, language);
    });
  });
};

// Show code preview in a modal
const showCodePreview = (codeContent, language) => {
  // Create modal if it doesn't exist yet
  let previewModal = document.getElementById("previewModal");
  if (!previewModal) {
    previewModal = document.createElement("div");
    previewModal.id = "previewModal";
    previewModal.className = "preview-modal";
    previewModal.innerHTML = `
      <div class="preview-modal__content">
        <div class="preview-modal__header">
          <h3>Preview</h3>
          <button class="preview-modal__close"><i class='bx bx-x'></i></button>
        </div>
        <div class="preview-modal__body">
          <iframe id="previewFrame" class="preview-modal__frame"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(previewModal);

    // Add close button functionality
    const closeButton = previewModal.querySelector(".preview-modal__close");
    closeButton.addEventListener("click", () => {
      previewModal.classList.remove("show");
    });
  }

  // Populate the iframe with the code
  const previewFrame = document.getElementById("previewFrame");
  const frameDocument =
    previewFrame.contentDocument || previewFrame.contentWindow.document;
  frameDocument.open();

  // Add necessary framework dependencies based on the selected framework
  let frameworkDependencies = "";
  if (selectedFramework === "bootstrap") {
    frameworkDependencies = `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    `;
  } else if (selectedFramework === "tailwind") {
    frameworkDependencies = `
      <script src="https://cdn.tailwindcss.com"></script>
    `;
  } else if (selectedFramework === "mui") {
    // For MUI, we can't really preview in an iframe, so we'll just show the code
    frameworkDependencies = `
      <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="font-family: sans-serif; color: #333;">
          MUI React components cannot be previewed directly in this iframe. 
          Please copy the code and use it in your React application.
        </p>
      </div>
    `;
  }

  frameDocument.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview</title>
      ${frameworkDependencies}
      <style>
        body { padding: 20px; font-family: system-ui, sans-serif; }
      </style>
    </head>
    <body>
      ${
        language === "jsx" || language === "tsx"
          ? `<div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
           <p style="font-family: sans-serif; color: #333;">
             React components cannot be previewed directly in this iframe.
             Please copy the code and use it in your React application.
           </p>
         </div>`
          : codeContent
      }
    </body>
    </html>
  `);
  frameDocument.close();

  // Show the modal
  previewModal.classList.add("show");
};

// Show loading animation during API request
const displayLoadingAnimation = () => {
  const loadingHtml = `
    <div class="message__content">
      <img class="message__avatar" src="assets/Logo.png" alt="AI avatar">
      <p class="message__text"></p>
      <div class="message__loading-indicator">
        <div class="message__loading-bar"></div>
        <div class="message__loading-bar"></div>
        <div class="message__loading-bar"></div>
      </div>
    </div>
    <span onClick="copyMessageToClipboard(this)" class="message__icon hide"><i class='bx bx-copy-alt'></i></span>
  `;

  const loadingMessageElement = createChatMessageElement(
    loadingHtml,
    "message--incoming",
    "message--loading"
  );
  chatHistoryContainer.appendChild(loadingMessageElement);

  requestApiResponse(loadingMessageElement);
};

// Copy message to clipboard
const copyMessageToClipboard = (copyButton) => {
  const messageContent =
    copyButton.parentElement.querySelector(".message__text").innerText;

  navigator.clipboard.writeText(messageContent);
  copyButton.innerHTML = `<i class='bx bx-check'></i>`; // Confirmation icon
  setTimeout(
    () => (copyButton.innerHTML = `<i class='bx bx-copy-alt'></i>`),
    1000
  ); // Revert icon after 1 second
};

// Handle sending chat messages
const handleOutgoingMessage = () => {
  currentUserMessage =
    messageForm.querySelector(".prompt__form-input").value.trim() ||
    currentUserMessage;
  if (!currentUserMessage || isGeneratingResponse) return; // Exit if no message or already generating response

  isGeneratingResponse = true;
  selectedFramework = frameworkSelector.value; // Get selected framework

  const outgoingMessageHtml = `
    <div class="message__content">
      <img class="message__avatar" src="assets/profile.png" alt="User avatar">
      <p class="message__text">${currentUserMessage}</p>
      <p class="message__framework">Framework: ${selectedFramework}</p>
    </div>
  `;

  const outgoingMessageElement = createChatMessageElement(
    outgoingMessageHtml,
    "message--outgoing"
  );
  chatHistoryContainer.appendChild(outgoingMessageElement);

  messageForm.reset(); // Clear input field
  document.body.classList.add("hide-header");
  setTimeout(displayLoadingAnimation, 500); // Show loading animation after delay
};

// Toggle between light and dark themes
themeToggleButton.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");

  // Update icon based on theme
  const newIconClass = isLightTheme ? "bx bx-moon" : "bx bx-sun";
  themeToggleButton.querySelector("i").className = newIconClass;
});

// Clear all chat history
clearChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chat history?")) {
    localStorage.removeItem("saved-ui-generator-chats");

    // Reload chat history to reflect changes
    loadSavedChatHistory();

    currentUserMessage = null;
    isGeneratingResponse = false;
    document.body.classList.remove("hide-header");
  }
});

// Handle click on suggestion items
suggestionItems.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    currentUserMessage = suggestion.querySelector(
      ".suggests__item-text"
    ).innerText;
    handleOutgoingMessage();
  });
});

// Prevent default form submission and handle outgoing message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingMessage();
});

// Load saved chat history on page load
window.addEventListener("DOMContentLoaded", () => {
  loadSavedChatHistory();
});
