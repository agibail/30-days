// 30 Days gallery — reads window.MANIFEST (built by `./30 build`) and renders
// the 30-day grid (#/) and a day view (#/day/N or #/day/N/vNN).
(function () {
  const M = window.MANIFEST || { days: [], total: 30, start: new Date().toISOString().slice(0, 10) };
  const byDay = new Map(M.days.map((d) => [d.day, d]));
  const app = document.getElementById("app");

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const src = (p) => (/^https?:\/\//.test(p) ? p : p.split("/").map(encodeURIComponent).join("/"));
  const pad = (n) => String(n).padStart(2, "0");

  const noon = (iso) => new Date(iso + "T12:00:00");
  function todayNum() {
    const n = new Date(); n.setHours(12, 0, 0, 0);
    return Math.round((n - noon(M.start)) / 864e5) + 1;
  }
  function dateFor(n) { const d = noon(M.start); d.setDate(d.getDate() + n - 1); return d; }
  const fmtDate = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  // each day's own yellow: warm gold on day 1 shifting to neon on the last day
  function shade(n, total) {
    const t = total > 1 ? (n - 1) / (total - 1) : 0;
    return `--h:${(40 + t * 25).toFixed(1)};--l:${(58 - t * 8).toFixed(1)}%`;
  }

  // tiny markdown: headings, lists, links, bold/italic/code, paragraphs
  function md(text) {
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    let out = "", para = [], list = [];
    const flush = () => {
      if (para.length) out += "<p>" + para.map(inline).join("<br>") + "</p>";
      if (list.length) out += "<ul>" + list.map((l) => "<li>" + inline(l) + "</li>").join("") + "</ul>";
      para = []; list = [];
    };
    for (const line of (text || "").split("\n")) {
      const h = line.match(/^(#{1,4}) (.*)$/), li = line.match(/^\s*[-*] (.*)$/);
      if (h) { flush(); out += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`; }
      else if (li) { if (para.length) flush(); list.push(li[1]); }
      else if (!line.trim()) flush();
      else { if (list.length) flush(); para.push(line); }
    }
    flush();
    return out;
  }

  function thumb(d) {
    const img = d.media.find((m) => m.kind === "image");
    if (img) return `<img loading="lazy" src="${src(img.src)}" alt="">`;
    if (d.site) return `<div class="frame-thumb"><iframe loading="lazy" tabindex="-1" aria-hidden="true" src="${src(d.site)}"></iframe></div>`;
    const vid = d.media.find((m) => m.kind === "video");
    if (vid) return `<video muted playsinline preload="metadata" src="${src(vid.src)}#t=0.5"></video>`;
    return `<div class="big">${pad(d.day)}</div>`;
  }

  function badges(d) {
    const imgs = d.media.filter((m) => m.kind === "image").length;
    const vids = d.media.filter((m) => m.kind === "video").length;
    const b = [];
    if (d.type) b.push(`<span class="badge accent">${esc(d.type)}</span>`);
    if (d.iterations.length) b.push(`<span class="badge">${d.iterations.length} iter</span>`);
    if (imgs) b.push(`<span class="badge">${imgs} img</span>`);
    if (vids) b.push(`<span class="badge">${vids} vid</span>`);
    return b.join("");
  }

  function renderProgress() {
    const done = M.days.length, total = M.total || 30, t = todayNum();
    const pct = Math.min(100, Math.round((done / total) * 100));
    document.getElementById("progress").innerHTML =
      `<span>${done}/${total}</span><span class="bar"><i style="width:${pct}%;background-size:${pct ? (10000 / pct).toFixed(1) : 100}% 100%"></i></span>` +
      (t >= 1 && t <= total ? `<span>today: day ${t}</span>` : "");
  }

  function renderGrid() {
    const total = Math.max(M.total || 30, ...M.days.map((d) => d.day), 0);
    const t = todayNum();
    let cards = "";
    for (let n = 1; n <= total; n++) {
      const d = byDay.get(n);
      const cls = ["card", d ? "" : "empty", n === t ? "today" : ""].join(" ");
      const date = fmtDate(d && d.date ? noon(d.date) : dateFor(n));
      if (d) {
        cards += `<a class="${cls}" style="${shade(n, total)}" href="#/day/${n}">
          <div class="thumb">${thumb(d)}</div>
          <div class="card-body">
            <div class="card-meta"><span>Day ${pad(n)}</span><span>${date}</span></div>
            <div class="card-title">${esc(d.title || "Untitled")}</div>
            <div class="badges">${badges(d)}</div>
          </div></a>`;
      } else {
        cards += `<a class="${cls}" style="${shade(n, total)}" href="#/day/${n}">
          <div class="thumb"><div class="big">${pad(n)}</div></div>
          <div class="card-body">
            <div class="card-meta"><span>Day ${pad(n)}</span><span>${date}</span></div>
            <div class="card-title" style="color:var(--muted)">${n === t ? "Today — make something" : n < t ? "—" : "Soon"}</div>
          </div></a>`;
      }
    }
    app.innerHTML = `
      <div class="hero"><h1>30 Days</h1><p>A new project every day. Started ${fmtDate(noon(M.start))}.</p></div>
      <div class="grid">${cards}</div>
      <p class="foot">Last built ${esc(M.generated || "never")}${M.repo ? ` · <a href="${esc(M.repo)}">source on GitHub</a>` : ""}</p>`;
    document.title = "30 Days";
  }

  function renderDay(n, iterId, compare) {
    const d = byDay.get(n);
    const total = M.total || 30;
    const nav = `<div class="day-nav">
      <a href="#/">← all days</a>
      <span>${n > 1 ? `<a href="#/day/${n - 1}">‹ day ${n - 1}</a>` : ""}${n > 1 && n < total ? " &nbsp;·&nbsp; " : ""}${n < total ? `<a href="#/day/${n + 1}">day ${n + 1} ›</a>` : ""}</span>
    </div>`;
    if (!d) {
      app.innerHTML = nav + `<div class="empty-state"><h1>Day ${pad(n)}</h1><p>Nothing here yet. Start it with</p>
        <p><code>./30 new ${n} "Title" website</code></p></div>`;
      document.title = `Day ${pad(n)} · 30 Days`;
      return;
    }

    let viewer = "";
    if (d.site || d.iterations.length) {
      const iters = d.iterations.slice();
      // newest iteration shows the live site/ folder (may include unsaved edits)
      const items = iters.map((it, i) => ({ ...it, src: i === iters.length - 1 && d.site ? d.site : it.path, latest: i === iters.length - 1 }));
      if (!items.length) items.push({ id: "latest", src: d.site, note: "", date: "", latest: true });
      let idx = items.findIndex((it) => it.id === iterId);
      if (idx < 0) idx = items.length - 1;
      const cur = items[idx];
      const prev = items[idx - 1];
      const chips = items.map((it, i) =>
        `<a class="chip ${i === idx ? "on" : ""}" href="#/day/${n}/${it.id}${compare ? "/compare" : ""}" title="${esc(it.date)}">${esc(it.id)}${it.latest ? " · latest" : ""}</a>`).join("");
      const paneHtml = (it) => `<div class="pane"><div class="label">${esc(it.id)}${it.date ? " · " + esc(it.date) : ""}</div><iframe src="${src(it.src)}" title="${esc(it.id)}"></iframe></div>`;
      const showCompare = compare && prev;
      viewer = `<section><h2>Website · iterations</h2>
        <div class="toolbar">${chips}<span class="spacer"></span>
          ${prev ? `<a class="chip ${compare ? "on" : ""}" href="#/day/${n}/${cur.id}${compare ? "" : "/compare"}">compare with ${esc(prev.id)}</a>` : ""}
          <a class="chip" href="${src(cur.latest && d.link ? d.link : cur.src)}" target="_blank" rel="noopener">open ↗</a>
        </div>
        <p class="iter-note">${esc(cur.note)}</p>
        <div class="viewer ${showCompare ? "compare" : ""}">${showCompare ? paneHtml(prev) : ""}${paneHtml(cur)}</div>
      </section>`;
    }

    const gallery = d.media.length ? `<section><h2>Media · ${d.media.length}</h2><div class="gallery">${d.media.map((m, i) =>
      `<button data-i="${i}" aria-label="Open ${m.kind} ${i + 1}">${m.kind === "video"
        ? `<video muted playsinline preload="metadata" src="${src(m.src)}#t=0.5"></video><span class="play">▶ video</span>`
        : `<img loading="lazy" src="${src(m.src)}" alt="">`}</button>`).join("")}</div></section>` : "";

    const notes = d.notes && d.notes.trim() ? `<section><h2>Notes</h2><div class="notes">${md(d.notes)}</div></section>` : "";
    const log = d.log.length ? `<section><h2>Changes</h2><ul class="log">${d.log.map((l) => `<li><time>${esc(l.date)}</time>${esc(l.msg)}</li>`).join("")}</ul></section>` : "";
    const hist = M.repo ? `<a href="${esc(M.repo)}/commits/${esc(M.branch || "main")}/days/${esc(d.slug)}" target="_blank" rel="noopener">full git history ↗</a> · ` : "";

    app.innerHTML = nav + `
      <div class="day-head">
        <div class="kicker">Day ${pad(n)} · ${esc(d.type || "")}</div>
        <h1>${esc(d.title || "Untitled")}</h1>
        <div class="sub">${d.date ? fmtDate(noon(d.date)) : ""}</div>
      </div>
      ${viewer}${gallery}${notes}${log}
      <p class="foot">${hist}folder: days/${esc(d.slug)}/</p>`;
    document.title = `Day ${pad(n)}: ${d.title} · 30 Days`;

    app.querySelectorAll(".gallery button").forEach((b) => b.addEventListener("click", () => openLightbox(d.media, +b.dataset.i)));
  }

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  let lbItems = [], lbIdx = 0;
  function showLb() {
    const m = lbItems[lbIdx];
    lb.querySelector(".lb-stage").innerHTML = m.kind === "video"
      ? `<video src="${src(m.src)}" controls autoplay playsinline></video>`
      : `<img src="${src(m.src)}" alt="">`;
    lb.querySelector(".lb-count").textContent = `${lbIdx + 1} / ${lbItems.length}`;
  }
  function openLightbox(items, i) { lbItems = items; lbIdx = i; lb.hidden = false; showLb(); }
  function closeLb() { lb.hidden = true; lb.querySelector(".lb-stage").innerHTML = ""; }
  const step = (k) => { lbIdx = (lbIdx + k + lbItems.length) % lbItems.length; showLb(); };
  lb.querySelector(".lb-close").onclick = closeLb;
  lb.querySelector(".lb-prev").onclick = () => step(-1);
  lb.querySelector(".lb-next").onclick = () => step(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---------- routing ----------
  function route() {
    const m = location.hash.match(/^#\/day\/(\d+)(?:\/(v\d+|latest))?(\/compare)?/);
    // a day page takes on that day's yellow; the grid stays greyscale
    document.body.classList.toggle("day-theme", !!m);
    if (m) document.body.setAttribute("style", shade(+m[1], Math.max(M.total || 30, +m[1])));
    else document.body.removeAttribute("style");
    if (m) renderDay(+m[1], m[2], !!m[3]); else renderGrid();
    window.scrollTo(0, 0);
  }
  renderProgress();
  window.addEventListener("hashchange", route);
  route();
})();
