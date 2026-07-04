const STORAGE_KEY = "theme";

function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function initThemeToggle(buttonEl) {
  const current = getStoredTheme() || getSystemTheme();
  applyTheme(current);
  updateButtonLabel(buttonEl, current);

  buttonEl.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    updateButtonLabel(buttonEl, next);
  });
}

function updateButtonLabel(buttonEl, theme) {
  buttonEl.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  buttonEl.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
