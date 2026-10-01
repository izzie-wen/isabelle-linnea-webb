(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === button));
      let visible = 0;
      document.querySelectorAll('[data-story-genre]').forEach(card => {
        const match = value === 'Alla' || card.dataset.storyGenre === value;
        card.hidden = !match;
        if (match) visible++;
      });
      const empty = document.querySelector('[data-empty-state]');
      if (empty) empty.classList.toggle('show', visible === 0);
    });
  });

  document.querySelectorAll('[data-faq-button]').forEach(button => {
    button.addEventListener('click', () => {
      const answer = button.parentElement.querySelector('[data-faq-answer]');
      const opening = answer.hidden;
      answer.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
      const symbol = button.querySelector('[data-faq-symbol]');
      if (symbol) symbol.textContent = opening ? '−' : '+';
    });
  });

  const share = document.querySelector('[data-copy-link]');
  if (share) share.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast('Länken är kopierad.');
    } catch {
      toast('Kopiera länken från adressfältet.');
    }
  });

  // Nyhetsbrevet ovanför sidfoten: skickas till Netlify Forms i bakgrunden och visar tack på sidan
  document.querySelectorAll('form[data-signup]').forEach(form => {
    const msg = form.querySelector('.signup__msg');
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      msg.textContent = '';
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        form.classList.add('is-done');
        msg.textContent = 'Tack! Nu är du anmäld till nyhetsbrevet.';
      } catch {
        msg.textContent = 'Det gick inte att skicka just nu. Försök gärna igen om en stund.';
      } finally {
        button.disabled = false;
      }
    });
  });

  document.querySelectorAll('form[data-local-success]').forEach(form => {
    form.addEventListener('submit', () => {
      setTimeout(() => toast(form.dataset.localSuccess || 'Tack!'), 50);
    });
  });

  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__siteToast);
    window.__siteToast = setTimeout(() => el.classList.remove('show'), 2200);
  }
})();
