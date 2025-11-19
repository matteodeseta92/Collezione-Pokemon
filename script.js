// ===== Funzioni comuni ===== 
async function loadJSON(file) {
  try {
    const res = await fetch(file);
    return await res.json();
  } catch (err) {
    console.error("Errore caricamento JSON:", err);
    return [];
  }
}

// ===== LOCAL STORAGE =====
function saveCardsState(cards) {
  localStorage.setItem("cardsState", JSON.stringify(cards));
}
function loadCardsState() {
  const data = localStorage.getItem("cardsState");
  return data ? JSON.parse(data) : null;
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const current = localStorage.getItem("theme") || "light";
  document.body.classList.remove("light", "dark");
  document.body.classList.add(current);
  toggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// ===== HOME PAGE =====
async function renderHome() {
  initThemeToggle();
  const setsData = await loadJSON('sets.json');
  let cardsData = loadCardsState();
  if (!cardsData) cardsData = await loadJSON('cards.json');

  const eras = {};
  setsData.forEach(set => {
    if (!eras[set.Era]) eras[set.Era] = [];
    eras[set.Era].push(set);
  });

  const content = document.getElementById("content");
  content.innerHTML = "";

  for (let era in eras) {
    const eraBox = document.createElement("div");
    eraBox.className = "era-container";

    const title = document.createElement("div");
    title.className = "era-title";

    const gif = document.createElement("img");
    gif.src = "assets/home_pikachu.gif";
    gif.className = "tiny-gif";
    gif.alt = "";

    title.appendChild(gif);
    title.appendChild(document.createTextNode(" " + era));
    eraBox.appendChild(title);

    eras[era].forEach(set => {
      const card = document.createElement("div");
      card.className = "set-card";

      const info = document.createElement("div");
      info.className = "set-info";

      const img = document.createElement("img");
      img.src = `assets/${set.Nome_Logo}`;
      img.alt = set.Nome_Set;
      img.onerror = () => { img.style.display = 'none'; };

      const name = document.createElement("div");
      name.textContent = set.Nome_Set;

      info.appendChild(img);
      info.appendChild(name);

      const progress = document.createElement("div");
      progress.className = "progress";

      const possedute = cardsData.filter(c => c.ID_Set === set.ID && c.Posseduta).length;
      const totale = set.Totale_Carte || 0;
      const perc = totale ? Math.round((possedute / totale) * 100) : 0;

      const bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.style.width = perc + "%";

      const barText = document.createElement("div");
      barText.className = "progress-text";
      barText.textContent = `${possedute} / ${totale}`;

      progress.appendChild(bar);
      progress.appendChild(barText);

      card.appendChild(info);
      card.appendChild(progress);

      card.onclick = () => {
        window.location.href = `set.html?set=${encodeURIComponent(set.Nome_Set)}`;
      };

      eraBox.appendChild(card);
    });

    content.appendChild(eraBox);
  }
}

// ===== SET PAGE =====
async function renderSet() {
  initThemeToggle();
  const urlParams = new URLSearchParams(window.location.search);
  const setName = urlParams.get('set');
  const setsData = await loadJSON('sets.json');

  let cardsData = loadCardsState();
  if (!cardsData) cardsData = await loadJSON('cards.json');

  const set = setsData.find(s => s.Nome_Set === setName);
  if (!set) {
    document.getElementById("content").innerHTML = "<p>Set non trovato!</p>";
    return;
  }

  document.getElementById("set-title").textContent = set.Nome_Set;

  // ---- LOGO ALTERNATIVO + GIF ----
  const altLogoBox = document.getElementById("set-alt-logo-container");
  altLogoBox.innerHTML = "";

  const firstCardWithLogo = cardsData.find(c => c.ID_Set === set.ID && c.Logo_Alternativo);

  if (firstCardWithLogo?.Logo_Alternativo) {
    const wrapper = document.createElement("div");
    wrapper.className = "alt-logo-wrapper";

    const img = document.createElement("img");
    img.className = "set-alt-logo";
    img.src = `img/${firstCardWithLogo.Logo_Alternativo}`;
    img.alt = `Logo alternativo ${set.Nome_Set}`;
    img.onerror = () => { img.style.display = 'none'; };

    const gif = document.createElement("img");
    gif.src = "assets/sets_pikachu.gif";
    gif.className = "tiny-gif-set";
    gif.alt = "";

    wrapper.appendChild(img);
    wrapper.appendChild(gif);
    altLogoBox.appendChild(wrapper);
  }

  // ---- CARTE ----
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";

  const cardsOfSet = cardsData.filter(c => c.ID_Set === set.ID);

  cardsOfSet.forEach(c => {
    const cardWrap = document.createElement("div");
    cardWrap.className = "card-wrap";

    const cardDiv = document.createElement("div");
    cardDiv.className = "card-item";

    const imgBox = document.createElement("div");
    imgBox.className = "card-img-box";

    const imgEl = document.createElement("img");
    imgEl.className = "card-img";
    imgEl.alt = c.Nome_Carta;

    // --- LOGICA IMMAGINI ---
    if (c.Posseduta === false) {
      imgEl.src = `cardsimg/card_false.png`;
      imgEl.onerror = () => { imgEl.style.display = 'none'; };
      imgBox.appendChild(imgEl);

    } else {
      if (c.Logo_Carta && c.Logo_Carta !== "none") {
        imgEl.src = `cardsimg/${c.Logo_Carta}`;
        imgEl.onerror = () => {
          imgEl.style.display = 'none';
          imgBox.classList.add('card-placeholder-green');
        };
        imgBox.appendChild(imgEl);

      } else {
        imgBox.classList.add('card-placeholder-green');
      }
    }

    // CAPTION (nome + numero)
    const caption = document.createElement("div");
    caption.className = "card-caption";

    const nameLine = document.createElement("div");
    nameLine.className = "card-name";
    nameLine.textContent = c.Nome_Carta;

    const numberLine = document.createElement("div");
    numberLine.className = "card-number";
    numberLine.textContent = c.Numero_Carta;

    caption.appendChild(nameLine);
    caption.appendChild(numberLine);

    cardDiv.appendChild(imgBox);
    cardDiv.appendChild(caption);

    // effetto click (non modifica dati)
    cardDiv.addEventListener('click', () => {
      cardDiv.classList.add('card-clicked');
      setTimeout(() => cardDiv.classList.remove('card-clicked'), 120);
    });

    cardWrap.appendChild(cardDiv);
    cardsContainer.appendChild(cardWrap);
  });
}