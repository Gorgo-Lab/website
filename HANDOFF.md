# Consegna del progetto

Documento per chi riprende il lavoro su un'altra macchina o dopo una pausa.
Descrive **dove siamo, cosa manca e in che ordine farlo**. Per l'architettura e
le regole del codice vedi [`AGENTS.md`](AGENTS.md).

Ultimo aggiornamento: 18 settembre 2026.

---

## Stato in due righe

Il sito è **online su Cloudflare Pages**, all'indirizzo provvisorio
`gorgolab-website.pages.dev`: build pulita, tutti i controlli verdi. Il codice
sta su GitHub, in `Gorgo-Lab/website`, **pubblico dal 18 settembre 2026**.

Il 17 settembre 2026 il sito è stato preparato alla pubblicazione: tolti i
contenuti inventati (restano il Mamecab e il modello, in bozza), caratteri
serviti dal sito invece che da Google, pagina `/privacy/`, intestazioni HTTP in
`public/_headers`, nessun riferimento a wiki e regolamento.

Il 18 settembre 2026 sono stati fatti gli ultimi due passi che dipendevano da
GitHub: il repository è diventato pubblico e `main` è protetto da un ruleset.
Nella stessa giornata: titolare del trattamento in `/privacy/`, file di licenza
con la riserva sul marchio, primo articolo del blog, revisione dei testi.

**Manca solo il dominio** (sezione 5). La wiki su `www.gorgolab.it` viene
eliminata a mano, senza redirect: i collegamenti che puntano lì moriranno, ed è
accettato. Il regolamento verrà riscritto come pagina del sito.

---

## 1. Portare il progetto su un'altra macchina

Il repository sta su GitHub ed è pubblico: per clonarlo non serve nulla. Per
**spingere** invece serve l'accesso in scrittura e una chiave SSH registrata;
senza chiave si clona l'URL HTTPS e si autentica al primo push.

```bash
git clone git@github.com:Gorgo-Lab/website.git gorgolab && cd gorgolab
git branch --show-current       # dev'essere "main"
nvm use                         # legge .nvmrc e seleziona Node 22
npm install
npm run validate                # deve passare tutto
```

Provato il 27 agosto 2026 su una seconda macchina (macOS 12, Intel):
installazione e `validate` passano tutti e quattro i controlli.

Il ramo principale si chiama **`main`**: il workflow in
`.github/workflows/ci.yml` è configurato su quel nome, e su un ramo chiamato
diversamente i controlli non partirebbero affatto — senza dare errore.

### Due cose che NON viaggiano con git

- **`node_modules/`** — si ricrea con `npm install`. Serve **Node ≥ 22.12**
  (sviluppato con la 22.23): `.nvmrc` la dichiara e `nvm use` la seleziona.
  Con una versione più vecchia — anche una 22 sotto la 22.12 — `astro build`
  si ferma subito con «Node.js vX is not supported by Astro!». Fallisce presto e
  a voce alta, ma se il Node predefinito della macchina è un altro conviene
  ricordarsi di `nvm use` prima di dare la colpa al progetto.
- **`tmp/Gorgo Lab Design System/`** — la cartella con il design system
  originale è esclusa dal repository di proposito: sono materiali di
  lavorazione, non contenuti del sito. Il suo contenuto utile è già stato
  tradotto in token in `src/styles/global.css` e le regole sono riassunte in
  `AGENTS.md`. **Se serve ancora come riferimento va copiata a parte**;
  altrimenti si può cancellare, come era già previsto.

---

## 2. Verificare che tutto funzioni

```bash
npm run dev                  # localhost:4321
npm run dev -- --host        # raggiungibile dagli altri dispositivi in LAN
npm run validate             # i quattro controlli della CI
```

`validate` deve chiudersi con:

```
✓ 20 file di contenuto, tutti entro i limiti.
- 0 errors
13 page(s) built
✓ 12 pagine, tutti i collegamenti interni risolvono.
```

I numeri crescono con i contenuti; conta che non ci siano errori. Con
`SHOW_DRAFTS=true` le pagine sono di più, perché compare il modello.

Se gli stili sembrano rotti o disallineati dopo modifiche estese al CSS, prima
di cercare il bug nel codice prova `npm run build && npm run preview`: il server
di sviluppo tiene in cache il CSS e ci ha già fatto perdere tempo una volta.

---

## 3. Dati e testi

Indirizzo, email, orari e attrezzature sono stati **confermati dai soci il 28
agosto 2026**. L'email è `info@martelab.it` di proposito: una casella
`@gorgolab.it` non esiste ancora. Quando esisterà si cambia in
`src/site.config.ts`, e da lì si aggiornano footer, contatti, 404 e privacy.

Restano da scrivere:

| Cosa | Dove andrà |
| --- | --- |
| Il regolamento | una pagina del sito, non un collegamento esterno |
| La cifra e le modalità della quota | `src/pages/spazio.astro` |
| Chi è il titolare del trattamento, in senso legale | `src/pages/privacy.astro` — oggi dice «il Gorgo Lab» |
| I social | `src/site.config.ts`, oggi vuoti e quindi nascosti |

Il carattere del wordmark **non è più una cosa da confermare**: sovrapponendo la
scritta del banner (`public/brand/banner.png`) alle candidate, lettera per
lettera, il marchio è **Poppins Bold**. Il disaccordo dei pixel è del 13,7 %
contro il 29,1 % di DM Sans e il 17,5 % di Archivo Black, che era il sostituto
in uso fino al 28 agosto 2026. Poppins è sotto licenza SIL OFL, quindi si può
usare liberamente, e ora è il carattere dei titoli di tutto il sito.

---

## 4. Repository su GitHub

Il repository è **`Gorgo-Lab/website`**, pubblico, ramo `main` protetto.
Resta da fare:

1. **`.github/CODEOWNERS`** — già compilato con `@naicodev`. Vanno aggiunti gli
   handle degli altri soci che devono comparire come revisori, quando ce ne
   saranno.

La CI invece è già stata provata sul campo: la **PR #1** (`progetto-mamecab`,
28 agosto 2026) l'ha fatta partire e il job è passato in 38 secondi su
`ubuntu-latest` con Node 22 — quindi il contenuto regge anche dove i nomi dei
file distinguono maiuscole e minuscole, cosa che sul Mac non si vede. La stessa
PR ha mostrato l'altra faccia: GitHub offriva il merge automatico, senza
revisori richiesti e senza vincoli sul semaforo.

Comoda ma non indispensabile: `gh`, la CLI di GitHub (`brew install gh`, poi
`gh auth login`, che richiede il browser). Serve ad aprire pull request e a
leggere i log di una CI rossa (`gh run view --log-failed`) senza uscire dal
terminale; l'interfaccia web fa le stesse cose.

### Perché è pubblico, e cosa protegge `main`

Il repository è pubblico dal 18 settembre 2026. La ragione non è solo di
principio — makerspace comunale, contenuti già sotto CC BY-SA, un sito pubblico
per definizione — ma molto pratica: **su un'organizzazione con piano gratuito i
ruleset non vengono applicati sui repository privati**, dove richiedono GitHub
Team, a pagamento. Finché il repository è stato privato, la CI girava su ogni
pull request e mostrava il semaforo, ma nessuno impediva di fare merge col
semaforo rosso o di scrivere dritto su `main`: la validazione informava senza
bloccare. Da pubblico la stessa protezione è gratis.

Il ruleset su `main` (Settings → Rules → Rulesets) ha come bersaglio il ramo
predefinito e richiede: una pull request prima del merge, la revisione dei code
owner, i controlli verdi con il ramo aggiornato, e blocca i force push. La
**bypass list è vuota di proposito**: metterci "Repository admin" avrebbe reso
il ruleset decorativo, visto che l'amministratore è chi scrive di più.

Due conseguenze pratiche, valide anche per chi cura il sito:

- **non si committa più su `main`**, mai, nemmeno per una virgola nella
  documentazione: si apre un ramo e una PR. Se il ruleset non richiede
  approvazioni (0 required approvals) la PR la si può comunque chiudere da soli,
  ma solo a controlli verdi;
- **l'`enforcement status` dev'essere `Active`**. Un ruleset creato e lasciato
  `Disabled` esiste, si legge, e non fa niente: è la prima cosa da guardare se
  un giorno il merge passa quando non dovrebbe.

**Nota sui fork**: chiunque può aprire una PR — che è il modello giusto per un
bene comune — ma le PR da fork non ricevono le variabili d'ambiente e le
anteprime vanno approvate a mano la prima volta. Aprire la PR non significa
poter pubblicare: il merge resta a chi ha accesso in scrittura.

---

## 5. Deploy

### Quale prodotto Cloudflare

La situazione è cambiata rispetto a quando è stata presa la decisione iniziale,
quindi serve una scelta consapevole:

- **Cloudflare Pages** — non è deprecato (documentazione aggiornata ad aprile
  2026, nessun avviso), l'interfaccia è più semplice e **le anteprime automatiche
  su ogni pull request sono mature**. Quelle anteprime sono il pilastro del
  flusso di lavoro: senza, si fa merge alla cieca.
- **Cloudflare Workers** — è la direzione in cui Cloudflare spinge i progetti
  nuovi, e dal 2025 serve anche gli asset statici. Richiede un
  `wrangler.jsonc` con `{"assets": {"directory": "./dist"}}`.

Verificato il 29 agosto 2026 sulla documentazione ufficiale: **Pages non è
deprecato**, le anteprime per branch esistono anche su Workers (vanno però
abilitate le build dei rami non di produzione, e i controlli sui rami sono meno
configurabili), e soprattutto **Workers serve solo domini la cui zona DNS è su
Cloudflare, mentre Pages accetta un dominio esterno via CNAME**.

**Raccomandazione confermata: Pages.** Due ragioni concrete: le anteprime per
PR sono automatiche, e il dominio si collega senza spostare la zona DNS di
gorgolab.it su Cloudflare — cosa che, finché la wiki è viva su quel dominio,
significa non toccare quello che già funziona. Il vantaggio di Workers è unire
frontend e backend: qui il backend non c'è. La migrazione, se un giorno
servirà, è documentata e riguarda l'infrastruttura, non il codice del sito.

### Impostazioni per Cloudflare Pages

Dalla dashboard: **Workers & Pages → Create → Pages → Connect to Git**.

| Impostazione | Valore |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(vuoto)* |

Variabili d'ambiente:

| Nome | Valore | Ambiente |
| --- | --- | --- |
| `NODE_VERSION` | `22` | Production **e** Preview |
| `SHOW_DRAFTS` | `true` | **solo Preview** |

`SHOW_DRAFTS` è ciò che rende visibili le bozze nelle anteprime delle PR
lasciandole invisibili sul sito pubblico. **Se lo imposti anche in Production,
pubblichi le bozze di tutti.**

### Cosa è già stato fatto e verificato

Il progetto Pages è collegato al repository e la produzione si ricostruisce a
ogni push su `main`. Provato il 29 agosto 2026, tutto sul campo:

- **le anteprime nascono dal push di un ramo**, senza bisogno della pull
  request, e vivono a un indirizzo prevedibile: `<ramo>.<progetto>.pages.dev`.
  L'indirizzo segue il ramo, quindi un secondo commit aggiorna la stessa pagina
  (~40 secondi);
- **`SHOW_DRAFTS=true` sul solo ambiente Preview funziona**: un progetto
  `draft: true` si vede nell'anteprima e non in produzione. Verificato con un
  progetto finto, poi rimosso;
- **i quattro controlli girano sulla pull request**, non sul push del ramo: il
  workflow scatta su `pull_request` e su `push: [main]`. Fermarsi al ramo
  significa avere l'anteprima senza validazione;
- **Cloudflare non lascia un commento** sulla PR: attacca un *check* il cui
  "Details" porta all'anteprima, più uno stato di deployment. Il commento
  automatico non è garantito e dipende dai permessi dell'app GitHub — l'indirizzo
  prevedibile del ramo è più affidabile;
- `/rss.xml` e `/sitemap-index.xml` rispondono, e gli URL canonici dichiarano
  già `https://www.gorgolab.it`.

### Cosa resta

1. **Verificare `public/_headers` sull'anteprima di un ramo**, prima del
   lancio: `curl -I https://<ramo>.gorgolab-website.pages.dev/` deve mostrare
   `Content-Security-Policy` e `X-Robots-Tag: noindex`, e la console del browser
   non deve riportare risorse bloccate (provare anche il click su un video del
   modello). Le intestazioni non valgono né in `dev` né in `preview`.
2. **Tenere spento Cloudflare Web Analytics** nel progetto Pages: inietterebbe
   uno script di terzi, la CSP lo bloccherebbe e la pagina `/privacy/`, che dice
   che il sito non conta le visite, diventerebbe falsa.
3. **Collegare il dominio.** Su Pages si aggiunge `www.gorgolab.it` come dominio
   personalizzato e si crea un CNAME nel DNS dov'è adesso (OVH): la zona non va
   spostata su Cloudflare. Va fatto insieme all'eliminazione della wiki, che oggi
   occupa quell'indirizzo.
4. **Il dominio nudo `gorgolab.it`.** OVH non ammette un CNAME sul dominio nudo,
   che oggi punta all'hosting OVH della wiki. Se quell'hosting si spegne,
   `gorgolab.it` smette di rispondere: serve un redirect verso `www` fatto da
   OVH (redirect visibile, o `.htaccess` sull'hosting se resta attivo), oppure
   lo spostamento della zona DNS su Cloudflare.
5. **Le anteprime sono pubbliche**: chiunque abbia l'URL le vede. Ora che anche
   il repository è pubblico la cosa è meno sorprendente, ma resta vera per le
   bozze, che nelle anteprime sono visibili (`SHOW_DRAFTS=true`) e in produzione
   no. Se dà fastidio si mette davanti Cloudflare Access, che ha un piano
   gratuito, al prezzo di dover fare login per guardarle.
6. **Le PR da fork non ricevono l'anteprima**: Cloudflare costruisce solo i rami
   che stanno dentro il repository. Perché il patto con i maker funzioni come
   descritto in `README.md`, chi pubblica deve avere accesso in scrittura e
   spingere un ramo, non un fork.

---

## 6. Decisioni ancora aperte

- **Statistiche in home.** Si mostrano solo da 5 progetti in su
  (`STATS_MIN_PROJECTS` in `src/pages/index.astro`): con un progetto e un maker
  raccontavano un posto vuoto. La soglia è arbitraria, si può cambiare.
- **Mappa in `/contatti/`.** Provata e **scartata** il 28 agosto 2026. Era una
  mappa statica: tasselli di OpenStreetMap cuciti a build time in un JPG con il
  pallino della sede disegnato in tavolozza, nessuna richiesta a terzi e nessun
  cookie. Funzionava, ma vista in pagina non aggiungeva niente all'indirizzo
  scritto sopra e appesantiva la pagina. Se un giorno si riprende, la strada è
  quella — non l'`<iframe>` di OpenStreetMap, che manderebbe l'IP di ogni
  visitatore a un server esterno al caricamento.
- **Un editor web per chi non usa git.** Valutato e **scartato per ora**: la
  motivazione sta in `README.md`. Da rivalutare sopra i ~20 contributi l'anno.

---

## 7. Note operative utili

**Ispezionare il sito senza aprire il browser.** Chrome headless funziona bene
per verifiche visive e misurazioni:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # macOS
CHROME=google-chrome                                                    # Linux

"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=6000 --window-size=1280,2000 \
  --screenshot=/tmp/pagina.png http://localhost:4322/progetti/
```

`--virtual-time-budget` serve ad aspettare il caricamento delle immagini: senza,
gli screenshot escono con i riquadri vuoti e sembra un bug che non c'è.

**Misurare a un viewport preciso.** `--window-size` non produce un viewport CSS
esatto in headless (chiedendo 390 px se ne ottengono 485). Per verifiche
attendibili su mobile conviene una paginetta con un `<iframe>` largo 390 px che
carica il sito e misura dall'interno con `getBoundingClientRect()`: essendo
stessa origine, il DOM è accessibile. È così che sono stati diagnosticati i due
bug di overflow già risolti.

**Gestione dei server**: `astro dev --background`, poi
`astro dev stop|status|logs`. Il preview si ferma con `astro preview stop`.

---

## 8. Cosa è già stato deciso e non va rifatto

Per non ripercorrere strade già valutate:

- **Astro invece di Hugo** — scelto per la validazione dello schema a build time
  e per l'ecosistema a componenti.
- **Nessun test unitario** — su un sito statico darebbero copertura teorica e
  zero difesa reale. I controlli veri sono i quattro della CI.
- **Nessun framework CSS** — il design system è già un sistema di token.
- **Nessuna animazione allo scroll** — provata e rimossa: contraddice il design
  system e lasciava sezioni invisibili.
- **Niente duotone sulle foto dei progetti** — in una documentazione tecnica il
  colore è informazione.
- **Il modello è una bozza** (17 settembre 2026) — non compare tra i progetti
  veri; `/contribuire/` porta al suo sorgente su GitHub. Il rischio è che un
  maker copi anche `draft: true`: il commento in cima al frontmatter lo avverte,
  e l'anteprima non lo rivelerebbe perché lì le bozze si vedono.
- **Via i contenuti inventati** (17 settembre 2026) — braccio robotico, lampada
  e l'articolo sulla saldatura. Meglio un sito con un progetto vero che con tre
  finti.
- **Wiki eliminata senza redirect** (17 settembre 2026) — nessun contenuto da
  salvare; il dump esiste fuori dal repository.

I bug già diagnosticati e le loro cause sono elencati in `AGENTS.md`, sezione
"Trappole già incontrate": vale la pena leggerla prima di mettere mano al CSS.
