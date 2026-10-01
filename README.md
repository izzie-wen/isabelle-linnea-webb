# Isabelle Linnea – redigerbar produktionswebb

Den här versionen är **inte en skärmdump med klickytor**. Rubriker, brödtext, knappar, noveller, blogginlägg, FAQ och resurser är riktig HTML som byggs från redigerbara innehållsfiler i `content/`.

## Så fungerar projektet

- `content/` – allt innehåll du vill ändra.
- `assets/images/` – bilder som används på webbplatsen.
- `assets/css/home.css` – stilmall för startsidan (ny design). Övriga sidor använder `assets/css/styles.css`.
- `assets/uploads/` – nya bilder/PDF:er som du laddar upp via CMS.
- `build.mjs` – bygger den färdiga webbplatsen.
- `dist/` – den färdiga webbplatsen som publiceras.
- `.pages.yml` – gör innehållet redigerbart i Pages CMS.
- `netlify.toml` – talar om för Netlify hur webbplatsen ska byggas.

## Testa lokalt

Du behöver Node.js 22 eller senare.

```bash
npm run build
npm run preview
```

Öppna sedan `http://localhost:8080`.

## Rekommenderad publicering

### 1. Skapa ett GitHub-konto och ett repository

Skapa exempelvis ett repository som heter `isabelle-linnea-webb` och ladda upp **hela projektmappen** (inte bara `dist`).

### 2. Koppla repositoryt till Netlify

I Netlify väljer du att skapa ett nytt projekt från Git. Välj GitHub-repositoryt.

Projektet innehåller redan `netlify.toml`, så Netlify använder:

- Build command: `node build.mjs`
- Publish directory: `dist`

Varje gång innehållet ändras i GitHub byggs och publiceras webbplatsen automatiskt.

### 3. Redigera utan att skriva kod – Pages CMS

Gå till `https://app.pagescms.org`, logga in med GitHub och ge Pages CMS åtkomst till repositoryt. Eftersom `.pages.yml` redan finns får du menyer för:

- Framsida
- Om mig
- Böcker
- Noveller
- Blogginlägg
- För författare
- Annat
- Kontakt / FAQ
- Webbplatsinställningar

När du trycker **Save** i Pages CMS sparas ändringen i GitHub. Netlify ser ändringen och publicerar den nya versionen automatiskt.

### 4. Egen domän

När Netlify-versionen fungerar kan du köpa eller använda en egen domän och lägga till den i **Netlify → Domain management**. Netlify visar exakt vilka DNS-poster du ska ändra hos din domänleverantör.

## Kontaktformulär och nyhetsbrev

Kontaktformuläret och nyhetsbrevsformulären är märkta som Netlify Forms. När webbplatsen ligger på Netlify kan formulärsvar visas i Netlify-kontot.

För ett riktigt utskicksbrev (kampanjer, automatiska mejl osv.) bör nyhetsbrevet senare kopplas till exempelvis Brevo eller Mailchimp. Formulären fungerar tills dess som insamling på Netlify.

## Podden (`/podd.html`)

- `content/podd.json` – bannerns rubrik, text och bild, samt inställningar för ljudfilerna.
- `content/podd/block-01.json` … `block-39.json` – ett block per fil med rubrik, ämne (filterknapp), beskrivning, citat på bilden, bild och avsnitt.
- `assets/images/podd/` – bilderna till blocken och bannern.
- `assets/css/podd.css` och `assets/js/podd.js` – utseende, sök/filter och ljudspelaren.

I Pages CMS heter delarna **Podd – sidinställningar** och **Podd – block och avsnitt**.

### Ljudfiler

Ljudfilerna ska **inte** ligga i det här repot eller på Netlify (de är för stora och varje lyssning skulle dra Netlify-krediter). Lägg dem hos en lagringstjänst för ljud/filer och länka dit. Två sätt:

1. **En mapp för alla avsnitt (enklast).** Ladda upp filerna med namnen `avsnitt-001.mp3`, `avsnitt-002.mp3` … `avsnitt-398.mp3`. Fyll i mappens adress i *Podd – sidinställningar → Adress till mappen med ljudfiler* och ändra *Publicerade avsnitt till och med nummer* varje gång du släpper nya avsnitt.
2. **En länk per avsnitt.** Klistra in direktlänken till mp3-filen i fältet *Ljudfil (länk)* på avsnittet. En länk i fältet går alltid före mappen.

Avsnitt utan ljudfil visas med en grå spelknapp och texten ”kommer snart”. Längden på avsnitten räknas ut automatiskt när ljudfilen finns (fältet *Längd* behöver bara fyllas i om du vill skriva den själv).

## Ändra direkt i filer

Du kan också ändra JSON-filerna manuellt. Exempel:

`content/home.json`

```json
{
  "hero": {
    "title": "Berättelser och tankar från min värld"
  }
}
```

Kör därefter `npm run build` om du jobbar lokalt.
