import { initThemeToggle } from "./theme.js";
import { parseMarkdown } from "./markdown.js";

const themeButton = document.getElementById("theme-toggle");
const tagsEl = document.getElementById("post-tags");
const titleEl = document.getElementById("post-title");
const metaEl = document.getElementById("post-meta");
const contentEl = document.getElementById("post-content");

initThemeToggle(themeButton);

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    contentEl.innerHTML = "<p>글을 찾을 수 없습니다.</p>";
    return;
  }

  try {
    const res = await fetch(`posts/${slug}.md`);
    if (!res.ok) throw new Error("not found");
    const raw = await res.text();
    const { meta, html } = parseMarkdown(raw);

    document.title = meta.title ? `${meta.title} - My Blog` : "My Blog";
    tagsEl.innerHTML = (meta.tags || []).map((t) => `<span class="card-tag">${t}</span>`).join("");
    titleEl.textContent = meta.title || slug;
    metaEl.textContent = meta.date || "";
    contentEl.innerHTML = html;
  } catch (err) {
    contentEl.innerHTML = "<p>글을 불러오지 못했습니다.</p>";
  }
}

loadPost();
