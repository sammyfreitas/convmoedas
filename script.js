// ==========================
// CONFIGURAÇÕES GERAIS
// ==========================
const apiBase = "https://api.frankfurter.app";

// ==========================
// COTAÇÕES MARQUEE (8 moedas em relação ao BRL)
// ==========================
async function carregarCotacoes() {
  try {
    const resposta = await fetch(`${apiBase}/latest?from=BRL&to=USD,EUR,GBP,JPY,CHF,AUD,CAD,CNY`);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    const dados = await resposta.json();
    const taxas = dados.rates;

    const moedas = {
      USD: "Dólar Americano",
      EUR: "Euro",
      GBP: "Libra Esterlina",
      JPY: "Iene Japonês",
      CHF: "Franco Suíço",
      AUD: "Dólar Australiano",
      CAD: "Dólar Canadense",
      CNY: "Yuan Chinês"
    };

    let html = "";
    for (let [sigla, nome] of Object.entries(moedas)) {
      const taxa = taxas[sigla];
      if (taxa) {
        html += `<span><strong>${nome} (${sigla}):</strong> ${taxa.toFixed(2)} </span>`;
      }
    }

    const el = document.getElementById("ticker-marquee");
    if (el) el.innerHTML = html + html + html;
  } catch (erro) {
    console.error("Erro ao carregar cotações:", erro);
    const el = document.getElementById("ticker-marquee");
    if (el) el.innerHTML = "Erro ao carregar as cotações.";
  }
}

// ==========================
// CONVERSOR DE MOEDAS
// ==========================
async function carregarSimbolos() {
  try {
    const res = await fetch(`${apiBase}/currencies`);
    const data = await res.json();

    const moedas = Object.keys(data);
    const selDe = document.getElementById("moedaDe");
    const selPara = document.getElementById("moedaPara");

    if (!selDe || !selPara) return;

    selDe.innerHTML = "";
    selPara.innerHTML = "";

    moedas.forEach(m => {
      selDe.add(new Option(`${m} - ${data[m]}`, m));
      selPara.add(new Option(`${m} - ${data[m]}`, m));
    });

    selDe.value = "BRL";
    selPara.value = "USD";
  } catch (err) {
    console.error("Erro ao carregar moedas:", err);
  }
}

async function converter() {
  const valor = parseFloat(document.getElementById("valor").value);
  const de = document.getElementById("moedaDe").value;
  const para = document.getElementById("moedaPara").value;
  const resultado = document.getElementById("resultado");

  if (!valor || valor <= 0) {
    resultado.innerText = "Digite um valor válido.";
    return;
  }

  try {
    const res = await fetch(`${apiBase}/latest?amount=${valor}&from=${de}&to=${para}`);
    const data = await res.json();

    if (data && data.rates && data.rates[para]) {
      resultado.innerText = `${valor} ${de} = ${data.rates[para].toFixed(2)} ${para}`;
    } else {
      resultado.innerText = "Conversão não disponível.";
    }
  } catch (err) {
    console.error("Erro na conversão:", err);
    resultado.innerText = "Erro na conversão.";
  }
}

// ==========================
// NOTÍCIAS (API pública gratuita)
// ==========================
let currentSlide = 0;

async function carregarNoticiasGratis() {
  const endpoint = "https://saurav.tech/NewsAPI/top-headlines/category/business/us.json";
  const carousel = document.getElementById("carousel");

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    // Limpa conteúdo anterior
    carousel.innerHTML = "";

    const noticias = data.articles || [];
    noticias.slice(0, 8).forEach(noticia => {
      const card = document.createElement("div");
      card.className = "card-noticia";

      const imagem = noticia.urlToImage || "https://via.placeholder.com/250x150?text=No+Image";

      card.innerHTML = `
        <img src="${imagem}" alt="Notícia">
        <div class="conteudo">
          <h3>${noticia.title}</h3>
          <a href="${noticia.url}" target="_blank">Ler mais</a>
        </div>
      `;
      carousel.appendChild(card);
    });

    iniciarCarrossel();
  } catch (err) {
    console.error("Erro ao carregar notícias:", err);
    carousel.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
  }
}

function iniciarCarrossel() {
  const carousel = document.getElementById("carousel");
  const cards = document.querySelectorAll(".card-noticia");
  if (!cards.length) return;

  const cardWidth = cards[0].offsetWidth + 20; // largura + margin
  const visibleCards = Math.floor(carousel.parentElement.offsetWidth / cardWidth);

  function atualizarSlide() {
    const offset = -(currentSlide * cardWidth);
    carousel.style.transform = `translateX(${offset}px)`;
  }

  document.querySelector(".carousel-btn.prev").onclick = () => {
    currentSlide = Math.max(currentSlide - 1, 0);
    atualizarSlide();
  };
  document.querySelector(".carousel-btn.next").onclick = () => {
    currentSlide = Math.min(currentSlide + 1, cards.length - visibleCards);
    atualizarSlide();
  };

  setInterval(() => {
    currentSlide = (currentSlide + 1) % (cards.length - visibleCards + 1);
    atualizarSlide();
  }, 3000);
}

// ==========================
// FORMULÁRIO DE CONTATO → WhatsApp
// ==========================
function configurarContato() {
  const contactForm = document.querySelector("#contato form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Preencha todos os campos!");
      return;
    }

    const phoneNumber = "5521986140005";
    const text = `Olá! Meu nome é ${name} (${email}).\nMensagem: ${message}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
    contactForm.reset();
  });
}

// ==========================
// INICIALIZAÇÃO GERAL
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  carregarCotacoes();
  setInterval(carregarCotacoes, 600000); // Atualiza a cada 10 min

  carregarSimbolos();
  carregarNoticiasGratis();
  configurarContato();
});
