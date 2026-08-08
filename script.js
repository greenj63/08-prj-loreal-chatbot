/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Worker URL
const workerURL = "https://loreal-chatbot.jgreene6801.workers.dev/";

// System message
const directions = {
  role: "system",
  content:
    "You are a Smart Product Advisor for L'Oreal. You will only answer questions related to L'Oreal products, routines, and recommendations. If the user asks unrelated questions, state that you cannot help with that area and guide them to L'Oreal instead. When mentioning products, be specific and try to include a specific L'Oreal product name. Keep your responses concise and straight to the point.",
};

// Message history
const messages = JSON.parse(localStorage.getItem("chatHistory")) || [
  directions,
];
console.log(messages);

// Set initial message
addAssistantMessage("👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Send the chatbot the message from user input
  sendMessage();
});

// Takes a message from the user and fetches an answer from the L'Oreal Chatbot
// Saves this interaction to the chat history and returns only the response.
async function generateResponse(msg) {
  // Add the user message to the messages array
  messages.push({ role: "user", content: msg });

  // Fetch a response from the chatbot
  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    // Check if the response was ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response
    const result = await response.json();

    // Get the chatbot reply
    const reply = result.choices[0].message.content;

    // Add reply to chat history
    messages.push({ role: "assistant", content: reply });

    // Save chat history
    localStorage.setItem("chatHistory", JSON.stringify(messages));

    // Return the reply
    return reply;
  } catch (err) {
    // log the error
    console.error(err);
  }
  return "Error generating reply. Please try again later";
}

async function sendMessage() {
  // Save the user message
  const userMsg = userInput.value;

  // place the user message in a bubble within the chatbox
  addUserMessage(userMsg);

  // get the chatbot reply
  addThinkingMessage();
  const reply = await generateResponse(userMsg);

  // Add an assistant chat bubble with the reply
  removeThinkingMessage();
  addAssistantMessage(reply);

  console.log(reply);
}

// Generates a user message bubble with the content stored in msg
function addUserMessage(msg) {
  // generate a user messages section
  const userMessages = document.createElement("div");
  userMessages.classList.add("messages", "user");

  // generate a message bubble
  const bubble = document.createElement("p");
  bubble.classList.add("bubble");
  bubble.textContent = msg;

  // put elements inside the chatbox
  userMessages.appendChild(bubble);
  chatWindow.appendChild(userMessages);
}

// Generates an assistant message bubble with the content stored in msg
async function addAssistantMessage(msg, classes = null) {
  // generate an assistant messages section
  const assistantMessages = document.createElement("div");
  assistantMessages.classList.add("messages", "ai");

  // add special classes to the message
  if (classes != null) {
    assistantMessages.classList.add(classes);
  }

  // generate an assistant reply bubble
  const bubble = document.createElement("p");
  bubble.classList.add("bubble");
  bubble.textContent = msg;

  // put elements inside the chatbox
  assistantMessages.appendChild(bubble);
  chatWindow.appendChild(assistantMessages);
}

// Adds a thinking message bubble for the AI
function removeThinkingMessage() {
  // select the first thinking message and remove it
  document.querySelector(".thinking-msg").remove();
}

// Removes the AI thinking message bubble
function addThinkingMessage() {
  addAssistantMessage(". . .", "thinking-msg");

}
