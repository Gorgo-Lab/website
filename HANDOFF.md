# Consegna del progetto

Documento per chi riprende il lavoro su un'altra macchina o dopo una pausa.
Descrive **dove siamo, cosa manca e in che ordine farlo**. Per l'architettura e
le regole del codice vedi [`AGENTS.md`](AGENTS.md).

Ultimo aggiornamento: 27 agosto 2026.

---

## Stato in due righe

Il sito è **completo e funzionante in locale**: 20 pagine, build pulita, tutti i
controlli verdi. Il codice sta su GitHub, in `Gorgo-Lab/website` (privato). Il
sito **non è ancora pubblicato** e alcuni dati sulla pagina "Lo spazio" sono
stati dedotti, non verificati.

---

## 1. Portare il progetto su un'altra macchina

Il repository sta su GitHub. Serve un account con accesso a `Gorgo-Lab/website`
— è privato — e una chiave SSH registrata; senza chiave, si clona l'URL HTTPS.

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
✓ 24 file di contenuto, tutti entro i limiti.
- 0 errors
20 page(s) built
✓ 20 pagine, tutti i collegamenti interni risolvono.
```

Se gli stili sembrano rotti o disallineati dopo modifiche estese al CSS, prima
di cercare il bug nel codice prova `npm run build && npm run preview`: il server
di sviluppo tiene in cache il CSS e ci ha già fatto perdere tempo una volta.

---

## 3. Dati dedotti, da confermare con i soci

**Questo è il vero blocco alla pubblicazione.** Il design system è stato
generato senza accesso a gorgolab.it e alcune informazioni sono state
estrapolate. Sono plausibili ma **non verificate**: se il sito va online con
orari sbagliati, qualcuno trova la porta chiusa.

| Dato | Valore attuale | Dove |
| --- | --- | --- |
| Indirizzo | Via Sant'Andrea 6, Gorgonzola (MI) | `src/site.config.ts:16` |
| Email | `info@gorgolab.it` | `src/site.config.ts:15` |
| Orari | Mar e Gio 21:00–23:30, Sab 15:00–19:00 | `src/pages/spazio.astro:8-10` |
| Regole dello spazio | quattro punti riscritti | `src/pages/spazio.astro` |
| Attrezzature | stampa 3D, laser, elettronica, falegnameria, CNC, tessile | `src/pages/index.astro` |
| Social | tutti vuoti | `src/site.config.ts` |

Il wiki storico (`https://www.gorgolab.it`) e il regolamento ufficiale sono già
collegati dal piè di pagina e dalla pagina "Lo spazio": lì si trovano i dati
veri da riportare.

Da confermare anche con chi cura la grafica: il wordmark GORGOLAB del banner usa
un carattere display su misura, e **Archivo Black è solo il sostituto libero più
vicino**. Se qualcuno ha il `.ttf`/`.otf` originale, va messo in `src/fonts/` e
i titoli si allineano al banner.

---

## 4. Repository su GitHub

Il repository esiste già: **`Gorgo-Lab/website`**, privato, ramo `main`.
Resta da fare:

1. **`.github/CODEOWNERS`** — già compilato con `@naicodev`. Vanno aggiunti gli
   handle degli altri soci che devono comparire come revisori, quando ce ne
   saranno.
2. **Protezione del ramo `main`** — vedi il riquadro qui sotto: sul piano
   gratuito è disponibile solo per i repository pubblici.
3. Verificare che il workflow `.github/workflows/ci.yml` parta alla prima PR.

Comoda ma non indispensabile: `gh`, la CLI di GitHub (`brew install gh`, poi
`gh auth login`, che richiede il browser). Serve ad aprire pull request e a
leggere i log di una CI rossa (`gh run view --log-failed`) senza uscire dal
terminale; l'interfaccia web fa le stesse cose.

### Privato adesso, pubblico al lancio

Il repository è privato, ed è la scelta giusta finché indirizzo, orari e
attrezzature non sono confermati: non ha senso pubblicare informazioni che
potrebbero essere sbagliate.

Va però ripresa la decisione al momento del lancio, perché **su
un'organizzazione con piano gratuito la protezione del ramo e i ruleset
funzionano solo sui repository pubblici**: su un repository privato sono
disattivati e richiedono GitHub Team, a pagamento.

Conseguenza concreta, oggi: la CI gira su ogni pull request e mostra i controlli
verdi o rossi, ma **nessuno impedisce di fare merge con i controlli rossi** o di
scrivere direttamente su `main`. La validazione informa, non blocca.

Rendere pubblico il repository al lancio risolve la cosa gratis, ed è coerente
con la natura del progetto: un hackerspace comunale, contenuti già sotto
CC BY-SA, un sito che è pubblico per definizione. Una volta pubblico, in
Settings → Rules va attivata la protezione di `main` con "richiedi che i
controlli passino" e "richiedi la revisione dei code owner".

**Nota sulla visibilità**: se il repository è pubblico, chiunque può aprire una
PR — che è il modello giusto per un bene comune — ma le PR da fork non ricevono
le variabili d'ambiente e le anteprime vanno approvate a mano la prima volta.

---

## 5. Deploy

### Quale prodotto Cloudflare

La situazione è cambiata rispetto a quando è stata presa la decisione iniziale,
quindi serve una scelta consapevole:

- **Cloudflare Pages** — non è deprecato (documentazione aggiornata ad aprile
  2026, nessun avviso), l'interfaccia è più semplice e **le anteprime automatiche
  su ogni pull request sono mature**. Quelle anteprime sono il pilastro del
  flusso di lavoro: senza, si fa merge alla cieca.
- **Cloudflare Workers** — è la direzione in cui Cloudflare sta spingendo i
  nuovi progetti. Richiede un file `wrangler.jsonc` con
  `{"assets": {"directory": "./dist"}}` e il deploy via `npx wrangler deploy`.
  **Non è stato verificato** se le anteprime per pull request siano altrettanto
  immediate: va accertato prima di sceglierlo.

**Raccomandazione: partire da Pages**, perché il requisito n. 1 è l'anteprima
per PR. La migrazione a Workers, se e quando servirà, è documentata da
Cloudflare e riguarda solo l'infrastruttura, non il codice del sito.

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

### Dopo il primo deploy

1. Impostare il dominio definitivo e riportarlo in **`astro.config.mjs`** (campo
   `site`, oggi `https://gorgolab.it` con un TODO). Da quel campo dipendono
   sitemap, URL canonici e anteprime social: se resta sbagliato, i link
   condivisi puntano altrove.
2. Aprire una PR di prova e verificare che Cloudflare commenti con il link
   all'anteprima e che i quattro controlli compaiano verdi.
3. Controllare che `/rss.xml` e `/sitemap-index.xml` rispondano.

---

## 6. Decisioni ancora aperte

- **Il progetto modello resta visibile?** Oggi
  `src/content/progetti/modello-pagina-progetto/` compare nell'elenco insieme ai
  progetti veri (sono 3 in tutto). È voluto — serve che i maker lo trovino
  navigando — ma è un progetto "meta". Per nasconderlo dal sito pubblico basta
  aggiungere `draft: true` al suo frontmatter: resta visibile in locale e nelle
  anteprime.
- **Contenuti di esempio.** I due progetti e l'articolo sono inventati, con
  autori di fantasia. Vanno sostituiti con contenuti veri prima di mostrare il
  sito ai soci come se fosse finito.
- **Mappa in `/contatti/`.** Prevista ma non fatta: usare OpenStreetMap e non
  Google Maps, per evitare il banner dei cookie su un sito che oggi non ne ha
  bisogno.
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

I bug già diagnosticati e le loro cause sono elencati in `AGENTS.md`, sezione
"Trappole già incontrate": vale la pena leggerla prima di mettere mano al CSS.
