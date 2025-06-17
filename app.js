// Config
const JSON_URL = "./public/cards.json"; // Cambia se necessario

let cards = [];
let selectedCards = [];
let filters = { dominio: "", livello: "" };
let allCardsVisible = true;
let sortMode = "livello-asc";

// Helpers storage
function saveSelected() {
  localStorage.setItem("selectedCards", JSON.stringify(selectedCards));
}
function loadSelected() {
  selectedCards = JSON.parse(localStorage.getItem("selectedCards") || "[]");
}

// Caricamento JSON
async function loadCards() {
  const res = await fetch(JSON_URL);
  cards = await res.json();
  renderFilters();
  renderCards();
  renderSelected();
  updateToggleButton();
}

// Filtri dinamici + Sorting
function renderFilters() {
  const domini = [...new Set(cards.map(c => c.dominio))];
  const livelli = [...new Set(cards.map(c => c.livello))].sort((a, b) => a - b);

  let html = `
    <select id="dominio-filter" class="form-select mb-2">
      <option value="">Tutti i domini</option>
      ${domini.map(dom => `<option>${dom}</option>`).join("")}
    </select>
    <select id="livello-filter" class="form-select mb-2">
      <option value="">Tutti i livelli</option>
      ${livelli.map(lvl => `<option>${lvl}</option>`).join("")}
    </select>
    <select id="sort-mode" class="form-select mb-2">
      <option value="livello-asc">Livello crescente</option>
      <option value="livello-desc">Livello decrescente</option>
      <option value="nome">Nome (A→Z)</option>
    </select>
  `;
  document.getElementById("filter-panel").innerHTML = html;

  document.getElementById("dominio-filter").onchange = (e) => {
    filters.dominio = e.target.value;
    renderCards();
  };
  document.getElementById("livello-filter").onchange = (e) => {
    filters.livello = e.target.value;
    renderCards();
  };
  document.getElementById("sort-mode").onchange = (e) => {
    sortMode = e.target.value;
    renderCards();
  };
}

// Rendering delle card (TUTTE non selezionate)
function renderCards() {
  if (!allCardsVisible) {
    document.getElementById("all-cards-section").style.display = "none";
    return;
  } else {
    document.getElementById("all-cards-section").style.display = "";
  }

  let filtered = cards.filter(card => {
    if (selectedCards.includes(card.id)) return false;
    if (filters.dominio && card.dominio !== filters.dominio) return false;
    if (filters.livello && card.livello !== Number(filters.livello)) return false;
    return true;
  });

  // Ordinamento
  if (sortMode === "livello-asc") {
    filtered.sort((a, b) => a.livello - b.livello);
  } else if (sortMode === "livello-desc") {
    filtered.sort((a, b) => b.livello - a.livello);
  } else if (sortMode === "nome") {
    filtered.sort((a, b) => a.titolo.localeCompare(b.titolo));
  }

  document.getElementById("card-list").innerHTML = filtered.length
    ? filtered.map(card => `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow card-border-top" style="--border-top-color:${getDominioColor(card.dominio)};">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge rounded-pill" style="background:${getDominioColor(card.dominio)};color:#fff;">${card.dominio}</span>
              <span class="badge bg-light text-dark border ms-1">Livello ${card.livello}</span>
            </div>
            <h5 class="card-title">${card.titolo}</h5>
            <div class="mb-2">
              <span class="badge bg-secondary">${card.categoria}</span>
              <span class="badge bg-warning text-dark ms-1">Costo: ${card.costo}</span>
            </div>
            <p class="card-text small">${card.descrizione}</p>
            <button class="btn btn-primary"
                    onclick="toggleSelect('${card.id}')">
              Seleziona
            </button>
          </div>
        </div>
      </div>
    `).join("")
    : '<p class="text-muted">Nessuna card trovata.</p>';
}

// Rendering Area Selezionate
function renderSelected() {
  let selected = cards.filter(card => selectedCards.includes(card.id));
  document.getElementById("selected-area").innerHTML = selected.length
    ? selected.map(card => `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow card-border-top" style="--border-top-color:${getDominioColor(card.dominio)};">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge rounded-pill" style="background:${getDominioColor(card.dominio)};color:#fff;">${card.dominio}</span>
              <span class="badge bg-light text-dark border ms-1">Livello ${card.livello}</span>
            </div>
            <h5 class="card-title">${card.titolo}</h5>
            <div class="mb-2">
              <span class="badge bg-secondary">${card.categoria}</span>
              <span class="badge bg-warning text-dark ms-1">Costo: ${card.costo}</span>
            </div>
            <p class="card-text small">${card.descrizione}</p>
            <button class="btn btn-danger" onclick="toggleSelect('${card.id}')">Rimuovi</button>
          </div>
        </div>
      </div>
    `).join("")
    : '<p class="text-muted">Nessuna card selezionata.</p>';
}

// Selezione / rimozione card
window.toggleSelect = function(id) {
  if (selectedCards.includes(id)) {
    selectedCards = selectedCards.filter(cid => cid !== id);
  } else {
    selectedCards.push(id);
  }
  saveSelected();
  renderCards();
  renderSelected();
};

// Bottone toggle mostra/nascondi tutte le carte
function updateToggleButton() {
  const btn = document.getElementById("toggle-all-btn");
  btn.textContent = allCardsVisible ? "Nascondi tutte le carte" : "Mostra tutte le carte";
}
function setupToggle() {
  document.getElementById("toggle-all-btn").onclick = () => {
    allCardsVisible = !allCardsVisible;
    renderCards();
    updateToggleButton();
  };
}

// Bottone reset selezione
function setupReset() {
  document.getElementById("reset-btn").onclick = () => {
    selectedCards = [];
    saveSelected();
    renderCards();
    renderSelected();
  };
}

// Colore bordo in base al dominio
function getDominioColor(dominio) {
  switch (dominio) {
    case "Arcano":      return "#835493";
    case "Spada":       return "#b63f37";
    case "Ossa":        return "#d6e2e9";
    case "Codex":       return "#2b5e99";
    case "Grazia":      return "#c94e8e";
    case "Mezzanotte":  return "#3f4344";
    case "Saggio":      return "#1b7d48";
    case "Splendore":   return "#eacb27";
    case "Valore":      return "#d97326";
    default:            return "#888";
  }
}

// Avvio app
window.onload = () => {
  loadSelected();
  loadCards();
  setupToggle();
  setupReset();
};
