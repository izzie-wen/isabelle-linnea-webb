// Podd-sidan: sök, ämnesfilter, anteckningar och ljudspelare.
// Lyssnarens position och avklarade avsnitt sparas i webbläsaren (localStorage).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* privat läge e.d. */ } }
  };
  const KEY_POS = 'podd-position';   // { ep, time } – senast spelade avsnitt
  const KEY_DONE = 'podd-done';      // [nummer, …] – avsnitt som lyssnats klart
  const KEY_RATE = 'podd-rate';
  const fmt = (sec) => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  };

  const blocks = $$('.pod-block');
  const eps = $$('.pod-ep');
  if (!blocks.length) return;
  const byNum = new Map(eps.map(li => [Number(li.dataset.ep), li]));
  const titleOf = (li) => $('.pod-ep__title', li).textContent.trim();
  // Söktext per avsnitt: nummer, titel och anteckningar
  const searchText = new Map(eps.map(li => {
    const note = $('.pod-ep__note', li);
    return [li, (li.dataset.ep + ' ' + titleOf(li) + ' ' + (note ? note.textContent : '')).toLocaleLowerCase('sv')];
  }));

  // ---------- Meddelanden ----------
  const toastEl = $('[data-pod-toast]');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => { toastEl.hidden = true; }, 300); }, 2800);
  };

  // ---------- Avklarade avsnitt och "Fortsätt med avsnitt …" ----------
  const done = new Set(store.get(KEY_DONE, []));
  const markDone = () => eps.forEach(li => li.classList.toggle('is-done', done.has(Number(li.dataset.ep))));
  const updateContinue = () => {
    const pos = store.get(KEY_POS, null);
    blocks.forEach(b => {
      const btn = $('[data-continue]', b);
      if (!btn) return;
      const nums = $$('.pod-ep', b).map(li => Number(li.dataset.ep));
      let target = Number(btn.dataset.first), label = 'Börja med avsnitt ';
      if (pos && nums.includes(pos.ep)) { target = pos.ep; label = 'Fortsätt med avsnitt '; }
      else if (nums.some(n => done.has(n))) {
        const next = nums.find(n => !done.has(n));
        if (next) { target = next; label = 'Fortsätt med avsnitt '; }
      }
      btn.dataset.target = target;
      btn.firstChild.textContent = label + target + ' ';
    });
  };

  // ---------- Spelaren ----------
  const player = $('[data-pod-player]');
  const audio = $('[data-pp-audio]');
  const ui = {
    toggle: $('[data-pp-toggle]'), label: $('[data-pp-label]'), title: $('[data-pp-title]'),
    cur: $('[data-pp-current]'), dur: $('[data-pp-duration]'), seek: $('[data-pp-seek]'), rate: $('[data-pp-rate]')
  };
  const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
  let rateIdx = Math.max(0, rates.indexOf(store.get(KEY_RATE, 1)));
  const rateText = (r) => String(r).replace('.', ',') + '×';
  ui.rate.textContent = rateText(rates[rateIdx]);
  let current = null, seeking = false, lastSave = 0;

  const savePos = () => { if (current) store.set(KEY_POS, { ep: Number(current.dataset.ep), time: Math.floor(audio.currentTime || 0) }); };
  const syncUI = () => {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    ui.toggle.setAttribute('aria-label', playing ? 'Pausa' : 'Spela');
    eps.forEach(li => {
      li.classList.toggle('is-current', li === current);
      li.classList.toggle('is-playing', li === current && playing);
    });
  };
  const markListened = (n) => { if (!done.has(n)) { done.add(n); store.set(KEY_DONE, [...done]); markDone(); } };

  const load = (li, startAt) => {
    current = li;
    audio.src = li.dataset.audio;
    audio.playbackRate = rates[rateIdx];
    ui.label.textContent = 'Avsnitt ' + li.dataset.ep;
    ui.title.textContent = titleOf(li);
    ui.seek.value = 0; ui.cur.textContent = '0:00'; ui.dur.textContent = '0:00';
    player.hidden = false;
    document.body.classList.add('pod-has-player');
    if (startAt > 5) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = startAt; } catch { /* ignorera */ } }, { once: true });
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: titleOf(li), artist: 'Isabelle Linnea', album: 'Avsnitt ' + li.dataset.ep });
    }
  };
  const play = (li, resume) => {
    if (!li) return;
    if (!li.dataset.audio) { toast('Avsnitt ' + li.dataset.ep + ' är inte publicerat ännu – det kommer snart.'); return; }
    const block = li.closest('.pod-block');
    if (block && !block.open) block.open = true;
    if (current === li) { if (audio.paused) audio.play(); else audio.pause(); return; }
    const pos = store.get(KEY_POS, null);
    load(li, resume && pos && pos.ep === Number(li.dataset.ep) ? pos.time : 0);
    audio.play().catch(() => toast('Ljudet kunde inte spelas upp just nu.'));
  };

  audio.addEventListener('play', syncUI);
  audio.addEventListener('pause', () => { syncUI(); savePos(); updateContinue(); });
  audio.addEventListener('loadedmetadata', () => {
    ui.seek.max = Math.floor(audio.duration) || 0;
    ui.dur.textContent = fmt(audio.duration);
    const t = current && $('[data-time]', current);
    if (t && !t.textContent.trim()) t.textContent = fmt(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    if (!seeking) ui.seek.value = Math.floor(audio.currentTime);
    ui.cur.textContent = fmt(audio.currentTime);
    if (!current || !audio.duration) return;
    const pct = audio.currentTime / audio.duration;
    current.style.setProperty('--progress', (pct * 100).toFixed(1) + '%');
    if (pct > 0.95) markListened(Number(current.dataset.ep));
    if (Date.now() - lastSave > 4000) { lastSave = Date.now(); savePos(); }
  });
  audio.addEventListener('ended', () => {
    const n = Number(current.dataset.ep);
    markListened(n);
    const next = byNum.get(n + 1);
    store.set(KEY_POS, next ? { ep: n + 1, time: 0 } : null);
    updateContinue();
    if (next && next.dataset.audio) play(next, false); else syncUI();
  });
  audio.addEventListener('error', () => { if (current) { toast('Ljudfilen för avsnitt ' + current.dataset.ep + ' kunde inte laddas.'); syncUI(); } });

  ui.toggle.addEventListener('click', () => { if (current) { if (audio.paused) audio.play(); else audio.pause(); } });
  ui.seek.addEventListener('input', () => { seeking = true; ui.cur.textContent = fmt(Number(ui.seek.value)); });
  ui.seek.addEventListener('change', () => { audio.currentTime = Number(ui.seek.value); seeking = false; });
  $$('[data-pp-skip]').forEach(b => b.addEventListener('click', () => {
    if (!current) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + Number(b.dataset.ppSkip)));
  }));
  ui.rate.addEventListener('click', () => {
    rateIdx = (rateIdx + 1) % rates.length;
    audio.playbackRate = rates[rateIdx];
    ui.rate.textContent = rateText(rates[rateIdx]);
    store.set(KEY_RATE, rates[rateIdx]);
  });
  $('[data-pp-close]').addEventListener('click', () => {
    audio.pause(); savePos();
    player.hidden = true; document.body.classList.remove('pod-has-player');
  });

  // Visa längden på avsnitten när ett block öppnas (om längden inte står i innehållet)
  const fillDurations = (block) => $$('.pod-ep[data-audio]', block).forEach(li => {
    const t = $('[data-time]', li);
    if (t.textContent.trim() || li.dataset.probed) return;
    li.dataset.probed = '1';
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => { if (!t.textContent.trim()) t.textContent = fmt(probe.duration); probe.removeAttribute('src'); probe.load(); }, { once: true });
    probe.src = li.dataset.audio;
  });
  blocks.forEach(b => b.addEventListener('toggle', () => { if (b.open) fillDurations(b); }));
  blocks.filter(b => b.open).forEach(fillDurations);

  // ---------- Klick i listan ----------
  const setNote = (btn, open) => {
    btn.setAttribute('aria-expanded', String(open));
    const note = document.getElementById(btn.getAttribute('aria-controls'));
    if (note) note.hidden = !open;
  };
  $('.pod-blocks').addEventListener('click', (ev) => {
    const playBtn = ev.target.closest('[data-play]');
    if (playBtn) { play(playBtn.closest('.pod-ep'), true); return; }
    const noteBtn = ev.target.closest('[data-note]');
    if (noteBtn) { setNote(noteBtn, noteBtn.getAttribute('aria-expanded') !== 'true'); return; }
    const all = ev.target.closest('[data-all-notes]');
    if (all) {
      const open = all.getAttribute('aria-expanded') !== 'true';
      $$('[data-note]', all.closest('.pod-block')).forEach(b => setNote(b, open));
      all.setAttribute('aria-expanded', String(open));
      $('span', all).textContent = open ? 'Dölj anteckningar' : 'Visa alla anteckningar';
      return;
    }
    const cont = ev.target.closest('[data-continue]');
    if (cont) play(byNum.get(Number(cont.dataset.target || cont.dataset.first)), true);
  });

  // ---------- Sök och ämnesfilter ----------
  const status = $('[data-pod-status]');
  const search = $('[data-pod-search]');
  let category = '', query = '', queryText = '';
  const apply = () => {
    let shownBlocks = 0, shownEps = 0;
    blocks.forEach(b => {
      const items = $$('.pod-ep', b);
      let visible = !category || b.dataset.category === category;
      if (visible && query) {
        // Visa de avsnitt som matchar. Matchar inget avsnitt men väl blockets rubrik/beskrivning: visa hela blocket.
        const matches = items.filter(li => searchText.get(li).includes(query));
        const shown = matches.length ? matches : (b.dataset.search.includes(query) ? items : []);
        items.forEach(li => { li.hidden = !shown.includes(li); });
        const hits = shown.length;
        visible = hits > 0;
        if (visible) { shownEps += hits; if (!b.open) { b.open = true; b.dataset.autoOpen = '1'; } }
      } else {
        items.forEach(li => { li.hidden = false; });
        if (b.dataset.autoOpen) { b.open = false; delete b.dataset.autoOpen; }
        if (visible) shownEps += items.length;
      }
      b.hidden = !visible;
      if (visible) shownBlocks++;
    });
    if (query) status.textContent = shownEps ? `${shownEps} avsnitt matchar ”${queryText}”.` : `Inga avsnitt matchar ”${queryText}”.`;
    else status.textContent = category ? `${shownBlocks} block om ${category.toLocaleLowerCase('sv')} · ${shownEps} avsnitt` : '';
  };
  let searchTimer;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { queryText = search.value.trim(); query = queryText.toLocaleLowerCase('sv'); apply(); }, 150);
  });
  $$('[data-pod-filter]').forEach(btn => btn.addEventListener('click', () => {
    category = btn.dataset.podFilter;
    $$('[data-pod-filter]').forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    apply();
  }));

  // ---------- Direktlänkar: #avsnitt-12 eller #block-3 ----------
  const openHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (!el || !el.closest('.pod-blocks')) return;
    const block = el.closest('.pod-block');
    if (block) { block.hidden = false; block.open = true; }
    $$('.is-target').forEach(x => x.classList.remove('is-target'));
    if (el.classList.contains('pod-ep')) { el.hidden = false; el.classList.add('is-target'); }
    setTimeout(() => el.scrollIntoView({ block: el.classList.contains('pod-ep') ? 'center' : 'start', behavior: 'instant' }), 60);
  };
  window.addEventListener('hashchange', openHash);

  markDone();
  updateContinue();
  openHash();
})();
