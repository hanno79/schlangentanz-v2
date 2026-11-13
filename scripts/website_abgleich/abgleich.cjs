/*
Gleicht docs/GAME_SPEC.md Teil A mit https://schlangentanz.ch/rules ab.

Zwei Prüfungen, beide müssen bestehen:
1. **Gleichheit:** Teil A, frisch aus der Website gebaut, ist zeichengleich mit Teil A
   im Dokument. Sonst zeigt das Skript die Unterschiede.
2. **Abdeckung:** Jede Textzeile der Website (Seite und Karten-Dialoge, so wie der
   Browser sie anzeigt) steht im Dokument. Diese Prüfung hängt nicht am
   Markdown-Konverter und fängt dessen Fehler ab. Zeilen, die nur in der
   Formatierung abweichen (Tabellenzellen, Erweiterungs-Etikett), stehen in
   NUR_FORMATIERUNG und werden ausgewiesen, nicht verschwiegen.

Aufruf:
  npm run abgleich:website              prüft, Exit 1 bei Abweichung
  npm run abgleich:website -- --schreiben  ersetzt Teil A und die Bundle-Angabe im Kopf

Nach --schreiben: Teil C, D und E von Hand prüfen und den Verlauf in Teil E ergänzen.
Umgebung: PW_CHROMIUM_PFAD (optional), HTTPS_PROXY (optional).
*/
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { baueTeilA } = require('./baue_teil_a.cjs');
const { ladeWebsite } = require('./lade_website.cjs');

const WURZEL = path.resolve(__dirname, '..', '..');
const SPEC = path.join(WURZEL, 'docs', 'GAME_SPEC.md');
const TEIL_A_KOPF = '## Teil A — Regeln (Spiegel der Website)\n\n';

/** Zeilen der Website, die im Dokument nur anders formatiert stehen (Tabelle, Etikett). */
const NUR_FORMATIERUNG = [
  /^(Schlangenhäutung|Schlangenkorb des Glücks|Aufgabenkarten|Zusätzliches Spielmaterial)Erweiterung$/,
  /^Verfügbare (Sonder|Aufgaben)karten:$/,
  /^\d+ Punkte$/,
  /^.+ \(\d+ Punkte\)$/,
];

function teilAImDokument(spec) {
  const start = spec.indexOf(TEIL_A_KOPF);
  const ende = spec.indexOf('\n## Teil B');
  if (start < 0 || ende < 0) throw new Error('Teil A oder Teil B nicht gefunden in docs/GAME_SPEC.md');
  return { start: start + TEIL_A_KOPF.length, ende: ende + 1 };
}

/**
 * Prüft, ob jede Textzeile der Website im Dokument steht. `seiteText` ist der
 * Bildschirmtext der Seite, `dialogeText` je Karten-Dialog `{ label, text }`.
 */
function pruefeAbdeckung({ seiteText, dialogeText }, spec) {
  const norm = (s) => s.replace(/\[[^\]]*\]/g, ' ').replace(/[*#|`>]/g, ' ').replace(/^\s*(\d+\.|-)\s+/gm, ' ').replace(/\s+/g, ' ').trim();
  const dokument = norm(spec);
  const seite = seiteText.split('\n');
  const dialoge = dialogeText.flatMap((d) => d.text.split('\n'));
  // Navigation (bis „Spielanleitung") und Fuss (ab „HR Spiele") gehören nicht zur Anleitung.
  const von = seite.findIndex((z) => z.trim() === 'Spielanleitung');
  const bis = seite.findIndex((z, i) => i > von && z.trim() === 'HR Spiele');
  if (von < 0 || bis < 0) throw new Error('Seitenanfang oder -ende nicht erkannt; hat sich der Aufbau der Website geändert?');
  const zeilen = [...seite.slice(von + 1, bis), ...dialoge]
    .map((z) => z.trim())
    .filter((z) => z.length > 3 && !['Details', 'Close', 'Schliessen', 'Erweiterung', 'Kategorie\tAnzahl\tBeschreibung'].includes(z));
  const fehlend = [];
  const formatiert = [];
  for (const zeile of new Set(zeilen)) {
    const n = norm(zeile);
    if (n.length <= 3 || dokument.includes(n)) continue;
    (NUR_FORMATIERUNG.some((muster) => muster.test(zeile)) ? formatiert : fehlend).push(zeile);
  }
  return { geprueft: zeilen.length, fehlend, formatiert };
}

async function main() {
  const schreiben = process.argv.includes('--schreiben');
  const website = await ladeWebsite();

  const neu = baueTeilA(website);
  const { bundle } = website;
  let spec = fs.readFileSync(SPEC, 'utf8');
  const { start, ende } = teilAImDokument(spec);
  const alt = spec.slice(start, ende);

  if (schreiben) {
    spec = spec.slice(0, start) + neu.trimEnd() + '\n\n' + spec.slice(ende);
    spec = spec.replace(/Bundle `index-[^`]+\.js`/, `Bundle \`${bundle}\``);
    fs.writeFileSync(SPEC, spec);
    console.log(`Teil A neu geschrieben (Bundle ${bundle}). Teil C, D und E jetzt von Hand prüfen und den Verlauf ergänzen.`);
  }

  let fehler = false;
  if (!schreiben && alt.trim() !== neu.trim()) {
    fehler = true;
    const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'website-abgleich-'));
    const a = path.join(ordner, 'teil_a_dokument.md');
    const b = path.join(ordner, 'teil_a_website.md');
    fs.writeFileSync(a, alt.trim() + '\n');
    fs.writeFileSync(b, neu.trim() + '\n');
    console.log('\nABWEICHUNG: Teil A im Dokument (-) und auf der Website (+):\n');
    spawnSync('git', ['--no-pager', 'diff', '--no-index', '--color=never', a, b], { stdio: 'inherit' });
  }

  const abdeckung = pruefeAbdeckung(website, spec);
  console.log(`\nAbdeckung: ${abdeckung.geprueft} Zeilen der Website geprüft, ${abdeckung.fehlend.length} fehlen, ${abdeckung.formatiert.length} nur anders formatiert.`);
  for (const zeile of abdeckung.fehlend) console.log('  FEHLT:', zeile.slice(0, 200));
  if (abdeckung.fehlend.length > 0) fehler = true;

  console.log(fehler ? '\nErgebnis: Teil A weicht von der Website ab.' : `\nErgebnis: Teil A stimmt mit der Website überein (Bundle ${bundle}).`);
  process.exit(fehler ? 1 : 0);
}

if (require.main === module) {
  main().catch((fehler) => {
    console.error('FEHLER beim Abgleich:', fehler.message);
    process.exit(1);
  });
}

module.exports = { pruefeAbdeckung };
