# Sito del Gorgo Lab

Sito statico dell'hackerspace comunale di Gorgonzola, costruito con
[Astro](https://astro.build). I progetti e gli articoli sono file markdown che i
maker aggiungono via pull request; il sito li impagina, ottimizza le immagini e
genera anteprime, indici e feed da solo.

L'identità visiva segue il design system ufficiale di Gorgo Lab: due colori
piatti (blu `#0071BC`, arancio `#F15A24`), sfondo carta, Archivo Black per i
titoli, bordi netti e ombre offset. Le regole vive stanno in
[`src/styles/global.css`](src/styles/global.css).

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `npm install` | installa le dipendenze |
| `npm run dev` | server di sviluppo su `localhost:4321` |
| `npm run build` | build di produzione in `dist/` |
| `npm run preview` | serve la build locale |
| `npm run validate` | tutti i controlli della CI in una volta |
| `npm run check:links` | verifica i collegamenti interni sulla build |
| `npm run ingest -- <zip\|cartella>` | importa il materiale di un maker |
| `npm run placeholder -- <cartella>` | genera una copertina segnaposto in tema |

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
