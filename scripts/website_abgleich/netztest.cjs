/*
Netztest für den Abruf der Website (nicht Teil von `npm test`, braucht Internet).
Prüft nur, ob Laden und Umwandlung noch greifen: Seite mit Text, Karten-Dialoge,
Haupt-Bundle, erkannter Anfang und erkanntes Ende der Anleitung, Teil A baubar.
Ob Teil A inhaltlich mit der Website übereinstimmt, prüft `npm run abgleich:website`.

Aufruf: npm run test:website-netz
*/
const assert = require('assert/strict');
const { ladeWebsite } = require('./lade_website.cjs');
const { baueTeilA } = require('./baue_teil_a.cjs');
const { pruefeAbdeckung } = require('./abgleich.cjs');

async function main() {
  const website = await ladeWebsite();
  assert.match(website.seiteText, /^Spielanleitung$/m, 'Überschrift „Spielanleitung“ fehlt im Bildschirmtext');
  assert.match(website.seiteText, /^HR Spiele$/m, 'Fuss „HR Spiele“ fehlt im Bildschirmtext');
  assert.match(website.bundle, /^index-.+\.js$/, `Haupt-Bundle nicht erkannt: „${website.bundle}“`);
  assert.ok(website.dialogeMd.length >= 20, `nur ${website.dialogeMd.length} Karten-Dialoge gefunden`);
  assert.match(website.seiteMd, /^## Spielmaterial$/m, 'Abschnitt „Spielmaterial“ fehlt im Markdown');
  const teilA = baueTeilA(website);
  assert.match(teilA, /^### A11 Punktezählung$/m, 'Teil A liess sich nicht bis A11 bauen');
  const abdeckung = pruefeAbdeckung(website, teilA);
  assert.ok(abdeckung.geprueft > 100, `nur ${abdeckung.geprueft} Zeilen der Website geprüft`);
  console.log(`Netztest bestanden: ${website.dialogeMd.length} Dialoge, ${abdeckung.geprueft} Zeilen, Bundle ${website.bundle}.`);
}

main().catch((fehler) => {
  console.error('Netztest fehlgeschlagen:', fehler.message);
  process.exit(1);
});
