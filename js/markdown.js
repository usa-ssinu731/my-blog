// Minimal Markdown -> HTML parser (no dependencies).
// parseMarkdown(raw) -> { meta: {title, date, tags}, html: string }

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      meta[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return { meta, body: raw.slice(match[0].length) };
}

function parseInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function parseBody(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const html = [];

  let inCodeBlock = false;
  let codeLang = "";
  let codeLines = [];

  let listType = null; // "ul" | "ol"
  let listItems = [];

  let quoteLines = [];

  function flushList() {
    if (!listType) return;
    const items = listItems.map((li) => `<li>${parseInline(li)}</li>`).join("");
    html.push(`<${listType}>${items}</${listType}>`);
    listType = null;
    listItems = [];
  }

  function flushQuote() {
    if (!quoteLines.length) return;
    html.push(`<blockquote><p>${parseInline(quoteLines.join(" "))}</p></blockquote>`);
    quoteLines = [];
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        flushQuote();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeLines = [];
      } else {
        const cls = codeLang ? ` class="language-${codeLang}"` : "";
        html.push(`<pre><code${cls}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      flushList();
      flushQuote();
      html.push("<hr>");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      flushQuote();
      const level = heading[1].length;
      html.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }
    flushQuote();

    const unordered = line.match(/^\s*[-*+]\s+(.*)$/);
    if (unordered) {
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(ordered[1]);
      continue;
    }
    flushList();

    if (line.trim() === "") {
      continue;
    }

    html.push(`<p>${parseInline(line.trim())}</p>`);
  }

  flushList();
  flushQuote();

  return html.join("\n");
}

export function parseMarkdown(raw) {
  const { meta, body } = parseFrontmatter(raw);
  return { meta, html: parseBody(body) };
}
