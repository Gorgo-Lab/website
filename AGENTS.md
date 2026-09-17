# Gorgo Lab — sito

Sito pubblico del **Gorgo Lab**, makerspace comunale di Gorgonzola (MI). I
progetti e gli articoli li scrivono i soci e i maker via pull request; il sito
li impagina, ottimizza le immagini e genera anteprime, indici e feed da solo.

Tutto in italiano: interfaccia, contenuti, commenti nel codice, messaggi di
commit. Non c'è internazionalizzazione ed è una scelta, non una mancanza.

---

## Stack

| Cosa | Scelta | Perché |
| --- | --- | --- |
| Generatore | **Astro 7**, output statico | contenuti in markdown, zero backend, zero database |
| Contenuti | **Content Collections** + schema **Zod** | il frontmatter è validato a build time: una PR malformata diventa rossa da sola |
| Markdown | `.md` e `.mdx` | MDX serve solo a chi vuole video, riquadri o specifiche |
| Immagini | `astro:assets` (Sharp) | ridimensiona, converte in WebP e genera le varianti responsive |
| Stile | CSS puro con custom properties | niente framework: il design system è già un sistema di token |
| Icone | **Lucide**, inlinate a build time | nessun CDN, nessun JS a runtime |
| Caratteri | API `fonts` di Astro, file dai pacchetti `@fontsource` | serviti dal sito: nessuna richiesta a Google, fallback con metriche corrette |
| Tipi | TypeScript strict + `astro check` | |
| Hosting previsto | **Cloudflare Pages** | anteprima automatica su ogni pull request |

Dipendenze runtime: `astro`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`.
In sviluppo: `@astrojs/check`, `typescript`, `yaml`, `lucide-static`,
`@fontsource/poppins`, `@fontsource-variable/space-grotesk`,
`@fontsource-variable/jetbrains-mono`.
Nessuna libreria UI, nessun framework CSS, nessuna dipendenza JavaScript sul
client tranne due frammenti minuscoli (menu mobile, facciata dei video).

---

## Il problema che questo sito risolve

Chi cura il sito non deve rileggere e correggere a mano quello che scrivono i
maker. Un maker apre una pull request con la sua cartella; la CI verifica
**prima del merge** che il contenuto sia pubblicabile; Cloudflare pubblica
un'anteprima; chi cura guarda la sostanza e fa merge.

Il principio guida, da tenere presente in ogni modifica:

> **Il sito deve rifiutare il contenuto malformato invece di renderizzarlo male.**

Fanno fallire la build: un campo obbligatorio mancante, un tag inventato, una
data scritta male, un'immagine di copertina inesistente, un allegato dichiarato
ma assente dalla cartella. È voluto. Un errore in CI costa cinque minuti al
maker; una pagina rotta in produzione non la scopre nessuno per mesi.

---

## Perché un progetto è una cartella e non un file

Ogni progetto è un **bundle**: una cartella che contiene il testo e tutti i suoi
materiali.

```
src/content/progetti/braccio-robotico/
├── index.mdx           ← il testo (o index.md)
├── copertina.jpg       ← apertura e anteprima
├── montaggio-01.jpg
├── schema.pdf          ← allegato scaricabile
└── firmware.zip
```

Le ragioni, in ordine di importanza:

1. **I percorsi relativi funzionano e sono verificati.** `![alt](./foto.jpg)` e
   `cover: ./copertina.jpg` vengono risolti a build time: se il nome è sbagliato
   la build fallisce. Con una cartella `public/` condivisa si otterrebbe un 404
   silenzioso.
2. **Le immagini vengono ottimizzate.** Solo ciò che sta sotto `src/` passa da
   `astro:assets`. Il maker carica la foto da 12 megapixel del telefono e il
   sito serve una WebP da poche decine di kB.
3. **Il contributo è autonomo e reversibile.** Una PR tocca una sola cartella;
   cancellare un progetto significa cancellare quella cartella, senza lasciare
   file orfani sparsi.
4. **Il nome della cartella è l'indirizzo.** `braccio-robotico/` diventa
   `/progetti/braccio-robotico/`: niente slug da tenere sincronizzati.

**Mai spostare gli asset di un progetto in `public/`**: perderebbero
l'ottimizzazione e la verifica di esistenza.

L'unica eccezione al percorso relativo sono gli allegati non-immagine (PDF, ZIP,
STL…): Astro tratta `src/` come sorgente, non come cartella statica, quindi un
`[schema](./schema.pdf)` scritto a mano non emetterebbe il file. Si dichiarano
nel frontmatter (`attachments:`) e li impagina il layout, che è l'unico a
conoscere la cartella dell'entry tramite `entry.id`.

---

## Architettura dei contenuti

Due collezioni, definite in **`src/content.config.ts`**, che è la fonte di
verità su cosa è obbligatorio:

- **`progetti`** — `src/content/progetti/<slug>/index.{md,mdx}`
  Campi comuni più `status`, `featured`, `gallery`, `galleryAlt`,
  `attachments`, `links`, `license`.
- **`blog`** — `src/content/blog/<slug>/index.{md,mdx}`
  Solo i campi comuni.

Campi comuni obbligatori: `title`, `summary` (20–220 caratteri: è il testo
dell'anteprima), `date`, `authors`, `cover`, `coverAlt`, `tags` (da 1 a 6).

**`src/site.config.ts`** contiene nome, contatti e i due vocabolari chiusi:
`TAGS` e `PROJECT_STATUS_KEYS`. Il vocabolario dei tag è chiuso di proposito:
senza vincolo nascono in fretta `stampa3d`, `stampa-3d` e `3dprint` come tag
distinti. Aggiungerne uno richiede di modificare quel file nella stessa PR — è
un attrito voluto, non un bug.

**`src/lib/content.ts`** incapsula le query: usare `getProjects()` e
`getPosts()`, mai `getCollection` diretto, perché gestiscono il filtro sulle
bozze e l'ordinamento.

Le bozze (`draft: true`) sono invisibili in produzione ma visibili in sviluppo e
nelle anteprime delle PR, dove la CI passa `SHOW_DRAFTS=true`: così si
revisionano prima di pubblicarle.

---

## Componenti disponibili nei file .mdx

Passati via `components` a `<Content />`, quindi **il maker non deve importarli**
(`src/components/mdx.ts`):

- `<Callout type="info|tip|warning|danger" title="…">`
- `<Specs items={[["Chiave","Valore"]]} />`
- `<Video provider="youtube|vimeo" id="…" title="…" />`

Vincolo: qui possono stare **solo componenti che non hanno bisogno di conoscere
la cartella dell'entry**. La risoluzione dei percorsi relativi la fa il layout,
che conosce `entry.id`. Per questo galleria e allegati si dichiarano nel
frontmatter invece di essere componenti.

I video si incorporano con una facciata: fino al click non parte nulla verso il
provider, quindi niente cookie e niente player da megabyte. Anche l'anteprima di
YouTube la scarica Astro a build time (`image.domains` in `astro.config.mjs`):
un ID inesistente fa fallire la build.

---

## Regole visive

Il design system ufficiale è tradotto in token in **`src/styles/global.css`**.
Da rispettare sempre:

- due colori piatti, `--gl-blue` e `--gl-orange`. **Nessun gradiente**;
- sfondo carta `--gl-paper`; il nero non esiste, l'inchiostro è `--gl-ink`;
- bordi netti da 2px, angoli piccoli (4px, 8px sulle schede), ombra offset dura;
- al passaggio del mouse cambia colore o opacità, **mai `scale()`**; alla
  pressione `translate(2px, 2px)` e l'ombra collassa;
- Poppins 800 solo maiuscolo per i titoli (classe `.shout`) — è il carattere del
  wordmark ufficiale, identificato confrontando le lettere del banner; Space Grotesk per
  il testo, JetBrains Mono per dati e metadati;
- **niente emoji** nell'interfaccia: si usa `<Icon name="…" />`. Restano ammesse
  nel testo informale scritto dai maker;
- l'unico elemento in animazione continua è il marquee del coro.

Due deviazioni consapevoli dal design system, entrambe annotate nel CSS:

1. **Scala tipografica fluida.** I gradini originali sono fissi fino a 120px e
   spaccano il layout sul telefono; le varianti `clamp()` li tengono come
   massimo.
2. **Testi chiari sulle bande blu.** Sul blu pieno nessun arancio della
   tavolozza raggiunge 4.5:1 (il migliore si ferma a 3.7). L'arancio su blu
   resta solo nel marquee, che riproduce il banner ufficiale ed è decorativo.

Le foto dei progetti **non** vanno trattate in duotone, nonostante il design
system lo suggerisca per le immagini donate: in una documentazione tecnica il
colore è informazione (il PLA che ingiallisce, il legno bruciato sui bordi).

---

## Invarianti da non rompere

- `src/content.config.ts` è l'unica fonte di verità sul frontmatter. Se un campo
  diventa opzionale lì, controllare che ogni layout gestisca l'assenza.
- Un progetto è una cartella con dentro tutto. Mai asset in `public/`.
- Dentro `.prose` ci va **solo** ciò che il maker scrive nel markdown. I blocchi
  strutturali (galleria, allegati, licenza) passano dallo slot `dopo` del
  `ContentLayout`.
- I componenti in `src/components/mdx.ts` non possono ricevere percorsi relativi
  a file.
- `check-assets.mjs` deve restare severo: la storia di git è per sempre.
- Il progetto modello `src/content/progetti/modello-pagina-progetto/` è la
  vetrina di ogni formattazione: aggiungendo un componente o una sintassi va
  aggiunto anche lì, altrimenti nessuno saprà che esiste. Vanno aggiornati
  insieme anche `CONTRIBUTING.md` e la pagina `/contribuire/`. Il modello è
  `draft: true`: esiste in locale e nelle anteprime, non in produzione, quindi
  dal sito si linka il suo sorgente su GitHub e mai la sua pagina.

---

## Trappole già incontrate

Bug già diagnosticati e risolti: se ricompaiono, la causa è probabilmente questa.

- **Griglie che sfondano lo schermo.** Un track `1fr` ha larghezza minima `auto`
  e si allarga fino all'elemento più largo che contiene (un blocco di codice,
  una tabella), trascinando l'intera pagina fuori dal viewport. Usare sempre
  `minmax(0, 1fr)` dove il contenuto è scritto dai maker.
- **Regole di `.prose` che invadono i componenti.** `.prose img` e
  `.prose li + li` erano generiche e deformavano galleria e poster dei video con
  margini e bordi doppi. Ora `.prose :is(p, figure) > img` colpisce solo le
  immagini del testo.
- **Specificità: una regola più corta che perde.** In `contatti.astro`
  `.cards section` (0-1-1) batteva `.highlight` (0-1-0): lo sfondo blu della
  scheda non si applicava mai, mentre il colore chiaro del testo passava — a
  parità di peso vince la regola scritta dopo — e la scheda restava con testo
  quasi bianco su carta, contrasto 1,03:1. Nel CSS di pagina, quando si vuole
  variare una scheda dentro un contenitore, la variante va scritta con lo stesso
  contenitore davanti (`.cards section.highlight`). Vale la pena misurare il
  contrasto calcolato invece di fidarsi dell'occhio: qui il testo era invisibile
  e nessuno se n'era accorto.
- **Classi scoped che non arrivano sugli SVG.** Astro non applica il proprio
  attributo di scope all'HTML inlinato con `set:html`: per stilare un'icona
  serve un contenitore `<span>` attorno a `<Icon />`.
- **Allegati trasformati in data URI.** Vite inlina gli asset piccoli; le
  estensioni degli allegati sono escluse in `astro.config.mjs` e la lista va
  tenuta allineata a `ATTACHMENT_EXTENSIONS` in `site.config.ts`.
- **Il dev server serve CSS stantio** dopo modifiche estese agli stili. Prima di
  dare la colpa al codice, verificare su `npm run build && npm run preview`.
- **Il dev server serve contenuti stantii dopo rinomini e cancellazioni** dentro
  `src/content/`. Un server acceso da ore continua a vedere il frontmatter
  precedente e produce errori che puntano a file non più citati da nessun
  sorgente — per esempio `[allegati] "x.zip" dichiarato nel frontmatter … ma non
  trovato` su un allegato che è stato tolto. Non cercare il refuso nel
  contenuto: confrontare prima con `npm run build`, che è la verità, poi
  riavviare il server.
- **«The collection "blog" does not exist or is empty»** ripetuto nel log di
  build non è un errore: il blog oggi non ha articoli. La cartella resta nel
  repository grazie a `src/content/blog/.gitkeep`; sparisce da sola al primo
  articolo.
- **Il data store della content layer sopravvive alla cancellazione di
  `.astro/`**: sta in `node_modules/.astro/`. Dopo aver rinominato un `index.mdx`
  in `index.md` la build fallisce con un messaggio di Rolldown che cerca ancora
  il vecchio percorso (`failed to resolve import "astro:content-layer-deferred-module…&fileName=…index.mdx"`),
  e né `rm -rf .astro` né `rm -rf dist` lo sbloccano. Serve
  `rm -rf node_modules/.astro`.

---

## Abitudini di lavoro con git

Due lezioni pagate sul campo il 29 agosto 2026, mentre si collaudava il flusso
delle anteprime.

- **Spingere `main` prima di aprire un ramo.** Un ramo nato da un `main` locale
  in anticipo di otto commit se li porta dentro tutti: la pull request non
  contiene più una cosa sola, e allo schiacciamento quegli otto messaggi
  diventano uno solo, col titolo del ramo. Il contenuto si salva, il *perché*
  no — e in questo repository i messaggi di commit sono documentazione.
- **Il bottone del merge si sceglie, non si subisce.** Ramo con un commit e un
  messaggio già scritto bene: *Rebase and merge*, che lo riporta intatto e
  tiene `main` lineare. Ramo di un maker con dieci commit di aggiustamento:
  *Squash and merge*, riscrivendo il messaggio a mano, perché quello proposto è
  il titolo della PR. Il commit di merge serve solo quando si vuole conservare
  la forma del ramo, che qui non succede quasi mai.

Per il lavoro proprio, finché il sito non è pubblico, il merge in locale è
legittimo: l'anteprima del ramo esiste comunque e i controlli girano anche sul
push a `main`. Per il lavoro degli altri no — la revisione prima del merge è
tutto il senso del patto con i maker.

---

## Comandi

```bash
npm install
npm run dev                  # sviluppo su localhost:4321 (--host per esporlo in LAN)
npm run build                # build di produzione in dist/
npm run preview              # serve la build locale
npm run validate             # tutti i controlli della CI in una volta

npm run ingest -- <zip|cartella>      # importa il materiale di un maker
npm run placeholder -- <cartella>     # copertina segnaposto in tavolozza
```

`validate` esegue in ordine: `check:assets` (peso e formato dei file),
`astro check` (tipi), `astro build` (schema del frontmatter),
`check:links` (collegamenti interni).

Se `validate` passa in locale, passa anche in CI.

L'elenco completo dei comandi, con le opzioni degli script e la gestione dei
server in secondo piano, sta nella sezione "Comandi" di [`README.md`](README.md).

---

## Struttura

```
src/
├── content/
│   ├── progetti/<slug>/index.{md,mdx}   ← un progetto = una cartella
│   └── blog/<slug>/index.{md,mdx}
├── content.config.ts    ← LO SCHEMA: cosa è obbligatorio nel frontmatter
├── site.config.ts       ← nome, contatti, tag ammessi, stati progetto
├── layouts/             ← BaseLayout (scheletro), ContentLayout (progetti e articoli)
├── components/          ← schede, galleria, allegati, blocchi per MDX, Icon
├── pages/               ← rotte del sito
├── plugins/             ← rehype: didascalie delle immagini, tabelle scorrevoli
├── icons/               ← SVG Lucide usati, copiati da lucide-static
└── styles/global.css    ← token del design system e tipografia dei contenuti
scripts/
├── ingest.mjs           ← import di uno zip: comprime, rinomina, prepara il frontmatter
├── placeholder.mjs      ← copertine segnaposto geometriche
├── check-assets.mjs     ← guardia su peso e formato dei file
└── check-links.mjs      ← guardia sui collegamenti interni rotti
```

---

## Stato e cose aperte

Il sito è completo e costruisce senza errori, ma **non è ancora pubblicato**.
Prima di andare online vanno confermati alcuni dati che sono stati dedotti e non
verificati (indirizzo, orari, email, attrezzature), e va completato il deploy.

**Tutti i dettagli, con i passaggi in ordine, stanno in [`HANDOFF.md`](HANDOFF.md).**

---

## Documentazione

- [`README.md`](README.md) — presentazione del progetto e comandi
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — guida per i maker che pubblicano
- [`HANDOFF.md`](HANDOFF.md) — cosa manca, deploy, decisioni da prendere
- Astro: <https://docs.astro.build> —
  [content collections](https://docs.astro.build/en/guides/content-collections/),
  [immagini](https://docs.astro.build/en/guides/images/),
  [routing](https://docs.astro.build/en/guides/routing/)

Quando avvii il server di sviluppo, usa la modalità in background:
`astro dev --background`, gestibile con `astro dev stop|status|logs`.
