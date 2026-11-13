/*
Setzt Teil A von docs/GAME_SPEC.md aus der umgewandelten Website zusammen (`seiteMd`
und `dialogeMd` aus lade_website.cjs).
Wörtlich; hinzu kommen nur Gliederung und Abschnittsnummern (A1 bis A11). Danach
vereinheitlicht `nachbessern` zwei Darstellungsfragen (Bildreihen der Farbenfusion,
Erweiterungs-Etikett), ohne Wortlaut zu ändern.
*/
function baueTeilA({ seiteMd: seite, dialogeMd }) {
const dialoge = new Map(dialogeMd.map((d) => [d.label, d.md]));

// Abschnitte der Seite nach H2 trennen.
const teile = new Map();
let akt = null;
for (const z of seite.split('\n')) {
  const m = /^## (.+)$/.exec(z);
  if (m) { akt = m[1].replace(/Erweiterung$/, '').trim(); teile.set(akt, []); continue; }
  if (akt) teile.get(akt).push(z);
}
const roh = (name) => { if (!teile.has(name)) throw new Error('Abschnitt fehlt: ' + name + ' | vorhanden: ' + [...teile.keys()].join(', ')); return teile.get(name).join('\n').trim(); };
const badge = (s) => s.replace(/^(#+ )Erweiterung(?=[A-ZÄÖÜ])/gm, '$1[Erweiterung] ').replace(/^(\d+\. )?Vielfaltbonus: Erweiterung$/gm, '$1Vielfaltbonus [Erweiterung]:').replace(/^Aufgabenkarten: Erweiterung$/gm, 'Aufgabenkarten [Erweiterung]:').replace(/^(\d+\. )Aufgabenkarten: Erweiterung$/gm, '$1Aufgabenkarten [Erweiterung]:');
const tiefer = (s, n) => s.replace(/^(#+) /gm, (x, h) => '#'.repeat(Math.min(6, h.length + n)) + ' ');
const ohneBilderZeilen = (s) => s.split('\n').filter((z) => !/^(\[[^\]]+\]\s*)+(Details)?$/.test(z.trim()) || /\] \[/.test(z)).join('\n').replace(/\n{3,}/g, '\n\n');

const A = [];
// A1 Spielmaterial: Tabelle mit ausgefüllter Kategorie-Spalte.
{
  const zeilen = roh('Spielmaterial').split('\n');
  const vor = [], tab = [], nach = [];
  let kat = '', inTab = false, fertig = false;
  for (const z of zeilen) {
    if (/^\|/.test(z)) {
      inTab = true;
      if (/^\|---/.test(z) || /Kategorie/.test(z)) continue;
      const c = z.split('|').slice(1, -1).map((x) => x.trim());
      if (c.length === 3) { kat = c[0].replace(/\s*Erweiterung$/, ' [Erweiterung]'); tab.push([kat, c[1], c[2]]); }
      else tab.push([kat, c[0], c[1]]);
    } else if (inTab) { fertig = true; if (z.trim()) nach.push(z, ''); }
    else if (z.trim() && !/^\[[^\]]+\]$/.test(z.trim())) vor.push(z, '');
  }
  A.push('### A1 Spielmaterial', '', ...vor, '| Kategorie | Anzahl | Beschreibung |', '|---|---|---|', ...tab.map((r) => `| ${r[0]} | ${r[1]} | ${r[2].replace(/ Erweiterung$/, ' [Erweiterung]')} |`), '', ...nach);
}
A.push('### A2 Spieler', '', roh('Spieler'), '', '### A3 Spielziel', '', roh('Spielziel'), '');
A.push('### A4 Spielvorbereitung', '', tiefer(badge(roh('Spielvorbereitung')), 1), '');
A.push('### A5 Spielablauf', '', tiefer(badge(roh('Spielablauf')), 1), '');
A.push('### A6 Sonderkarten-Timing und Beispiele', '', tiefer(roh('Sonderkarten-Timing und Beispiele'), 1), '');

// Karten: Kurzbeschreibung von der Seite + Dialogtext.
const kartenBlock = (abschnitt, nummer, start) => {
  const zeilen = roh(abschnitt).split('\n');
  const kopf = [];
  const karten = [];
  let k = null;
  for (const z of zeilen) {
    const m = /^#### (.+)$/.exec(z);
    if (m) { k = { name: m[1].trim(), kurz: [] }; karten.push(k); continue; }
    if (/^### /.test(z)) continue;
    if (k) { if (z.trim() && !/^(\[[^\]]+\]\s*)*Details$/.test(z.trim()) && !/^\[[^\]]+\]$/.test(z.trim())) k.kurz.push(z.trim()); }
    else if (z.trim()) kopf.push(z.trim());
  }
  const outp = [];
  if (kopf.length) outp.push(kopf.join('\n\n'), '');
  karten.forEach((c, i) => {
    const d = dialoge.get(c.name);
    if (!d) throw new Error('Dialog fehlt: ' + c.name);
    const rumpf = ohneBilderZeilen(d.split('\n').filter((z) => !/^## /.test(z)).join('\n')).trim();
    outp.push(`#### ${nummer}.${start + i} ${c.name}`, '', ...(c.kurz.length ? ['Kurzbeschreibung: ' + c.kurz.join(' '), ''] : []), tiefer(rumpf, 2).replace(/^#####+ (.+)$/gm, '**$1**'), '');
  });
  return { text: outp.join('\n'), anzahl: karten.length, namen: karten.map((c) => c.name) };
};
const sk = kartenBlock('Sonderkarten', 'A7', 1);
A.push('### A7 Sonderkarten', '', sk.text);
A.push('### A8 Erweiterung: Schlangenkorb des Glücks', '', roh('Erweiterung: Schlangenkorb des Glücks'), '');
const cb = kartenBlock('Comeback-Karten', 'A8', 1);
A.push(cb.text);
const rb = kartenBlock('Risiko-Belohnungs-Karten', 'A8', 2);
A.push(rb.text);

// A9 Aufgabenkarten: Regeln, dann Tabelle aller Karten, dann Beispiele.
{
  const zeilen = roh('Aufgabenkarten').split('\n');
  const regeln = [];
  const namen = [];
  let inKarten = false;
  for (const z of zeilen) {
    if (/^### Verfügbare Aufgabenkarten/.test(z)) { inKarten = true; continue; }
    const m = /^#### (.+)$/.exec(z);
    if (inKarten && m) { namen.push(m[1].trim()); continue; }
    if (!inKarten) regeln.push(z);
  }
  A.push('### A9 Aufgabenkarten [Erweiterung]', '', tiefer(regeln.join('\n').trim(), 1), '', '#### Verfügbare Aufgabenkarten', '', '| Nr. | Name | Punkte | Bedingung (Kartentext) |', '|---|---|---|---|');
  const beispiele = [];
  namen.forEach((n, i) => {
    const d = dialoge.get(n);
    if (!d) throw new Error('Aufgaben-Dialog fehlt: ' + n);
    const zl = d.split('\n').map((z) => z.trim()).filter(Boolean);
    const kopf = /^## (.+) \((\d+) Punkte\)$/.exec(zl[0]);
    if (!kopf) throw new Error('Kopf unlesbar: ' + zl[0]);
    const rest = zl.slice(1).filter((z) => !/^\[[^\]]+\]$/.test(z));
    A.push(`| ${i + 1} | ${kopf[1]} | ${kopf[2]} | ${rest[0]} |`);
    const bsp = rest.slice(1).filter((z) => !/^### Beispiele/.test(z) && z !== 'Schliessen');
    if (bsp.length) beispiele.push(`**${kopf[1]}:** ` + bsp.join(' '));
  });
  A.push('', '#### Beispiele zu einzelnen Aufgabenkarten', '', beispiele.join('\n\n'), '');
}
A.push('### A10 Spielende', '', roh('Spielende'), '');
A.push('### A11 Punktezählung', '', tiefer(badge(roh('Punktezählung')), 1), '');
const text = A.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
return nachbessern(text);
}

/** Darstellung vereinheitlichen. Wirft, wenn eine erwartete Stelle fehlt: dann hat sich die Website geändert und das hier muss nachgezogen werden. */
function nachbessern(text) {
  let h = text.replace(/\| (Schlangenhäutung|Schlangenkorb des Glücks)Erweiterung \|/g, '| $1 [Erweiterung] |');
  const ersetze = (alt, neu) => {
    const anzahl = h.split(alt).length - 1;
    if (anzahl !== 1) throw new Error(`Nachbesserung: Stelle ${anzahl}-mal statt einmal gefunden: ${alt.slice(0, 70)}`);
    h = h.replace(alt, neu);
  };
  // Bildreihen der Fusionsbeispiele vollständig und in einer Zeile.
  ersetze('(die am vorteilhaftesten ist).\n\n[Blau] [Blau]\n', '(die am vorteilhaftesten ist).\n\n[Blau] [Blau] [Gelb + Farbenfusion + Gelb]\n');
  ersetze('Farbenfusion(fusionierte Gelb - Gelb) - Rot - Rot.\n\n[Blau] [Blau]\n\n[Rot] [Rot]\n', 'Farbenfusion(fusionierte Gelb - Gelb) - Rot - Rot.\n\n[Blau] [Blau] [Gelb + Farbenfusion + Gelb] [Rot] [Rot]\n');
  ersetze('[Blau] [Blau]\n\n   [Blau]\n\n   [Farbenfusion]\n\n   [Blau]\n\n   [Violett] [Violett]\n', '[Blau] [Blau] [Blau + Farbenfusion + Blau] [Violett] [Violett]\n');
  // Erweiterungs-Etikett am Zeilenende einheitlich als [Erweiterung].
  h = h.replace(/([^\s\]]) Erweiterung$/gm, '$1 [Erweiterung]');
  return h;
}

module.exports = { baueTeilA };
