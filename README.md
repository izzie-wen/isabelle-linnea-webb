# Isabelle Linnea – redigerbar produktionswebb

Den här versionen är **inte en skärmdump med klickytor**. Rubriker, brödtext, knappar, noveller, blogginlägg, FAQ och resurser är riktig HTML som byggs från redigerbara innehållsfiler i `content/`.

## Så fungerar projektet

- `content/` – allt innehåll du vill ändra.
- `assets/images/` – bilder som används på webbplatsen.
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
