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
Audit-Kette" selbst als offen.

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
präsent") und M1f/M1g/M9/M3i („alles im Erstbild") verlangen bei 900 px Höhe
Unvereinbares.

Derselbe Zielkonflikt trifft die Lobby: Dort liegen die Start-Buttons bei y=1153
(siehe `PLAYABILITY_GATE.md`, Abschnitt „AP-6: M3g-Erstbild-Vertrag ist regrediert").

**Diese Entscheidung kann kein Test treffen.** Vor S-2 muss feststehen, was gilt:

- **(a) Erstbild hat Vorrang** — Hero-Größen aus M2x/M2i werden abgesenkt, ihre
  Smokes ziehen mit. Die Hand wird kleiner als heute gestaltet gedacht.
- **(b) Hero-Größen haben Vorrang** — das Erstbild-Versprechen bei 900 px wird
  aufgegeben, die Seite darf scrollen, M1f/M1g/M9/M1df/M1dg ziehen mit.
- **(c) Layout umbauen** — z. B. Hand als `position: sticky` am Viewport-Boden
  (der im Gate als „M3j Brettrand-Architektur-Pivot" notierte Weg). Beide Verträge
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

`„Zug an nächsten Spieler geben"` existiert dreimal gleichzeitig:
`ZugKompass.tsx:164`, `HandkartenPanel.tsx:216`, `WaldtanzArenazugknopf.tsx:39`.
Playwright bricht deshalb mit `strict mode violation` ab — zu Recht: drei Knöpfe mit
identischem Accessible Name sind für Screenreader-Nutzer nicht unterscheidbar.

Zu klären: Brauchen alle drei denselben Namen? Naheliegend sind ortsbezogene Namen
(„Zug beenden — Handleiste" / „… Zugkompass" / „… Brettrand") oder das Reduzieren
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
verursacht. Das Skript klickt einen „Neue Schlange starten"-Knopf und prüft nach
150 ms `data-letzte-aktion-ziel`; bevorzugt wird ein Knopf innerhalb der
Startzone, sonst `startButtons[0]` — trifft die Vorauswahl den falschen Knopf,
bleibt das Attribut `null`. Gehört nach S-5, ist aber kein Timeout, sondern eine
Race im Skript.

### S-3 — Umbenannte und verschobene Elemente (G3, 8 Skripte) · M

Pro Skript prüfen, ob die Erwartung veraltet ist oder etwas wirklich fehlt.
Vorabbefunde aus der Live-Messung:

| Skript | Erwartet | Live | Einschätzung |
|---|---|---|---|
| `m1ca` | `.schlangen-gruppe--gegnerfelder` | 0 — dafür `.waldtanz-gegnerlichtung` = 1 | veraltet, M1dp hat verschoben |
| `m1dk` | Phasen-Banner sichtbar | vorhanden, aber `checkVisibility()` = false | **prüfen** — evtl. echter Defekt |
| `m1di` | Schlangen-Reihen sichtbar | `count = 0` | **prüfen** |
| `live` | Kernregion „Spielstatus" | Überschrift vorhanden | Selektor veraltet |
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
