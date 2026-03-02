/**
 * HOLLIS ACADEMY | MISSION CONTROL SCRIPT
 * Features: AI Chat with Safety Guardrails & Interactive Detective Quiz
 */

const API_KEY = ''; // <--- Your Gemini API Key

// 1. SAFETY CONFIGURATION
const forbiddenWords = ["password", "address", "phone", "kill", "hate", "dumb", "stupid"]; 

// 2. QUIZ LOGIC
function checkAnswer(choice) {
    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.remove('hidden', 'bg-red-500/20', 'bg-green-500/20', 'text-red-400', 'text-green-400');
    
    if (choice === 1) {
        feedback.innerHTML = "🎯 <strong>MISSION SUCCESS:</strong> You found the Hallucination! Penguins are flightless birds. You have the eyes of a Hollis Detective!";
        feedback.classList.add('bg-green-500/20', 'text-green-400', 'block');
    } else {
        feedback.innerHTML = "❌ <strong>CLUE MISSED:</strong> That is actually a scientific fact. Look closer for the AI's mistake!";
        feedback.classList.add('bg-red-500/20', 'text-red-400', 'block');
    }
}

// 3. INTERACTIVE AI LOGIC (WITH SAFETY SHIELD)
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');

async function askAI() {
    const rawMessage = userInput.value.trim();
    if (!rawMessage) return;

    // --- SAFETY CHECK 1: Local Profanity/Privacy Filter ---
    const containsUnsafe = forbiddenWords.some(word => rawMessage.toLowerCase().includes(word));
    
    addMessage(rawMessage, 'user-msg');
    userInput.value = '';

    if (containsUnsafe) {
        addMessage("Detective, let's keep our communication professional and safe. I cannot answer that.", 'ai-msg');
        return;
    }

    const loadingDiv = addMessage('Consulting Academy Database...', 'ai-msg');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `SYSTEM ROLE: You are the Hollis Academy Mentor. 
                        Target Audience: 3rd to 5th grade students (8-11 years old).
                        Tone: Encouraging, safe, and educational.
                        STRICT RULES: 
                        1. Only discuss AI literacy, science, math, or detective-themed learning.
                        2. If asked for personal info (names, addresses), warn the student about privacy.
                        3. If the topic is inappropriate or unsafe, refuse politely.
                        4. Keep responses under 3 sentences.
                        
                        STUDENT MESSAGE: ${rawMessage}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // --- SAFETY CHECK 2: API Error Handling ---
        if (data.error) {
            loadingDiv.innerText = "Connection lost. Please check with an Academy Instructor.";
            console.error("API Error:", data.error.message);
        } else {
            const aiResponse = data.candidates[0].content.parts[0].text;
            loadingDiv.innerText = aiResponse;
        }

    } catch (error) {
        loadingDiv.innerText = "System error. The Academy firewall blocked the request.";
        console.error("Fetch Error:", error);
    }
}

// 4. HELPER FUNCTIONS
function addMessage(text, className) {
    const div = document.createElement('div');
    div.className = `msg-bubble ${className} animate-in fade-in slide-in-from-bottom-2 duration-300`;
    div.innerText = text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    return div;
}

// 5. EVENT LISTENERS
sendBtn.addEventListener('click', askAI);
userInput.addEventListener('keypress', (e) => { 
    if(e.key === 'Enter') askAI(); 
});