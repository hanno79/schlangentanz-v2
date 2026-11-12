/*
Author: Claude Code
Datum: 12.11.2026
Version: 1.0
Beschreibung: Wandelt die gerenderte Spielanleitung von schlangentanz.ch (Seite und
Karten-Dialoge) wörtlich in Markdown um. Läuft im Browser über `page.evaluate`.
*/
const KONVERTER = () => {
  const KARTEN = { '01-bluesnake': 'Blau', '01-redsnake': 'Rot', '01-yellowsnake': 'Gelb', '02-violetsnake': 'Violett', '02-brownsnake': 'Braun', '03-greensnake': 'Grün', regenbogenschlange: 'Regenbogenschlange', farbenfusion: 'Farbenfusion', farbenschutz: 'Farbenschutz', verdoppler: 'Verdoppler', schlangenhaeutung: 'Schlangenhäutung', schlangenkorb: 'Schlangenkorb des Glücks', comeback: 'Comeback-Karte', 'bild-c340c00a': 'Farbendieb', 'bild-66658355': 'Schlangenfrass', 'bild-8a15ae0d': 'Schlangenblockade', 'bild-7f3efeb8': 'Schlangengrube', 'bild-0bbf239a': 'Risiko-Belohnungs-Karte' };
  const bildName = (img) => { const f = (img.currentSrc || img.src || '').split('/').pop().replace(/\.webp$/, ''); return KARTEN[f] || null; };
  const sichtbar = (e) => (e.checkVisibility ? e.checkVisibility() : true);
  const putze = (s) => s.replace(/\s+/g, ' ').replace(/\*\* +/g, '**').replace(/ +\*\*/g, '**').replace(/\*\*([^*]+)\*\*/g, ' **$1** ').replace(/\s+/g, ' ').replace(/ ([.,:;!?)])/g, '$1').replace(/\( /g, '(').trim();
  const BLOCKTAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'TABLE', 'LI', 'SECTION', 'ARTICLE', 'HEADER']);
  const istBlock = (e) => {
    if (BLOCKTAGS.has(e.tagName)) return true;
    if (e.tagName === 'DIV') { const d = getComputedStyle(e).display; return d !== 'inline' && d !== 'inline-block' && d !== 'inline-flex' && d !== 'contents' ? true : false; }
    return false;
  };
  // Liefert Zeilen. inListe: Überschriften werden zu fetten Zeilen.
  const block = (el, inListe) => {
    const zeilen = [];
    let puffer = '';
    const spuele = () => { const teile = puffer.split(/\u0001\s*\u0001/); puffer = ''; for (const t of teile) { const x = putze(t.replace(/\u0001/g, ' ')); if (x) zeilen.push(x, ''); } };
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { puffer += c.nodeValue; continue; }
      if (c.nodeType !== 1) continue;
      const t = c.tagName;
      if (t.toLowerCase() === 'svg' || t === 'BUTTON' || t === 'SCRIPT' || t === 'STYLE') { if (t === 'BUTTON' && c.querySelector('img') && bildName(c.querySelector('img'))) { /* Kartenknopf: Bild weglassen, Name folgt als Überschrift */ } continue; }
      if (!sichtbar(c)) continue;
      if (c.closest('nav, footer, aside') && !c.closest('[role=dialog]')) continue;
      if (t === 'IMG') { const b = bildName(c); if (b) puffer += ` [${b}] `; continue; }
      if (t === 'BR') { puffer += '\u0001'; continue; }
      if (t === 'STRONG' || t === 'B') { puffer += ' **' + putze(c.textContent) + '** '; continue; }
      if (/^H[1-6]$/.test(t)) { spuele(); const x = putze(c.textContent); if (x) zeilen.push(inListe ? `**${x}**` : '#'.repeat(Number(t[1])) + ' ' + x, ''); continue; }
      if (t === 'UL' || t === 'OL') {
        spuele();
        let i = 0;
        for (const li of c.children) {
          if (li.tagName !== 'LI' || !sichtbar(li)) continue;
          i += 1;
          const inhalt = block(li, true).filter((z, k, arr) => !(z === '' && (k === 0 || arr[k - 1] === '')));
          while (inhalt.length && inhalt[inhalt.length - 1] === '') inhalt.pop();
          const marke = t === 'OL' ? `${i}. ` : '- ';
          const einzug = ' '.repeat(marke.length);
          inhalt.forEach((z, k) => zeilen.push(k === 0 ? marke + z : (z === '' ? '' : einzug + z)));
        }
        zeilen.push('');
        continue;
      }
      if (t === 'TABLE') {
        spuele();
        const rows = [...c.querySelectorAll('tr')].map((tr) => [...tr.children].map((td) => putze(td.textContent)));
        rows.forEach((r, i) => { zeilen.push('| ' + r.join(' | ') + ' |'); if (i === 0) zeilen.push('|' + r.map(() => '---').join('|') + '|'); });
        zeilen.push('');
        continue;
      }
      if (istBlock(c) || c.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,table')) { spuele(); zeilen.push(...block(c, inListe)); continue; }
      // Inline-Element (span, em, a …)
      const innen = block(c, inListe).filter((z) => z !== '');
      puffer += ' ' + innen.join(' ') + ' ';
    }
    spuele();
    return zeilen;
  };
  return (root) => block(root, false).join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

module.exports = { KONVERTER };
