# Spielbrett-Spezifikation

Dieses Dokument beschreibt, **was das Spielbrett zeigt und was der Spieler darauf
tun kann**. `GAME_SPEC.md` beschreibt die Regeln; dieses Dokument beschreibt die
Oberfläche.

## Warum es dieses Dokument gibt

Bis zum 31.07.2026 gab es keine Spezifikation der Oberfläche. Rund 250 Slices
haben je ein Brettobjekt hinzugefügt, kaum einer hat etwas entfernt. Das Ergebnis
war messbar unbenutzbar: 298 sichtbare Elemente, davon 8 von 12 Bedienelementen
vollständig verdeckt und 6 außerhalb des Bildes. Der Startfährte-Knopf — die
erste Handlung im Spiel — lag 481 px unter dem Bildrand; ein Mausklick darauf
bewirkte nichts.

Ohne ein Dokument, das sagt „so viel und nicht mehr", wächst jede Oberfläche in
diese Richtung. Dieses Dokument ist die Bremse.

---

## Die sieben Regionen

Mehr Regionen gibt es nicht. Wer eine achte braucht, ändert erst dieses Dokument.

```
┌──────────────────────────────────────────────────────────────┐
│ 1 KOPFLEISTE  Spieler·Punkte │ Phase · Zugbudget x/y │ Gegner │
├──────────────────────────────────────────────┬───────────────┤
│  2 SPIELFLÄCHE                               │ 4 SEITENSPALTE│
│    eigene Schlangen, Startkreis,             │   Aktionsliste│
│    Anlegeplätze links/rechts                 │   geheime     │
│    (füllt den Rest, scrollt in sich)         │     Aufgabe   │
│                                              │   Aufgaben    │
├──────────────────────────────────────────────┴───────────────┤
│ 3 GEGNERSTREIFEN   gegnerische Schlangen, Zustand, aussetzen │
├──────────────────────────────────────────────────────────────┤
│ 5 HANDLEISTE   Karten nebeneinander, jede anklickbar │ 6 AKTION│
├──────────────────────────────────────────────────────────────┤
│ 7 STATUSZEILE   Pflichtschritt · Stapel · letzte Aktion      │
└──────────────────────────────────────────────────────────────┘
```

| # | Region | Zeigt | Der Spieler tut hier |
|---|---|---|---|
| 1 | **Kopfleiste** | eigener Name, Punkte, Zugphase, Zugbudget, Gegnerübersicht | nichts — reine Orientierung |
| 2 | **Spielfläche** | eigene Schlangen, Startkreis, Anlegeplätze | legt Karten an, startet Schlangen, wählt Brettziele |
| 3 | **Gegnerstreifen** | gegnerische Schlangen, deren Zustand, wer aussetzt | wählt gegnerische Ziele für Sonderkarten |
| 4 | **Seitenspalte** | Aktionsliste, geheime Aufgabe, offene Aufgaben | löst Aktionen über die Liste aus (Rückfallebene) |
| 5 | **Handleiste** | die eigenen Karten | wählt Karten aus, wirft ab |
| 6 | **Aktionsknopf** | *ein* Knopf: der, der die Phase weiterbringt | bringt den Zug voran |
| 7 | **Statuszeile** | nächster Pflichtschritt, Nachziehstapel, Ablage, letzte Aktion | nichts — reine Rückmeldung |

Entworfen für **1280×900 und breiter**. Schmaler wird gestapelt und darf
scrollen.

**Region 6 ist bewusst ein einziger Knopf.** Vor dem Neubau gab es vier
konkurrierende Implementierungen derselben Phasen-Aktionen an verschiedenen
Orten.

---

## Zehn Regeln

1. **Jede Information genau einmal.** Wird sie an zwei Stellen gebraucht, ist
   eine davon die falsche Stelle. *(Vorher: Zugphase an 6 Stellen, aktiver
   Spieler an 7, Punktestand an 5.)*

2. **Keine festen Höhen-Caps auf Inhaltsflächen.** Der Inhalt bestimmt die Höhe;
   passt er nicht, scrollt sein Container — er wird nicht abgeschnitten.
   *(Vorher: jedes Infofeld auf ~80 px gedeckelt bei 100–230 px Inhalt.)*

3. **Eine Rahmenebene.** Ein Spielobjekt hat einen Rahmen, sein Inhalt keinen.
   *(Vorher: bis zu sechs Ebenen mit je 3–4 px Rahmen, Schatten und Verlauf
   ineinander.)*

4. **Kein `!important`, keine `[class~=]`-Specificity-Tricks, keine
   route-gescopten Überschreibungen.** Wer eine Regel ändern will, ändert sie.
   *(Vorher: 31 % aller Regeln route-gescopet, 27 Selektoren 3–5× über 8.000
   Zeilen verteilt.)*

5. **z-index nur aus einer benannten Skala.** `--ebene-brett`, `--ebene-karte`,
   `--ebene-overlay`. *(Vorher: 14 Werte ohne erkennbare Ordnung.)*

6. **Jede legale Aktion ist immer über mindestens einen sichtbaren Weg
   erreichbar.** Die Aktionsliste in der Seitenspalte ist die Rückfallebene.
   *(Vorher: Das `AktionenPanel` war der einzige Ort, der jede Aktion anbot —
   und wurde per CSS versteckt. Damit waren die freie Schlangenhäutung und die
   Kartenwahl beim Pflicht-Abwurf gar nicht mehr spielbar.)*

7. **Ein Klick verlangt eine Entscheidung.** *(ÄNDERUNG 31.07.2026.)* Ein Knopf,
   der nur bestätigt, dass die Engine weiterrechnen darf, gehört nicht aufs
   Brett — er wird zum Nachlauf des Klicks, der die Entscheidung getroffen hat.
   Übrig bleiben zwei: „Zug beenden" (bin ich fertig, oder spiele ich noch eine
   zweite Karte?) und der Überhand-Abwurf (welche Karten gehen weg?).
   *(Vorher: sieben Klicks pro Runde, davon zwei mit Wahl. „Weiter zum
   Zugabschluss", „Zug an nächsten Spieler geben", „Gegnerzug abspielen" und
   „Ausspielphase starten" fragten nichts.)*

   Was ohne Klick durchläuft, muss dafür **sichtbare Spuren hinterlassen**: Der
   Gegnerzug wird protokolliert (Region 3), und ein automatischer Schritt
   überschreibt dieses Protokoll nicht, bevor es gelesen werden konnte.

8. **Die Fläche, auf der gespielt wird, hat einen Boden — die Streifen, die
   mit dem Spielstand wachsen, haben einen Deckel.** *(ÄNDERUNG 01.08.2026.)*
   Gegnerstreifen und Hand wachsen mit jeder Karte; die Spielfläche nicht. Ist
   sie die einzige dehnbare Zeile, bezahlt sie für alle anderen — bis auf null.

   *(Vorher: `grid-template-rows: auto minmax(0, 1fr) …`. Mit zwei KI-Gegnern
   schrumpfte die Spielfläche über vier Runden von 384 px auf 162 px bei 339 px
   Inhalt, während der Gegnerstreifen auf 298 px wuchs. Regel 2 war dabei nie
   verletzt — die Fläche scrollte ja. Sie war nur zu klein zum Spielen.)*

9. **Sonderkarten spielt man wie Farbkarten: Karte wählen, Ziel am Brett
   anklicken.** *(ÄNDERUNG 01.08.2026.)* Zwei Wege für dieselbe Sache sind
   einer zu viel, und der unbequemere darf nicht der einzige sein.

   *(Vorher: Sonderkarten gingen nur über die Aktionsliste. Wer die
   Schlangengrube gegen einen bestimmten Gegner spielen wollte, musste den
   Eintrag heraussuchen, der genau diesen Gegner meint.)*

   Die Aktionsliste bleibt die Rückfallebene (Regel 6). Ein Brettziel erscheint
   nur, solange die gewählte Karte es anbietet — sonst stünden bei jeder
   Schlange Knöpfe ohne Zweck herum und das Elementbudget wäre gesprengt.

   Zusammengesetzt wird dabei keine Aktion: Die Engine enumeriert jede legale
   Kombination samt Zielen, die Oberfläche filtert nur. Alles andere hieße, die
   Regeln ein zweites Mal zu schreiben.

10. **Ein Wächter, der Erreichbares als unerreichbar meldet, wird bald nicht mehr
   gelesen.** *(ÄNDERUNG 01.08.2026.)* Weggescrollt ist nicht unerreichbar: Was
   außerhalb des Sichtfensters seiner scrollenden Spalte liegt, holt der
   Container mit einem Handgriff. Wer das nicht unterscheidet, produziert
   Rauschen — und übersieht den Tag, an dem der Befund stimmt.

---

## Vollständigkeitsliste

Abgeleitet aus `src/engine/legalActions.ts` und `GAME_SPEC.md`. Diese Liste ist
die Abnahmecheckliste des Bretts.

### Eingaben — je Aktion mindestens ein Klickpfad

| Eingabe | Für welche Aktion |
|---|---|
| Handkarte auswählen/abwählen, Drag-Start | alle |
| Startzone | `NeueSchlangeStarten` (Limit 2 sichtbar machen) |
| Anlegeplatz **links** und **rechts**, getrennt | `KarteAnlegen` |
| eigene Schlange | `FarbenschutzSpielen`, `SchlangenhaeutungSpielen` |
| Kartenpaar in eigener Schlange | `FarbenfusionSpielen` (max. 1×/Zug) |
| einzelne eigene Karte | `SchlangenfrassSpielen` (1 Ziel) |
| gegnerische Schlange | `SchlangenblockadeSpielen` |
| gegnerische Karte | `FarbendiebSpielen` (Beute), `SchlangenfrassSpielen` (2 Ziele, **2-Schritt-Auswahl mit Reset**) |
| Einfügeplatz 0..n in eigener Schlange | `FarbendiebSpielen` |
| Gegnerplakette | `SonderkarteSpielen` (Schlangengrube) |
| Verdoppler-Auslöser | `VerdopplerSpielen` (nur bei `gespielteKarten === 0`) |
| **freier Reihenfolge-Editor** | `SchlangenhaeutungSpielen` — nicht zwei Presets |
| Gegnerplakette anklicken | `SonderkarteSpielen` (Schlangengrube) |
| gegnerische Schlange anklicken | `SchlangenblockadeSpielen` — **ohne** Einfügeposition |
| gegnerische Karte anklicken | `FarbendiebSpielen` (Beute), `SchlangenfrassSpielen` (zwei Ziele) |
| eigene Karte anklicken | `FarbenfusionSpielen`, `SchlangenfrassSpielen` (ein Ziel) |
| Einfügeplatz in eigener Schlange | `FarbendiebSpielen` |
| Reaktionsdialog | `…Abwehren` / `…Durchlassen`, inkl. Zustand „kein Farbenschutz" |
| Pflicht-Abwurf **mit Kartenwahl** | `PflichtAbwurf` |
| Überhand-Abwurf: n-aus-m mit Bestätigung | Zugabschluss |
| zwei Phasenknöpfe | „Zug beenden" und Überhand-Abwurf — siehe Regel 7 |
| KI-Zug | läuft ohne Klick durch, mit Protokollanzeige |
| neues Spiel | 1–3 KI-Gegner |

### Dauerhaft sichtbare Zustände

aktiver Spieler · Zugphase · Endspurt · **gespielte Karten x/y mit Farb- und
Sonderkartenzähler** · **Verdoppler aktiv (2→3 Karten)** · Handkartenzahl und
Limit 10 · **Schlangenzahl und Limit 2** · Schlangenzustände
aktiv/blockiert/geschützt · Nachziehstapel und Ablage · offene Aufgaben (im
Endspurt doppelt zählend) · geheime Aufgabe **nur des Menschen** · **wer
aussetzt** · nächster Pflichtschritt · letzte Aktion · **abgelehnte Aktion mit
der deutschen Engine-Meldung** · Wertung und Sieger.

**Zur abgelehnten Aktion** *(ÄNDERUNG 03.08.2026)*: `GAME_SPEC.md` Abschnitt 6
verlangt, dass die UI bei einem Verstoß die deutsche Engine-Meldung sichtbar
macht, „statt still zu scheitern". Bis zu diesem Datum war das offen — die Engine
wirft an rund 220 Stellen, und der Klickpfad fing nichts davon ab: Der Knopf tat
nichts, kommentarlos.

Die Meldung steht in der **Statuszeile** (Region 7) und bekommt keine eigene
Region — dort steht ohnehin, was zuletzt geschah. Sie trägt `role="alert"`, damit
Screenreader sie ansagen; die übrigen Statusangaben sind bewusst still, sonst
wäre keine davon dringlich.

**Was der Fehlerfang abdeckt.** Ein `try/catch` im Klick-Handler erreicht keine
Fehler, die beim *Zeichnen* auftreten — und die gibt es: Das Brett ruft die
Wertung im Render (`ermittleSpielerLagen`). Dafür liegt eine Error Boundary um
das Brett (`src/components/Fehlerfang.tsx`); ohne sie wurde aus einem
Wertungsfehler eine weiße Seite. Sie umschließt bewusst nur das Brett, nicht die
ganze App: Die Lobby soll erreichbar bleiben, wenn das Brett stirbt.

Fett markiert sind die Angaben, die vor dem Neubau **nirgends** sichtbar waren.
`aussetzenSpielerIndizes` kam im gesamten `.tsx`-Code nicht ein einziges Mal vor.

---

## Zwei Fallen

**Das Reaktionsfenster gehört dem Verteidiger**, nicht dem Zugspieler. Die
`spielerId` in einer Reaktionsaktion ist die des Angegriffenen. Solange ein
`pendingReaktion` offen ist, liefert `ermittleLegaleAktionen` ein **leeres
Array**, und jede andere Aktion wird abgelehnt. Der Dialog ist zugleich der
Wiedereinstiegspunkt aus einem KI-Zug (`src/kiZug.ts:89`).

**Verdeckte Information ist harte Anforderung** (`GAME_SPEC.md`, R7-Abschnitt):
Während eines KI-Zugs dürfen Hand und geheime Aufgabe des Gegners nicht sichtbar
werden.

---

## Wie die Einhaltung geprüft wird

Fünf generische Wächter in `tests/layout/brett_waechter.spec.ts` prüfen nicht
einzelne Elemente, sondern Eigenschaften der ganzen Seite:

| Wächter | Regel |
|---|---|
| kein abgeschnittener Inhalt | 2 |
| kein Bedienelement außerhalb des Bildes | — |
| kein Bedienelement verdeckt | — |
| kein Textinhalt unter eine Zeilenhöhe gedrückt | 2, 7, 10 |
| Elementbudget | 1, 3 |

**Der fünfte kam am 02.08.2026 dazu** und schließt die Lücke zwischen Regel 2 und
Regel 10. „Abgeschnitten" nimmt scrollende Container aus, denn weggescrolltes ist
erreichbar — nur gilt das nicht mehr, wenn der Container unter eine Zeilenhöhe
gedrückt ist. Genau das war dem Gegnerprotokoll passiert: `clientHeight: 0` bei
61 px Inhalt, formal scrollend, praktisch weg. Vier Wächter grün, die Spur des
Gegnerzugs unsichtbar.

Alle vier Inhaltswächter laufen zusätzlich **nach acht gespielten Runden**
(`tests/layout/brett_dauerlauf.spec.ts`). Das Erstbild allein genügt nicht: Vor
dem ersten Gegnerzug gibt es kein Protokoll, und die Fehler, um die es geht,
entstehen mit dem Spielstand. Nur das Elementbudget bleibt dem Erstbild
vorbehalten — Karten häufen sich im Verlauf legitim an.

Dazu bei jedem Slice zwei Prüfungen, die zuvor gefehlt haben:

1. **Ein Blick auf das Bild**, nicht nur auf Zahlen.
2. **Ein Zug mit der Maus** über `page.mouse.click()` auf die
   Bildschirmkoordinate — ohne `scrollIntoView`-Hilfe. Playwrights `click()`
   scrollt Elemente intern in den Blick und verdeckt damit genau den Fehler, um
   den es hier geht.

### Zwei Nachträge aus der Umsetzung

**Die Stapelzahlen stehen in der Statuszeile, nicht in der Seitenspalte.** Der
Entwurf hatte sie in Region 4. Regel 1 verlangt, dass jede Information genau
einmal erscheint — und in der Statuszeile stehen sie neben den anderen
Randinformationen, während die Seitenspalte den Platz für Aktionen und Aufgaben
behält. Bewusste Abweichung vom Entwurf, kein Versehen.

**In der Seitenspalte steht die Aktionsliste zuoberst.** Die Spalte scrollt.
Als die offenen Aufgaben vor die Aktionsliste rutschten, meldete der Wächter
„kein Bedienelement verdeckt" prompt, dass die empfohlene Aktion unerreichbar
geworden war. Regel: Was man anklickt, kommt zuerst; was man nachschlägt,
danach.

**Zum Elementbudget:** Gemessen wird das Erstbild einer frischen Partie. Karten
häufen sich im Spielverlauf legitim an — ein Deckel auf jeden beliebigen Zustand
wäre irgendwann aus dem falschen Grund rot.
