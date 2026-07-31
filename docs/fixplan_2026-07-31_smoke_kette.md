# Fixplan — 44 fehlschlagende Production-Smokes

Stand: 31.07.2026, `main` = `0754613`, deployt und live.

## Ausgangslage

`npm run smoke:production` meldet **33 OK / 44 FEHL** von 77 Skripten.

**Die Fehler stammen nicht aus dem heutigen Deploy.** Nachgewiesen per Baseline-Diff
(Pitfall #20):

| Lauf | OK | FEHL |
|---|---|---|
| Production `0754613` | 33 | 44 |
| lokaler Build, gleicher Commit | 33 | 44 — **dieselben 44 Skripte** |
| lokaler Build `04aaa12` (vor AP-0…AP-6) | 33 | 44 — **dieselben 44 Skripte** |

Aus der Arbeit AP-0 bis AP-6: 0 neue Fehlschläge, 0 reparierte. Die Fehler entstanden
in der **Audit-Kette A–C7** (05./06.07.2026), die nie deployt und nie gegen Live
geprüft wurde — `docs/PLAYABILITY_GATE.md` führt „Live-Production-Gates für die
Audit-Kette“ selbst als offen.

## Befund: Es sind nicht 44 Probleme, sondern sechs Ursachen

| Gruppe | Skripte | Art |
|---|---|---|
| **G1** Drei Buttons mit identischem Namen | 4 | echter Defekt (Barrierefreiheit) |
| **G2** `/game` passt nicht ins 1280×900-Erstbild | 17 (+6 aus G7) | **Zielkonflikt im Produkt** |
| **G3** Element umbenannt oder verschoben | 8 | veraltete Erwartung |
| **G4** Timeout — Folgefehler aus G1/G3 | 4 | Folge |
| **G5** Stil-Vertrag verletzt | 4 | zu klären |
| **G6** Fehler im Smoke-Skript selbst | 1 | echter Defekt |

G7 aus der Rohsortierung (`m1bz`, `m1cb`, `m1cg`, `m1cn`, `m1co`, `m1dd`) sind
Hit-Test- und Geometriefehler und gehen in G2 auf; `m1co` und `m1cb` können zusätzlich
mit dem C3-Umbau der Zielspur-Keys zusammenhängen und werden dort mitgeprüft.

## Die tragende Ursache (G2): zwei Verträge, die sich widersprechen

`/game` ist **1061 px hoch** bei 900 px Viewport. Gemessen live:

| Element | Ist | Forderung | Quelle |
|---|---|---|---|
| Unterkante erste Handkarte | 927 px | ≤ 900 px | M1f |
| Unterkante Spielerplakette | 910 px | ≤ 900 px | M1g |
| Container-Bottom | 1043 px | ≤ 960 px | M1df |
| Container-Bottom | 1235 px | ≤ 1000 px | M1dg |

Gleichzeitig fordern andere Smokes das **Gegenteil**:

| Element | Ist | Forderung | Quelle |
|---|---|---|---|
| Höhe `.handkarten-buehne` | 53 px | ≥ 95 px | M2x |
| Höhe Handkarte | 98 px | ≥ 100 px | M2i |

Das ist kein Testproblem. **M3i hat die Caps gesenkt** (`clamp(6rem, 11vh, 7rem)` →
`clamp(5rem, 9vh, 6rem)`), damit die Hand ins Erstbild rutscht — und dabei die
Hero-Größen aus M2x/M2i unterschritten. Die Slices M2x/M2i („Hand groß und
präsent“) und M1f/M1g/M9/M3i („alles im Erstbild“) verlangen bei 900 px Höhe
Unvereinbares.

Derselbe Zielkonflikt trifft die Lobby: Dort liegen die Start-Buttons bei y=1153
(siehe `PLAYABILITY_GATE.md`, Abschnitt „AP-6: M3g-Erstbild-Vertrag ist regrediert“).

**Diese Entscheidung kann kein Test treffen.** Vor S-2 muss feststehen, was gilt:

- **(a) Erstbild hat Vorrang** — Hero-Größen aus M2x/M2i werden abgesenkt, ihre
  Smokes ziehen mit. Die Hand wird kleiner als heute gestaltet gedacht.
- **(b) Hero-Größen haben Vorrang** — das Erstbild-Versprechen bei 900 px wird
  aufgegeben, die Seite darf scrollen, M1f/M1g/M9/M1df/M1dg ziehen mit.
- **(c) Layout umbauen** — z. B. Hand als `position: sticky` am Viewport-Boden
  (der im Gate als „M3j Brettrand-Architektur-Pivot“ notierte Weg). Beide Verträge
  bleiben erfüllbar, kostet aber echte Layout-Arbeit.

Empfehlung: **(c)**, weil (a) und (b) jeweils ein bewusst gebautes Produktziel
opfern. Der Pivot ist im Gate bereits als nächste Lücke vorgemerkt.

## Reihenfolge

Jedes Paket ist ein eigener Slice mit eigenem Commit. Vor jedem Commit die volle
Gate-Liste; nach jedem Paket die Smoke-Kette erneut, damit der Fortschritt in
Zahlen sichtbar bleibt (77er-Lauf, ca. 8 Minuten).

### S-0 — Skriptfehler (G6, 1 Skript) · S

`m3a_brettrand_hand_im_sichtbereich_smoke.mjs` bricht mit `liste is not defined` ab —
ein Bug im Skript, kein Befund über die App. Reparieren, dann läuft es entweder
durch oder liefert einen echten Befund, der in G2 einsortiert wird.

### S-1 — Drei Buttons, ein Name (G1, 4 Skripte) · S–M

`„Zug an nächsten Spieler geben“` existiert dreimal gleichzeitig:
`ZugKompass.tsx:164`, `HandkartenPanel.tsx:216`, `WaldtanzArenazugknopf.tsx:39`.
Playwright bricht deshalb mit `strict mode violation` ab — zu Recht: drei Knöpfe mit
identischem Accessible Name sind für Screenreader-Nutzer nicht unterscheidbar.

Zu klären: Brauchen alle drei denselben Namen? Naheliegend sind ortsbezogene Namen
(„Zug beenden — Handleiste“ / „… Zugkompass“ / „… Brettrand“) oder das Reduzieren
auf einen sichtbaren Knopf pro Zustand.

Das ist ein Verhaltens-Slice: RED-Test in Vitest zuerst (eindeutige Namen), dann
Umsetzung, dann Smokes.

### S-2 — Erstbild-Zielkonflikt (G2, ~23 Skripte) · L

**Blockiert durch die Entscheidung oben.** Danach:

1. Ziel-Geometrie als Layout-Vertrag in `tests/layout/` festschreiben — messbar,
   bevor am CSS gedreht wird.
2. Layout anpassen (bei (c): Hand aus dem Flow lösen, Cap-Summe neu rechnen).
3. Die betroffenen Smoke-Schwellen **einmalig** auf die beschlossene Ziel-Geometrie
   ziehen — nicht einzeln nachjustieren, sonst entsteht dieselbe Widersprüchlichkeit
   erneut.
4. Den `test.fail()`-Marker im Lobby-Vertrag entfernen, sobald die Start-Buttons im
   Erstbild liegen.

Größter Brocken, aber ein Eingriff für über die Hälfte der Fehlschläge.

**Stand nach S-2 (31.07.2026):** 36 OK / 41 FEHL. Repariert: `m1bz`, `m1ci`, `m1g`,
`m3a`. Keine Regression.

Der Zielkonflikt ist damit **nicht** entschieden, sondern umgangen: S-2 hat den
vorhandenen Zeilenplatz umverteilt (die Arena-Zeile hatte 72 px ungenutzt), statt
Hero-Größen oder Erstbild zu opfern. Die Handkarte liegt jetzt bei 895 px statt
927 px. Die Optionen (a)/(b)/(c) bleiben offen für die Smokes, die harte
Container-Schwellen fordern (`m1df` ≤ 960 px, `m1dg` ≤ 1000 px) — dort reicht
Umverteilung nicht.

**Nebenbefund: `m1dc_spielmoment_pulse` ist flaky**, nicht kaputt. Gemessen 2/5
grün — und zwar auch auf dem Build *ohne* die S-2-Änderung, also nicht durch sie
verursacht. Das Skript klickt einen „Neue Schlange starten“-Knopf und prüft nach
150 ms `data-letzte-aktion-ziel`; bevorzugt wird ein Knopf innerhalb der
Startzone, sonst `startButtons[0]` — trifft die Vorauswahl den falschen Knopf,
bleibt das Attribut `null`. Gehört nach S-5, ist aber kein Timeout, sondern eine
Race im Skript.

### S-2b — Brettrand-Pivot: verworfener Versuch, gemessene Zielgeometrie

Umgesetzt und wieder zurückgenommen. Der Befund ist in
`tests/layout/hand_am_brettrand.spec.ts` festgehalten, ein Punkt davon als
`test.fail()`.

**Korrektur einer früheren Annahme.** Das Brett wächst *nicht* mit dem ersten
Zug. Die Handkarten liegen bei 1280×900 vor und nach dem Zug bei 895 px, also
im Bild. Was übersteht, ist die Panel-Box mit 961 px — 66 px Bühne und
Innenabstand unterhalb der Karten. Daran scheitern M9, M1f und M95, die die
Panel-Box messen. Die Zahl „969 px nach dem ersten Zug“ stammte aus der
m95-Messung der Panel-Box bei 1440 px Breite und beschrieb nicht, was sie zu
beschreiben schien.

Der Zielkonflikt bleibt real, ist aber enger: Die Hero-Größen (Bühne +42 px,
Karte +2 px) passen nicht über den Falz, solange die Hand im Dokumentfluss hängt.

**Warum die Hand allein zu fixieren nicht reicht.** Gemessen:

| Posten | px |
|---|---|
| Brettzeilen (Summe) | 772 |
| Brett mit Abständen | 879 |
| verfügbar über einer 252-px-Hand | 648 |
| **Fehlbetrag** | **231** |

Zugleiste (97 px) und Bodenzeile (145 px: Spielerplakette + Arenazug) lägen
hinter der fixierten Hand. Die Arena müsste stattdessen von 378 px auf 214 px
halbiert werden — das widerspricht M2r (Schlangenlichtung ≥ 55 % Viewport).

**Der tragfähige Weg** ist die *ganze* Bodenzeile. Das Grid trägt sie bereits
als eine Reihe: `"sp-plakette hand arenazug"`. Fixiert man sie gemeinsam statt
nur die Hand, bleiben 71 + 81 + Arena + 97 für das Brett, und die Arena darf
wachsen statt zu schrumpfen. Das braucht einen Wrapper um diese drei Elemente
in `App.tsx` — ein Struktur-Slice, kein CSS-Detail, und deshalb nicht nebenbei
erledigt.

### S-2c — Brettrand-Pivot umgesetzt: die ganze Bodenzeile

**49 OK / 28 FEHL** (von 45). Repariert: `m9`, `m95`, `m1d0`, `m1da`, `m2i`.

Spielerplakette, Hand und Gegnerzug-Knopf bilden jetzt ein gemeinsames Element
(`.waldtanz-brettrandleiste`) und liegen ab 1000 px Breite verankert am
Viewport-Boden. Im Grid waren sie schon immer eine Reihe
(`"sp-plakette hand arenazug"`), im DOM aber getrennt — die Plakette vor der
Zugleiste, die anderen beiden danach.

Damit ist der Zielkonflikt entschieden statt umgangen:

| | vorher | nachher |
|---|---|---|
| Handbühne | 53 px | 124 px (M2x fordert ≥ 95) |
| Handkarte | 98 px | 119 px (M2i fordert ≥ 100) |
| Seitenhöhe | 1028 px | 900 px, kein Scrollen |
| Brett | 32–950, teils hinter der Hand | 32–639, komplett über der Leiste |

Die Arenazeile trägt statt eines von Hand gerechneten `clamp()` jetzt
`minmax(0, 1fr)` — die Kommentarhistorie an dieser einen Zeile zählte sieben
Nachjustierungen, jede als Reaktion darauf, dass ein Nachbarslice die
Zeilensumme verschoben hatte.

**Zwei Widersprüche mussten dabei entschieden werden.** M3b forderte eine flache
Bühne (< 65 px), M2x eine Hero-Bühne (≥ 95 px); beide Verträge standen
gleichzeitig im Repo. Die Schwelle in `m3b` wurde einmalig auf die beschlossene
Ziel-Geometrie gezogen. Und der Reihenfolge-Vertrag in `m1d0` stellte die
Spielerplakette vor die Zugleiste, obwohl sie visuell darunter liegt — genau der
A11y-Regress, den der Test verhindern soll. Mit der Bodenleiste stimmen DOM- und
Leserichtung wieder überein.

**Begrenzt auf ≥ 1000 px Breite.** Darunter ist der Brettinhalt größer als der
Platz (bei 900 px misst die Schlangenlichtung allein über 1000 px); ein an den
Viewport gebundenes Brett verschluckt den Überschuss per `overflow: clip`, und
der Startkreis lag bei y=1233 unerreichbar. Schmalere Viewports behalten deshalb
das bisherige Verhalten. Ein tragfähiges Erstbild bei 900 px Breite braucht einen
eigenen Slice — der Engpass sitzt tiefer, das Spielfeld bekommt dort nur 109 von
263 px des Arenasteins.

**Neuer Befund, älter als dieser Slice:** Die Handkarten 3 und 4 (von 0 gezählt)
sind auf mittlerer Höhe an keinem Punkt frei — sie liegen vollständig unter der
Mittelkarte. Gemessen auf dem Build *vor* dem Pivot ebenso wie danach. Ursache
ist das Zusammenspiel der z-Reihenfolge im Fächer (1/11/21/11/1, Mitte oben) mit
Karten-Buttons, die breiter sind als ihre Listenelemente (122 px gegen 110 px).
Als `test.fail()` in `tests/layout/hand_am_brettrand.spec.ts` markiert.

### S-3 — Umbenannte und verschobene Elemente (G3, 8 Skripte) · M

Pro Skript prüfen, ob die Erwartung veraltet ist oder etwas wirklich fehlt.
Vorabbefunde aus der Live-Messung:

| Skript | Erwartet | Live | Einschätzung |
|---|---|---|---|
| `m1ca` | `.schlangen-gruppe--gegnerfelder` | 0 — dafür `.waldtanz-gegnerlichtung` = 1 | veraltet, M1dp hat verschoben |
| `m1dk` | Phasen-Banner sichtbar | vorhanden, aber `checkVisibility()` = false | **prüfen** — evtl. echter Defekt |
| `m1di` | Schlangen-Reihen sichtbar | `count = 0` | **prüfen** |
| `live` | Kernregion „Spielstatus“ | Überschrift vorhanden | Selektor veraltet |
| `m1bw`, `m1cd`, `m1do`, `m1ce` | diverse | — | einzeln prüfen |

Veraltete Erwartungen werden nachgezogen; echte Defekte bekommen einen eigenen
RED-Test in Vitest, bevor sie repariert werden.

### S-4 — Stil-Verträge (G5, 4 Skripte) · M

- `m2w`: `zugpfad` hat `box-shadow: "none"` — Schatten verloren oder bewusst entfernt?
- `m2h`: `::before` ohne Stitch-Dot-Farbe
- `m1db`: ausgewählte Karte ohne lime-grünen Glow
- `m2i`: Kartenhöhe (hängt an S-2)

Für jeden: War die Änderung beabsichtigt (dann Smoke nachziehen) oder ist der Stil
unbemerkt verlorengegangen (dann reparieren)? Die drei ersten sind gute Kandidaten
für die Migration nach `tests/layout/`, weil sie berechnete Stile prüfen — dort
fällt ein verlorener Wert sofort auf, im CSS-Quelltext nicht.

### S-5 — Timeouts (G4, 4 Skripte) · S

`m1cs`, `m1cw`, `m1dl`, `m95` warten auf Elemente, die durch G1/G3 nicht mehr
erscheinen. Erst nach S-1 und S-3 erneut laufen lassen; was dann noch hängt, wird
einzeln untersucht.

## Verifikation

Nach jedem Paket:

```bash
npm test -- --run          # 413 Dateien / 1549 Tests
npm run test:layout        # Playwright-Verträge
npm run typecheck && npm run lint && npm run build
npm run check:test-lines && npm run check:css-asserts
npm run smoke:production   # Fortschritt: 33/77 → Ziel 77/77
```

Der Runner aus AP-4 meldet alle Fehlschläge gesammelt — der Fortschritt ist damit
nach jedem Paket in einer Zahl ablesbar, ohne 44 Einzelläufe.

Abschluss: Evidence-Eintrag in `docs/PLAYABILITY_GATE.md` mit dem 77/77-Lauf und
dem Deploy-Stand.

## Was dieser Plan ausdrücklich nicht vorschlägt

**Schwellen aufweichen, bis es grün ist.** Genau so ist der aktuelle Zustand
entstanden: M3i senkte Caps, um ein Erstbild-Ziel zu halten, und unterschritt dabei
die Hero-Größen — beide Verträge blieben im Repo stehen, keiner wurde entschieden.
Ein zweites Mal Schwellen zu verschieben, ohne den Zielkonflikt zu klären, verschöbe
das Problem nur erneut.
