let pokemonData = [];
let currentIndex = 0;

let draggedElement = null;
let placeholder = null;


// ----------------------
// Storage key helper
// ----------------------
function storageKey() {
  return `tierlist_gen_${CURRENT_GENERATION}`;
}

function normalizeSpriteURL(url) {
  if (!url) {
    console.warn("Missing sprite URL for Pokémon");
    return "/static/images/placeholder.png"; // optional fallback
  }
  return url; // just return the API URL directly
}


// ----------------------
// Load from localStorage
// ----------------------
function loadTierListFromStorage() {
  const saved = localStorage.getItem(storageKey());
  if (!saved) return false;

  try {
    const parsed = JSON.parse(saved);

    document.querySelectorAll(".tier-content").forEach(t => t.innerHTML = "");

    for (const [tierId, arr] of Object.entries(parsed)) {
      const container = document.querySelector(`#${tierId} .tier-content`);
      if (!container) continue;

      arr.forEach(p => {
        const wrapper = createPokemonWrapper(p);
        container.appendChild(wrapper);
      });
    }

    updateGlobalRanks();
    currentIndex = Object.values(parsed).flat().length;
    updatePositionDisplay();
    return true;

  } catch (err) {
    console.error("Failed to load saved tier list:", err);
    return false;
  }
}

// ----------------------
// Save
// ----------------------
function saveTierListToStorage() {
  const result = {};
  document.querySelectorAll(".tier").forEach(t => {
    const tierId = t.id;
    const wrappers = [...t.querySelectorAll(".pokemon-wrapper")];
    result[tierId] = wrappers.map(w => ({
      id: parseInt(w.dataset.pokemonId),
      name: w.dataset.pokemonName,
      sprite_url: normalizeSpriteURL(w.dataset.pokemonSprite)
    }));
  });
  localStorage.setItem(storageKey(), JSON.stringify(result));
}

// ----------------------
// Reset
// ----------------------
async function resetCurrentTierList() {
  localStorage.removeItem(storageKey());
  document.querySelectorAll(".tier-content").forEach(t => t.innerHTML = "");
  currentIndex = 0;
  showCurrentPokemon();

  if (USER_LOGGED_IN) {
    await fetch("/save_tierlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierlist: "{}" }) // clears server tierlist
    });
  }
}



// -------------------------------------------------------------
// Load Pokémon list
// -------------------------------------------------------------
async function loadPokemon() {
  try {
    const res = await fetch(`/api/pokemon?gen=${CURRENT_GENERATION}`);
    pokemonData = await res.json();

    if (!pokemonData || pokemonData.length === 0) {
      document.getElementById('current-name').textContent = "No Pokémon";
      document.getElementById('current-image').src = "";
      return;
    }

    currentIndex = 0; // we’ll manage index in loadTierListFromStorage or server
    showCurrentPokemon();
  } catch (err) {
    console.error("Failed to load Pokémon:", err);
  }
}


// -------------------------------------------------------------
// Side panel
// -------------------------------------------------------------
function showCurrentPokemon() {
  const nameEl = document.getElementById('current-name');
  const imgEl = document.getElementById('current-image');
  const posEl = document.getElementById('current-position');
  const buttonsEl = document.getElementById('buttons');

  // When finished
  if (currentIndex >= pokemonData.length) {
    nameEl.textContent = "You ranked them all!";
    imgEl.src = "/static/Poké_Ball_icon.svg.png";
    posEl.textContent = `${pokemonData.length}/${pokemonData.length}`;

    // Hide ONLY the ranking buttons
    document.querySelectorAll(".rank_button").forEach(b => b.style.display = "none");

    // Keep reset button visible
    const resetBtn = document.getElementById('reset-list');
    if (resetBtn) resetBtn.style.display = "inline-block";

    return;
  }

  // Normal operation
  const current = pokemonData[currentIndex];

  nameEl.textContent = current.name;
  imgEl.src = normalizeSpriteURL(current.sprite_url);
  imgEl.alt = current.name;

  updatePositionDisplay();

  // Make sure ranking buttons are visible again (in case of reset)
  document.querySelectorAll(".rank_button").forEach(b => b.style.display = "inline-block");
}


// -------------------------------------------------------------
// Create Pokémon wrapper
// -------------------------------------------------------------
function createPokemonWrapper(p) {
  const wrapper = document.createElement("div");
  wrapper.className = "pokemon-wrapper";
  wrapper.draggable = true;

  wrapper.dataset.pokemonId = p.id;
  wrapper.dataset.pokemonName = p.name;
  wrapper.dataset.pokemonSprite = normalizeSpriteURL(p.sprite_url);

  wrapper.addEventListener('dragstart', dragStart);
  wrapper.addEventListener('dragend', dragEnd);

  const img = document.createElement("img");
  img.src = normalizeSpriteURL(p.sprite_url);
  img.alt = p.name;
  img.width = 50;
  img.draggable = false;

  const badge = document.createElement("span");
  badge.className = "pokemon-rank-badge";
  badge.textContent = "0";

  wrapper.appendChild(img);
  wrapper.appendChild(badge);

  return wrapper;
}

function updatePositionDisplay() {
  const posEl = document.getElementById('current-position');
  if (!posEl) return;

  const total = pokemonData.length;
  const current = currentIndex + 1; // 1-based human number

  posEl.textContent = `${current}/${total}`;
}

// -------------------------------------------------------------
// Assign current Pokémon to a tier
// -------------------------------------------------------------
function assignTier(tierNum) {
  if (currentIndex >= pokemonData.length) return;

  const current = pokemonData[currentIndex];
  const tierContent = document.querySelector(`#tier-${tierNum} .tier-content`);
  if (!tierContent) {
    console.error(`Tier container not found for tier ${tierNum}`);
    return;
  }

  const wrapper = createPokemonWrapper(current);
  tierContent.appendChild(wrapper);

  updateGlobalRanks();
  saveTierListToStorage();

  currentIndex++;
  showCurrentPokemon();
}
// -------------------------------------------------------------
// Drag & Drop
// -------------------------------------------------------------
function dragStart(e) {
  draggedElement = e.target.closest(".pokemon-wrapper");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "");

  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "drop-placeholder";
    placeholder.style.pointerEvents = "none";
  }

  const rect = draggedElement.getBoundingClientRect();
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${rect.height}px`;
  draggedElement.classList.add("dragging");
}

function dragEnd() {
  if (draggedElement) draggedElement.classList.remove("dragging");
  if (placeholder && placeholder.parentNode) placeholder.remove();
  placeholder = null;
  draggedElement = null;
  updateGlobalRanks();
  saveTierListToStorage();
}

function drop(event) {
  event.preventDefault();
  const container = event.currentTarget;

  if (!draggedElement) return;

  const afterElement = getDragAfterElement(container, event.clientX, event.clientY);
  if (afterElement === null) {
    container.appendChild(draggedElement);
  } else {
    container.insertBefore(draggedElement, afterElement);
  }

  if (placeholder && placeholder.parentNode) placeholder.remove();

  updateGlobalRanks();
  saveTierListToStorage();
}


function getDragAfterElement(container, mouseX, mouseY) {
  const elements = [...container.querySelectorAll('.pokemon-wrapper:not(.dragging)')];
  if (elements.length === 0) return null;

  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const offsetY = mouseY - (rect.top + rect.height / 2);
    const offsetX = mouseX - (rect.left + rect.width / 2);

    // Only consider elements in the same row (roughly)
    if (Math.abs(offsetY) < rect.height) {
      // Negative offset means mouse is left of element center
      if (offsetX < 0 && offsetX > closest.offset) {
        closest.offset = offsetX;
        closest.element = el;
      }
    }
  });

  // If mouse is past all elements in the row, return null to append at end
  return closest.element;
}

function allowDrop(event) {
  event.preventDefault();
  const container = event.currentTarget;

  if (!draggedElement) return;

  const afterElement = getDragAfterElement(container, event.clientX, event.clientY);

  if (afterElement === null) {
    container.appendChild(placeholder);
  } else {
    container.insertBefore(placeholder, afterElement);
  }
}




// -------------------------------------------------------------
// Update ranks
// -------------------------------------------------------------
function updateGlobalRanks() {
  const wrappers = document.querySelectorAll('.pokemon-wrapper');
  let rank = 1;
  wrappers.forEach(w => {
    const badge = w.querySelector('.pokemon-rank-badge');
    if (badge) badge.textContent = rank++;
  });
}

// -------------------------------------------------------------
// DOM Ready
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // --- 1️⃣ Load all Pokémon first ---
  await loadPokemon(); // ensures pokemonData is ready

  // --- 2️⃣ Load tierlist ---
  if (USER_LOGGED_IN) {
    await loadTierlistFromServer(); // will populate localStorage & DOM
  } else {
    loadTierListFromStorage(); // anonymous users
  }

  // --- 3️⃣ Setup drag & drop ---
  document.querySelectorAll('.tier-content').forEach(t => {
    t.addEventListener('dragover', allowDrop);
    t.addEventListener('drop', drop);
  });

  // --- 4️⃣ Button clicks for ranking ---
  document.addEventListener('click', e => {
    const btn = e.target.closest('.rank_button');
    if (!btn) return;

    const tierNum = btn.dataset.tier;
    if (!tierNum) return;

    assignTier(tierNum);
  });

  // --- 5️⃣ Reset button ---
  const resetBtn = document.getElementById('reset-list');
  if (resetBtn) {
    resetBtn.addEventListener('click', async e => {
      e.preventDefault();
      if (!confirm('Reset this generation\'s tier list?')) return;
      await resetCurrentTierList();
    });
  }
});



async function syncTierlistToServer() {
    const key = storageKey();       // your existing helper
    const data = localStorage.getItem(key);

    if (!data) return; // nothing to sync

    await fetch("/save_tierlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierlist: data })
    });
}

async function loadTierlistFromServer() {
  const res = await fetch("/get_tierlist");
  const data = await res.json();

  if (data.tierlist) {
    // 1️⃣ Save server tierlist to localStorage
    localStorage.setItem(storageKey(), data.tierlist);

    // 2️⃣ Load tierlist into DOM
    if (pokemonData.length > 0) {
      loadTierListFromStorage(); // wrappers now created safely
    } else {
      console.error("Cannot load tierlist: pokemonData not loaded yet.");
    }
  }
}



async function logout() {
    await fetch("/logout");
    localStorage.removeItem(storageKey()); // remove current user's tierlist locally
    window.location.href = "/";
}
