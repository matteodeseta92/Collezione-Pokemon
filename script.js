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

// ===== HOME PAGE =====
async function renderHome() {
  const setsData = await loadJSON('sets.json');
  let cardsData = loadCardsState();
  if (!cardsData) cardsData = await loadJSON('cards.json');

  // Raggruppa per era
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
    title.textContent = era;
    eraBox.appendChild(title);

    eras[era].forEach(set => {
      const card = document.createElement("div");
      card.className = "set-card";

      const info = document.createElement("div");
      info.className = "set-info";

      const img = document.createElement("img");
      img.src = `assets/${set.Nome_Logo}`;
      img.alt = set.Nome_Set;

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
      bar.textContent = `${possedute} / ${totale}`;

      progress.appendChild(bar);

      card.appendChild(info);
      card.appendChild(progress);

      // click -> apri pagina set
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
  const urlParams = new URLSearchParams(window.location.search);
  const setName = urlParams.get('set');
  const setsData = await loadJSON('sets.json');

  // Carica dati carte salvati o originali
  let cardsData = loadCardsState();
  if (!cardsData) cardsData = await loadJSON('cards.json');

  const set = setsData.find(s => s.Nome_Set === setName);
  if (!set) {
    document.getElementById("content").innerHTML = "<p>Set non trovato!</p>";
    return;
  }

  document.getElementById("set-title").textContent = set.Nome_Set;

  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";

  cardsData
    .filter(c => c.ID_Set === set.ID)
    .forEach(c => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card-item";
      if (c.Posseduta) cardDiv.classList.add("posseduta");

      // Numero e nome carta
      cardDiv.innerHTML = `<div style="font-size:14px; margin-bottom:5px;">#${c.Numero_Carta}</div>
                           <div>${c.Nome_Carta}</div>`;

      // click -> toggle posseduta e salva su localStorage
      cardDiv.onclick = () => {
        c.Posseduta = !c.Posseduta;
        cardDiv.classList.toggle("posseduta");
        saveCardsState(cardsData);

        // Aggiorna anche la progress bar se torni alla home
        const progressBar = document.querySelector(`.set-card .progress-bar`);
        if (progressBar) {
          const possedute = cardsData.filter(card => card.ID_Set === set.ID && card.Posseduta).length;
          const totale = set.Totale_Carte || 0;
          const perc = totale ? Math.round((possedute / totale) * 100) : 0;
          progressBar.style.width = perc + "%";
          progressBar.textContent = `${possedute} / ${totale}`;
        }
      };

      cardsContainer.appendChild(cardDiv);
    });
}
