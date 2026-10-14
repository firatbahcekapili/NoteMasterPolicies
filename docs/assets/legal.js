// Legal pages: TR/EN switch, table of contents, reading progress.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  // ── Language ──────────────────────────────────────────────────────────
  // #en / #tr in the URL wins (old links point at them), then the choice
  // remembered by the landing page, then the browser language.
  const pick = () => {
    const hash = location.hash.replace('#', '');
    if (hash === 'en' || hash === 'tr') return hash;
    try {
      const saved = localStorage.getItem('nm-lang');
      if (saved === 'en' || saved === 'tr') return saved;
    } catch (e) {}
    return (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  };

  // Section headings "3. Title" → numbered, linkable entries.
  $$('.doc section[data-lang]').forEach(section => {
    const lang = section.dataset.lang;
    $$('h2', section).forEach((h, i) => {
      const m = h.textContent.trim().match(/^(\d+)\.\s*(.*)$/);
      if (m) h.innerHTML = `<span class="n">${m[1].padStart(2, '0')}</span><span>${m[2]}</span>`;
      h.id = `${lang}-${i + 1}`;
      h.dataset.title = m ? m[2] : h.textContent.trim();
    });
  });

  let lang = 'tr';
  function buildToc() {
    const items = $$(`.doc section[data-lang="${lang}"] h2`)
      .map(h => `<li><a href="#${h.id}" data-target="${h.id}">${h.dataset.title}</a></li>`)
      .join('');
    $$('[data-toc]').forEach(ol => { ol.innerHTML = items; });
  }

  function setLang(next) {
    lang = next;
    root.lang = next;
    $$('[data-lang]').forEach(el => { el.hidden = el.dataset.lang !== next; });
    $$('[data-tr]').forEach(el => { el.textContent = next === 'en' ? el.dataset.en : el.dataset.tr; });
    const title = root.dataset[next === 'en' ? 'titleEn' : 'titleTr'];
    if (title) document.title = title;
    $('#lang').textContent = next === 'en' ? 'TR' : 'EN';
    buildToc();
    observeHeadings();
    try { localStorage.setItem('nm-lang', next); } catch (e) {}
  }

  $('#lang').addEventListener('click', () => {
    setLang(lang === 'tr' ? 'en' : 'tr');
    history.replaceState(null, '', `#${lang}`);
    scrollTo({ top: 0 });
  });

  // Close the mobile contents list after a jump.
  document.addEventListener('click', e => {
    const link = e.target.closest('.toc-mobile a');
    if (link) link.closest('details').open = false;
  });

  // ── Active section in the contents ───────────────────────────────────
  let headingIO;
  function observeHeadings() {
    if (headingIO) headingIO.disconnect();
    headingIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('.toc a').forEach(a => a.classList.toggle('active', a.dataset.target === entry.target.id));
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    $$(`.doc section[data-lang="${lang}"] h2`).forEach(h => headingIO.observe(h));
  }

  // ── Reveal + progress ────────────────────────────────────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('.rv').forEach(el => io.observe(el));

  const bar = $('.progress');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  setLang(pick());
  onScroll();
})();
