const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const suggestionsEl = document.getElementById("suggestions");

// ---------------------------------------------------------------------------
// MOCK: respostas falsas enquanto a API do ChatGPT não está conectada.
// ---------------------------------------------------------------------------
const mockResponses = [
    {
        keywords: ["terror", "medo", "horror", "assustador"],
        answers: [
            "Para terror, recomendo \"Hereditário\" (2018). É perturbador do começo ao fim! 👻",
            "Que tal \"Corra!\" (2017), do Jordan Peele? Terror com crítica social, imperdível.",
            "Um clássico: \"O Iluminado\" (1980). Kubrick + Jack Nicholson = pesadelos garantidos.",
        ],
    },
    {
        keywords: ["comédia", "comedia", "rir", "engraçado", "leve"],
        answers: [
            "Para dar risada: \"Superbad\" (2007). Leve e muito divertido! 😂",
            "Recomendo \"O Grande Hotel Budapeste\" (2014): comédia charmosa e visualmente linda.",
            "\"Curtindo a Vida Adoidado\" (1986) é perfeito para um dia leve.",
        ],
    },
    {
        keywords: ["batman", "herói", "heroi", "super"],
        answers: [
            "Se você gosta de Batman, assista \"Coringa\" (2019) e a trilogia \"O Cavaleiro das Trevas\". 🦇",
            "\"The Batman\" (2022) tem uma pegada de filme de detetive. Combina com \"Seven\" (1995)!",
            "Fãs de Batman costumam curtir \"Watchmen\" (2009), um olhar mais sombrio sobre heróis.",
        ],
    },
    {
        keywords: ["romance", "amor", "romântico", "romantico"],
        answers: [
            "Para um romance: \"Antes do Amanhecer\" (1995). Só diálogo, e é maravilhoso. 💕",
            "\"La La Land\" (2016) mistura romance e musical de um jeito inesquecível.",
        ],
    },
    {
        keywords: ["ficção", "ficcao", "sci-fi", "espaço", "espaco"],
        answers: [
            "\"Interestelar\" (2014) é obrigatório para quem gosta de ficção científica. 🚀",
            "Recomendo \"A Chegada\" (2016): ficção científica inteligente e emocionante.",
        ],
    },
    {
        keywords: ["curiosidade", "fato", "sabia"],
        answers: [
            "Curiosidade: em \"Titanic\" (1997), o desenho da Rose foi feito pelo próprio James Cameron. 🎨",
            "Sabia que o som dos velociraptors em \"Jurassic Park\" veio, em parte, de tartarugas acasalando? 🦖",
            "Em \"O Senhor dos Anéis\", Viggo Mortensen quebrou dois dedos do pé ao chutar um capacete, e a cena ficou no filme!",
        ],
    },
];

const fallbackAnswers = [
    "Boa pergunta! Ainda estou aprendendo, mas posso te indicar algo se você me disser um gênero. 🎬",
    "Hmm, não tenho certeza... Que tal me dizer se prefere ação, comédia, terror ou romance?",
    "Interessante! Enquanto penso nisso, uma dica: \"Cidade de Deus\" (2002) é sempre uma ótima escolha.",
];

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function getMockResponse(message) {
    const text = message.toLowerCase();
    const match = mockResponses.find((r) => r.keywords.some((k) => text.includes(k)));
    const answer = match ? pickRandom(match.answers) : pickRandom(fallbackAnswers);

    // Simula o tempo de resposta de uma API
    const delay = 800 + Math.random() * 1000;
    return new Promise((resolve) => setTimeout(() => resolve(answer), delay));
}

// ---------------------------------------------------------------------------
// Função que obtém a resposta do bot.
// Quando a View com o ChatGPT estiver pronta, troque o mock por um fetch, ex.:
//
  async function getBotResponse(message) {
      const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
      const response = await fetch("/bot/", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ message: message }),
      });
      const data = await response.json();
      return data.reply;
  }
// ---------------------------------------------------------------------------
// async function getBotResponse(message) {
//     return getMockResponse(message);
// }

// ---------------------------------------------------------------------------
// Interface do chat
// ---------------------------------------------------------------------------
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${sender}`;
    avatar.textContent = sender === "bot" ? "🎬" : "Eu";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    message.append(avatar, bubble);
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return message;
}

function showTyping() {
    const message = document.createElement("div");
    message.className = "message bot";
    message.innerHTML = `
        <div class="avatar bot">🎬</div>
        <div class="bubble typing"><span></span><span></span><span></span></div>
    `;
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return message;
}

async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    suggestionsEl.style.display = "none";

    const typing = showTyping();
    try {
        const reply = await getBotResponse(text);
        typing.remove();
        addMessage(reply, "bot");
    } catch (error) {
        typing.remove();
        addMessage("Ops! Algo deu errado. Tente novamente. 🎞️", "bot");
        console.error(error);
    } finally {
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
});

suggestionsEl.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => sendMessage(button.textContent));
});
