# Sito del Gorgo Lab

Sito statico del makerspace comunale di Gorgonzola, costruito con
[Astro](https://astro.build). I progetti e gli articoli sono file markdown che i
maker aggiungono via pull request; il sito li impagina, ottimizza le immagini e
genera anteprime, indici e feed da solo.

L'identità visiva segue il design system ufficiale di Gorgo Lab: due colori
piatti (blu `#0071BC`, arancio `#F15A24`), sfondo carta, Poppins per i
titoli, bordi netti e ombre offset. Le regole vive stanno in
[`src/styles/global.css`](src/styles/global.css).

## Comandi

Tutto quello che si può lanciare da riga di comando, con cosa fa.

### Ogni giorno

```bash
nvm use                      # seleziona la versione di Node dichiarata in .nvmrc
npm install                  # installa le dipendenze (serve Node 22.12 o superiore)
npm run dev                  # server di sviluppo su localhost:4321, si ricarica da solo
npm run dev -- --host        # come sopra, ma raggiungibile dagli altri dispositivi in rete
npm run build                # genera il sito in dist/, pronto da pubblicare
npm run preview              # serve dist/ in locale: è il sito vero, senza ricarica automatica
```

Per mostrare il sito a qualcuno usa `build` + `preview`, non `dev`: le immagini
sono ottimizzate e non c'è l'impalcatura dello sviluppo.

### Controlli prima di aprire una pull request

```bash
npm run validate             # lancia tutti e quattro i controlli qui sotto, in ordine
npm run check:assets         # file oltre 2 MB, immagini oltre 3000px, video committati
npm run check                # tipi TypeScript e template (astro check)
npm run check:links          # collegamenti interni rotti (richiede una build recente)
```

Se `validate` passa in locale, passa anche in integrazione continua. `check:links`
legge la cartella `dist/`, quindi va lanciato dopo `build` se il sito è cambiato.

### Pubblicare contenuti

```bash
# importa il materiale di un maker (zip o cartella): comprime le immagini,
# toglie i dati EXIF, rinomina i file e prepara index.md con i campi da compilare
npm run ingest -- ~/Downloads/progetto.zip
npm run ingest -- ./cartella --collection blog     # per un articolo invece di un progetto
npm run ingest -- ./cartella --slug nome-scelto    # decide il nome della cartella, e quindi l'indirizzo
npm run ingest -- ./cartella --force               # sovrascrive una destinazione già esistente

# copertina segnaposto geometrica, per un progetto senza foto decenti
npm run placeholder -- src/content/progetti/mio-progetto
npm run placeholder -- src/content/progetti/mio-progetto --force   # rigenera sovrascrivendo
npm run placeholder -- copertina.jpg --seed "tornio"               # cambia il disegno
npm run placeholder -- copertina.jpg --ratio 16:9 --width 2400     # proporzioni e dimensione
```

Entrambi i comandi stampano cosa hanno fatto e cosa resta da completare a mano.
Lanciati senza argomenti mostrano le opzioni.

### Gestione dei server

Entrambi i server possono girare in secondo piano, con gli stessi sottocomandi:

```bash
npx astro dev --background       # avvia lo sviluppo senza occupare il terminale
npx astro dev status             # dice se sta girando, e con quale PID
npx astro dev logs               # mostra il registro del server
npx astro dev logs --follow      # lo segue in tempo reale
npx astro dev stop               # lo ferma

npx astro preview --background   # stessa cosa per il server di anteprima
npx astro preview status
npx astro preview logs
npx astro preview stop
```

Se una porta risulta occupata da un server dimenticato:

```bash
lsof -iTCP -sTCP:LISTEN -P -n | grep -E '4321|4322'   # macOS
ss -tlnp | grep -E '4321|4322'                        # Linux
```

### Manutenzione

```bash
npx astro info               # versioni di Astro, Node, integrazioni: da allegare quando si chiede aiuto
npx astro sync               # rigenera i tipi delle collezioni dopo aver toccato content.config.ts
npx astro add <nome>         # aggiunge un'integrazione ufficiale e la configura da sola
npm outdated                 # elenca le dipendenze con una versione più recente
npm update                   # le aggiorna entro i limiti di versione dichiarati

# aggiungere un'icona all'interfaccia: si copia l'SVG e la si usa con <Icon name="…" />
cp node_modules/lucide-static/icons/<nome>.svg src/icons/
```

### Lavorare su un'altra macchina

```bash
git clone git@github.com:Gorgo-Lab/website.git gorgolab && cd gorgolab
nvm use                                     # legge .nvmrc e seleziona Node 22
npm install
npm run validate                            # deve passare tutto
```

Ricorda che `node_modules/` e la cartella `tmp/` non viaggiano: la prima si
ricrea con `npm install`, la seconda è esclusa dal repository di proposito.
Dettagli in [`HANDOFF.md`](HANDOFF.md).

### Diagnostica visiva senza aprire il browser

```bash
# il binario di Chrome sta in posti diversi: si sceglie la riga del proprio sistema
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # macOS
CHROME=google-chrome                                                    # Linux

# istantanea di una pagina; --virtual-time-budget aspetta il caricamento delle immagini
"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=6000 --window-size=1280,2000 \
  --screenshot=/tmp/pagina.png http://localhost:4322/progetti/
```

Attenzione: `--window-size` non produce un viewport CSS esatto (chiedendo 390 px
se ne ottengono 485). Per misure attendibili su mobile vedi la nota in
[`HANDOFF.md`](HANDOFF.md).

## Come è organizzato

```
src/
├── content/
│   ├── progetti/<slug>/index.md   ← un progetto = una cartella
│   └── blog/<slug>/index.md
├── content.config.ts    ← LO SCHEMA: cosa è obbligatorio nel frontmatter
├── site.config.ts       ← nome, contatti, tag ammessi, stati progetto
├── layouts/             ← struttura delle pagine
├── components/          ← schede, galleria, allegati, blocchi per MDX, icone
├── pages/               ← rotte del sito
├── plugins/             ← rehype: didascalie delle immagini, tabelle scorrevoli
├── icons/               ← SVG Lucide usati nell'interfaccia
└── styles/global.css    ← token del design system e tipografia dei contenuti
scripts/
├── ingest.mjs           ← import di uno zip: comprime, rinomina, prepara il frontmatter
├── placeholder.mjs      ← copertine segnaposto geometriche, in palette
├── check-assets.mjs     ← guardia su peso e formato dei file
└── check-links.mjs      ← guardia sui collegamenti interni rotti
```

## La pagina modello

`src/content/progetti/modello-pagina-progetto/` contiene **ogni formattazione
disponibile**, già scritta e commentata: frontmatter completo, titoli, elenchi,
tabelle, immagini con e senza didascalia, video, riquadri di richiamo,
specifiche, codice e allegati di sei tipi.

Si copia la cartella, si cancella quello che non serve, si sostituisce il resto.
È anche consultabile renderizzata su `/progetti/modello-pagina-progetto/`.

Chi aggiunge un componente o una sintassi deve aggiornare anche quel modello,
`CONTRIBUTING.md` e la pagina `/contribuire/`: altrimenti la novità esiste ma
nessuno saprà che c'è.

## Il patto con i maker

Un maker apre una PR con la sua cartella. La CI verifica **prima del merge**:

1. `check:assets` — nessun file oltre 2 MB, nessun video committato, nessuna
   immagine a piena risoluzione;
2. `astro check` — tipi e template;
3. `astro build` — lo schema Zod di `content.config.ts` valida ogni campo del
   frontmatter: campi mancanti, tag inventati, date malformate, immagini
   inesistenti e allegati dichiarati ma assenti fanno **fallire la build**;
4. `check:links` — nessun collegamento interno punta a una pagina che non esiste.

Cloudflare Pages pubblica un'anteprima della PR, così il progetto si vede
renderizzato prima di accettarlo. Nelle preview le bozze (`draft: true`) sono
visibili; sul sito pubblico no.

Il risultato: si accetta un contributo guardando la sostanza, non la
formattazione.

## Da fare prima di andare online

Il sito è completo e costruisce senza errori, ma **non è ancora pubblicato**:
mancano la conferma di alcuni dati (indirizzo, orari, email, attrezzature) e la
messa in opera del deploy.

L'elenco completo dei passaggi, in ordine, sta in [`HANDOFF.md`](HANDOFF.md).

## Decisioni prese, e perché

**Solo italiano.** Niente i18n: le pagine dichiarano `lang="it"` e i contenuti
stanno in una gerarchia piatta. Aggiungere una seconda lingua più avanti
significherebbe rifare i path di tutti i contenuti — è una scelta reversibile
solo a caro prezzo, presa consapevolmente.

**Nessun CMS.** Un editor web git-based (Sveltia, Pages CMS) non introdurrebbe
problemi di sicurezza — non c'è database utenti né server da proteggere, l'auth
è delegata a GitHub — ma introdurrebbe uno **schema duplicato** accanto a
`content.config.ts`, cioè una seconda fonte di verità che va tenuta allineata a
mano. Per il volume atteso (una decina di contributi l'anno) non vale il costo.

I maker che non usano git hanno già due strade senza infrastruttura aggiuntiva:
l'interfaccia web di GitHub (upload della cartella + "Propose changes", che apre
la PR da sola) oppure lo zip via email importato con `npm run ingest`.

Da rivalutare se i contributi superano i ~20 all'anno e la revisione diventa il
collo di bottiglia. A quel punto Sveltia CMS dovrebbe essere in GA.

## Deploy

Cloudflare Pages, connesso al repository:

- Build command: `npm run build`
- Output directory: `dist`
- Variabile d'ambiente (solo preview): `SHOW_DRAFTS=true`

Istruzioni passo per passo in [`HANDOFF.md`](HANDOFF.md).

## Altri documenti

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — guida per i maker che pubblicano
- [`HANDOFF.md`](HANDOFF.md) — cosa manca, deploy, decisioni aperte
- [`AGENTS.md`](AGENTS.md) — presentazione tecnica per chi (o cosa) lavora sul
  codice: stack, architettura, invarianti, trappole già incontrate
