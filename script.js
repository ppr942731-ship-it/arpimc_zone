const state = {
  skins: [],
  addons: [],
  games: [],
  category: "all",
  query: "",
  page: "skins",
  selected: null,
  favorites: new Set(JSON.parse(localStorage.getItem("arpimc-favorites") || "[]"))
};

const $ = id => document.getElementById(id);

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function saveFavorites() {
  localStorage.setItem("arpimc-favorites", JSON.stringify([...state.favorites]));
}

function allItems() {
  return [
    ...state.skins.map(item => ({ ...item, _type: "skin", _key: "s" + item.id })),
    ...state.addons.map(item => ({ ...item, _type: "addon", _key: "a" + item.id }))
  ];
}

function titleOf(item) {
  return item.tag || item.nama || "Item Minecraft";
}

function imageOf(item) {
  return item.gambar || "";
}

function renderCard(item) {
  const key = item._key || (item._type === "addon" ? "a" : "s") + item.id;
  const title = titleOf(item);
  const category = item.kategori || "";
  const image = imageOf(item);
  const saved = state.favorites.has(key);

  return `
    <article class="card" data-category="${escapeHTML(category)}">
      <div class="card-image">
        ${image
          ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" loading="lazy">`
          : `<span>🧱</span>`}
        <span class="badge">${escapeHTML(category.toUpperCase() || "ITEM")}</span>
        <button class="favorite ${saved ? "saved" : ""}"
          data-favorite="${escapeHTML(key)}"
          aria-label="Simpan favorit">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="card-content">
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(item.deskripsi || item.author || item.creator || "Minecraft collection")}</p>
        <div class="card-actions">
          <button data-preview="${escapeHTML(key)}">Preview</button>
          <a class="download" href="${escapeHTML(item.link_download || "#")}"
             target="_blank" rel="noopener noreferrer">Unduh ↗</a>
        </div>
      </div>
    </article>`;
}

function renderSkins() {
  const q = state.query.toLowerCase();

  const items = state.skins.filter(item => {
    const categoryMatch = state.category === "all" ||
      item.kategori === state.category;

    const text = `${item.tag || ""} ${item.kategori || ""}`.toLowerCase();
    return categoryMatch && text.includes(q);
  });

  $("skinGrid").innerHTML = items.map(renderCard).join("") ||
    '<p class="empty" style="display:block">Skin tidak ditemukan.</p>';
}

function renderAddons() {
  const q = $("addonSearch").value.toLowerCase();

  const items = state.addons.filter(item =>
    `${item.nama || ""} ${item.kategori || ""} ${item.deskripsi || ""}`
      .toLowerCase().includes(q)
  );

  $("addonGrid").innerHTML = items.map(item => {
    item._type = "addon";
    return renderCard(item);
  }).join("") || '<p class="empty" style="display:block">Addon tidak ditemukan.</p>';
}

function renderGames() {
  $("gameGrid").innerHTML = state.games.map(game => `
    <article class="game-card">
      <h3>${escapeHTML(game.nama || "Mini Game")}</h3>
      <p>${escapeHTML(game.deskripsi || "")}</p>
      <iframe src="${escapeHTML(game.link || "")}"
        title="${escapeHTML(game.nama || "Mini Game")}"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
      <p><a class="primary" target="_blank" rel="noopener"
        href="${escapeHTML(game.link || "#")}">Buka penuh ↗</a></p>
    </article>
  `).join("");
}

function renderFavorites() {
  const items = allItems().filter(item => state.favorites.has(item._key));

  $("favoriteGrid").innerHTML = items.map(renderCard).join("");
  $("emptyFavorites").style.display = items.length ? "none" : "block";
}

function updateStats() {
  $("skinTotal").textContent = state.skins.length;
  $("addonTotal").textContent = state.addons.length;
  $("gameTotal").textContent = state.games.length;
  $("favTotal").textContent = state.favorites.size;
}

function openPreview(key) {
  const item = allItems().find(entry => entry._key === key);
  if (!item) return;

  state.selected = item;

  $("previewTitle").textContent = titleOf(item);
  $("previewImage").src = imageOf(item);
  $("previewAuthor").textContent =
    item.author || item.creator || "Minecraft collection";
  $("downloadButton").href = item.link_download || "#";

  const ratings = JSON.parse(localStorage.getItem("arpimc-ratings") || "{}");
  const rating = ratings[key] || 0;

  document.querySelectorAll("#ratingButtons button").forEach(button => {
    button.classList.toggle("selected", Number(button.dataset.rating) <= rating);
  });

  $("ratingLabel").textContent = rating ? `${rating}/5` : "Belum diberi rating";

  renderComments(key);
  $("previewModal").classList.add("open");
}

function renderComments(key) {
  const comments = JSON.parse(localStorage.getItem("arpimc-comments") || "{}");
  $("commentList").innerHTML = (comments[key] || []).map(comment =>
    `<div class="comment-entry">${escapeHTML(comment)}</div>`
  ).join("") || '<p class="muted">Belum ada catatan.</p>';
}

function closePreview() {
  $("previewModal").classList.remove("open");
  $("previewImage").src = "";
  state.selected = null;
}

function scrollToCollection() {
  document.querySelector(".tabs").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");

  if (favoriteButton) {
    const key = favoriteButton.dataset.favorite;

    if (state.favorites.has(key)) state.favorites.delete(key);
    else state.favorites.add(key);

    saveFavorites();
    updateStats();
    renderSkins();
    renderAddons();
    renderFavorites();
    return;
  }

  const previewButton = event.target.closest("[data-preview]");
  if (previewButton) {
    openPreview(previewButton.dataset.preview);
    return;
  }

  const tab = event.target.closest("[data-page]");
  if (tab) {
    state.page = tab.dataset.page;

    document.querySelectorAll(".tabs button").forEach(button =>
      button.classList.toggle("active", button === tab)
    );

    document.querySelectorAll(".page").forEach(page =>
      page.classList.toggle("active", page.id === state.page)
    );

    if (state.page === "favorites") renderFavorites();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton && categoryButton.closest(".filters")) {
    state.category = categoryButton.dataset.category;

    document.querySelectorAll(".filters button").forEach(button =>
      button.classList.toggle("active", button === categoryButton)
    );

    renderSkins();
    return;
  }
});

$("skinSearch").addEventListener("input", event => {
  state.query = event.target.value;
  renderSkins();
});

$("addonSearch").addEventListener("input", renderAddons);

$("closeModal").addEventListener("click", closePreview);

$("previewModal").addEventListener("click", event => {
  if (event.target.id === "previewModal") closePreview();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePreview();
});

$("themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");

  localStorage.setItem(
    "arpimc-theme",
    document.documentElement.classList.contains("light") ? "light" : "dark"
  );
});

$("ratingButtons").addEventListener("click", event => {
  const button = event.target.closest("[data-rating]");
  if (!button || !state.selected) return;

  const ratings = JSON.parse(localStorage.getItem("arpimc-ratings") || "{}");
  ratings[state.selected._key] = Number(button.dataset.rating);
  localStorage.setItem("arpimc-ratings", JSON.stringify(ratings));

  document.querySelectorAll("#ratingButtons button").forEach(star => {
    star.classList.toggle(
      "selected",
      Number(star.dataset.rating) <= Number(button.dataset.rating)
    );
  });

  $("ratingLabel").textContent = `${button.dataset.rating}/5`;
});

$("commentForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!state.selected) return;

  const text = $("commentInput").value.trim();
  if (!text) return;

  const comments = JSON.parse(localStorage.getItem("arpimc-comments") || "{}");
  const key = state.selected._key;

  comments[key] ||= [];
  comments[key].push(text);

  localStorage.setItem("arpimc-comments", JSON.stringify(comments));
  $("commentInput").value = "";
  renderComments(key);
});

$("shareButton").addEventListener("click", async () => {
  if (!state.selected) return;

  const item = state.selected;
  const message = `${titleOf(item)}\n${location.origin}${location.pathname}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: titleOf(item),
        text: "Lihat koleksi Minecraft ini di ArpiMC Zone!",
        url: location.href
      });
    } else {
      const wa = "https://wa.me/?text=" + encodeURIComponent(message);
      window.open(wa, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    if (error.name !== "AbortError") console.error(error);
  }
});

if (localStorage.getItem("arpimc-theme") === "light") {
  document.documentElement.classList.add("light");
}

Promise.all([
  fetch("skins.json").then(response => {
    if (!response.ok) throw new Error("skins.json gagal dimuat");
    return response.json();
  }),
  fetch("addons.json").then(response => {
    if (!response.ok) throw new Error("addons.json gagal dimuat");
    return response.json();
  }),
  fetch("games.json").then(response => {
    if (!response.ok) throw new Error("games.json gagal dimuat");
    return response.json();
  })
]).then(([skins, addons, games]) => {
  state.skins = skins;
  state.addons = addons;
  state.games = games;

  updateStats();
  renderSkins();
  renderAddons();
  renderGames();
  renderFavorites();
}).catch(error => {
  console.error(error);
  $("skinGrid").innerHTML =
    '<p class="empty" style="display:block">Gagal memuat data JSON. Periksa nama dan lokasi file.</p>';
});
