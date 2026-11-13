import { SONDERKARTENNAMEN } from '../deck';
import type { FarbkarteInfo, Partiephase, Spielkarte, Spielzustand } from '../types';
import { baukasten } from './szenario';
import type { Baukasten, Schlangenglied } from './szenario';

/*
Ein zufälliger Zustand aus echtem Material, für Speichern und Laden (Plan E1,
Kriterium 6): Karten an jedem Ort, Fusionen, Gruben, schwebende Karten, jede
Partiephase, 2 bis 4 Spieler, mit und ohne Erweiterung. Er muss kein Zustand
sein, den eine Partie erreicht, aber jede Invariante erfüllen.
*/

interface Wuerfel {
  bis(n: number): number;
  ja(wahrscheinlichkeit: number): boolean;
}

const istSonderkarte = (name: string) => (karte: Spielkarte) => karte.typ === 'Sonderkarte' && karte.name === name;

/** Bis zu `anzahl` verschiedene freie Karten, die `passt`, zufällig gewählt, als Wahl über ihre Id. */
function waehle(bau: Baukasten, wuerfel: Wuerfel, anzahl: number, passt: (karte: Spielkarte) => boolean = () => true): { id: string }[] {
  const kandidaten = bau.frei().filter(passt);
  const gewaehlt: { id: string }[] = [];
  while (gewaehlt.length < anzahl && kandidaten.length > 0) gewaehlt.push({ id: kandidaten.splice(wuerfel.bis(kandidaten.length), 1)[0].id });
  return gewaehlt;
}

function zufallsSchlange(bau: Baukasten, wuerfel: Wuerfel): Schlangenglied[] {
  const paar = wuerfel.ja(0.4) && bau.frei().some(istSonderkarte('Farbenfusion')) ? fusionspaar(bau, wuerfel) : null;
  const vergeben = new Set(paar?.map((wahl) => wahl.id) ?? []);
  // Eine Farbenfusion ohne Karten darunter gibt es nicht; sie kommt nur über `fusion` in die Schlange.
  const ohneFusion = (karte: Spielkarte) => !vergeben.has(karte.id) && !istSonderkarte('Farbenfusion')(karte);
  const glieder: Schlangenglied[] = waehle(bau, wuerfel, 1 + wuerfel.bis(5), ohneFusion);
  if (paar !== null) glieder.splice(wuerfel.bis(glieder.length + 1), 0, { fusion: paar });
  return glieder;
}

/** Zwei freie Farbkarten gleicher Farbe (A7.7, D20), wenn es sie gibt. */
function fusionspaar(bau: Baukasten, wuerfel: Wuerfel): [{ id: string }, { id: string }] | null {
  const farbkarten = bau.frei().filter((karte): karte is FarbkarteInfo => karte.typ === 'Farbkarte');
  const erste = farbkarten[wuerfel.bis(farbkarten.length)];
  if (erste === undefined) return null;
  const zweite = farbkarten.find((karte) => karte.id !== erste.id && karte.farbe === erste.farbe);
  return zweite === undefined ? null : [{ id: erste.id }, { id: zweite.id }];
}

/** Aufgaben erfüllen, Comeback umdrehen, Risiko-Karten aus dem Spiel nehmen. */
function verteileErweiterung(zustand: Spielzustand, wuerfel: Wuerfel): void {
  for (const spieler of zustand.spieler) {
    if (wuerfel.ja(0.3) && zustand.offeneAufgaben.length > 0) {
      spieler.erfuellteAufgaben.push(zustand.offeneAufgaben.splice(wuerfel.bis(zustand.offeneAufgaben.length), 1)[0]);
    }
    spieler.geheimeAufgabeErfuellt = wuerfel.ja(0.2);
    if (spieler.comeback !== null) spieler.comeback.verbraucht = wuerfel.ja(0.3);
    if (wuerfel.ja(0.3)) zustand.ausDemSpiel.push(...spieler.risikoKarten.splice(0, 1 + wuerfel.bis(2)));
  }
}

export function zufallszustand(zufall: () => number): Spielzustand {
  const wuerfel: Wuerfel = { bis: (n) => Math.floor(zufall() * n), ja: (wahrscheinlichkeit) => zufall() < wahrscheinlichkeit };
  const { bis, ja } = wuerfel;
  const spielerzahl = 2 + bis(3);
  const erweiterung = ja(0.5);
  const phase: Partiephase = (['Laufend', 'Schlussrunde', 'Beendet'] as const)[bis(3)];
  const bau = baukasten({ spielerzahl, erweiterung, zufall });

  for (let index = 0; index < spielerzahl; index += 1) {
    for (let anzahl = bis(3); anzahl > 0; anzahl -= 1) bau.schlange(index, zufallsSchlange(bau, wuerfel));
    bau.ablage(index, waehle(bau, wuerfel, bis(4)));
  }
  if (ja(0.4) && bau.frei().some(istSonderkarte('Schlangengrube'))) bau.grube(bis(spielerzahl), bis(spielerzahl));
  bau.ausDemSpiel(waehle(bau, wuerfel, bis(2)));
  bau.haendeAuffuellen();
  for (let index = 0; index < spielerzahl; index += 1) bau.hand(index, waehle(bau, wuerfel, bis(3)));

  const verdoppler = waehle(bau, wuerfel, 1, istSonderkarte('Verdoppler'))[0];
  if (phase !== 'Beendet' && ja(0.3) && verdoppler !== undefined) {
    const angreifer = bis(spielerzahl);
    const ausstehend = ja(0.5) ? [(angreifer + 1) % spielerzahl] : [];
    bau.schwebend(angreifer, verdoppler, (karteId, spielerId) => ({ typ: 'VerdopplerSpielen', spielerId, karteId }), ausstehend);
  }

  bau.amZug(bis(spielerzahl), ja(0.3) ? 2 : 1).aendere((zustand) => {
    zustand.zug.gespielteFarbkarten = bis(2);
    zustand.zug.gespielteSonderkarten = bis(2);
    zustand.zug.verdopplerGespielt = ja(0.3);
    zustand.zug.farbenfusionGespielt = ja(0.3);
    zustand.zug.abschnitt = ja(0.2) ? 'Abwerfen' : 'Ausspielen';
    for (const spieler of zustand.spieler) {
      spieler.ausgespielteSonderkarten = Array.from({ length: bis(4) }, () => SONDERKARTENNAMEN[bis(SONDERKARTENNAMEN.length)]);
      spieler.schlangenhaeutungDreiergruppen = bis(3);
    }
    if (erweiterung) verteileErweiterung(zustand, wuerfel);
  });
  if (phase === 'Schlussrunde') bau.schlussrunde(bis(spielerzahl));
  if (phase === 'Beendet') bau.beendet(bis(spielerzahl));
  return bau.zustand();
}
