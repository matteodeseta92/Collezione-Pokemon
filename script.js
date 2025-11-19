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

/* ============================================================
   ======================= HOME PAGE ===========================
   ============================================================ */
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
      img.className = "set-logo-small";   // ⭐ LOGHI PICCOLI
      img.onerror = () => img.style.display = "none";

      const name = document.createElement("div");
      name.textContent = set.Nome_Set;

      info.appendChild(img);
      info.appendChild(name);

      const progress = document.createElement("div");
      progress.className = "progress";

      const possedute = cardsData.filter(c => c.ID_Set === set.ID && c.Posseduta).length;
      const totale = set.Totale_Carte || 0;

      const bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.style.width = (totale ? (possedute / totale) * 100 : 0) + "%";

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

/* ============================================================
   =======================   SET PAGE  =========================
   ============================================================ */
async function renderSet() {
  initThemeToggle();

  const urlParams = new URLSearchParams(window.location.search);
  const setName = urlParams.get('set');

  const setsData = await loadJSON('sets.json');
  let cardsData = loadCardsState();
  if (!cardsData) cardsData = await loadJSON('cards.json');

  const set = setsData.find(s => s.Nome_Set === setName);
  if (!set) return;

  document.getElementById("set-title").textContent = set.Nome_Set;

  // LOGO ALTERNATIVO
  const altBox = document.getElementById("set-alt-logo-container");
  altBox.innerHTML = "";

  const firstLogo = cardsData.find(c => c.ID_Set === set.ID && c.Logo_Alternativo);
  if (firstLogo?.Logo_Alternativo) {
    const wrap = document.createElement("div");
    wrap.className = "alt-logo-wrapper";

    const img = document.createElement("img");
    img.className = "set-alt-logo";
    img.src = `img/${firstLogo.Logo_Alternativo}`;
    img.onerror = () => img.style.display = "none";

    const gif = document.createElement("img");
    gif.src = "assets/sets_pikachu.gif";
    gif.className = "tiny-gif-set";

    wrap.appendChild(img);
    wrap.appendChild(gif);
    altBox.appendChild(wrap);
  }

  // CARTE
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const cards = cardsData.filter(c => c.ID_Set === set.ID);

  cards.forEach(c => {
    const wrap = document.createElement("div");
    wrap.className = "card-wrap";

    const card = document.createElement("div");
    card.className = "card-item";

    // Box immagine
    const box = document.createElement("div");
    box.className = "card-img-box";

    const img = document.createElement("img");
    img.className = "card-img";
    img.alt = c.Nome_Carta;

    if (c.Posseduta === false) {
    imgEl.src = "cardsimg/card_false.png";
    imgEl.onerror = () => { imgEl.style.display = 'none'; };
    imgBox.appendChild(imgEl);
} else {
    if (c.Logo_Carta) {
        imgEl.src = `cardsimg/${c.Logo_Carta}`;
        imgEl.onerror = () => { 
            imgEl.style.display = 'none'; 
            imgBox.classList.add('card-placeholder-green'); 
        };
        imgBox.appendChild(imgEl);
    } else {
        // nessuna immagine fornita ma posseduta -> riquadro stesso size
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.background = '#444'; // colore scuro neutro Pokémon style
        imgBox.appendChild(placeholder);
    }
}

    // Caption
    const caption = document.createElement("div");
    caption.className = "card-caption";

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = c.Nome_Carta;

    const number = document.createElement("div");
    number.className = "card-number";
    number.textContent = c.Numero_Carta;

    caption.appendChild(name);
    caption.appendChild(number);

    card.appendChild(box);
    card.appendChild(caption);

    wrap.appendChild(card);
    container.appendChild(wrap);
  });
}
