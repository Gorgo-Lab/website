# Pubblicare un progetto o un articolo

Vuoi metterci il tuo progetto? Fallo e basta.

> **La scorciatoia:** copia la cartella
> [`src/content/progetti/modello-pagina-progetto/`](src/content/progetti/modello-pagina-progetto/),
> rinominala col nome del tuo progetto e sostituisci il contenuto. Quel modello
> contiene ogni formattazione disponibile, già scritta e commentata, e lo vedi
> renderizzato su **`/progetti/modello-pagina-progetto/`**.

Tu scrivi il contenuto, il sito ci mette la grafica. Non serve sapere HTML o CSS,
e non serve chiedere il permesso a nessuno.

La versione con esempi e schermate è online su **`/contribuire/`**; questo file
è il riassunto operativo.

---

## In breve

1. Crea una cartella in `src/content/progetti/nome-del-progetto/`
2. Metti dentro `index.md`, le foto e gli allegati
3. Compila il frontmatter (le righe tra i due `---` in cima al file)
4. Apri una pull request
5. Un controllo automatico dice se qualcosa non va, e Cloudflare pubblica
   un'anteprima del sito con il tuo progetto dentro

Se qualcosa nel frontmatter è sbagliato **la PR diventa rossa e ti dice cosa**:
non c'è modo di pubblicare per distrazione un progetto rotto.

---

## La struttura della cartella

```
src/content/progetti/
└── braccio-robotico/          ← diventa /progetti/braccio-robotico/
    ├── index.md               ← il testo
    ├── copertina.jpg          ← apertura e anteprima
    ├── montaggio-01.jpg
    ├── schema.pdf             ← allegato scaricabile
    └── firmware.zip
```

Il nome della cartella diventa l'indirizzo della pagina: minuscolo, con i
trattini, senza accenti.

Le immagini le richiami con il percorso relativo, `./copertina.jpg`. Il sito le
ridimensiona, le converte in formati moderni e genera le varianti per telefono e
desktop: **carica pure la foto grossa che esce dal telefono**, non ritoccarla.

```markdown
![Descrizione per chi non vede la foto](./montaggio.jpg)
![Descrizione per chi non vede la foto](./montaggio.jpg "Didascalia visibile sotto la foto")
```

Il testo fra parentesi quadre è obbligatorio e serve a chi usa uno screen
reader: descrivi **cosa si vede**. Il testo fra virgolette è facoltativo e
diventa la didascalia stampata sotto la foto — quindi non ripetere la stessa
frase due volte.

---

## Frontmatter di un progetto

```yaml
---
title: Braccio robotico da scrivania       # 3-90 caratteri
summary: >                                 # 20-220 caratteri: è l'anteprima
  Un braccio a 4 assi stampato in 3D e comandato da un ESP32.
date: 2026-03-14                           # AAAA-MM-GG
updated: 2026-05-02                        # facoltativo
authors:
  - Nome Cognome                           # almeno uno
tags:                                      # da 1 a 6, dalla lista qui sotto
  - robotica
  - stampa-3d
status: completato                         # idea | in-corso | completato | sospeso
cover: ./copertina.jpg
coverAlt: Il braccio appoggiato sul banco   # obbligatorio: serve a chi non vede
gallery:                                   # facoltativo
  - ./montaggio-01.jpg
galleryAlt:                                # uno per ogni immagine di gallery
  - Le parti stampate prima del montaggio
attachments:                               # facoltativo
  - file: schema.pdf
    label: Schema elettrico
    note: KiCad 8, esportato in PDF
links:                                     # facoltativo
  - label: Repository su GitHub
    url: https://github.com/utente/braccio
license: CC BY-SA 4.0                      # default se non lo scrivi
draft: true                                # non pubblicare ancora
featured: true                             # in evidenza in home (lo decide chi cura il sito)
---
```

Per un **articolo del blog** la cartella va in `src/content/blog/` e il
frontmatter si ferma a `tags`: niente `status`, `gallery`, `attachments`,
`links`, `license`.

### Tag ammessi

La lista sta in [`src/site.config.ts`](src/site.config.ts). È chiusa apposta:
senza vincolo nascono in fretta `stampa3d`, `stampa-3d` e `3dprint` come tag
diversi. Se manca quello che ti serve, aggiungilo a quel file nella stessa PR.

### Collegamenti esterni

Due modi, che servono a due cose diverse.

Dentro il testo, quando il rimando serve in quel punto del discorso:

```markdown
la voce di [Wikipedia](https://www.wikipedia.org) che spiega la tecnica
```

Nel frontmatter, quando è una destinazione stabile del progetto (il repository,
la scheda del materiale): finiscono nella colonna di destra sotto "Link
esterni", sempre nello stesso posto.

```yaml
links:
  - label: Repository su GitHub      # il testo che si legge, non l'indirizzo
    url: https://github.com/utente/braccio
```

I collegamenti esterni non li verifica nessun controllo automatico —
`check:links` guarda solo quelli interni al sito — quindi provali prima di
aprire la pull request.

---

## Blocchi speciali

Rinomina il file da `index.md` a `index.mdx` e puoi usarli, senza importare nulla:

```mdx
<Video provider="youtube" id="dQw4w9WgXcQ" title="Il braccio in funzione" />

<Callout type="warning" title="Occhio">
L'alimentatore va collegato **prima** di innestare i servo.
</Callout>

<Specs items={[["Materiale","PLA"],["Assi","4"],["Peso","480 g"]]} />
```

`Callout` accetta `info`, `tip`, `warning`, `danger`.

**I video si embeddano sempre, non si caricano mai come file.** Un video nel
repository lo appesantisce per sempre: git conserva ogni versione di ogni file,
anche di quelli cancellati. Il controllo automatico blocca `.mp4` e simili.

---

## Limiti tecnici, e perché esistono

| Limite | Valore | Motivo |
| --- | --- | --- |
| Peso di un file | 2 MB | la storia di git è per sempre |
| Lato lungo di un'immagine | 3000 px | oltre non serve, il sito ridimensiona comunque |
| Peso di una cartella progetto | 12 MB | clone del repository ragionevole |
| Estensioni allegato | pdf, zip, stl, step, 3mf, svg, dxf, ino, sch, csv, txt, gcode | il resto o è enorme o non si apre |

Li verifica `npm run check:assets`, che gira da solo su ogni PR.

---

## Non so usare git

Non serve. Ci sono due strade, scegli quella che ti pesa meno.

### A. Dal sito di GitHub, senza installare niente

Ti serve solo un account GitHub gratuito e l'invito al repository. Poi, dal
browser:

1. Sul repository, apri la cartella `src/content/progetti/`
2. **Add file → Upload files**
3. Trascina dentro la tua cartella (markdown, foto e allegati insieme:
   GitHub tiene la struttura)
4. In fondo alla pagina scegli **"Create a new branch for this commit and start
   a pull request"**
5. **Propose changes** → **Create pull request**

Fatto: hai aperto una pull request senza aver mai aperto un terminale.

Per correggere il frontmatter dopo, apri il file nella PR e clicca l'icona della
matita. Se preferisci un editor vero, premi il tasto **`.`** sul repository:
si apre VS Code nel browser, con la stessa possibilità di trascinare i file.

> Le foto grosse da telefono qui non vengono ricompresse: se superano i 2 MB o i
> 3000 px il controllo automatico blocca la PR e te lo dice. Ridimensionale
> prima, o usa la strada B.

### B. Mandi uno zip e basta

Manda una cartella zippata a chi cura il sito — email, chat, come preferisci.
L'import è un comando solo:

```bash
npm run ingest -- ~/Downloads/il-tuo-progetto.zip
```

che ricomprime le immagini, toglie i dati EXIF (**anche la posizione GPS**),
rinomina i file e prepara `index.md` con i campi da completare segnati `TODO:`.

In questo caso non serve nessun account: le foto le carichi come stanno, grandi
quanto vengono.

---

## Prima di chiedere la revisione

```bash
npm install     # solo la prima volta
npm run dev     # apri http://localhost:4321
npm run validate  # gli stessi controlli della CI
```

Nota: finché nel frontmatter restano campi `TODO:` la build fallisce. È voluto —
serve a non dimenticarli.

---

## Non ho una foto decente

`cover` è obbligatoria, ma non deve per forza essere una fotografia. Se il
progetto è finito e le uniche foto che hai sono mosse o al buio, chiedi una
copertina segnaposto:

```bash
npm run placeholder -- src/content/progetti/il-mio-progetto
```

Genera un `copertina.jpg` geometrico nei colori del Gorgo Lab, sempre lo stesso
per lo stesso nome di cartella. Non è una scusa per non fotografare niente — le
foto del processo valgono più di qualsiasi grafica — ma è meglio di un progetto
non pubblicato.

---

## Diritti e consensi

Pubblicando dichiari di avere i diritti su testo e immagini e il consenso delle
persone riconoscibili nelle foto. I contenuti escono sotto la licenza indicata
in `license`, di default CC BY-SA 4.0: chiunque può riusarli citando l'autore e
mantenendo la stessa licenza. Se non ti va bene, cambia quel campo.
