## Cosa contiene questa PR

<!-- Una riga: "Aggiungo il progetto X" oppure "Articolo sulla serata Y" -->

## Checklist

- [ ] Il contenuto sta in **una sola cartella** sotto `src/content/progetti/` o `src/content/blog/`
- [ ] Il file si chiama `index.md` (o `index.mdx` se uso `<Video>`, `<Callout>`, `<Specs>`)
- [ ] `summary` descrive il progetto in una-due frasi (è il testo dell'anteprima)
- [ ] Ogni immagine ha una descrizione testuale (`coverAlt`, `galleryAlt`)
- [ ] I `tags` sono presi dalla lista in `src/site.config.ts`
- [ ] Nessun video caricato come file: solo embed con `<Video />`
- [ ] Ho i diritti sulle immagini e il consenso delle persone riconoscibili
- [ ] `draft: true` è stato tolto (o lasciato apposta, se è ancora una bozza)

## Anteprima

Il sito costruito da questo ramo si vede qui, prima del merge:

<!-- Sostituisci NOME-DEL-RAMO. L'indirizzo segue il ramo, quindi resta valido
     anche dopo altri commit: ricarica e vedi l'ultima versione. Lo stesso link
     sta nel check "Cloudflare Pages" qui sotto, sotto "Details". -->

https://NOME-DEL-RAMO.gorgolab-website.pages.dev/

Controllalo prima di chiedere la revisione.
