import { initThemeToggle } from "./theme.js";

const listEl = document.getElementById("post-list");
const searchEl = document.getElementById("search-input");
const tagsEl = document.getElementById("tag-filters");
const themeButton = document.getElementById("theme-toggle");

initThemeToggle(themeButton);

let posts = [];
let activeTags = new Set();

async function loadPosts() {
  const res = await fetch("posts/index.json");
  posts = await res.json();
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  renderTagFilters();
  renderList();
}

function renderTagFilters() {
  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
  tagsEl.innerHTML = allTags
    .map((tag) => `<button class="tag-filter" data-tag="${tag}">${tag}</button>`)
    .join("");

  tagsEl.querySelectorAll(".tag-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.tag;
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
        btn.classList.remove("active");
      } else {
        activeTags.add(tag);
        btn.classList.add("active");
      }
      renderList();
    });
  });
}

function renderList() {
  const query = searchEl.value.trim().toLowerCase();

  const filtered = posts.filter((post) => {
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      (post.summary || "").toLowerCase().includes(query);
    const matchesTags = activeTags.size === 0 || (post.tags || []).some((t) => activeTags.has(t));
    return matchesQuery && matchesTags;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="empty-state">글이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (post) => `
      <a class="post-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <div class="card-tags">${(post.tags || []).map((t) => `<span class="card-tag">${t}</span>`).join("")}</div>
        <p class="card-title">${post.title}</p>
        <p class="post-meta">${post.date}</p>
        <p class="post-summary">${post.summary || ""}</p>
      </a>
    `
    )
    .join("");
}

searchEl.addEventListener("input", renderList);

loadPosts();
