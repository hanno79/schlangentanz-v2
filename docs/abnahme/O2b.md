# Prüfprotokoll O2b – Lobby für flache Fenster, Iteration 2

| Feld | Wert |
|---|---|
| Task | O2b Lobby für flache Fenster (Folgeaufgabe des Orchestrators, kein Block im Plan) |
| Branch | `task/O2b-lobby-flach`, PR #35 gegen `neuaufbau` |
| Geprüfter Stand | `488c2a3` (Basis `e96caac`, `origin/neuaufbau` steht auf `e96caac`) |
| Prüfer | Claude Code (Subagent) als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 2; Vorgänger: Protokoll der Iteration 1 in Commit `496331c` (Urteil abgelehnt, ein Mangel: Wächter blind für Labels versteckter Felder) |
| Datum | 13.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: Zeilenenden vorher 414 Dateien `w/crlf`, nach Löschen und `git checkout -- .` 0. `core.hooksPath` = `scripts/githooks`. `npm ci` Exit 0. Logs, Skripte und Rohbilder liegen im Scratchpad unter `O2b-it2-pruefer/` (im Folgenden `<scratchpad>`). Das Protokoll der Iteration 1 habe ich erst nach allen Prüfungen gelesen.

## Urteil: ABGENOMMEN

Alle fünf Kriterien sind erfüllt, und der Mangel aus Iteration 1 ist behoben: `messeErreichbarkeit` misst ein Feld mit Label jetzt am Label. Die alte Gegenprobe (Schalter 400 px tiefer) und zwei neue (Segmente unter dem Rand, Schalter-Label zugedeckt) werden in `handy-quer` je mit 5 roten Verträgen erkannt; mit dem alten Wächter blieb die Zudeck-Probe grün. Kein Klassenname der App kollidiert mehr mit `src/entwicklung/**/*.css`, „Regeln“ steht vorn in der Tab-Reihe, `/spiel` und `/regeln` sind unverändert bedienbar. Alle Gates enden mit 0; `test:layout` lief dreimal, davon zweimal grün und einmal mit einem Lade-Timeout in einem Entwurfs-Vertrag unter Last (siehe Gates). Beide `test:`-Commits enthalten nur Tests und sind auf ihrem Stand rot.

Hinweis 1 beschreibt eine neue, heute folgenlose Lücke im geänderten Wächter (sichtbares Feld mit nur vorgelesenem Label). Sie ist kein Mangel, weil die App kein solches Feld hat und der Tippflächen-Vertrag dieselbe Lage rot meldet; ich empfehle trotzdem die Einzeilen-Korrektur.

## Abnahmekriterien

Der Task hat keinen Block im Plan; die Kriterien stammen aus dem Auftrag des Orchestrators.

| # | Kriterium (wörtlich aus dem Auftrag) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | Handy quer (844×390, Touch): in allen Lobby-Zuständen (leer, mit Partie, Rückfrage offen, nach unlesbarem Stand) liegt jedes Bedienelement ohne Scrollen im Bild. | ja | eigene Messung inkl. Labels: `scrollHeight` 390, nichts ausserhalb, in allen vier Zuständen; Wächter erkennt jetzt Schalter und Segmente (Gegenproben a bis c); Bilder `O2b-it2-*-handy-quer.png` |
| 2 | Drehen von hochkant auf quer bei offener Rückfrage: Rückfrage ganz im Bild. | ja | 390×844 → 844×390: Rückfrage 230..356, Fokus bleibt auf „Abbrechen“; Vertrag `O2b TF-APP-016` grün in fünf Klassen, auf `dd5f15c` rot; TF-APP-016 bestanden |
| 3 | Die drei Lobby-Einträge sind aus `tests/layout/geraeteklassen_ausnahmen.json` entfernt; Lobby-Verträge in allen fünf Klassen grün ohne Ausnahme. | ja | Liste enthält nur drei `entwurf.hooks.spec.ts`-Einträge; `lobby.spec.ts` in allen zehn Projekten grün; `x` im Lauf nur bei Entwurfs-Verträgen |
| 4 | In allen fünf Klassen: keine Verschlechterung, Tippflächen ≥ 44 px, kein waagrechtes Scrollen, Fokus sichtbar, Tastatur bedienbar; alle O2-Kriterien gelten weiter. | ja | 40 Zustände gemessen (`<scratchpad>/zustaende.log`), Tastatur in fünf Klassen (`tastatur.log`), O2 K3/K4 in fünf Klassen (`o2.log`), Maus im eingebauten Browser |
| 5 | Alle Gates grün. | ja | Abschnitt Gates |

### 1. Handy quer ohne Scrollen

Skript `<scratchpad>/zustaende.mjs` gegen den Produktionsbuild auf Port 4383, Kontext aus `scripts/pruefung/geraeteklassen.mjs` (Touch, `isMobile`), Bedienung mit `tap()`. Gemessen werden `button`, `a[href]` und jedes `input` über sein Label, also das, was ein Finger trifft. Ausgabe `<scratchpad>/zustaende.log`:

| Zustand | Fenster | `scrollWidth` | `scrollHeight` | ausserhalb | kleinste Tippfläche |
|---|---|---|---|---|---|
| leer | 844×390 | 844 | 390 | – | 44 px |
| mit Partie | 844×390 | 844 | 390 | – | 44 px |
| Rückfrage offen (230..356) | 844×390 | 844 | 390 | – | 44 px |
| nach unlesbarem Stand | 844×390 | 844 | 390 | – | 44 px |

Dass der Vertrag das jetzt auch selbst sieht, belegen die Gegenproben a bis c (Abschnitt Gegenprobe).

### 2. Drehen bei offener Rückfrage

`handy-hochkant` mit offener Rückfrage (545..723 bei 844 px), dann `setViewportSize({ width: 844, height: 390 })`: Rückfrage 230..356, ganz im Bild, `scrollY` 0, Fokus auf „Abbrechen“. Gegenrichtung `handy-quer` → 390×844: 545..723. Dreimal hin und her (`<scratchpad>/grenz.log`, G2): jedes Mal ganz im Bild, Fokus bleibt auf „Abbrechen“, danach „Abbrechen“ getippt, „Weiterspielen“ bleibt. Der Vertrag `O2b TF-APP-016: Lobby mit offener Rückfrage nach dem Drehen` läuft in allen fünf Klassen (jede tauscht Breite und Höhe) und war auf `dd5f15c` in `handy-hochkant` rot.

### 3. Ausnahmeliste

`tests/layout/geraeteklassen_ausnahmen.json` hat nur noch drei Einträge, alle `tests/layout/entwurf.hooks.spec.ts` (O1-Entwürfe). In beiden grünen Gate-Läufen enden genau diese drei Verträge mit `x` (erwartet rot); kein Lobby-Vertrag ist mit `test.fail` markiert. `tests/geraeteklassen_ausnahmen.test.ts` (Liste darf nur schrumpfen) ist in `npm test` grün.

### 4. Keine Verschlechterung, O2-Kriterien, Tastatur

**Messung in allen fünf Klassen** (`zustaende.log`, je acht Zustände: leer, Partie, Rückfrage, unlesbar, gedreht, `/spiel` mit und ohne Partie, `/regeln`): in allen 40 Läufen `scrollWidth` = Fensterbreite, `scrollHeight` = Fensterhöhe, nichts ausserhalb, kleinste Tippfläche 44 px. Konsolenfehler 0, ausser genau 1 im Zustand „unlesbar“ (gewollt: `console.error` zum beschädigten Spielstand, seit O2).

**Tastatur** (`tastatur.mjs`, `tastatur.log`), in allen fünf Klassen gleich:

- leer: Tab-Reihe „Regeln“ › „1 Gegner“ › „Mit Erweiterung“ › „Neue Partie“, jedes Element mit doppeltem Ring (`box-shadow` weiss 3 px, Tinte `rgb(43,33,28)`); beim Segment liegt der Ring um das Segment, beim Schalter um die ganze Zeile;
- Pfeil rechts wählt „2 Gegner“, Leertaste schaltet die Erweiterung, das Wort wechselt auf „An“, Enter auf „Neue Partie“ öffnet `/spiel` mit „Gegner 2“, „Erweiterung an“;
- mit Partie: „Regeln“ › „Weiterspielen“ › „1 Gegner“ › „Mit Erweiterung“ › „Neue Partie“;
- Enter auf „Neue Partie“ öffnet die Rückfrage, Fokus auf „Abbrechen“ (Ring), Shift+Tab auf „Ja, neue Partie“, Escape schliesst sie, Fokus zurück auf „Neue Partie“, „Laufende Partie“ unverändert.

**Maus im eingebauten Browser** (Produktionsbuild, Fenster des Panels 714×726): Segment „3“ und Schalter angeklickt, „Neue Partie“: `/spiel` mit „Gegner 3“, „Erweiterung an“. Browser-Zurück: „Laufende Partie: 3 Gegner, Erweiterung an“. Sechsmal Tab: „Regeln“, „Weiterspielen“, „1 Gegner“, „Mit Erweiterung Aus“, „Neue Partie“, wieder „Regeln“; Fokusring um „Regeln“ sichtbar. Enter öffnet die Rückfrage, Escape schliesst sie. Konsole: nur Warnungen „Error with Permissions-Policy header: Unrecognized feature“ des Panels, keine Fehler der App. Die Klick-Werkzeuge mit `ref` treffen bei 1×1-Feldern die Ecke des Labels daneben; deshalb habe ich dort mit Koordinaten aus dem Bildschirmfoto geklickt (kein Befund der App).

**O2 K3 und K4** (`o2.mjs`, `o2.log`), fünf Klassen: Zurück von `/spiel` → `/` mit „Weiterspielen“, Vor → `/spiel`, Neuladen → `/spiel` mit „Gegner 1“, „Zurück zur Lobby“ → `/`. `Math.random` wirft beim Start: „Hier ist ein Fehler aufgetreten · Pruefer: Zufall gesperrt · Eine laufende Partie lässt sich nicht fortsetzen …“ mit „Zurück zur Lobby“, kein Überstand (2 Konsolenfehler aus dem Fehlerfang, gewollt). `/gibt-es-nicht` zeigt die Seite mit Fuss. O2 K5 (keine Partie im Hintergrund) belegt `Lobby.hintergrund.test.tsx` in `npm test`. K1 und K2 siehe Tastatur und Maus.

**Neu in Iteration 2:**

- *Keine Klasse kollidiert mehr.* `<scratchpad>/klassen.py` sammelt alle Klassen aus den Selektoren aller CSS-Dateien unter `src/` und vergleicht App (`index.css`, `karte.css`, `lobby-seite.css`, `lobby.css`, `tokens.css`) mit `src/entwicklung/**/*.css`: **0 gemeinsame Klassen**. Die Entwicklungs-CSS haben nur Klassenselektoren (kein `:root`, `body` o. ä.). Im Testhook-Build (`testhook.mjs`): `/dev/entwurf/lobby` öffnen, dann ohne Neuladen nach `/` (`history.pushState` und `popstate`, Marke am `window` bleibt erhalten), beide Stylesheets (`index-*.css`, `Entwicklertisch-*.css`) geladen. Farbe, Hintergrund, Rand, Radius, Schrift, Polster, Schatten und Lage aller 28 (leer) bzw. 32 (mit Partie) Elemente der Lobby gleichen einer frisch geladenen Lobby in allen fünf Klassen: **0 Abweichungen**. Im eingebauten Browser derselbe Weg: Segment-Fläche `rgb(194,65,12)`, Knopfradius 12 px, Bild unauffällig.
- *Antipp-Leuchten:* `-webkit-tap-highlight-color` an Segmenten und Schalter berechnet `rgba(0,0,0,0)`, `cursor: pointer` (G4).
- *„Regeln“ im Kopf:* in allen Klassen unter dem Untertitel, im Querformat links. Die Verträge „O2b: die Tab-Reihe folgt der sichtbaren Anordnung“ (leer und mit Partie) sind grün und waren auf `5f8289e` rot.
- *`Rahmen` mit `kopfZusatz`, `fuss` optional:* `/spiel`, `/regeln` und `/gibt-es-nicht` übergeben weiter `fuss` und haben kein `kopfZusatz`; sie zeigen ihren Fuss wie vorher (`nav.rahmen__fuss` vorhanden, Bilder unten). Nur die Lobby lässt `fuss` weg.

### 5. Gates

Siehe Abschnitt Gates.

## Gates

Jeder Befehl einzeln, Exit-Code einzeln gelesen (Git Bash `${PIPESTATUS[0]}` hinter `tee`), Logs unter `<scratchpad>/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 43 passed, Tests 1028 passed |
| `npm run typecheck` | 0 | `tsc -b` ohne Ausgabe |
| `npm run build` | 0 | CSS 8,79 kB, JS 223,29 kB |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | 160 Dateien, keine Verstösse, Merge-Basis e96caac |
| `npx eslint .` | 0 | keine Ausgabe |
| `python scripts/regelcheck.py` | 0 | 3 Warnungen, keine Fehler (Arbeitsschritt ohne Testlauf zu O2, TF-SPEC-005, Länge `messung.ts` 929 Zeilen) |
| `npm run test:layout` (1) | 0 | 1195 passed (2,4 min); `x` nur bei den drei Entwurfs-Ausnahmen |
| `npm run test:layout` (2) | 1 | 1 failed, 1194 passed (4,3 min): `[handy-quer-testhooks] O1: Entwurf /dev/entwurf/tisch … jedes Bild ist geladen`, „/dev/entwurf/tisch hat entwurf-tisch nicht aufgebaut“ (5 s Timeout beim Öffnen) |
| `npm run test:layout` (3) | 0 | 1195 passed (2,7 min); `x` nur bei den drei Entwurfs-Ausnahmen |

Ports vor jedem Lauf: `netstat -ano | grep -E ':417[34] ' | grep -E 'LISTENING|ABH'` ohne Ausgabe, frei; nach Lauf 1 und 2 wieder frei. Nach Lauf 3 lauschten auf 4173/4174 PIDs 23844 und 66408 mit `…\worktrees\agent-a2068a3eca8784da8\…\vite.js preview`, also Server eines anderen Agenten, die nach meinem Lauf starteten; nicht beendet.

Zu Lauf 2: Der rote Vertrag gehört zu den O1-Entwürfen, die O2b nicht ändert; er scheiterte schon beim Öffnen der Seite (der Entwurfs-Chunk wurde in 5 s nicht aufgebaut), bevor ein Wächter lief. Die Maschine war dabei ausgelastet (CPU 80 %, 26 Node- und 26 Chromium-Prozesse anderer Agenten; Laufzeit 4,3 statt 2,4 min). Lauf 1 und Lauf 3 sind auf demselben Stand grün. Ich werte das als Wackler unter Last, nicht als Befund zu O2b; siehe Hinweis 5.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
dd5f15c test: Lobby in flachen Fenstern und Rückfrage nach dem Drehen (O2b, rot)
7d134cd feat: Lobby passt in flache Fenster, Rückfrage geht beim Drehen mit (O2b)
496331c docs: Prüfprotokoll O2b
5f8289e test: Wächter messen Labels versteckter Felder, Tab-Reihe der Lobby (O2b Iteration 2, rot)
488c2a3 fix: Wächter messen Labels, Lobby-Klassen eindeutig, Regeln unter dem Titel (O2b Iteration 2)
```

**Iteration 1, `dd5f15c`:** nur `src/ui/lobby/Lobby.drehen.test.tsx`, `tests/layout/geraeteklassen_ausnahmen.json`, `tests/layout/lobby.spec.ts`. Ausgecheckt (`git switch --detach dd5f15c`):

- `npx vitest run src/ui/lobby/Lobby.drehen.test.tsx` → Exit 1, „Tests 1 failed | 1 passed“, `expected "vi.fn()" to be called 1 times, but got 0 times` (`<scratchpad>/rot-it1-vitest.txt`);
- `npx playwright test tests/layout/lobby.spec.ts` → Exit 1, „5 failed, 480 passed“: „Neue Partie“ 412..460 und „Regeln“ 480..528 (mit Partie), 410..458 / 478..526 (unlesbar), „Regeln“ 389..437 (Rückfrage), nach dem Drehen `Received: "412..531 bei 390 px Höhe"` und „Ja, neue Partie“/„Abbrechen“ 465..513 (`rot-it1-layout.txt`).

**Iteration 2, `5f8289e`:** nur `tests/layout/lobby.spec.ts` und `tests/layout/waechter_labels.spec.ts` (neu). Ausgecheckt: `npx playwright test tests/layout/lobby.spec.ts tests/layout/waechter_labels.spec.ts` → Exit 1, „20 failed, 490 passed“ (`rot-it2-layout.txt`). Rot sind in jeder der fünf Klassen genau vier Tests: „ein Label unter dem Bildrand gilt als ausserhalb des Bildes“ und „ein zugedecktes Label gilt als vollständig verdeckt“ (`Received + 1`, Befunde leer), beide Tab-Reihen (`Received: "1 Gegner"` bzw. `"Weiterspielen"` statt „Regeln“). Der Gegentest „ein freies Label im Bild meldet keiner der beiden Wächter“ ist grün, wie er sein soll.

Rot jeweils, weil das Verhalten fehlt. Spätere Änderungen an den Tests: `git diff 5f8289e HEAD -- tests/layout/waechter_labels.spec.ts` ändert nur „außerhalb“ zu „ausserhalb“ in Kommentar und Testname; `lobby.spec.ts` ist seit `5f8289e` unverändert. Seit `dd5f15c` wurde die eigene `expect.poll`-Messung durch `toBeInViewport({ ratio: 1 })` ersetzt (gleich streng, prüft zusätzlich links und rechts). Nichts wurde schwächer.

## Diff gegen das Feld „Dateien“

Der Task hat kein Feld „Dateien“; massgeblich sind O2 (`src/App.tsx`, `src/ui/lobby/**`) und der Auftrag (Ausnahmeliste, Lobby-Verträge, Wächter). Code und Tests (`git diff --stat origin/neuaufbau...HEAD -- src tests`):

```
 src/App.tsx                                |   2 +-
 src/ui/lobby/Lobby.drehen.test.tsx         |  55 ++++++++
 src/ui/lobby/Lobby.tsx                     | 136 +++++++++++--------
 src/ui/lobby/Rahmen.tsx                    |  16 ++-
 src/ui/lobby/Verweis.tsx                   |   2 +-
 src/ui/lobby/VerworfenHinweis.tsx          |   2 +-
 src/ui/lobby/lobby-seite.css               | 205 +++++++++++++++++++++++++++++
 src/ui/lobby/lobby.css                     | 192 +++++++--------------------
 src/ui/lobby/texte.ts                      |   2 +
 src/ui/regeln/Regeln.tsx                   |   2 +-
 tests/layout/geraeteklassen_ausnahmen.json |  20 +--
 tests/layout/lobby.spec.ts                 |  47 ++++++-
 tests/layout/messung.ts                    |  20 ++-
 tests/layout/oeffnen.ts                    |  16 ++-
 tests/layout/waechter_labels.spec.ts       |  49 +++++++
 15 files changed, 530 insertions(+), 236 deletions(-)
```

Dazu Protokoll, Bilder und Testregister der Iteration 1 (106 Dateien unter `docs/abnahme/` und `tagebuch/`).

| Datei | im Auftrag | Urteil |
|---|---|---|
| `src/ui/lobby/**` | ja (O2-Feld) | `Lobby.tsx` 166 Zeilen, `lobby-seite.css` 205, `lobby.css` 191 (U7). Nur Tokens, keine Farbwerte |
| `src/App.tsx`, `src/ui/regeln/Regeln.tsx` | `App.tsx` ja (O2), `Regeln.tsx` nein | je eine Zeile: Klassenname `verweis` → `rahmen-verweis`. Begründung im PR (Hinweis 3 der Iteration 1, gleichnamige Klassen). Trägt; ohne diese Zeile hätten die Seiten nach der Umbenennung in `lobby.css` keinen Stil |
| `tests/layout/messung.ts` | ja (Mangel 1) | 13 Zeilen in `messeErreichbarkeit`; Hinweis 1 |
| `tests/layout/waechter_labels.spec.ts` | ja (Mangel 1) | eigene kleine Seite, prüft nur die Wächter. Lag in keinem Testregister-Bereich; ergänzt (Abschnitt Testregister) |
| `tests/layout/lobby.spec.ts`, `geraeteklassen_ausnahmen.json`, `oeffnen.ts`, `Lobby.drehen.test.tsx` | ja | wie in Iteration 1 |

U10: `package.json` unverändert. U13: keine geschützte Datei. U9: neue Dateien ohne Dateikopf und ohne `// ÄNDERUNG`; `messung.ts` und `oeffnen.ts` behalten ihre alten Köpfe (erlaubt). U11: kein Fremdcode. U3: Die Lobby ruft die Engine weiter nur über `partie.ts`.

## Gegenprobe

Alle in `handy-quer` mit `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer`, je eine Zeile ans Ende von `src/ui/lobby/lobby-seite.css`, danach `git checkout -- src/ui/lobby/lobby-seite.css` und `git status` leer.

| | Änderung | Ergebnis |
|---|---|---|
| a | `.lobby__schalter { position: relative; top: 400px; }` (Wiederholung aus Iteration 1) | **Exit 1, 5 failed, 94 passed**: „kein Bedienelement liegt außerhalb des Bildes“ in leer, mit Partie, unlesbar, Rückfrage und gedreht, je `lobby__schalter "Mit ErweiterungAus" — liegt bei 577..621 (Bild ist 390px hoch)` bzw. 619..663, 653..697, 578..622, 889..933 bei 844 (`gegenprobe-a.txt`). In Iteration 1: 97 passed |
| b | `.lobby__segment { position: relative; top: 400px; }` (Segmente unter dem Rand) | **Exit 1, 5 failed, 94 passed**: je „1 Gegner“, „2 Gegner“, „3 Gegner“ bei 521..565 (leer) bis 829..873 bei 844 (`gegenprobe-b.txt`) |
| c | `.lobby__schalter { position: relative; z-index: -1; }` (Label hinter die weisse Fläche, nicht mehr antippbar) | **Exit 1, 5 failed, 94 passed**: „kein Bedienelement ist vollständig verdeckt“, `lobby__schalter "Mit ErweiterungAus" — an keiner Stelle frei` (`gegenprobe-c.txt`). Dieselbe Zeile mit `messung.ts` von `origin/neuaufbau`: **99 passed, Exit 0** (`gegenprobe-c-altermessung.txt`); der alte Wächter war also auch für „verdeckt“ blind |

**Wird durch die Änderung anderswo etwas unerwartet rot oder grün?** Der volle `test:layout`-Lauf ist grün; die drei Entwurfs-Ausnahmen bleiben erwartet rot (sie wären bei einer Änderung „unerwartet grün“ gemeldet worden). In der App gibt es nur drei Arten von `input`: die Radios und das Kästchen der Lobby (1×1, Label gross) und die Felder des Entwicklertischs (`<label>Saat <input></label>`, Label umschliesst das Feld und ist grösser). Für beide ist das Label die richtige Fläche. Einen Fall, der durch die Änderung unbemerkt grün wird, habe ich konstruiert: ein **sichtbares** Feld mit einem nur vorgelesenen Label (1×1). Der neue Wächter misst dann das 1×1-Label, fällt unter die 2-px-Grenze und übergeht das Feld; unter dem Rand und zugedeckt bleiben beide Wächter leer (`grenzfall-sichtbares-feld-neu.txt`, 2 failed), der alte meldete beides (`grenzfall-sichtbares-feld-alt.txt`, 2 passed). Heute ohne Folge, Hinweis 1, TF-PRUEF-027. Die temporäre Spec-Datei ist gelöscht.

## Browserprüfung

Produktionsbuild `npm run build`, `npx vite preview --port 4383 --strictPort`; Testhook-Build `npm run build:testhooks`, `npx vite preview --outDir dist-testhooks --port 4384 --strictPort`. Fünf Klassen mit Playwright über `kontextOptionen` (Touch-Klassen `pointer: coarse` ja, Bedienung mit `tap()`), Desktop zusätzlich im eingebauten Browser mit der Maus. `bildschirmfotos.mjs` für `/`, `/spiel`, `/regeln` (Port 4383) und `/dev/entwurf/lobby` (4384, mit `--warte-auf '[data-testid="entwurf-lobby"]'`; ohne das zeigte das erste Bild noch „Lädt …“): je Exit 0, fünf Bilder in der richtigen Grösse, Touch wie erwartet, 0 Konsolenfehler.

Waagrechtes Scrollen je Klasse (alle Zustände, `document.documentElement`): desktop 1280/1280, tablet-quer 1024/1024, tablet-hochkant 768/768, handy-hochkant 390/390, handy-quer 844/844; gedreht jeweils gleich der neuen Breite. Kein abgeschnittener Text in den fünf Klassen.

### Desktop 1280×900 – `bilder/O2b-it2-lobby-desktop.png`, `O2b-it2-rueckfrage-desktop.png`, `O2b-it2-gedreht-desktop.png`, `O2b-it2-spiel-ohne-desktop.png`, `O2b-it2-entwurf-desktop.png`

Zwei Spalten, senkrecht mittig. Links Logo (Schlange in der Kiste, etwa 160 px hoch), „Schlangentanz“ in Lilita One und Kürbis, „Du gegen bis zu drei KI-Gegner“, darunter unterstrichen „Regeln“. Rechts eine weisse Fläche: „Gegner“ mit den Segmenten 1 (gewählt, Kürbis), 2, 3 auf Tischfarbe; „Mit Erweiterung“ mit Schalter „Aus“; „Neue Partie“ als Hauptknopf über die ganze Breite. Mit Rückfrage: oben „Laufende Partie: 1 Gegner, Erweiterung aus“ mit „Weiterspielen“ rechts daneben, unten der gelbe Kasten „Es läuft schon eine Partie. Eine neue Partie überschreibt sie.“ mit rotem „Ja, neue Partie“ und weissem „Abbrechen“ nebeneinander, alles zwischen 274 und 626 px. Gedreht auf 900×1280 bleibt die Anordnung zweispaltig (ab 900 px Breite), Rückfrage 685..811. `/spiel` ohne Partie: Titel „Spieltisch im Aufbau“, ein Satz, Fuss „Zurück zur Lobby“. Im Vergleich mit dem Entwurf: gleiche Spalten, Logo, Titel, Flächen, Segmente und Schalter; der Entwurf hat zusätzlich Abschnittstitel („Deine Partie“, „Neue Partie“), einen Erklärsatz zur Erweiterung und „Spielregeln auf schlangentanz.ch“ statt „Regeln“. Auf dem ersten Foto der Rückfrage fehlte das Logo einmal; in 15 gezielten Wiederholungen (`logo.log`) war es immer geladen (`complete`, 521 px breit, 124×160) und sichtbar. Ich werte das als Momentaufnahme vor dem Dekodieren, nicht als Befund.

### Tablet quer 1024×768, Touch – `bilder/O2b-it2-lobby-tablet-quer.png`, `O2b-it2-partie-tablet-quer.png`

Wie Desktop, etwas enger: Logo etwa 138 px, Flächen rechts ab x 436. Mit Partie „Laufende Partie: 1 Gegner, Erweiterung aus“ einzeilig neben „Weiterspielen“, darunter „Neue Partie“ als Zweitknopf (weiss mit Kürbis-Rand). Getippt: Segmente, Schalter, „Neue Partie“, „Ja, neue Partie“ reagieren wie erwartet. Gedreht auf 768×1024: einspaltig, Rückfrage 551..678.

### Tablet hochkant 768×1024, Touch – `bilder/O2b-it2-lobby-tablet-hochkant.png`, `O2b-it2-unlesbar-tablet-hochkant.png`

Einspaltig, mittig 512 px breit: Logo, Titel, Untertitel, „Regeln“, darunter die Fläche. Nach unlesbarem Stand ein rosa Hinweis mit roter Leiste links, vierzeilig: „Die gespeicherte Partie liess sich nicht laden. Der Spielstand ist beschädigt (Ungültiger Spielstand: Spielstand: erweiterung fehlt, spieler fehlt, partiephase fehlt und 10 weitere). Sie wurde verworfen; starte eine neue Partie.“ Alles bis 615 px, unten viel Leerraum. Gedreht auf 1024×768: zweispaltig, Rückfrage 439..543.

### Handy hochkant 390×844, Touch – `bilder/O2b-it2-lobby-handy-hochkant.png`, `O2b-it2-partie-handy-hochkant.png`, `O2b-it2-unlesbar-handy-hochkant.png`, `O2b-it2-gedreht-handy-quer.png`, `O2b-it2-regeln-handy-hochkant.png`, `O2b-it2-fokus-segment-handy-hochkant.png`

16 px Rand. „Laufende Partie: 1 Gegner, Erweiterung aus“ bricht vor „aus“ um, „Weiterspielen“ über die volle Breite. Segmente rechts neben „Gegner“, Schalter rechts neben „Mit Erweiterung“. Unlesbarer Stand: sechszeiliger Hinweis, darunter die Fläche, alles bis 632 px. Aus Handy quer gedreht (390×844): Rückfrage mit zweizeiligem Satz, „Ja, neue Partie“ und „Abbrechen“ untereinander, 545..723. `/regeln`: Titel, zwei Zeilen Text, Hauptknopf „Spielregeln auf schlangentanz.ch“, darunter „Zurück zur Lobby“. Fokus auf Segment „2“: dunkler Doppelring um das gewählte Kürbis-Segment.

### Handy quer 844×390, Touch – `bilder/O2b-it2-leer-handy-quer.png`, `-partie-`, `-rueckfrage-`, `-unlesbar-`, `O2b-it2-gedreht-handy-hochkant.png`, `-spiel-handy-quer.png`, `-regeln-handy-quer.png`, `-fokus-schalter-handy-quer.png`, `-testhook-partie-handy-quer.png`, `-startfehler-handy-quer.png`, `O2b-it2-entwurf-handy-quer.png`

Zwei Spalten. Links Logo (etwa 72 px), „Schlangentanz“, Untertitel, „Regeln“ (247..291); rechts die Flächen. Leer: Fläche 105..285 mit Segmenten, Schalter, „Neue Partie“. Mit Partie: „Laufende Partie: 1 Gegner, Erweiterung aus“ zweizeilig neben „Weiterspielen“, darunter die Fläche bis etwa 327 px. Rückfrage: die Fläche reicht bis etwa 368 px, der gelbe Kasten mit zweizeiligem Satz und den beiden Knöpfen nebeneinander liegt ganz darin. Unlesbar: fünfzeiliger Hinweis oben rechts, darunter die Fläche bis 360 px. **Unter dem Bildrand liegt in keinem Zustand etwas**; die Seite ist genau 390 px hoch. Aus Handy hochkant gedreht: dasselbe Bild wie „Rückfrage“. Fokus auf dem Schalter: Doppelring um die ganze Zeile, der Schalter grün mit „An“; der Text „Mit Erweiterung“ liegt dabei direkt am linken Rand des Rings (Hinweis 4). Testhook-Build nach dem Wechsel vom Entwurf: dasselbe Bild wie im Produktionsbuild. `/spiel`: „Spieltisch im Aufbau“, zwei Kästen „Gegner 1“ und „Erweiterung aus“, „Zurück zur Lobby“. `/regeln`: Hauptknopf und Verweis nebeneinander. Startfehler: Überschrift einzeilig, Grund rot, Erklärung dreizeilig, Hauptknopf „Zurück zur Lobby“. Der Entwurf ist bei dieser Höhe einspaltig und reicht weit unter den Rand (bekannte Ausnahme aus O1); die Lobby ist hier besser als ihr Vorbild.

Server danach beendet: PID 65708 (`…\worktrees\agent-a30baa5760485d33f\…\vite.js preview --port 4383 --strictPort`) und PID 30640 (`… preview --outDir dist-testhooks --port 4384 --strictPort`), Befehlszeile geprüft, `Stop-Process`; danach lauscht auf 4383/4384 nichts mehr. Den Tab des eingebauten Browsers (`tab-35`) habe ich geschlossen.

## Satz-für-Satz-Abdeckung

Entfällt, weil kein Engine-Task.

## Eigene Grenzfälle

1. **Fenster unter den Klassen** (`grenz.log`, `zwischen.log`, TF-APP-017 und TF-APP-018). Warum: echte Handys quer haben wegen der Browserleisten oft weniger Höhe. 1024×600 und 740×360: alles im Bild (740×360 mit Rückfrage: Seite 381 px, Knöpfe im Bild). 667×375 und 640×360: alle Knöpfe im Bild, nur der Rahmen der Rückfrage reicht 14 px unter den Rand (`bilder/O2b-it2-grenz-640x360-rueckfrage.png`). 568×320: wie in Iteration 1 nicht ohne Scrollen bedienbar, „Abbrechen“ bricht als „Abbreche / n“ um (`O2b-it2-grenz-568x320-rueckfrage.png`); neu gemessen liegt dort auch nach unlesbarem Stand „Neue Partie“ bei 316..360. 320×568 hochkant: mit Rückfrage scrollt die Seite, „Regeln“ -28..16, Rückfrage ganz im Bild. Ausserhalb der fünf Klassen, laut PR wie vereinbart unverändert; Hinweis 2.
2. **Mehrfach drehen bei offener Rückfrage** (G2): 390×844 → 844×390 → 390×844 → 844×390. Rückfrage jedes Mal ganz im Bild, Fokus bleibt auf „Abbrechen“, danach „Abbrechen“: Lobby mit „Weiterspielen“, Fokus auf „Neue Partie“. Bestanden.
3. **Rückfrage weggescrollt, dann drehen** (G3): 390×500, Rückfrage offen, ganz nach oben gescrollt (Rückfrage 515..694, also unter dem Rand). Auf 500×390 gedreht: Rückfrage 263..390, ganz im Bild. Das Nachholen per `scrollIntoView` wirkt auch dann, wenn die Rückfrage vor dem Drehen nicht sichtbar war. Bestanden.
4. **Lobby nach dem Entwurf ohne Neuladen** (Testhook-Build, alle Klassen, mit und ohne Partie): 0 Stilabweichungen (Kriterium 4). Bestanden; Hinweis 3 der Iteration 1 erledigt.
5. **Sichtbares Feld mit nur vorgelesenem Label** im geänderten Wächter: wird übergangen (Abschnitt Gegenprobe, TF-PRUEF-027, Hinweis 1).

## Testregister

Bereiche APP und PRUEF. `<scratchpad>/ohne_bereich.py` meldete `tests/layout/waechter_labels.spec.ts` ohne Bereich; ich habe die Datei in `tagebuch/tests/bereiche.md` zum Bereich PRUEF ergänzt (neben `tests/layout/messung.ts`). Vorschlag an den Orchestrator: so übernehmen. Übrig bleiben nur die Protokoll- und Bilddateien unter `docs/abnahme/`, die bewusst keinem Bereich angehören.

TF-PRUEF-025 nennt jetzt die Klasse `.lobby__schalter` (vorher `.schalter`) und verweist unter „Nicht abgedeckte Grenzfälle“ auf zwei neue Grenzfälle: TF-PRUEF-026 (Segmente unter dem Rand, Schalter-Label zugedeckt) und TF-PRUEF-027 (sichtbares Feld mit nur vorgelesenem Label). Die Abschnitte „Worum es geht“, „Bestanden, wenn“ und „Fehlgeschlagen, wenn“ beider neuer Testfälle habe ich vor dem ersten Lauf mit dem Humanizer geprüft (`pruefe_muster.py`: ein Hinweis „absolutheit“ in TF-PRUEF-026, umformuliert; danach keine Befunde).

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-PRUEF-025 | Wächter meldet Schalter unter dem Bildrand | `2026-11-13-1658-TF-PRUEF-025` | bestanden |
| TF-PRUEF-026 | Segmente unter dem Rand, Schalter-Label zugedeckt | `2026-11-13-1658-TF-PRUEF-026` | bestanden |
| TF-PRUEF-027 | sichtbares Feld mit nur vorgelesenem Label | `2026-11-13-1658-TF-PRUEF-027` | fehlgeschlagen (Hinweis 1) |
| TF-APP-016 | Drehen bei offener Rückfrage | `2026-11-13-1658-TF-APP-016` | bestanden |
| TF-APP-017 | 1024×600, 740×360, 667×375 | `2026-11-13-1658-TF-APP-017` | bestanden |
| TF-APP-018 | 568×320 | `2026-11-13-1658-TF-APP-018` | unklar (wie Iteration 1) |
| TF-APP-008 | Handy quer mit Rückfrage ohne Scrollen | `2026-11-13-1658-TF-APP-008` | bestanden |
| TF-APP-002 | K1 mit Tastatur, Touch und Maus | `2026-11-13-1659-TF-APP-002` | bestanden |
| TF-APP-003 | K2 Rückfrage in fünf Klassen | `2026-11-13-1659-TF-APP-003` | bestanden |
| TF-APP-004 | Vor, Zurück, Neuladen | `2026-11-13-1659-TF-APP-004` | bestanden |
| TF-APP-005 | Startfehler | `2026-11-13-1659-TF-APP-005` | bestanden |

`python scripts/tagebuch_bauen.py`: 402 Dateien geschrieben, Exit 0.

## Hinweise (kein Mangel)

1. **Der geänderte Wächter übergeht ein sichtbares Feld mit nur vorgelesenem Label.** `messeErreichbarkeit` (`tests/layout/messung.ts`, Z. 388–390) nimmt bei einem `input` mit Labels immer das grösste Label, auch wenn das Feld selbst grösser ist. Ist das Label `.nur-vorlesen` (1×1), fällt es unter die 2-px-Grenze, und weder „ausserhalb des Bildes“ noch „vollständig verdeckt“ messen das Feld; vor O2b mass der Wächter es selbst. Heute ohne Folge: Die App hat kein solches Feld, und `findeKleineTippflaechen` meldet dieselbe Lage als Tippfläche 1×1 rot, überall wo `bedienbarkeitsVertraege` mitläuft (in `entwurf.hooks.spec.ts` Z. 97 läuft nur `waechterVertraege`). Vorschlag, eine Zeile: das Feld in die Auswahl der grössten Fläche aufnehmen, `[element, ...labels].reduce(…)`. Reproduktion und Beleg: TF-PRUEF-027.
2. **Kleine Querformate** (Grenzfall 1, TF-APP-018): unverändert gegenüber Iteration 1. Bei 640×360 und 667×375 reicht der Rahmen der Rückfrage 14 px unter den Rand, bei 568×320 ist die Lobby mit Partie, mit Rückfrage und nach unlesbarem Stand nicht ohne Scrollen bedienbar, und „Abbrechen“ bricht mitten im Wort um.
3. **`scrollIntoView` beim Drehen** hält weiter nur `Lobby.drehen.test.tsx` fest; in den fünf Klassen passt die Rückfrage ohnehin. Grenzfall 3 zeigt im Browser, dass es wirkt.
4. **Fokusring am Schalter:** Der Ring liegt um das Label, dessen Text ohne Innenabstand beginnt; „Mit Erweiterung“ berührt links den Ring (`O2b-it2-fokus-schalter-handy-quer.png`). Gut sichtbar, nur etwas eng.
5. **Wackler in `test:layout` unter Last:** In Lauf 2 baute `/dev/entwurf/tisch` in `handy-quer-testhooks` nicht innerhalb von 5 s auf (Entwurfs-Vertrag, nicht von O2b berührt; `retries: 0`). Läufe 1 und 3 auf demselben Stand grün. Bei paralleler Last anderer Agenten kann das Gate deshalb ohne Codefehler rot werden.
6. **Schalter und Segmente bleiben Kästchen und Radios** (Hinweis 5 der Iteration 1): DESIGN.md beschreibt `role="switch"` und `aria-pressed`. Unverändert, vertretbar.
