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

// Set initial message
addThinkingMessage();
setTimeout(() => {
  removeThinkingMessage();
  addAssistantMessage("👋 Hello! How can I help you today?");
}, 600);

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

function sendMessage() {
  // Save the user message
  const userMsg = userInput.value;

  // Clear input and chatbox
  userInput.value = "";
  chatWindow.innerHTML = "";

  // place the user message in a bubble within the chatbox
  addUserMessage(userMsg);

  // wait for a short amount of time before reply for realism
  setTimeout(async () => {
    // get the chatbot reply
    addThinkingMessage();
    const reply = await generateResponse(userMsg);

    // Add an assistant chat bubble with the reply
    removeThinkingMessage();
    addAssistantMessage(reply);
  }, 700);
}

// Generates a user message bubble with the content stored in msg
function addUserMessage(msg) {
  // generate a user messages section
  const userMessages = document.createElement("div");
  userMessages.classList.add("messages", "user");

  // generate a message bubble
  const bubble = document.createElement("p");
  bubble.classList.add("bubble");
  bubble.innerHTML = stylizeToHTML(msg);

  // put elements inside the chatbox
  userMessages.appendChild(bubble);
  // start in the "enter" state then trigger the show state for animation
  userMessages.classList.add("enter");
  chatWindow.appendChild(userMessages);

  // trigger the transition on the next frame
  requestAnimationFrame(() => {
    userMessages.classList.add("show");
    userMessages.classList.remove("enter");
  });
}

// Generates an assistant message bubble with the content stored in msg
async function addAssistantMessage(msg) {
  // generate an assistant messages section
  const assistantMessages = document.createElement("div");
  assistantMessages.classList.add("messages", "ai");

  // generate an assistant reply bubble
  const bubble = document.createElement("p");
  bubble.classList.add("bubble");
  bubble.innerHTML = stylizeToHTML(msg);

  // put elements inside the chatbox
  assistantMessages.appendChild(bubble);

  // start in the "enter" state then trigger the show state for animation
  assistantMessages.classList.add("enter");
  chatWindow.appendChild(assistantMessages);

  // trigger the transition on the next frame
  requestAnimationFrame(() => {
    assistantMessages.classList.add("show");
    assistantMessages.classList.remove("enter");
  });
}

// Removes the AI thinking message bubble
function removeThinkingMessage() {
  // select the first thinking message and remove it
  const el = document.querySelector(".thinking-msg");
  if (!el) return;
  // stop interval if present
  const intervalId = el._thinkingIntervalId;
  if (intervalId) clearInterval(intervalId);
  el.remove();
}

// Adds a thinking message bubble for the AI
function addThinkingMessage() {
  // create the thinking element with per-letter spans
  const text = ". . .";
  const wrapper = document.createElement("div");
  wrapper.classList.add("messages", "ai", "thinking-msg");

  const bubble = document.createElement("p");
  bubble.classList.add("bubble");

  const thinking = document.createElement("span");
  thinking.classList.add("thinking");

  // create a span per letter
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.classList.add("letter");
    span.textContent = text[i];
    thinking.appendChild(span);
  }

  bubble.appendChild(thinking);
  wrapper.appendChild(bubble);

  // start in the "enter" state then trigger the show state for animation
  wrapper.classList.add("enter");
  chatWindow.appendChild(wrapper);

  requestAnimationFrame(() => {
    wrapper.classList.add("show");
    wrapper.classList.remove("enter");
  });

  // animate letters in sequence
  const letters = thinking.querySelectorAll(".letter");
  let idx = 0;
  // ensure at least one letter
  if (letters.length === 0) return;

  const intervalId = setInterval(() => {
    // remove active from previous
    letters.forEach((l) => l.classList.remove("active"));
    // set active on current
    letters[idx].classList.add("active");
    idx = (idx + 1) % letters.length;
  }, 260);

  // store interval id so remove can clear it
  wrapper._thinkingIntervalId = intervalId;
}

// Converts text to HTML code with appropriate styling.
// ** -> bold
// *  -> italic
// __ -> underlined
function stylizeToHTML(txt) {
  if (!txt || typeof txt !== "string") return txt;

  // Replace bold (**text**) first
  // Use non-greedy match so multiple pairs are handled
  txt = txt.replace(/\*\*(.+?)\*\*/g, (m, p1) => {
    return `<span class="stylized-bold">${p1}</span>`;
  });

  // Then replace italic (*text*)
  txt = txt.replace(/\*(.+?)\*/g, (m, p1) => {
    return `<span class="stylized-italic">${p1}</span>`;
  });

  // Finally replace underline (__text__)
  txt = txt.replace(/__(.+?)__/g, (m, p1) => {
    return `<span class="stylized-underline">${p1}</span>`;
  });

  return txt;
}
