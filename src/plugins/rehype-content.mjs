/**
 * Trasforma un'immagine sola in un paragrafo in <figure> con didascalia.
 *
 * Nel markdown la didascalia è il "titolo" dell'immagine, cioè il testo fra
 * virgolette dopo il percorso:
 *
 *   ![Testo alternativo](./foto.jpg "Didascalia visibile sotto la foto")
 *
 * Senza titolo l'immagine resta com'è. Il testo alternativo serve a chi non
 * vede la foto, la didascalia serve a tutti: sono due cose diverse e vanno
 * scritte diverse.
 *
 * Gira dopo l'ottimizzazione delle immagini di Astro: qui si sposta soltanto
 * un nodo già pronto, senza toccarne gli attributi.
 */
export function rehypeFigure() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.tagName !== 'p') return;

      // Solo paragrafi che contengono esclusivamente un'immagine.
      const children = node.children.filter(
        (c) => !(c.type === 'text' && c.value.trim() === ''),
      );
      if (children.length !== 1) return;

      const img = children[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;

      const caption = img.properties?.title;
      if (!caption) return;

      // Il titolo diventa didascalia visibile: lasciarlo anche come tooltip
      // duplicherebbe l'informazione.
      delete img.properties.title;

      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          img,
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: String(caption) }],
          },
        ],
      };
    });
  };
}

/**
 * Avvolge ogni tabella in un contenitore che scorre in orizzontale.
 *
 * Serve perché una tabella larga non deve mai far scorrere l'intera pagina.
 * Mettere `overflow-x` direttamente sulla tabella obbligherebbe a
 * `display: block`, e a quel punto la tabella smette di comportarsi da tabella:
 * le colonne si stringono sul contenuto invece di riempire la riga.
 */
export function rehypeTableWrap() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.tagName !== 'table') return;
      if (parent.tagName === 'div' && parent.properties?.className?.includes('table-wrap')) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [node],
      };
    });
  };
}

/** Visita minimale dell'albero: evita una dipendenza per venti righe. */
function visit(node, fn, parent = null, index = null) {
  fn(node, index, parent);
  if (!node.children) return;
  // All'indietro: sostituire un figlio non sposta quelli ancora da visitare.
  for (let i = node.children.length - 1; i >= 0; i--) {
    visit(node.children[i], fn, node, i);
  }
}
