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
const podd = readJSON('podd.json');
const poddBlocks = readCollection('podd').sort((a,b)=>a.number-b.number);

// Menyvalen – samma på alla sidor
const menuItems=[
  ['Hem','/index.html','home'],['Om mig','/om-mig.html','about'],['Böcker','/books.html','books'],['Noveller','/noveller.html','stories'],['Blogg','/blog.html','blog'],['För författare','/for-forfattare.html','writers'],['Annat','/annat.html','other'],['Kontakt','/contact.html','contact']
];

// Menyraden med murgröna högst upp – gemensam för alla sidor (stilar i /assets/css/topbar.css)
const topbarHead=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+SC:wght@500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/topbar.css">`;
function topbar(active=''){
 const icons={
  instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12c0 1.3.1 2.6.4 3.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15.1V8.9l5.2 3.1L10 15.1z"/></svg>'
 };
 const socials=[['Instagram',site.instagram,'instagram']].filter(([,url])=>url).map(([label,url,id])=>`<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${icons[id]}</a>`).join('\n    ');
 return `<img class="topbar-ivy topbar-ivy--left" src="/assets/images/murgrona-topp-vanster.webp" alt="" aria-hidden="true">
<img class="topbar-ivy topbar-ivy--right" src="/assets/images/murgrona-topp-hoger.webp" alt="" aria-hidden="true">
<header class="topbar">
  <a class="topbar-logo" href="/index.html">
    <span class="topbar-logo__name">${esc(site.author_name)}</span>
    <span class="topbar-logo__tag">${esc(site.tagline)}</span>
  </a>
  <button class="topbar-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="huvudmeny">
    <span></span><span></span><span></span><span class="visually-hidden">Meny</span>
  </button>
  <nav id="huvudmeny" class="topbar-nav" data-main-nav aria-label="Huvudmeny">
    <ul>
      ${menuItems.map(([label,href,key])=>`<li><a href="${href}"${active===key?' aria-current="page"':''}>${esc(label)}</a></li>`).join('\n      ')}
    </ul>
  </nav>
  <div class="topbar-social">
    ${socials}
  </div>
</header>`;
}

function layout({title,description='',active='',body,scripts='',head=''}){
return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title)} | ${esc(site.author_name)}</title>
<link rel="stylesheet" href="/assets/css/styles.css">
<link rel="stylesheet" href="/assets/css/home-exact.css">
${topbarHead}
<link rel="stylesheet" href="/assets/css/signup.css">
${head}
</head>
<body id="top">
<a class="skip-link" href="#main">Hoppa till innehållet</a>
${topbar(active)}
<main id="main">${body}</main>
${footer()}
<script src="/assets/js/site.js" defer></script>
${scripts}
</body></html>`;
}

function footer(){ return `${signup()}
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand"><strong>${esc(site.author_name).toUpperCase()}</strong><small>${esc(site.tagline)}</small><div class="copyright">${esc(site.copyright)}</div></div>
    <nav class="footer-nav" aria-label="Sidfot">
      ${menuItems.map(([label,href])=>`<a href="${href}">${esc(label)}</a>`).join('')}
    </nav>
    <div class="footer-right">
      <div class="footer-socials" aria-label="Sociala medier">
        <a href="${esc(site.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.8" r="1"/></svg></a>
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
// Nyhetsbrevet ovanför sidfoten – samma på alla sidor (stilar i /assets/css/signup.css, skickas av site.js).
// Trädsilhuetten (skog.webp) ligger sist i den här delen: texten och formuläret hamnar i "dalen"
// mellan de höga träden, och trädens mörka nederkant går sömlöst över i sidfoten.
function signup(){
 return `<section class="signup" aria-labelledby="signup-title">
  <div class="signup__inner">
    <div class="signup__text">
      <h2 class="signup__title" id="signup-title">${esc(site.newsletter_title||'Vill du veta när jag publicerat något nytt?')}</h2>
      <svg class="signup__ornament" viewBox="0 0 140 14" aria-hidden="true"><line x1="0" y1="7" x2="58" y2="7" stroke="currentColor" stroke-width="1"/><path d="M70 1 L73 7 L70 13 L67 7 Z" fill="currentColor"/><line x1="82" y1="7" x2="140" y2="7" stroke="currentColor" stroke-width="1"/></svg>
      ${site.newsletter_body?`<p>${esc(site.newsletter_body)}</p>`:''}
    </div>
    <form class="signup__form" name="nyhetsbrev" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-ajax-form data-hide-on-success data-success="Tack! Nu är du anmäld till nyhetsbrevet.">
      <input type="hidden" name="form-name" value="nyhetsbrev">
      <p class="signup__hp"><label>Fyll inte i detta: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <label class="signup__label" for="signup-email">Din e-postadress</label>
      <input id="signup-email" type="email" name="email" placeholder="Din e-postadress" autocomplete="email" required>
      <button type="submit">${esc(site.newsletter_button||'Ja tack!')}</button>
      <p class="signup__msg" data-form-msg role="status" aria-live="polite"></p>
    </form>
    <svg class="signup__birds" viewBox="0 0 64 26" aria-hidden="true"><path d="M2 14c4-4 8-4 11 0 3-4 7-4 11 0-4-1.5-8-1-11 2.5C10 13 6 12.5 2 14z"/><path d="M34 6c5-5 10-5 14 0 4-5 9-5 14 0-5-2-10-1.4-14 3C44 4.6 39 4 34 6z"/></svg>
  </div>
  <img class="signup__forest" src="/assets/images/skog.webp" alt="" aria-hidden="true" width="1600" height="312">
</section>`;
}

// Startsidan har en egen design (mockup) med egen footer och stilmallen /assets/css/home.css.
// Menyraden högst upp är gemensam för alla sidor: topbar() + topbar.css.
// Övriga sidor använder layout() och styles.css.
function homePage(){
 const wanted=['bakom-kulisserna','platser-som-inspirerar','tema-och-budskap'];
 const latest=wanted.map(slug=>posts.find(p=>p.slug===slug)).filter(Boolean);
 const orn=(cls='')=>`<svg class="ornament${cls?' '+cls:''}"><use href="#ornament"/></svg>`;
 const icon=(id)=>`<svg><use href="#i-${id}"/></svg>`;
 const socials=[['Instagram',site.instagram,'instagram']].filter(([,url])=>url).map(([label,url,id])=>`<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${icon(id)}</a>`).join('\n    ');
 const navLinks=(wrap)=>menuItems.map(([label,href],i)=>wrap(`<a href="${href}"${i===0?' aria-current="page"':''}>${esc(label)}</a>`)).join('\n      ');
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
  <link rel="stylesheet" href="/assets/css/topbar.css">
  <link rel="stylesheet" href="/assets/css/signup.css">
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

${topbar('home')}

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
  </section>
</main>

${signup()}

<footer class="site-footer">
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
<section class="section paper-alt"><div class="container"><p class="eyebrow">Andra verk</p><div class="three-col">${books.other.map(b=>`<article class="card book-card"><div class="card-media">${img(b.image,b.title)}</div><div class="card-body"><div class="meta">${esc(b.genre)}</div><h3>${esc(b.title)}</h3><p>${esc(b.description)}</p><a class="btn small" href="/contact.html">Läs mer</a></div></article>`).join('')}</div></div></section>`});}

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
<section class="section paper"><div class="container blog-layout"><div><div class="filters">${cats.map((c,i)=>`<button class="filter-btn${i===0?' active':''}" type="button" data-post-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="blog-grid" data-post-grid>${posts.map(p=>`<div data-post-category="${esc(p.category)}">${postCard(p)}</div>`).join('')}</div></div><aside class="sidebar-panel"><p class="eyebrow">Välkommen hit</p><p>Här på bloggen delar jag tankar, inspiration och glimtar bakom mina berättelser.</p><a class="btn small" href="/om-mig.html">Läs mer om mig</a><hr style="border:0;border-top:1px solid var(--line);margin:2rem 0"><p class="eyebrow">Kategorier</p><div class="category-list">${cats.filter(c=>c!=='Alla').map(c=>`<span>${esc(c)}</span>`).join('')}</div></aside></div></section>`,scripts:`<script>document.querySelectorAll('[data-post-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-post-filter]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-post-category]').forEach(x=>x.hidden=b.dataset.postFilter!=='Alla'&&x.dataset.postCategory!==b.dataset.postFilter)}));</script>`});
}

function postPage(p){return layout({title:p.title,description:p.excerpt,active:'blog',body:`<section class="banner-hero" style="background-image:url('${esc(p.image)}')"><div class="container"><div class="copy"><p class="eyebrow">${esc(p.category)} · ${esc(formatDate(p.date))}</p><h1 style="font-size:clamp(2.8rem,5vw,5rem)">${esc(p.title)}</h1><p>${esc(p.excerpt)}</p></div></div></section><section class="section paper"><article class="container story-text" style="max-width:760px"><div class="rule"></div>${paras(p.body)}<p style="margin-top:3rem"><a class="btn" href="/blog.html">Tillbaka till bloggen</a></p></article></section>`});}

function writersPage(){
 const [main,...small]=writers.videos;
 return layout({title:'För författare',description:'YouTube-videor, printables och skrivtips av '+site.author_name+'.',active:'writers',body:`
<section class="resources-hero"><div class="copy"><p class="eyebrow">${esc(writers.hero.eyebrow)}</p><h1>${esc(writers.hero.title)}</h1><div class="rule"></div><p>${esc(writers.hero.body)}</p><div class="hero-actions"><a class="btn primary" href="#youtube">Se YouTube-videor</a><a class="btn" href="#printables">Printables</a><a class="btn" href="/podd.html">Lyssna på podden</a></div></div><div class="image" style="background-image:url('${esc(writers.hero.image)}')"></div></section>
<section id="youtube" class="section paper"><div class="container resource-band"><div><p class="eyebrow">YouTube-videor</p><p>${esc(writers.youtube_intro)}</p><a class="btn small" href="${esc(site.youtube)}" target="_blank" rel="noopener">Till YouTube</a></div><div class="video-grid"><a class="video-main" href="${esc(main.url)}" target="_blank" rel="noopener" style="background-image:url('${esc(main.image)}')"><div><div class="meta">YouTube</div><h2>${esc(main.title)}</h2><p>${esc(main.subtitle)}</p></div></a><div class="stack">${small.map(v=>`<a class="video-small" href="${esc(v.url)}" target="_blank" rel="noopener" style="background-image:url('${esc(v.image)}')"><span><strong>${esc(v.title)}</strong><br><small>${esc(v.subtitle)}</small></span></a>`).join('')}</div></div></div></section>
<section id="printables" class="section paper-alt"><div class="container resource-band"><div><p class="eyebrow">Printables</p><p>${esc(writers.printables_intro)}</p></div><div class="printables-grid">${writers.printables.map(p=>`<article class="printable-card">${img(p.image,p.title)}<h3>${esc(p.title)}</h3>${p.file?`<a class="btn small" href="${esc(p.file)}" download>Ladda ner</a>`:`<span class="meta">Fil kan läggas till i CMS</span>`}</article>`).join('')}</div></div></section>
<section class="section paper"><div class="container resource-band"><div><p class="eyebrow">Kom igång med ditt skrivande</p><p>En enkel väg från idé till bearbetad text.</p></div><ol style="font-size:1.15rem;margin:0;padding-left:1.4rem">${writers.guide_steps.map(x=>`<li style="padding:.6rem 0;border-bottom:1px solid var(--line)">${esc(x)}</li>`).join('')}</ol></div></section>`});}

function otherPage(){return layout({title:'Annat',description:'Printables, projekt, inspirationsmaterial och annat av '+site.author_name+'.',active:'other',body:`
<section class="resources-hero"><div class="copy"><p class="eyebrow">${esc(other.hero.eyebrow)}</p><h1>${esc(other.hero.title)}</h1><div class="rule"></div><p>${esc(other.hero.body)}</p></div><div class="image" style="background-image:url('${esc(other.hero.image)}')"></div></section>
<section class="section paper"><div class="container other-grid">${other.cards.map((c,i)=>`<article class="card" id="${['printables','projekt','inspiration','ovrigt'][i]}"><div class="card-media">${img(c.image,c.title)}</div><div class="card-body"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><a class="btn small" href="${esc(c.url)}">${esc(c.label)}</a></div></article>`).join('')}</div></section>`});}

// Kontakt: banner med bild, formulär och andra kontaktvägar till vänster, vanliga frågor till höger.
// Stilar i /assets/css/kontakt.css. Texterna redigeras i content/contact.json (Pages CMS: Kontakt).
function contactPage(){
 const c=contact, hero=c.hero||{}, reasons=c.reasons||[], faqs=c.faqs||[];
 const icons={
  bok:'<path d="M3 6.2c3-1.2 6-1 9 .9 3-1.9 6-2.1 9-.9v12.4c-3-1.2-6-1-9 .9-3-1.9-6-2.1-9-.9z"/><path d="M12 7.1v12.4"/>',
  penna:'<path d="M15.8 4.2l4 4L8.6 19.4l-5.1 1.1 1.1-5.1z"/><path d="M13.6 6.4l4 4"/>',
  personer:'<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.5-3.6 2.9-5.6 6-5.6s5.5 2 6 5.6"/><circle cx="17.2" cy="8.8" r="2.5"/><path d="M15.8 14.1c2.8-.3 4.8 1.4 5.2 4.7"/>',
  pratbubbla:'<path d="M20.5 11.6c0 4-3.8 7.1-8.5 7.1-1.3 0-2.5-.2-3.6-.6L4 19.8l1.4-3.6c-1.1-1.2-1.9-2.8-1.9-4.6 0-4 3.8-7.1 8.5-7.1s8.5 3.1 8.5 7.1z"/>'
 };
 const iconOrder=['bok','penna','personer','pratbubbla'];
 const icon=(name,i)=>`<svg class="ct-reason__icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons[iconOrder[i%iconOrder.length]]}</svg>`;
 const orn=(cls='')=>`<span class="ct-orn${cls?' '+cls:''}" aria-hidden="true"><span>◆</span></span>`;
 const chevron='<svg class="ct-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
 const arrow='<svg class="ct-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
 // Ämnena i formuläret = rubrikerna under "Andra sätt att kontakta mig"
 const subjects=reasons.length?reasons.map(r=>r.title):['Läsarfråga','Samarbete','Skolor & bibliotek','Övrigt'];
 const [noteFirst,...noteRest]=String(c.faq_note||'').split(/(?<=\?)\s+/);
 return layout({title:'Kontakt',description:'Kontakta '+site.author_name+' för frågor, samarbeten och författarbesök.',active:'contact',
  head:'<link rel="stylesheet" href="/assets/css/kontakt.css">',
  body:`
<section class="ct-hero"${hero.image?` style="--ct-hero:url('${esc(hero.image)}')"`:''}>
  <div class="ct-wrap ct-hero__inner">
    <h1>${esc(hero.title||'Kontakt')}</h1>
    ${orn('ct-orn--short')}
    ${hero.subtitle?`<p class="ct-hero__lead">${esc(hero.subtitle)}</p>`:''}
    ${hero.body?`<p class="ct-hero__body">${esc(hero.body)}</p>`:''}
  </div>
</section>
<section class="ct-main">
  <div class="ct-wrap ct-grid">
    <div class="ct-col" id="meddelande">
      <h2 class="ct-h">Skicka ett meddelande</h2>
      ${orn()}
      <form class="ct-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-ajax-form data-success="Tack för ditt meddelande! Jag återkommer så snart jag kan.">
        <input type="hidden" name="form-name" value="contact">
        <p class="ct-hidden"><label>Fyll inte i detta: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <label class="ct-hidden" for="ct-name">Namn</label>
        <input id="ct-name" name="name" placeholder="Namn *" autocomplete="name" required>
        <label class="ct-hidden" for="ct-email">E-post</label>
        <input id="ct-email" type="email" name="email" placeholder="E-post *" autocomplete="email" required>
        <label class="ct-hidden" for="ct-subject">Ämne</label>
        <div class="ct-select">
          <select id="ct-subject" name="subject" required>
            <option value="" disabled selected>Ämne *</option>
            ${subjects.map(s=>`<option>${esc(s)}</option>`).join('\n            ')}
          </select>
          ${chevron}
        </div>
        <label class="ct-hidden" for="ct-message">Meddelande</label>
        <textarea id="ct-message" name="message" placeholder="Meddelande *" rows="6" required></textarea>
        <button class="ct-btn" type="submit">Skicka meddelande ${arrow}</button>
        <p class="ct-form__msg" data-form-msg role="status" aria-live="polite"></p>
      </form>
      ${c.form_note?`<p class="ct-note">${esc(c.form_note)}</p>`:''}
      ${reasons.length?`<h2 class="ct-h ct-h--small">Andra sätt att kontakta mig</h2>
      ${orn()}
      <div class="ct-reasons">
        ${reasons.map((r,i)=>`<div class="ct-reason">${icon(r.icon,i)}<div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div></div>`).join('\n        ')}
      </div>`:''}
    </div>
    <div class="ct-col ct-col--faq">
      <h2 class="ct-h">Vanliga frågor</h2>
      ${orn()}
      <div class="ct-faq">
        ${faqs.map((f,i)=>`<div class="ct-faq__item">
          <button type="button" id="fraga-${i+1}" data-faq-button aria-expanded="${i===0?'true':'false'}" aria-controls="svar-${i+1}"><span>${esc(f.q)}</span>${chevron}</button>
          <div class="ct-faq__answer" id="svar-${i+1}" role="region" aria-labelledby="fraga-${i+1}" data-faq-answer${i===0?'':' hidden'}><p>${esc(f.a)}</p></div>
        </div>`).join('\n        ')}
      </div>
      ${c.faq_note?`<a class="ct-faq__note" href="#meddelande"><span>${esc(noteFirst)}</span>${noteRest.length?` <span>${esc(noteRest.join(' '))}</span>`:''} ${arrow}</a>`:''}
    </div>
  </div>
</section>`});}

// Podd: block och avsnitt från content/podd/*.json, sidinställningar i content/podd.json.
// Ljudfilerna ligger utanför webbplatsen. Ett avsnitt får sin ljudfil antingen från fältet "audio"
// (en länk per avsnitt) eller automatiskt från audio_base + /avsnitt-001.mp3 … för alla avsnitt
// till och med published_through.
function poddPage(){
 const base=String(podd.audio_base||'').trim().replace(/\/+$/,'');
 const upTo=Number(podd.published_through)||0;
 const audioFor=(e)=>String(e.audio||'').trim()||(base&&e.number<=upTo?`${base}/avsnitt-${String(e.number).padStart(3,'0')}.mp3`:'');
 const categories=[...new Set(poddBlocks.map(b=>b.category).filter(Boolean))];
 const total=poddBlocks.reduce((n,b)=>n+(b.episodes||[]).length,0);
 // Ikonerna definieras en gång (sprite) och återanvänds med <use>, så att sidan med ~400 avsnitt hålls liten
 const sprite=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="pi-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></symbol>
  <symbol id="pi-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></symbol>
  <symbol id="pi-doc" viewBox="0 0 24 24"><path d="M6 2.5h8l4.5 4.5v14.5H6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 2.5V7h4.5M9 11h6.5M9 14h6.5M9 17h4.5" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
  <symbol id="pi-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="pi-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="pi-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
</svg>`;
 const use=(id,cls='')=>`<svg${cls?` class="${cls}"`:''} aria-hidden="true"><use href="#pi-${id}"/></svg>`;
 const ic={play:use('play','i-play'),pause:use('pause','i-pause'),doc:use('doc'),chevron:use('chevron'),arrow:use('arrow'),search:use('search')};
 const episode=(e)=>{
  const audio=audioFor(e), hasNote=Boolean(e.description||e.notes);
  // En rad per avsnitt (sidan har ~400 avsnitt, så varje tecken räknas)
  return `<li class="pod-ep${audio?'':' is-soon'}" id="avsnitt-${e.number}" data-ep="${e.number}"${audio?` data-audio="${esc(audio)}"`:''}>`
   +`<span class="pod-ep__num">${e.number}</span>`
   +`<button class="pod-ep__play" type="button" data-play aria-label="${audio?'Spela':'Kommer snart:'} avsnitt ${e.number}">${ic.play}${ic.pause}</button>`
   +`<span class="pod-ep__title">${esc(e.title)}</span>`
   +`<span class="pod-ep__time" data-time>${audio?esc(e.duration||''):''}</span>`
   +(hasNote?`<button class="pod-ep__notes" type="button" data-note aria-expanded="false" aria-controls="anteckning-${e.number}" title="Anteckningar">${ic.doc}<span class="visually-hidden">Anteckningar till avsnitt ${e.number}</span></button>`
    +`<div class="pod-ep__note" id="anteckning-${e.number}" hidden>${e.description?`<p>${esc(e.description)}</p>`:''}${e.notes?paras(e.notes):''}</div>`:'')
   +`</li>`;
 };
 const block=(b,i)=>{
  const eps=b.episodes||[]; if(!eps.length) return '';
  const first=eps[0].number, last=eps[eps.length-1].number;
  const playable=eps.some(e=>audioFor(e)), hasNotes=eps.some(e=>e.description||e.notes);
  const search=[b.title,b.description,b.category].join(' ').toLowerCase();
  return `<details class="pod-block" id="block-${b.number}" data-category="${esc(b.category||'')}" data-search="${esc(search)}"${i===0?' open':''}>
    <summary class="pod-block__head">
      ${b.image?`<span class="pod-block__thumb"><img src="${esc(b.image)}" alt="" loading="lazy" width="760" height="713"></span>`:''}
      <h2 class="pod-block__title">Block ${b.number} – ${esc(b.title)}</h2>
      ${b.description?`<span class="pod-block__desc">${esc(b.description)}</span>`:''}
      <span class="pod-block__meta">${eps.length} avsnitt · Avsnitt ${first}–${last}${playable?'':'<em>Kommer snart</em>'}</span>
      <span class="pod-block__chevron" aria-hidden="true">${ic.chevron}</span>
    </summary>
    <div class="pod-block__body">
      ${b.image?`<figure class="pod-block__art"><img src="${esc(b.image)}" alt="" loading="lazy" width="760" height="713">${b.caption?`<figcaption>”${esc(b.caption)}”</figcaption>`:''}</figure>`:''}
      <div class="pod-block__list">
        <ol class="pod-eps">
        ${eps.map(episode).join('\n        ')}
        </ol>
        <div class="pod-block__actions">
          <button class="pod-btn pod-btn--solid" type="button" data-continue data-first="${first}">Börja med avsnitt ${first} ${ic.arrow}</button>
          ${hasNotes?`<button class="pod-btn" type="button" data-all-notes aria-expanded="false"><span>Visa alla anteckningar</span> ${ic.doc}</button>`:''}
        </div>
      </div>
    </div>
  </details>`;
 };
 const hero=podd.hero||{};
 // Podden ligger inte i huvudmenyn – den nås via en knapp på För författare, som därför markeras i menyn
 return layout({title:'Podd',description:`${total} avsnitt om skrivande och berättande i ${poddBlocks.length} block – från idé och karaktärer till dialog, redigering och utgivning.`,active:'writers',
  head:'<link rel="stylesheet" href="/assets/css/podd.css">',
  scripts:'<script src="/assets/js/podd.js" defer></script>',
  body:`${sprite}
<section class="pod-hero"${hero.image?` style="--pod-hero:url('${esc(hero.image)}')"`:''}>
  <div class="pod-wrap pod-hero__inner">
    <h1>${esc(hero.title||'Podd')}</h1>
    ${hero.subtitle?`<p>${esc(hero.subtitle)}</p>`:''}
  </div>
</section>
<div class="pod-page">
  <div class="pod-wrap">
    <div class="pod-tools">
      <label class="pod-search">${ic.search}<span class="visually-hidden">Sök bland alla avsnitt</span><input type="search" placeholder="Sök bland alla ${total} avsnitt …" data-pod-search autocomplete="off"></label>
      <div class="pod-filters" role="group" aria-label="Filtrera på ämne">
        <button type="button" class="is-active" aria-pressed="true" data-pod-filter="">Alla</button>
        ${categories.map(c=>`<button type="button" aria-pressed="false" data-pod-filter="${esc(c)}">${esc(c)}</button>`).join('\n        ')}
      </div>
    </div>
    <p class="pod-status" data-pod-status aria-live="polite"></p>
    <div class="pod-blocks">
    ${poddBlocks.map(block).join('\n    ')}
    </div>
  </div>
</div>
<div class="pod-player" data-pod-player hidden>
  <div class="pod-wrap pod-player__inner">
    <button class="pod-player__toggle" type="button" data-pp-toggle aria-label="Spela">${ic.play}${ic.pause}</button>
    <div class="pod-player__info"><span class="pod-player__label" data-pp-label></span><span class="pod-player__title" data-pp-title></span></div>
    <div class="pod-player__progress"><span data-pp-current>0:00</span><input type="range" min="0" max="0" step="1" value="0" data-pp-seek aria-label="Spola i avsnittet"><span data-pp-duration>0:00</span></div>
    <div class="pod-player__extra">
      <button type="button" data-pp-skip="-15" aria-label="15 sekunder bakåt">−15</button>
      <button type="button" data-pp-skip="15" aria-label="15 sekunder framåt">+15</button>
      <button type="button" data-pp-rate aria-label="Uppspelningshastighet">1×</button>
      <button type="button" data-pp-close aria-label="Stäng spelaren">✕</button>
    </div>
  </div>
  <audio data-pp-audio preload="none"></audio>
</div>
<div class="pod-toast" data-pod-toast role="status" hidden></div>`});
}

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
write('podd.html',poddPage());
write('404.html',notFound());
for(const s of stories){write(path.join('noveller',s.slug+'.html'),storyPage(s));if(s.slug==='implantatet') write('implantatet.html',storyPage(s));}
for(const p of posts) write(path.join('blog',p.slug+'.html'),postPage(p));
write('robots.txt','User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
const urls=['/','/om-mig.html','/books.html','/noveller.html','/blog.html','/for-forfattare.html','/podd.html','/annat.html','/contact.html',...stories.map(s=>'/noveller/'+s.slug+'.html'),...posts.map(p=>'/blog/'+p.slug+'.html')];
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${urls.length} pages to ${dist}`);
