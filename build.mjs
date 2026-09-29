import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const contentDir = path.join(root, 'content');
const dist = path.join(root, 'dist');

const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(contentDir,p),'utf8'));
const readCollection = (dir) => fs.readdirSync(path.join(contentDir,dir)).filter(f=>f.endsWith('.json')).map(f=>readJSON(path.join(dir,f)));
const esc = (s='') => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const paras = (s='') => String(s).split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('\n');
const img = (src, alt='', cls='') => `<img src="${esc(src)}" alt="${esc(alt)}"${cls?` class="${cls}"`:''}>`;
const formatDate = (iso) => new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',year:'numeric'}).format(new Date(iso+'T12:00:00'));

const site = readJSON('site.json');
const home = readJSON('home.json');
const about = readJSON('about.json');
const books = readJSON('books.json');
const writers = readJSON('writers.json');
const other = readJSON('other.json');
const contact = readJSON('contact.json');
const stories = readCollection('stories').sort((a,b)=>a.title.localeCompare(b.title,'sv'));
const posts = readCollection('posts').sort((a,b)=>b.date.localeCompare(a.date));

function nav(active='') {
  const items=[
    ['Hem','/index.html','home'],['Om mig','/om-mig.html','about'],['Böcker','/books.html','books'],['Noveller','/noveller.html','stories'],['Världen','/index.html#varlden','world'],['Nyheter','/blog.html','blog'],['För författare','/for-forfattare.html','writers'],['Annat','/annat.html','other'],['Kontakt','/contact.html','contact']
  ];
  return items.map(([label,href,key])=>`<a href="${href}"${active===key?' class="active" aria-current="page"':''}>${esc(label)}</a>`).join('');
}

function layout({title,description='',active='',body,scripts=''}){
return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title)} | ${esc(site.author_name)}</title>
<link rel="stylesheet" href="/assets/css/styles.css">\n<link rel="stylesheet" href="/assets/css/home-exact.css">
</head>
<body id="top">
<a class="skip-link" href="#main">Hoppa till innehållet</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/index.html"><strong>${esc(site.author_name).toUpperCase()}</strong><small>${esc(site.tagline)}</small></a>
    <nav class="main-nav" data-main-nav aria-label="Huvudmeny">${nav(active)}</nav>
    <div class="socials" aria-label="Sociala medier">
      <a href="${esc(site.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.8" r="1"/></svg></a>
      <a href="${esc(site.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8H17V4.5c-.48-.07-2.12-.2-4.08-.2-4.03 0-6.79 2.46-6.79 6.98V15H2.5v3.92h3.63V24h4.45v-5.08h3.73L14.9 15h-4.32v-3.34c0-1.13.3-1.9 1.92-1.9h1.7V8Z"/></svg></a>
      <a href="${esc(site.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.4" width="19" height="13.2" rx="4"/><path d="m10 9 5 3-5 3z" class="filled"/></svg></a>
      <span class="social-static" aria-label="Spotify"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M6.8 9.3c3.8-1.1 7.8-.8 10.8.7M7.6 12.2c3-.8 6.3-.6 8.8.6M8.4 15c2.3-.6 4.8-.4 6.8.4"/></svg></span>
      <button class="header-search" type="button" aria-label="Sök"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.6" cy="10.6" r="6.4"/><path d="M15.3 15.3 21 21"/></svg></button>
    </div>
    <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false">Meny</button>
  </div>
</header>
<main id="main">${body}</main>
${footer()}
<script src="/assets/js/site.js" defer></script>
${scripts}
</body></html>`;
}

function footer(){ return `<footer class="site-footer">
  <img class="footer-treeline" src="/assets/images/home/footer-treeline.webp" alt="" aria-hidden="true">
  <div class="container footer-inner">
    <div class="footer-brand"><strong>${esc(site.author_name).toUpperCase()}</strong><small>${esc(site.tagline)}</small><div class="copyright">${esc(site.copyright)}</div></div>
    <nav class="footer-nav" aria-label="Sidfot">
      <a href="/index.html">Hem</a><a href="/om-mig.html">Om mig</a><a href="/books.html">Böcker</a><a href="/index.html#varlden">Världen</a><a href="/blog.html">Nyheter</a><a href="/contact.html">Kontakt</a>
    </nav>
    <div class="footer-right">
      <div class="footer-socials" aria-label="Sociala medier">
        <a href="${esc(site.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.8" r="1"/></svg></a>
        <a href="${esc(site.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8H17V4.5c-.48-.07-2.12-.2-4.08-.2-4.03 0-6.79 2.46-6.79 6.98V15H2.5v3.92h3.63V24h4.45v-5.08h3.73L14.9 15h-4.32v-3.34c0-1.13.3-1.9 1.92-1.9h1.7V8Z"/></svg></a>
        <a href="${esc(site.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12s0-3.8-.48-5.63a2.9 2.9 0 0 0-2.04-2.04C17.65 3.85 12 3.85 12 3.85s-5.65 0-7.48.48a2.9 2.9 0 0 0-2.04 2.04C2 8.2 2 12 2 12s0 3.8.48 5.63a2.9 2.9 0 0 0 2.04 2.04c1.83.48 7.48.48 7.48.48s5.65 0 7.48-.48a2.9 2.9 0 0 0 2.04-2.04C22 15.8 22 12 22 12Z"/><path class="play" d="m10 15.4 5.2-3.4L10 8.6v6.8Z"/></svg></a>
        <span class="footer-music" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M6.7 9.3c3.7-1.1 7.9-.8 11.1.8M7.6 12.3c3-.8 6.4-.6 9 .7M8.5 15.1c2.4-.6 4.9-.4 7 .5"/></svg></span>
      </div>
      <div class="footer-quote">${esc(site.footer_tagline)}</div>
    </div>
    <a class="footer-top" href="#top" aria-label="Till sidans topp">⌃</a>
  </div>
  <div class="footer-extra">
    <a href="/for-forfattare.html">För författare · Videor · Printables · Skrivtips</a>
    <a href="/annat.html">Annat · Printables · Projekt · Inspiration</a>
  </div>
</footer>`; }
function newsletterForm(name,title,bodyText,note=''){return `<section class="newsletter-box"><p class="eyebrow">${esc(title)}</p><p>${esc(bodyText)}</p><form class="form-row" name="${esc(name)}" method="POST" data-netlify="true" data-local-success="Tack! Din anmälan är registrerad."><input type="hidden" name="form-name" value="${esc(name)}"><label class="visually-hidden" for="${esc(name)}-email">Din e-postadress</label><input id="${esc(name)}-email" type="email" name="email" placeholder="Din e-postadress" required><button class="btn primary" type="submit">Prenumerera</button></form>${note?`<p class="form-note">${esc(note)}</p>`:''}</section>`;}

// Startsidan har en egen design (mockup) med egen header/footer och stilmallen /assets/css/home.css.
// Övriga sidor använder fortfarande layout() och styles.css.
function homePage(){
 const wanted=['bakom-kulisserna','platser-som-inspirerar','tema-och-budskap'];
 const latest=wanted.map(slug=>posts.find(p=>p.slug===slug)).filter(Boolean);
 const orn=(cls='')=>`<svg class="ornament${cls?' '+cls:''}"><use href="#ornament"/></svg>`;
 const icon=(id)=>`<svg><use href="#i-${id}"/></svg>`;
 const socials=[['Instagram',site.instagram,'instagram'],['YouTube',site.youtube,'youtube']].filter(([,url])=>url).map(([label,url,id])=>`<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${icon(id)}</a>`).join('\n    ');
 const navItems=[['Hem','/index.html'],['Om mig','/om-mig.html'],['Böcker','/books.html'],['Noveller','/noveller.html'],['Världen','#varlden'],['Nyheter','/blog.html'],['Kontakt','/contact.html']];
 const navLinks=(wrap)=>navItems.map(([label,href],i)=>wrap(`<a href="${href}"${i===0?' aria-current="page"':''}>${esc(label)}</a>`)).join('\n      ');
 const logo=(extra='',cls='logo')=>`<a class="${cls}" href="/index.html">
      <span class="logo__name">${esc(site.author_name)}</span>
      <span class="logo__tag">${esc(site.tagline)}</span>${extra}
    </a>`;
 return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(site.author_name)} – Fantasy, berättelser, världar</title>
  <meta name="description" content="Noveller, skrivliv och glimtar ur den kreativa processen från fantasyförfattaren ${esc(site.author_name)}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+SC:wght@500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
  <link rel="preload" as="image" href="${esc(home.hero.image)}">
  <link rel="stylesheet" href="/assets/css/home.css">
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ornament" viewBox="0 0 140 14">
    <line x1="0" y1="7" x2="58" y2="7" stroke="currentColor" stroke-width="1"/>
    <path d="M70 1 L73 7 L70 13 L67 7 Z" fill="currentColor"/>
    <line x1="82" y1="7" x2="140" y2="7" stroke="currentColor" stroke-width="1"/>
  </symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/></symbol>
  <symbol id="i-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4V14h2.7v8h3.4z"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24"><path fill="currentColor" d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12c0 1.3.1 2.6.4 3.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15.1V8.9l5.2 3.1L10 15.1z"/></symbol>
</svg>

<a class="skip" href="#innehall">Hoppa till innehållet</a>

<img class="ivy ivy--top-left" src="/assets/images/murgrona-topp-vanster.webp" alt="" aria-hidden="true">
<img class="ivy ivy--top-right" src="/assets/images/murgrona-topp-hoger.webp" alt="" aria-hidden="true">

<header class="site-header">
  ${logo()}

  <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="huvudmeny">
    <span></span><span></span><span></span><span class="visually-hidden">Meny</span>
  </button>

  <nav id="huvudmeny" class="main-nav" data-main-nav aria-label="Huvudmeny">
    <ul>
      ${navLinks(a=>`<li>${a}</li>`)}
    </ul>
  </nav>

  <div class="social">
    ${socials}
  </div>
</header>

<main id="innehall">

  <section class="hero" style="--hero-img:url('${esc(home.hero.image)}')">
    <div class="hero__text">
      <p class="kicker">${esc(home.hero.eyebrow)}</p>
      ${orn('ornament--small')}
      <h1>${esc(home.hero.title)}</h1>
      <p class="hero__lead">${esc(home.hero.subtitle)}</p>
      ${orn()}
      <p class="hero__body">${esc(home.hero.body)}</p>
      <div class="buttons">
        <a class="btn btn--solid" href="/noveller.html">Läs noveller</a>
        <a class="btn btn--outline" href="/blog.html">Besök bloggen</a>
      </div>
      <a class="text-link" href="/om-mig.html">Om mig <span aria-hidden="true">›</span></a>
    </div>
  </section>

  <section class="about" id="om-mig">
    <img class="ivy ivy--about-left" src="/assets/images/murgrona-horn.webp" alt="" aria-hidden="true">
    <img class="ivy ivy--about-right" src="/assets/images/murgrona-gren.webp" alt="" aria-hidden="true">
    <img class="ivy ivy--about-top" src="/assets/images/blad.webp" alt="" aria-hidden="true">

    <div class="about__inner">
      <figure class="about__photo">
        <img src="${esc(home.about.image)}" alt="Porträtt av ${esc(site.author_name)}" width="600" height="660" loading="lazy">
      </figure>

      <div class="about__text">
        <h2>${esc(home.about.title)}</h2>
        ${orn()}
        <p>${esc(home.about.body)}</p>
        <a class="btn btn--outline" href="/om-mig.html">Läs mer om mig</a>
      </div>

      <blockquote class="about__quote">
        <span class="quote-mark" aria-hidden="true">“</span>
        <p>${esc(home.about.quote)}</p>
        <footer>${esc(site.author_name)}</footer>
        ${orn('ornament--small')}
      </blockquote>
    </div>
  </section>

  <section class="world" id="varlden" style="--world-img:url('${esc(home.world.image)}')">
    <div class="world__art" aria-hidden="true"></div>
    <img class="world__forest" src="/assets/images/skog.webp" alt="" aria-hidden="true">
    <div class="world__text">
      <h2>${esc(home.world.title)}</h2>
      <p>${esc(home.world.body)}</p>
      <a class="btn btn--gold" href="/annat.html">Till världen</a>
    </div>
  </section>

  <section class="latest" id="nyheter">
    <div class="latest__blog">
      <h2>Senaste från bloggen</h2>
      ${orn('ornament--left')}

      <div class="posts">
        ${latest.map(p=>`<article class="post">
          <a href="/blog/${esc(p.slug)}.html"><img src="${esc(p.image)}" alt="" loading="lazy"></a>
          <h3><a href="/blog/${esc(p.slug)}.html">${esc(p.title)}</a></h3>
          <p class="post__sub">${esc(p.excerpt)}</p>
          <time datetime="${esc(p.date)}">${esc(formatDate(p.date))}</time>
        </article>`).join('\n        ')}
      </div>
    </div>

    <aside class="newsletter" id="kontakt">
      <h2>${esc(home.newsletter.title)}</h2>
      <p>${esc(home.newsletter.body)}</p>
      <form name="newsletter-home" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-local-success="Tack! Din anmälan är registrerad.">
        <input type="hidden" name="form-name" value="newsletter-home">
        <p class="visually-hidden"><label>Fyll inte i detta: <input name="bot-field"></label></p>
        <label class="visually-hidden" for="epost">E-postadress</label>
        <input id="epost" type="email" name="email" placeholder="Din e-postadress" required>
        <button class="btn btn--solid" type="submit">Prenumerera</button>
      </form>
      ${home.newsletter.note?`<p class="newsletter__note">${esc(home.newsletter.note)}</p>`:''}
      <img class="newsletter__sprig" src="/assets/images/kvist.webp" alt="" aria-hidden="true">
    </aside>
  </section>
</main>

<footer class="site-footer">
  <img class="site-footer__forest" src="/assets/images/skog.webp" alt="" aria-hidden="true">
  <div class="site-footer__main">
    ${logo(`\n      <small>${esc(site.copyright)}</small>`,'logo logo--light')}

    <nav class="footer-nav" aria-label="Sidfotsmeny">
      ${navLinks(a=>a)}
    </nav>

    <div class="footer-right">
      <div class="social social--light">
        ${socials}
        <a class="to-top" href="#" aria-label="Till toppen">
          <svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        </a>
      </div>
      <p class="tagline">${esc(site.footer_tagline)}</p>
      ${orn('ornament--small')}
    </div>
  </div>

  <div class="site-footer__bar">
    <nav aria-label="För författare">
      <a href="/for-forfattare.html">För författare</a> · <a href="/for-forfattare.html#youtube">Videor</a> · <a href="/for-forfattare.html#printables">Printables</a> · <a href="/blog.html">Skrivtips</a>
    </nav>
    <nav aria-label="Övrigt">
      <a href="/annat.html">Annat</a> · <a href="/annat.html#printables">Printables</a> · <a href="/annat.html#projekt">Projekt</a> · <a href="/annat.html#inspiration">Inspiration</a>
    </nav>
  </div>
</footer>

<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

function postCard(p){return `<article class="card"><a href="/blog/${esc(p.slug)}.html"><div class="card-media">${img(p.image,p.title)}</div><div class="card-body"><div class="meta">${esc(p.category)} · ${esc(formatDate(p.date))}</div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="link-arrow">Läs mer</span></div></a></article>`;}
function storyCard(s){return `<article class="card story-card" data-story-genre="${esc(s.genre)}"><a href="/noveller/${esc(s.slug)}.html"><div class="card-media">${img(s.image,s.title)}<span class="genre-badge">${esc(s.genre)}</span></div><div class="card-body"><h3>${esc(s.title)}</h3><p>${esc(s.excerpt)}</p><span class="link-arrow">Läs mer</span></div></a></article>`;}

function aboutPage(){return layout({title:'Om mig',description:'Om '+site.author_name+', hennes skrivande, inspiration och process.',active:'about',body:`
<section class="about-hero"><div class="image" style="background-image:url('${esc(about.hero.image)}')"></div><div class="copy"><p class="eyebrow">Om mig</p><h1>${esc(about.hero.title)}</h1><div class="rule"></div><p class="section-subtitle">${esc(about.hero.subtitle)}</p><p>${esc(about.hero.body)}</p></div></section>
<section class="section paper"><div class="container about-layout"><div><p class="eyebrow">Min väg hit</p><h2 class="section-title">${esc(about.path.title)}</h2><div class="rule"></div>${about.path.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<a class="btn" href="/books.html">Mina böcker</a></div><div>${img(about.path.image,'Natur och inspiration')}</div><aside class="facts"><p class="eyebrow">Snabba fakta</p>${about.facts.map(f=>`<div class="fact"><strong>${esc(f.label)}</strong><span>${esc(f.value)}</span></div>`).join('')}</aside></div></section>
<section class="section paper-alt"><div class="container process-grid"><div><p class="eyebrow">Min skrivprocess</p><h2 class="section-title">${esc(about.process.title)}</h2><div class="rule"></div><p>${esc(about.process.body)}</p><a class="btn" href="/for-forfattare.html">Mer om skrivprocessen</a></div><div>${img(about.process.image,'Skrivprocess')}</div></div></section>
<section class="section paper"><div class="container"><p class="eyebrow">Inspiration</p><div class="four-col">${about.inspiration.map(i=>`<article class="inspiration-card">${img(i.image,i.title)}<div class="overlay"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div></article>`).join('')}</div></div></section>
<section class="section dark"><div class="container" style="text-align:center;max-width:850px"><p class="section-subtitle" style="color:#fff;font-size:1.7rem">“${esc(about.quote)}”</p><p class="eyebrow" style="color:#e9ddcb">${esc(site.author_name)}</p></div></section>`});}

function booksPage(){return layout({title:'Böcker',description:'Böcker och längre verk av '+site.author_name+'.',active:'books',body:`
<section class="banner-hero" style="background-image:url('${esc(books.hero.image)}')"><div class="container"><div class="copy"><p class="eyebrow" style="color:#f0e4d4">Böcker</p><h1>${esc(books.hero.title)}</h1><p class="section-subtitle" style="color:#fff">${esc(books.hero.subtitle)}</p><p>${esc(books.hero.body)}</p></div></div></section>
<section class="section paper"><div class="container feature-book"><div>${img(books.featured.image,books.featured.title,'book-cover')}</div><div class="copy"><p class="eyebrow">${esc(books.featured.kicker)}</p><h2>${esc(books.featured.title)}</h2><p class="section-subtitle">${esc(books.featured.tagline)}</p><div class="rule"></div><p>${esc(books.featured.description)}</p><p><strong>${esc(books.featured.genre)}</strong><br>${esc(books.featured.status)}</p><a class="btn primary" href="/contact.html">Fråga om projektet</a></div><blockquote class="feature-quote">“Berättelser växer fram i sin egen takt. Här kan du följa vad som händer längs vägen.”</blockquote></div></section>
<section class="section paper-alt"><div class="container"><p class="eyebrow">Andra verk</p><div class="three-col">${books.other.map(b=>`<article class="card book-card"><div class="card-media">${img(b.image,b.title)}</div><div class="card-body"><div class="meta">${esc(b.genre)}</div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p><a class="btn small" href="/contact.html">Läs mer</a></div></article>`).join('')}</div></div></section>
<section class="section dark"><div class="container">${newsletterForm('newsletter-books',books.newsletter_title,books.newsletter_body)}</div></section>`});}

function novelsPage(){
 const genres=['Alla',...new Set(stories.map(s=>s.genre))];
 return layout({title:'Noveller',description:'Noveller av '+site.author_name+' i flera genrer.',active:'stories',body:`
<section class="novels-hero" style="background-image:url('/assets/images/novels-hero.jpg')"><div class="container"><div class="copy"><p class="eyebrow">Noveller</p><h1>Noveller</h1><p class="section-subtitle">Stora världar ryms ibland i små berättelser.</p><p>Här samlar jag mina noveller – berättelser om människors liv, stora frågor och det oväntade som kan förändra allt.</p></div></div></section>
<section class="section paper"><div class="container"><p class="eyebrow">Utforska noveller</p><div class="filters" role="group" aria-label="Filtrera noveller">${genres.map((g,i)=>`<button class="filter-btn${i===0?' active':''}" type="button" data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div><div class="story-grid">${stories.map(storyCard).join('')}</div><div class="empty-state" data-empty-state>Inga noveller finns i den här kategorin ännu.</div></div></section>`});
}

function storyPage(s){
 const related=stories.filter(x=>x.slug!==s.slug && x.genre===s.genre).slice(0,2);
 return layout({title:s.title,description:s.excerpt,active:'stories',body:`
<section class="story-hero" style="background-image:url('${esc(s.hero)}')"><div class="container"><div class="meta">${esc(s.genre)}</div><h1>${esc(s.title)}</h1><p style="font-size:1.25rem">En novell av ${esc(site.author_name)}</p><div class="story-meta"><span>${esc(s.read_time)} lästid</span><span>${esc(s.word_count)}</span><button type="button" data-copy-link class="btn small" style="color:#fff;border-color:#c9ab75">Kopiera länk</button></div></div></section>
<section class="section paper"><div class="container story-layout"><article><p class="story-intro">${esc(s.excerpt)}</p><div class="rule"></div><div class="story-text">${paras(s.body)}</div></article><aside class="story-side"><section class="info-card"><h2>Om novellen</h2><dl class="details"><dt>Titel</dt><dd>${esc(s.title)}</dd><dt>Genre</dt><dd>${esc(s.genre)}</dd><dt>Längd</dt><dd>${esc(s.word_count)} (${esc(s.read_time)})</dd><dt>Publicerad</dt><dd>${esc(s.year)}</dd><dt>Teman</dt><dd>${esc(s.themes)}</dd></dl></section><blockquote class="info-card" style="font-size:1.15rem;font-style:italic;text-align:center">“${esc(s.quote)}”<br><small>– ${esc(site.author_name)}</small></blockquote>${related.length?`<section class="info-card"><h2>Fler i samma genre</h2>${related.map(r=>`<a class="related-mini" href="/noveller/${esc(r.slug)}.html">${img(r.image,r.title)}<span><strong>${esc(r.title)}</strong><br><small>${esc(r.excerpt)}</small></span></a>`).join('<hr>')}</section>`:''}</aside></div></section>`});
}

function blogPage(){
 const cats=['Alla',...new Set(posts.map(p=>p.category))];
 return layout({title:'Bloggen',description:'Blogg om skrivande, inspiration och berättelser av '+site.author_name+'.',active:'blog',body:`
<section class="blog-hero" style="background-image:url('${esc(home.hero.image)}')"><div class="container"><div class="copy"><p class="eyebrow">Nyheter & blogg</p><h1>Bloggen</h1><p class="section-subtitle">Tankar, inspiration och inblickar bakom berättelserna.</p><p>Här delar jag med mig av skrivprocessen, research, karaktärer, platser och sådant som ryms mellan idé och färdig text.</p></div></div></section>
<section class="section paper"><div class="container blog-layout"><div><div class="filters">${cats.map((c,i)=>`<button class="filter-btn${i===0?' active':''}" type="button" data-post-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="blog-grid" data-post-grid>${posts.map(p=>`<div data-post-category="${esc(p.category)}">${postCard(p)}</div>`).join('')}</div></div><aside class="sidebar-panel"><p class="eyebrow">Välkommen hit</p><p>Här på bloggen delar jag tankar, inspiration och glimtar bakom mina berättelser.</p><a class="btn small" href="/om-mig.html">Läs mer om mig</a><hr style="border:0;border-top:1px solid var(--line);margin:2rem 0"><p class="eyebrow">Kategorier</p><div class="category-list">${cats.filter(c=>c!=='Alla').map(c=>`<span>${esc(c)}</span>`).join('')}</div><hr style="border:0;border-top:1px solid var(--line);margin:2rem 0">${newsletterForm('newsletter-blog','Håll dig uppdaterad','Få nya blogginlägg och inblickar direkt i din inkorg.')}</aside></div></section>`,scripts:`<script>document.querySelectorAll('[data-post-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-post-filter]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-post-category]').forEach(x=>x.hidden=b.dataset.postFilter!=='Alla'&&x.dataset.postCategory!==b.dataset.postFilter)}));</script>`});
}

function postPage(p){return layout({title:p.title,description:p.excerpt,active:'blog',body:`<section class="banner-hero" style="background-image:url('${esc(p.image)}')"><div class="container"><div class="copy"><p class="eyebrow">${esc(p.category)} · ${esc(formatDate(p.date))}</p><h1 style="font-size:clamp(2.8rem,5vw,5rem)">${esc(p.title)}</h1><p>${esc(p.excerpt)}</p></div></div></section><section class="section paper"><article class="container story-text" style="max-width:760px"><div class="rule"></div>${paras(p.body)}<p style="margin-top:3rem"><a class="btn" href="/blog.html">Tillbaka till bloggen</a></p></article></section>`});}

function writersPage(){
 const [main,...small]=writers.videos;
 return layout({title:'För författare',description:'YouTube-videor, printables och skrivtips av '+site.author_name+'.',active:'writers',body:`
<section class="resources-hero"><div class="copy"><p class="eyebrow">${esc(writers.hero.eyebrow)}</p><h1>${esc(writers.hero.title)}</h1><div class="rule"></div><p>${esc(writers.hero.body)}</p><div class="hero-actions"><a class="btn primary" href="#youtube">Se YouTube-videor</a><a class="btn" href="#printables">Printables</a></div></div><div class="image" style="background-image:url('${esc(writers.hero.image)}')"></div></section>
<section id="youtube" class="section paper"><div class="container resource-band"><div><p class="eyebrow">YouTube-videor</p><p>${esc(writers.youtube_intro)}</p><a class="btn small" href="${esc(site.youtube)}" target="_blank" rel="noopener">Till YouTube</a></div><div class="video-grid"><a class="video-main" href="${esc(main.url)}" target="_blank" rel="noopener" style="background-image:url('${esc(main.image)}')"><div><div class="meta">YouTube</div><h2>${esc(main.title)}</h2><p>${esc(main.subtitle)}</p></div></a><div class="stack">${small.map(v=>`<a class="video-small" href="${esc(v.url)}" target="_blank" rel="noopener" style="background-image:url('${esc(v.image)}')"><span><strong>${esc(v.title)}</strong><br><small>${esc(v.subtitle)}</small></span></a>`).join('')}</div></div></div></section>
<section id="printables" class="section paper-alt"><div class="container resource-band"><div><p class="eyebrow">Printables</p><p>${esc(writers.printables_intro)}</p></div><div class="printables-grid">${writers.printables.map(p=>`<article class="printable-card">${img(p.image,p.title)}<h3>${esc(p.title)}</h3>${p.file?`<a class="btn small" href="${esc(p.file)}" download>Ladda ner</a>`:`<span class="meta">Fil kan läggas till i CMS</span>`}</article>`).join('')}</div></div></section>
<section class="section paper"><div class="container resource-band"><div><p class="eyebrow">Kom igång med ditt skrivande</p><p>En enkel väg från idé till bearbetad text.</p></div><ol style="font-size:1.15rem;margin:0;padding-left:1.4rem">${writers.guide_steps.map(x=>`<li style="padding:.6rem 0;border-bottom:1px solid var(--line)">${esc(x)}</li>`).join('')}</ol></div></section>
<section class="section dark"><div class="container">${newsletterForm('newsletter-writers',writers.newsletter_title,writers.newsletter_body)}</div></section>`});}

function otherPage(){return layout({title:'Annat',description:'Printables, projekt, inspirationsmaterial och annat av '+site.author_name+'.',active:'other',body:`
<section class="resources-hero"><div class="copy"><p class="eyebrow">${esc(other.hero.eyebrow)}</p><h1>${esc(other.hero.title)}</h1><div class="rule"></div><p>${esc(other.hero.body)}</p></div><div class="image" style="background-image:url('${esc(other.hero.image)}')"></div></section>
<section class="section paper"><div class="container other-grid">${other.cards.map((c,i)=>`<article class="card" id="${['printables','projekt','inspiration','ovrigt'][i]}"><div class="card-media">${img(c.image,c.title)}</div><div class="card-body"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><a class="btn small" href="${esc(c.url)}">${esc(c.label)}</a></div></article>`).join('')}</div></section>
<section class="section paper-alt"><div class="container">${newsletterForm('newsletter-other',other.newsletter_title,other.newsletter_body)}</div></section>`});}

function contactPage(){return layout({title:'Kontakt',description:'Kontakta '+site.author_name+' för frågor, samarbeten och författarbesök.',active:'contact',body:`
<section class="banner-hero" style="background-image:url('${esc(contact.hero.image)}')"><div class="container"><div class="copy"><p class="eyebrow" style="color:#f0e4d4">Kontakt</p><h1>${esc(contact.hero.title)}</h1><p class="section-subtitle" style="color:#fff">${esc(contact.hero.subtitle)}</p><p>${esc(contact.hero.body)}</p></div></div></section>
<section class="section paper"><div class="container contact-grid"><div><p class="eyebrow">Skicka ett meddelande</p><form class="form" name="contact" method="POST" data-netlify="true" data-local-success="Tack! Meddelandet är skickat."><input type="hidden" name="form-name" value="contact"><div><label for="name">Namn</label><input id="name" name="name" required></div><div><label for="email">E-post</label><input id="email" type="email" name="email" required></div><div><label for="subject">Ämne</label><select id="subject" name="subject"><option>Läsarfråga</option><option>Samarbete</option><option>Skolor & bibliotek</option><option>Övrigt</option></select></div><div><label for="message">Meddelande</label><textarea id="message" name="message" required></textarea></div><button class="btn primary" type="submit">Skicka meddelande</button></form><div class="reasons-grid">${contact.reasons.map(r=>`<div class="reason"><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('')}</div></div><div><p class="eyebrow">Vanliga frågor</p><div class="faq-list">${contact.faqs.map((f,i)=>`<div class="faq-item"><button type="button" data-faq-button aria-expanded="${i===0?'true':'false'}"><span>${esc(f.q)}</span><span data-faq-symbol>${i===0?'−':'+'}</span></button><div class="faq-answer" data-faq-answer${i===0?'':' hidden'}>${esc(f.a)}</div></div>`).join('')}</div></div></div></section>
<section class="section dark"><div class="container">${newsletterForm('newsletter-contact','Håll dig uppdaterad','Få nyheter om berättelser, projekt och nya resurser direkt i din inkorg.')}</div></section>`});}

function notFound(){return layout({title:'Sidan hittades inte',description:'Sidan kunde inte hittas.',body:`<section class="section paper"><div class="container" style="max-width:720px;text-align:center;padding-block:8rem"><p class="eyebrow">404</p><h1 class="section-title">Sidan hittades inte</h1><p>Den här länken leder inte till någon sida ännu.</p><a class="btn primary" href="/index.html">Till startsidan</a></div></section>`});}

function write(rel, html){const p=path.join(dist,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,html,'utf8');}

fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
write('index.html',homePage());
write('om-mig.html',aboutPage());
write('books.html',booksPage());
write('noveller.html',novelsPage());
write('blog.html',blogPage());
write('for-forfattare.html',writersPage());
write('annat.html',otherPage());
write('contact.html',contactPage());
write('404.html',notFound());
for(const s of stories){write(path.join('noveller',s.slug+'.html'),storyPage(s));if(s.slug==='implantatet') write('implantatet.html',storyPage(s));}
for(const p of posts) write(path.join('blog',p.slug+'.html'),postPage(p));
write('robots.txt','User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
const urls=['/','/om-mig.html','/books.html','/noveller.html','/blog.html','/for-forfattare.html','/annat.html','/contact.html',...stories.map(s=>'/noveller/'+s.slug+'.html'),...posts.map(p=>'/blog/'+p.slug+'.html')];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${urls.length} pages to ${dist}`);
