# Prüfprotokoll O2b – Lobby für flache Fenster

| Feld | Wert |
|---|---|
| Task | O2b Lobby für flache Fenster (Folgeaufgabe des Orchestrators, kein Block im Plan) |
| Branch | `task/O2b-lobby-flach`, PR #35 gegen `neuaufbau` |
| Geprüfter Stand | `3626e90` (Basis `414e39c`, `origin/neuaufbau` steht auf `e96caac`; `git merge-tree` ohne Konflikt) |
| Prüfer | Claude Code (Subagent) als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 13.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 |

Vorbereitung: Zeilenenden vorher 414 Dateien `w/crlf`, nach Löschen und `git checkout -- .` 0. `core.hooksPath` = `scripts/githooks`. `npm ci` Exit 0. Logs, Skripte und Rohbilder liegen im Scratchpad unter `O2b-pruefer/` (im Folgenden `<scratchpad>`).

## Urteil: ABGELEHNT

Die Lobby selbst erfüllt alle Kriterien: In Handy quer liegt in jedem Zustand jedes Bedienelement ohne Scrollen im Bild, die Rückfrage geht beim Drehen in beiden Richtungen mit, die anderen vier Klassen verschlechtern sich nicht, alle Gates enden mit 0, der erste Commit ist nur Tests und rot. Abgelehnt wird wegen einer Lücke in den Verträgen, die O2b selbst geöffnet hat:

1. **Der Wächter „kein Bedienelement liegt außerhalb des Bildes“ sieht den Schalter „Mit Erweiterung“ und die Segmente 1/2/3 nicht.** Kriterium 1 und 3. `findeAusserhalbDesBildes` (`tests/layout/messung.ts`, `messeErreichbarkeit`) sucht nur `button, a[href], [role="button"], input, select` und überspringt Elemente unter 2 px. O2b macht das Kästchen der Erweiterung zu `.nur-vorlesen` (1 × 1 px); vorher war es 22 × 22 px und wurde gemessen. Getippt wird das Label, und das misst niemand. Reproduktion (Gegenprobe d): ans Ende von `src/ui/lobby/lobby-seite.css` die Zeile `.schalter { position: relative; top: 400px; }`, dann `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer` → **97 passed, Exit 0**, obwohl der Schalter bei 577..621 px in einem 390 px hohen Fenster liegt (eigene Messung im selben Build). Dieselbe Lücke betrifft „vollständig verdeckt“ und die Segmente (deren Radios waren schon seit O2 unsichtbar). Vorschlag: In `messeErreichbarkeit` bei einem `input` mit `labels` die Box des Labels messen, wie es `findeKleineTippflaechen` schon tut, und die 2-px-Grenze erst danach anwenden. Beleg `<scratchpad>/gegenprobe-d.txt`, Testfall TF-PRUEF-025 (fehlgeschlagen).

## Abnahmekriterien

Der Task hat keinen Block im Plan; die Kriterien stammen aus dem Auftrag des Orchestrators.

| # | Kriterium (wörtlich aus dem Auftrag) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | In Handy quer (844×390, Touch) liegt in allen Lobby-Zuständen (leer, mit Partie, Rückfrage offen, nach unlesbarem Stand) jedes Bedienelement ohne Scrollen im Bild. | ja (Verhalten); Vertrag lückenhaft, Mangel 1 | eigene Messung inkl. Labels: `scrollHeight` 390 in allen vier Zuständen, nichts ausserhalb; Bilder `O2b-*-handy-quer.png` |
| 2 | Dreht man das Handy bei offener Rückfrage von hochkant auf quer, liegt die Rückfrage im Bild (vorher 412..531 bei 390 px Höhe). | ja | Rückfrage nach dem Drehen 230..356, Fokus bleibt auf „Abbrechen“; Vertrag `O2b TF-APP-016` in fünf Klassen grün, auf `a9189f0` und in Gegenprobe b rot |
| 3 | Die drei Lobby-Einträge sind aus `tests/layout/geraeteklassen_ausnahmen.json` entfernt; die Lobby-Verträge sind in allen fünf Klassen grün ohne Ausnahme. | ja; Lücke siehe Mangel 1 | Liste hat nur noch drei `entwurf.hooks.spec.ts`-Einträge; `test:layout` zweimal Exit 0, `x` nur bei den drei Entwurfs-Verträgen |
| 4 | In den anderen vier Klassen verschlechtert sich nichts; Tippflächen ≥ 44 px, kein waagrechtes Scrollen, Fokus sichtbar, Tastatur bedienbar; alle O2-Kriterien gelten weiter. | ja | Messung und Bedienung in fünf Klassen (`<scratchpad>/ablauf.txt`, `tastatur.txt`), Tabelle unten |
| 5 | Alle Gates grün. | ja | Abschnitt Gates |

### 1. Handy quer ohne Scrollen

Eigenes Skript `<scratchpad>/ablauf.mjs`, Produktionsbuild auf Port 4383, `kontextOptionen(handy-quer)`, Bedienung mit `tap()`. Gemessen werden `button`, `a[href]`, die Segment-Flächen `label.wahl > span`, das Label `label.schalter` und der `alertdialog` (also mehr als der Wächter, siehe Mangel 1):

| Zustand | Lage (px, Fenster 390 hoch) | Seite |
|---|---|---|
| leer | Segmente 121..165, Schalter 177..221, „Neue Partie“ 229..273, „Regeln“ 247..291 | `scrollHeight` 390 |
| mit Partie | „Weiterspielen“ 76..120, Segmente 163..207, Schalter 219..263, „Neue Partie“ 271..315, „Regeln“ 247..291 | 390 |
| Rückfrage offen | „Weiterspielen“ 35..79, Segmente 122..166, Schalter 178..222, Rückfrage 230..356, „Ja, neue Partie“/„Abbrechen“ 298..342, „Regeln“ 247..291 | 390 |
| nach unlesbarem Stand (`{"version":1,"kaputt":true}`, Hinweis „älteres Speicherformat“) | Segmente 185..229, Schalter 241..285, „Neue Partie“ 293..337, „Regeln“ 247..291 | 390 |

`scrollWidth` = `clientWidth` = 844, kleinste Tippfläche 44 × 44. Vorher (P0.3c-Protokoll und Stand `a9189f0`): „Neue Partie“ 412..460 und „Regeln“ 480..528, Rückfrage-Seite 623 px hoch. Das Verhalten ist erfüllt; dass der Vertrag Schalter und Segmente nicht mitmisst, ist Mangel 1.

### 2. Drehen bei offener Rückfrage

Je Klasse: Partie anlegen, Zurück, „Neue Partie“ (Rückfrage offen, Fokus „Abbrechen“), `setViewportSize` mit vertauschten Massen, messen, zurückdrehen, messen.

| Klasse → gedreht | Rückfrage nach dem Drehen | nach dem Zurückdrehen |
|---|---|---|
| Handy hochkant 390×844 → 844×390 | 230..356, alles im Bild, Fokus „Abbrechen“ | offen, alles im Bild |
| Handy quer 844×390 → 390×844 | 497..675, alles im Bild | offen, alles im Bild |
| Tablet hochkant → 1024×768 | 439..543 | offen, alles im Bild |
| Tablet quer → 768×1024 | 503..630 | offen, alles im Bild |
| Desktop → 900×1280 | 685..811 | offen, alles im Bild |

Der Vertrag `O2b TF-APP-016: Lobby mit offener Rückfrage nach dem Drehen` ist in allen fünf Klassen grün (60 Tests: ein `toBeInViewport` plus alle Wächter je Klasse) und auf dem ersten Commit rot (`Received: "412..531 bei 390 px Höhe"`).

**`toBeInViewport({ ratio: 1 })` statt eigener Messung: mindestens gleich streng.** Die alte Prüfung verglich nur oben und unten mit `innerHeight`. `toBeInViewport` rechnet mit einem IntersectionObserver gegen das ganze Fenster, also auch links und rechts und mit Beschnitt durch Vorfahren, und verlangt das Verhältnis 1 ohne Rundung. Beleg aus Gegenprobe a: Dort holte `scrollIntoView` die Rückfrage bis auf einen Bruchteil eines Pixels ins Bild, und der Vertrag schlug trotzdem an (`Received: viewport ratio 0.998788595199585`). In Gegenprobe b (alte Anordnung) meldet er `viewport ratio 0`. Beide Male rot.

Nicht vom Layout-Vertrag gedeckt ist das Nachholen per `scrollIntoView` selbst: In den fünf Klassen passt die Rückfrage auch ohne, deshalb bleibt TF-APP-016 grün, wenn man den Listener entfernt (Gegenprobe c). Das hält nur `Lobby.drehen.test.tsx` fest; dort wird es rot. Hinweis 2.

### 3. Ausnahmeliste

`git diff origin/neuaufbau...HEAD -- tests/layout/geraeteklassen_ausnahmen.json`: genau die drei Einträge `tests/layout/lobby.spec.ts` / `handy-quer` gelöscht, der Kommentar nachgezogen, die drei Einträge zu `entwurf.hooks.spec.ts` bleiben. `npm test` (darin `tests/geraeteklassen_ausnahmen.test.ts`, Liste darf nur schrumpfen) grün. In beiden `test:layout`-Läufen erscheinen als `x` (erwartetes Scheitern) nur `/dev/entwurf`, `/dev/entwurf/lobby` und die Lupe in `handy-quer-testhooks`; kein Lobby-Vertrag ist mehr als Ausnahme markiert, und keiner ist rot. In der Gegenprobe a werden genau die drei früheren Einträge wieder rot, dazu „O2: Lobby ohne Spielstand“ und TF-APP-016 in `handy-hochkant`.

### 4. Keine Verschlechterung, O2-Kriterien

Alle fünf Klassen mit `ablauf.mjs` (Desktop `click()`, sonst `tap()`):

| Prüfung | Ergebnis in allen fünf Klassen |
|---|---|
| O2 K1: 1/2/3 Gegner, Erweiterung, Neue Partie | Segment 2 und Schalter angetippt: Radios `010`, Schalter „An“, Kästchen `checked`; „Neue Partie“ → `/spiel` mit „Gegner 2“, „Erweiterung an“ |
| O2 K2: Weiterspielen, Rückfrage | „Laufende Partie: 2 Gegner, Erweiterung an“ mit „Weiterspielen“; Rückfrage mit Fokus auf „Abbrechen“; Escape und „Abbrechen“ lassen den Stand zeichengleich, Fokus zurück auf „Neue Partie“; 3 Gegner + „Ja, neue Partie“ → `/spiel`, Stand neu |
| O2 K3: Vor/Zurück | `/spiel` → Zurück `/` → Vor `/spiel` → Zurück `/`; „Regeln“ und Zurück → `/` |
| O2 K4: Startfehler | `Math.random` wirft: „Hier ist ein Fehler aufgetreten · Pruefer: Zufall gesperrt …“, „Zurück zur Lobby“ führt zurück; unlesbarer Stand zeigt den Hinweis |
| O2 K5: keine Partie im Hintergrund | 3 s: `timeout 0, interval 0, raf 0, random 0`, Stand unverändert |
| waagrecht | `scrollWidth` = `clientWidth` überall (1280, 1024, 768, 390, 844), auch auf `/spiel`, `/regeln`, Fehlerseite und gedreht |
| Tippflächen | kleinste 44 × 44 (Segment); Schalter 44 hoch über die Zeilenbreite |
| Ausserhalb | in den vier Lobby-Zuständen und gedreht in keiner Klasse etwas ausserhalb |
| Konsole | nur die absichtlichen Fehler aus K4 und die Warnung „älteres Speicherformat“ |

Tastatur (`<scratchpad>/tastatur.mjs`, Desktop und Handy quer): Tab-Reihe leer „1 Gegner“ (Radio) → Kästchen „Mit Erweiterung“ → „Neue Partie“ → „Regeln“; mit Partie zuerst „Weiterspielen“. Jeder Halt zeigt den doppelten Ring (`box-shadow: rgb(255,255,255) 0 0 0 3px, rgb(43,33,28) …`) am sichtbaren Segment bzw. an der Schalterzeile. Zweimal Pfeil rechts wählt „3 Gegner“ (`001`), Pfeil links `010`, Leertaste schaltet „An“, Enter auf „Neue Partie“ startet. Mit Partie: Enter öffnet die Rückfrage, Fokus „Abbrechen“; Tab verlässt die Rückfrage zu „Regeln“, dort wirkt Escape nicht (bekannt aus O2, TF-APP-010). Barrierebaum (`<scratchpad>/aria.txt`): `radiogroup "Gegner"` mit `radio "1 Gegner"` …, `checkbox "Mit Erweiterung"` (das „Aus“ ist `aria-hidden` und nicht im Namen), `button "Neue Partie"`, `link "Regeln"`.

Im eingebauten Browser (Desktop 1280×900, Maus): „3“ und Schalter geklickt (Schalter wird grün „An“), „Neue Partie“ → „Gegner 3, Erweiterung an“, Zurück zeigt „Laufende Partie: 3 Gegner, Erweiterung an“, „Neue Partie“ öffnet die Rückfrage, Escape schliesst sie. Keine Konsolenfehler.

### 5. Gates

Siehe nächster Abschnitt, alle Exit 0.

## Gates

Jeder Befehl einzeln in Git Bash, Exit-Code über `${PIPESTATUS[0]}` hinter `tee`, Logs unter `<scratchpad>/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 38 passed (38), Tests 924 passed (924); `Lobby.drehen.test.tsx` ist dabei (`vitest list`) |
| `npm run typecheck` | 0 | `tsc -b` ohne Ausgabe |
| `npm run build` | 0 | `index-C9ZDtfx0.css` 8,87 kB, `index-LDs_t6Kh.js` 223,14 kB, `prod-Bb0O1mwa.js` 448,15 kB |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | 0 in 0 Dateien (Baseline gehalten) |
| `npm run check:regeln` | 0 | 149 Dateien (U6), U7 45 Testdateien, Merge-Basis 414e39c, keine Verstösse |
| `npx eslint .` | 0 | keine Ausgabe |
| `python scripts/regelcheck.py` | 0 | 4 Warnungen, keine Fehler (`scoring.ts` 402 Zeilen, `messung.ts` 921 Zeilen, Arbeitsschritt ohne Testlauf für den O2-Eintrag, TF-SPEC-005) |
| `npm run test:layout` (Lauf 1) | 0 | 1125 passed (2,2 min), `x` nur die drei Entwurfs-Ausnahmen |
| `npm run test:layout` (Lauf 2) | 0 | 1125 passed (2,4 min), dieselben drei `x`, kein Wackler |

Ports vor `test:layout`: `Get-NetTCPConnection -LocalPort 4173,4174 -State Listen` ohne Ausgabe. Später belegte ein anderer Worktree (`agent-a2068a3eca8784da8`, PIDs 65444/62972, Befehlszeile geprüft, nicht angefasst) die Ports; die Gegenproben b und c liefen deshalb mit einer eigenen Konfiguration `<scratchpad>/pw-eigen.config.mjs` (gleiche Klassen über `kontextOptionen`, nur `lobby.spec.ts`, Port 4393).

**`document.fonts.ready` in `oeffne()`.** Die Schriften liegen lokal unter `public/schrift/`; das Warten kostet nach dem sichtbaren Leitelement kaum Zeit. Beide Läufe ohne Wackler; die Lobby-Verträge in `desktop` und `handy-quer` brauchten im Mittel 1,6 s bzw. 2,0 s je Test. Ein Vergleichslauf auf der Basis `414e39c` lief unter fremder Last (andere Agenten): 4,9 min, 6 rote P0.4-Verträge in `handy-hochkant-testhooks` (`browserContext.newPage: Test timeout`, „/dev zeigt keinen Entwicklertisch“), Lobby-Verträge im Mittel 4,1 s. Er taugt deshalb nicht als sauberer Zeitvergleich; einen Hinweis auf zusätzliche Laufzeit oder Wackler durch das Warten gibt es nicht. Die roten P0.4-Verträge betreffen den Basisstand und nicht O2b.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
a9189f0 test: Lobby in flachen Fenstern und Rückfrage nach dem Drehen (O2b, rot)
3626e90 feat: Lobby passt in flache Fenster, Rückfrage geht beim Drehen mit (O2b)
```

`a9189f0` enthält nur `src/ui/lobby/Lobby.drehen.test.tsx` (neu), `tests/layout/lobby.spec.ts` (Vertrag TF-APP-016) und `tests/layout/geraeteklassen_ausnahmen.json` (drei Einträge gelöscht). Ausgecheckt (`git switch --detach a9189f0`):

- `npx vitest run src/ui/lobby/Lobby.drehen.test.tsx` → Exit 1, „Tests 1 failed | 1 passed“, `expected "vi.fn()" to be called 1 times, but got 0 times` (der Resize-Listener fehlt).
- `npx playwright test tests/layout/lobby.spec.ts` → Exit 1, „5 failed, 480 passed“: `handy-quer` dreimal „kein Bedienelement liegt außerhalb des Bildes“ (mit Partie, unlesbar, Rückfrage), `handy-hochkant` „die Rückfrage liegt nach dem Drehen ganz im Bild“ (`Received: "412..531 bei 390 px Höhe"`) und „außerhalb des Bildes“.

Rot, weil das Verhalten fehlt. Spätere Änderung an den Tests (`git diff a9189f0 HEAD -- tests/`): die eigene `expect.poll`-Messung wurde durch `toBeInViewport({ ratio: 1 })` ersetzt (nicht schwächer, siehe Kriterium 2), der ungenutzte Import `kasten` entfiel; `tests/layout/oeffnen.ts` wartet zusätzlich auf `document.fonts.ready`.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
 src/ui/lobby/Lobby.drehen.test.tsx         |  55 +++++++
 src/ui/lobby/Lobby.tsx                     | 129 ++++++++++-------
 src/ui/lobby/Rahmen.tsx                    |   9 +-
 src/ui/lobby/lobby-seite.css               | 221 +++++++++++++++++++++++++++++
 src/ui/lobby/lobby.css                     | 170 +++++-----------------
 src/ui/lobby/texte.ts                      |   2 +
 tests/layout/geraeteklassen_ausnahmen.json |  20 +--
 tests/layout/lobby.spec.ts                 |  27 +++-
 tests/layout/oeffnen.ts                    |  16 ++-
 9 files changed, 439 insertions(+), 210 deletions(-)
```

| Datei | im Auftrag | Urteil |
|---|---|---|
| `src/ui/lobby/**` | ja (O2-Feld `src/ui/lobby/**`) | `Lobby.tsx` 165 Zeilen, `lobby-seite.css` 221 Zeilen (U7) |
| `src/ui/lobby/lobby-seite.css` (neu) | ja | Lobby-Regeln ausgelagert, weil `lobby.css` sonst über 300 Zeilen käme (Commit-Body). Nur Tokens, keine Farbwerte. Trägt |
| `src/ui/lobby/lobby.css` (`@import '../tokens.css'`) | ja | `--rahmen-*` zeigen jetzt auf Tokens, wie der alte Kommentar es vorsah; Titel aller Rahmen-Seiten in Lilita One und Kürbis, Fokus als `--fokus-ring`, `.hinweis--fehler` bekommt `--farbe-fehler-hell`. Wirkt auch auf `/spiel`, `/regeln` und die Fehlerseite (Bilder unten), gewollt. Trägt |
| `tests/layout/geraeteklassen_ausnahmen.json`, `tests/layout/lobby.spec.ts` | ja (Kriterium 3, TF-APP-016) | |
| `tests/layout/oeffnen.ts` | ja (im Auftrag genannt) | Begründung im Kommentar und PR: `@font-face` mit `font-display: swap`. Trägt |

U10: `package.json` unverändert. U13: keine geschützte Datei. U9: `lobby-seite.css` ohne Dateikopf; `oeffnen.ts` behält seinen alten Kopf (erlaubt). U11: kein Fremdcode. U3: Lobby ruft die Engine weiter nur über `partie.ts`; keine Regellogik neu.

## Gegenprobe

| | Änderung im Code | Befehl | Ergebnis |
|---|---|---|---|
| a | `lobby-seite.css` Z. 163: `@media (min-width: 900px), (orientation: landscape) and (min-width: 560px)` → `@media (min-width: 900px)` (Handy quer wieder einspaltig, „Regeln“ rutscht unter den Rand) | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer --project=handy-hochkant` | **Exit 1, 6 failed, 188 passed**: die drei früheren Ausnahmen (z. B. „Neue Partie“ 410..454, „Regeln“ 487..531), „O2: Lobby ohne Spielstand“ („Regeln“ 374..418) und TF-APP-016 in `handy-hochkant` (`viewport ratio 0.9988`, Wächter: Rückfrage-Knöpfe 455..499) |
| b | alte Anordnung: `src/ui/lobby/{Lobby.tsx,Rahmen.tsx,lobby.css,texte.ts}` auf `414e39c`, `lobby-seite.css` entfernt, Tests von HEAD | `npx playwright test -c <scratchpad>/pw-eigen.config.mjs --grep "TF-APP-016"` | **Exit 1, 2 failed, 58 passed**: `handy-hochkant` `toBeInViewport` „viewport ratio 0“ und Wächter „Ja, neue Partie“/„Abbrechen“ 465..513, „Regeln“ 551..599 |
| c | `Lobby.tsx` Z. 144: `'resize'` → `'orientationchange'` | `npx vitest run src/ui/lobby/Lobby.drehen.test.tsx`; dazu TF-APP-016 in fünf Klassen | Vitest **Exit 1** („to be called 1 times, but got 0 times“); Layout 60 passed (Hinweis 2) |
| d | `lobby-seite.css` + `.schalter { position: relative; top: 400px; }` | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer` | **Exit 0, 97 passed**, Schalter liegt bei 577..621 → Mangel 1 |

Nach jeder Gegenprobe `git checkout` der Dateien, `git status` danach ohne Änderungen ausserhalb von `tagebuch/`. Der Produktionsbuild wurde danach neu gebaut; er hat wieder dieselben Dateinamen wie im Gate (`index-LDs_t6Kh.js`).

## Browserprüfung

Produktionsbuild `npx vite build`, `npx vite preview --port 4383 --strictPort`; Testhook-Build `npm run build:testhooks`, `npx vite preview --outDir dist-testhooks --port 4384 --strictPort` (für den Entwurf). Alle fünf Klassen mit Playwright über `scripts/pruefung/geraeteklassen.mjs` (Touch-Klassen `pointer: coarse` ja, Bedienung mit `tap()`), Desktop zusätzlich im eingebauten Browser mit der Maus. `bildschirmfotos.mjs` für `/` und `/dev/entwurf/lobby`: je Exit 0, fünf Bilder in der richtigen Grösse, 0 Konsolenfehler.

**Gestaltung gegenüber dem freigegebenen Entwurf** (`bilder/O2b-entwurf-desktop.png`, `-handy-quer.png`, `-handy-hochkant.png`): Gleich sind warmer Papiergrund, Logo (Schlange in der Kiste) über dem Titel, Titel „Schlangentanz“ in Lilita One und Kürbis-Dunkel, Text in Inter, weisse Flächen mit grossem Radius und flachem Schatten, Gegnerzahl als drei Segmente „1 2 3“ auf beiger Schiene mit dem gewählten in Kürbis, Erweiterung als runder Schalter mit Knopf und dem Wort „Aus“ (beige) bzw. „An“ (grün), Hauptknopf in Kürbis, „Neue Partie“ bei laufender Partie als Zweitknopf (weiss, Kürbis-Rand), zweispaltig mit Kopf links. Abweichungen: Die echte Lobby hat keine Zwischentitel „Deine Partie“ und „Neue Partie“, keinen Erklärsatz zur Erweiterung, den Untertitel „Du gegen bis zu drei KI-Gegner“ statt „Das farbenfrohe Kartenspiel“ und den internen Verweis „Regeln“ statt des externen. Das sind die O2-Texte, auf die die bestehenden Tests zielen; im Querformat ist die echte Lobby kompakter als der Entwurf, der dort selbst unter den Rand reicht. Kontraste: Die Wächter „zu blass“ (WCAG-Mindestwerte) sind in allen Klassen grün; nach DESIGN.md Weiss auf Kürbis 5,2 : 1, Titel 6,8 : 1, Nebentext 6,0 : 1.

### Desktop 1280×900 – `bilder/O2b-partie-desktop.png`, `O2b-rueckfrage-desktop.png`, `O2b-gedreht-desktop.png`, `O2b-gewaehlt-desktop.png`

Zwei Spalten, senkrecht mittig, viel ruhiger Rand. Links Logo (etwa 160 px hoch), „Schlangentanz“, grau „Du gegen bis zu drei KI-Gegner“, darunter unterstrichen „Regeln“. Rechts oben die Fläche „**Laufende Partie:** 2 Gegner, Erweiterung an“ einzeilig mit „Weiterspielen“ (Kürbis) rechts, darunter die Fläche mit „Gegner … 1 2 3“, „Mit Erweiterung … Aus“ und „Neue Partie“ als Zweitknopf. Rückfrage: hellgelber Kasten mit braunem Rand, Satz einzeilig, „Ja, neue Partie“ rot und „Abbrechen“ weiss nebeneinander, alles innerhalb der Fläche. Gewählt: Segment „2“ in Kürbis, Schalter dunkelgrün mit „An“ links und weissem Knopf rechts. Gedreht (900×1280): weiterhin zwei Spalten, Text „Erweiterung an“ und der Rückfragesatz brechen auf zwei Zeilen, Fokusring um „Abbrechen“. Nichts abgeschnitten oder verdeckt.

### Tablet quer 1024×768, Touch – `bilder/O2b-leer-tablet-quer.png`, `O2b-partie-tablet-quer.png`, `O2b-rueckfrage-tablet-quer.png`, `O2b-gedreht-tablet-quer.png`

Wie Desktop, schmaler. Leer: links Logo, Titel, Untertitel, „Regeln“; rechts eine Fläche mit Segmenten (1 gewählt), Schalter „Aus“ und breitem Hauptknopf „Neue Partie“. Mit Touch: Segment 2, Schalter, „Neue Partie“, Zurück, Rückfrage, Escape, „Abbrechen“, 3 Gegner, „Ja, neue Partie“, alles wirkte. Gedreht auf 768×1024: einspaltig, Rückfrage 503..630 im Bild.

### Tablet hochkant 768×1024, Touch – `bilder/O2b-partie-tablet-hochkant.png`, `O2b-rueckfrage-tablet-hochkant.png`, `O2b-gedreht-tablet-hochkant.png`

Einspaltig, mittig etwa 512 px breit: Logo, Titel, Untertitel, Fläche „Laufende Partie … Erweiterung an“ mit „Weiterspielen“ über die volle Breite, Fläche mit Segmenten, Schalter und Rückfrage (Satz zweizeilig, Knöpfe nebeneinander), darunter „Regeln“ bei 667..711. Untere Bildhälfte leer. Gedreht auf 1024×768: zwei Spalten, Rückfrage 439..543, Fokusring um „Abbrechen“ sichtbar.

### Handy hochkant 390×844, Touch – `bilder/O2b-partie-handy-hochkant.png`, `O2b-rueckfrage-handy-hochkant.png`, `O2b-gedreht-handy-hochkant.png`, `O2b-gewaehlt-handy-hochkant.png`, `O2b-unlesbar-handy-hochkant.png`

16 px Rand. „Laufende Partie: 2 Gegner, Erweiterung an“ bricht vor „an“ um, „Weiterspielen“ volle Breite. Segmente rechts neben „Gegner“, Schalter rechts neben „Mit Erweiterung“. Rückfrage: Satz zweizeilig, „Ja, neue Partie“ und „Abbrechen“ untereinander über die volle Breite; „Regeln“ bei 712..756, noch im Bild. Unlesbarer Stand: rosa Hinweis mit roter Leiste links, fünfzeilig, darunter die Fläche, alles bis „Regeln“ (581..625) im Bild. Auf dem Foto „gewaehlt“ liegt über der Schalterzeile das hellblaue Antipp-Leuchten des Browsers (Hinweis 4). Gedreht auf 844×390: genau das Bild aus Handy quer mit offener Rückfrage, Fokusring um „Abbrechen“.

### Handy quer 844×390, Touch – `bilder/O2b-leer-handy-quer.png`, `O2b-partie-handy-quer.png`, `O2b-rueckfrage-handy-quer.png`, `O2b-unlesbar-handy-quer.png`, `O2b-gedreht-handy-quer.png`, `O2b-startfehler-handy-quer.png`, `O2b-regeln-handy-quer.png`

Zwei Spalten. Links Logo (etwa 70 px), „Schlangentanz“, Untertitel, „Regeln“; rechts die Flächen. Mit Partie: „Laufende Partie: 2 Gegner, Erweiterung an“ zweizeilig neben „Weiterspielen“, darunter Segmente, Schalter, „Neue Partie“ (Zweitknopf) mit dem unteren Rand der Fläche bei etwa 325 px. Rückfrage: Die Fläche reicht bis etwa 370 px, der gelbe Kasten mit zweizeiligem Satz und zwei Knöpfen nebeneinander liegt ganz darin. Unlesbarer Stand: vierzeiliger Hinweis oben rechts, darunter die Fläche, „Neue Partie“ bei 293..337. **Unter dem Bildrand liegt in keinem Zustand etwas**; die Seite ist genau 390 px hoch. Fehlerseite: Überschrift einzeilig in Lilita One, Grund rot, Erklärung dreizeilig, Hauptknopf „Zurück zur Lobby“. Regelseite: „Regeln“, zwei Zeilen Text, Hauptknopf „Spielregeln auf schlangentanz.ch“ und Verweis „Zurück zur Lobby“ nebeneinander. Gedreht auf 390×844: einspaltig, Rückfrage 497..675 im Bild, Fokusring um „Abbrechen“.

Waagrechtes Scrollen je Klasse: `scrollWidth`/`clientWidth` 1280/1280, 1024/1024, 768/768, 390/390, 844/844 in allen Zuständen, auf `/spiel`, `/regeln`, der Fehlerseite und gedreht. Kein Text abgeschnitten.

Server danach beendet: PID 63064 (`…\agent-ae5ac90a336b6e820\node_modules\.bin\..\vite\bin\vite.js preview --port 4383 --strictPort`) und PID 47396 (`… preview --outDir dist-testhooks --port 4384 --strictPort`), beide aus diesem Worktree, mit `Stop-Process`; danach lauscht auf 4383/4384/4393 nichts. Tab des eingebauten Browsers geschlossen.

## Satz-für-Satz-Abdeckung

Entfällt, weil kein Engine-Task.

## Eigene Grenzfälle

1. **1024×600, Touch (kleines Notebook, TF-APP-017).** Warum: zwischen Tablet quer und Handy quer, flacher als jede Tablet-Klasse. Ergebnis: in allen vier Zuständen, gedreht (600×1024) und zurück alles im Bild, `scrollHeight` 600 (`bilder/O2b-grenz-1024x600-rueckfrage.png`). Bestanden.
2. **740×360 und 667×375, Touch (Android quer, iPhone SE quer, TF-APP-017).** 740×360: alle Knöpfe in jedem Zustand im Bild (Rückfrage-Seite 381 px hoch, Knöpfe innerhalb). 667×375: alle Knöpfe im Bild, nur der Rahmen der Rückfrage reicht bis 389 px. Bestanden mit dieser Einschränkung.
3. **568×320, Touch (kleinstes verbreitetes Querformat, TF-APP-018, `bilder/O2b-grenz-568x320-partie.png`, `-rueckfrage.png`).** Mit Partie liegt „Neue Partie“ bei 295..339 (unter 320), „Laufende Partie: 1 Gegner, Erweiterung aus“ bricht auf fünf Zeilen. Mit Rückfrage scrollt die Seite: „Weiterspielen“ -45..-1, Rückfrage 185..334, „Abbrechen“ bricht mitten im Wort als „Abbreche / n“ um, „KI-Gegner“ im Untertitel ebenfalls getrennt. Leer und mit unlesbarem Stand alles im Bild. Das Fenster ist kleiner als jede Klasse; ob es unterstützt werden muss, entscheidet der Autor (Lauf „unklar“, Hinweis 1).
4. **Drehen in beide Richtungen und zurück** in allen fünf Klassen und bei 568×320, 667×375, 740×360, 1024×600: Die Rückfrage bleibt offen, der Fokus bleibt auf „Abbrechen“. Nach 667×375 → 375×667 → 667×375 liegt die zuvor angeschnittene Rückfrage ganz im Bild (das `scrollIntoView` wirkt). Bestanden.
5. **Schalter unter dem Bildrand** (Gegenprobe d, TF-PRUEF-025): Mangel 1.
6. **Entwurf und Lobby im selben Testhook-Build.** `/dev/entwurf/lobby` öffnen, dann ohne Neuladen auf `/` wechseln (`history.pushState` und `schlangentanz:adresswechsel`): Die Regeln `.schalter` und `.schalter::before` aus `src/entwicklung/entwurf/lobby.css` gelten dann auch für das Label der echten Lobby (berechnet: `padding 0 12px 0 4px`, `background rgb(241,231,214)`, `border-radius 999px`, ein zweiter 32-px-Kreis). Nur im Testhook-Build und nur nach diesem Weg; Hinweis 3.

## Testregister

Bereiche APP und PRUEF (bestehend); `ohne_bereich.py` meldet keine Datei ohne Bereich. TF-APP-008 und TF-APP-016 nachgezogen: TF-APP-008 erwartet jetzt „Seite 390 px hoch, alles im Bild“ statt „623 px, scrollt“, beide `art: beides` mit `skript: tests/layout/lobby.spec.ts`. Neu: TF-APP-017 und TF-APP-018 (Grenzfälle von TF-APP-003, dort unter „Nicht abgedeckte Grenzfälle“ verlinkt) und TF-PRUEF-025. Die drei neuen Testfälle und die geänderten Abschnitte von TF-APP-008 mit `pruefe_muster.py` des Humanizers geprüft: keine Befunde.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-APP-002 | K1 in fünf Klassen | `2026-11-13-1611-TF-APP-002`, `-2` bis `-5` | bestanden |
| TF-APP-003 | K2 Rückfrage in fünf Klassen | `2026-11-13-1611-TF-APP-003`, `-2` bis `-5` | bestanden |
| TF-APP-004 | Vor/Zurück | `2026-11-13-1611-TF-APP-004` | bestanden |
| TF-APP-005 | Startfehler | `2026-11-13-1611-TF-APP-005` | bestanden |
| TF-APP-006 | keine Partie im Hintergrund | `2026-11-13-1611-TF-APP-006` | bestanden |
| TF-APP-007 | unlesbarer Stand, Handy quer | `2026-11-13-1611-TF-APP-007` | bestanden |
| TF-APP-008 | Handy quer mit Rückfrage ohne Scrollen | `2026-11-13-1611-TF-APP-008` | bestanden |
| TF-APP-016 | Drehen bei offener Rückfrage | `2026-11-13-1611-TF-APP-016` | bestanden |
| TF-APP-017 | 1024×600, 740×360, 667×375 | `2026-11-13-1611-TF-APP-017` | bestanden |
| TF-APP-018 | 568×320 | `2026-11-13-1611-TF-APP-018` | unklar |
| TF-PRUEF-025 | Wächter misst Labels versteckter Felder | `2026-11-13-1611-TF-PRUEF-025` | fehlgeschlagen |

`python scripts/tagebuch_bauen.py`: 355 Dateien geschrieben, Exit 0.

## Hinweise (kein Mangel)

1. **Kleine Querformate.** Bei 568×320 passt die Lobby mit Partie oder Rückfrage nicht, und „Abbrechen“ bricht mitten im Wort um; bei 667×375 reicht der Rahmen der Rückfrage 14 px unter den Rand. Ein echtes iPhone quer hat wegen der Browserleisten oft noch weniger Höhe als diese Masse; bei 667×340 liegen „Weiterspielen“ (-1..43) und die Rückfrage (206..354) teilweise ausserhalb. Ob eine kleinere Klasse oder eine Mindesthöhe gelten soll, entscheidet der Orchestrator mit dem Autor.
2. **`scrollIntoView` beim Drehen** ist nur durch `Lobby.drehen.test.tsx` belegt; in den fünf Klassen passt die Rückfrage ohnehin, der Layout-Vertrag bleibt ohne den Listener grün (Gegenprobe c). Dazu misst die `alleVertraege()`-Gruppe von TF-APP-016 direkt nach `setViewportSize`; in Gegenprobe a sah der Wächter die Rückfrage noch ungescrollt, während `toBeInViewport` (mit Warten) sie schon fast im Bild fand. Solange keine Klasse das Nachholen braucht, ist das folgenlos.
3. **Gleichnamige Klasse `.schalter`** in `src/ui/lobby/lobby-seite.css` und `src/entwicklung/entwurf/lobby.css` (Grenzfall 6). Nur im Testhook-Build sichtbar; ein eigener Klassenname (`lobby__schalter`) würde es vermeiden.
4. **Antipp-Leuchten.** Chromium zeigt beim Antippen eines Labels die Standardfarbe `-webkit-tap-highlight-color: rgba(51,181,229,0.4)`; auf `O2b-gewaehlt-handy-hochkant.png` färbt sie die Schalterzeile kurz hellblau und den grünen Schalter türkis. Flüchtig, aber nicht in der Palette.
5. **Schalter als Kästchen.** DESIGN.md beschreibt den Schalter als `role="switch"` und die Segmente als Knöpfe mit `aria-pressed`; die Lobby nutzt bewusst weiter Radio und Kästchen (Commit-Body), damit Pfeiltasten, Namen und O2-Tests gelten. Für Bildschirmleser heisst er damit „Kontrollkästchen Mit Erweiterung“. Vertretbar; DESIGN.md oder die Lobby sollte das angleichen.
6. **Fokusreihenfolge.** Im Querformat steht „Regeln“ links unter dem Titel, ist in der Tab-Reihe aber das letzte Element nach „Neue Partie“ (DOM-Reihenfolge des Rahmens). Bedienbar, aber nicht in Lesereihenfolge.
7. **„Mit Erweiterung … Aus“** liest sich etwas doppelt; der Entwurf schreibt „Erweiterung“ mit Erklärsatz. Textfrage, kein Layout.
8. Der Vergleichslauf auf der Basis `414e39c` hatte unter fremder Last 6 rote P0.4-Verträge (`handy-hochkant-testhooks`, Zeitüberschreitung beim Öffnen von `/dev`). Das betrifft den Stand vor O2b.
