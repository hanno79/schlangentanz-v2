# Prüfprotokoll PROBE-1 – Geräteklasse anzeigen

| Feld | Wert |
|---|---|
| Task | PROBE-1 Geräteklasse anzeigen (Übungstask, `docs/abnahme/probe/PROBE-1.md`, kein Dart-Task) |
| Branch | `probe/PROBE-1-geraeteklasse`, kein PR (Probe-Task); Basis `origin/task/P0.3-pruefwerkzeuge` statt `neuaufbau` |
| Geprüfter Stand | `59a50e2` (Basis `22ced4b` aus `git merge-base origin/task/P0.3-pruefwerkzeuge HEAD`, `origin/task/P0.3-pruefwerkzeuge` steht auf `22ced4b`) |
| Prüfer | Claude Code als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | 1 |
| Datum | 13.11.2026 |
| Umgebung | Windows 11 Pro 10.0.26300, Node v25.2.1, npm 11.5.2, Python 3.13.15, Playwright 1.60.0 (Chromium 148.0.7778.96, ohne `PW_CHROMIUM_PFAD`) |

Vorbereitung: Lokaler Branch `pruefung-probe-1` auf `origin/probe/PROBE-1-geraeteklasse`. `git ls-files --eol | grep -c w/crlf` ergab vorher 558, nach `git ls-files -z | xargs -0 rm -f` und `git checkout -- .` 0. `core.hooksPath` steht auf `scripts/githooks`. `npm ci` Exit 0. Die Gates liefen in Git Bash, Exit-Code je Befehl mit `echo $?` gelesen.

## Urteil: ABGENOMMEN

Alle sechs Abnahmekriterien sind erfüllt, alle Gates enden mit 0, der erste Commit enthält nur die Testdatei und ist dort rot, alle vier Dateien stehen im Feld „Dateien“, beide Gegenproben wurden rot. Keine Mängel; Hinweise ohne Einfluss auf das Urteil stehen am Ende.

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Task) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | `geraeteklasseFuer(breite)` liefert für 599 „Handy“, für 600 und 1024 „Tablet“ und für 1025 „Desktop“; je ein Test. | ja | `src/probe/geraeteklasse.test.tsx` › `PROBE-1: 599 px ist Handy`, `600 px ist Tablet`, `1024 px ist Tablet`, `1025 px ist Desktop`, alle grün; Gegenprobe rot |
| 2 | `/probe` zeigt „Geräteklasse: Desktop“ und „Touch: nein“ bei 1280×900, „Geräteklasse: Tablet“ und „Touch: ja“ bei 1024×768 mit Touch, „Geräteklasse: Handy“ und „Touch: ja“ bei 390×844 mit Touch, jeweils im Produktionsbuild. | ja | `bilder/PROBE-1-probe-desktop.png`, `-tablet.png`, `-handy.png`, Produktionsbuild auf :4173 |
| 3 | Ändert sich die Fensterbreite, passt sich die Anzeige ohne Neuladen an. | ja | Playwright `setViewportSize` 1025→1024→600→599→320→1280, Zähler blieb auf 1; Test `passt sich an, wenn sich die Fensterbreite ändert`; Gegenprobe 2 rot |
| 4 | Der Knopf „Neu messen“ zählt mit, wie oft er gedrückt wurde („Messungen: 2“ nach zwei Tipps), mit Maus und mit Touch. | ja | Maus: eingebauter Browser, zwei Klicks → „Messungen: 2“; Touch: Playwright `tap()` → `bilder/PROBE-1-zwei-tipps-tablet.png`, `-handy.png` |
| 5 | Alle anderen Adressen zeigen die App unverändert; `/` zeigt die Lobby. | ja | `bilder/PROBE-1-lobby-*.png`; `/game` zeigt den Spieltisch; Diff von `src/main.tsx` ist nur die Weiche; Layout-Vertrag `lobby_erstbild.spec.ts` grün |
| 6 | Alle Gates aus Plan 3.5 sind grün, `npm run test:layout` eingeschlossen. | ja | alle neun Befehle einzeln Exit 0, siehe „Gates“ |

### 1. `geraeteklasseFuer` an den Grenzen

`npx vitest run tests/architektur.test.ts src/probe/geraeteklasse.test.tsx --reporter=verbose` zeigt sechs grüne Tests der Funktion: `PROBE-1: 390 px ist Handy`, `599 px ist Handy`, `600 px ist Tablet`, `1024 px ist Tablet`, `1025 px ist Desktop`, `1280 px ist Desktop`. Die vier verlangten Werte haben je einen eigenen Test (`it.each`). Der Code in `src/probe/geraeteklasse.ts` setzt die Festlegung mit `breite < 600` → Handy und `breite <= 1024` → Tablet um. Die Gegenprobe (`<` → `<=`) macht `600 px ist Tablet` rot, die Grenze ist also festgehalten.

### 2. Anzeige in drei Geräteklassen

Produktionsbuild (`npm run build`, Exit 0), Server `npm run preview -- --port 4173 --strictPort`, Adresse `http://localhost:4173/probe`. `node scripts/pruefung/bildschirmfotos.mjs http://localhost:4173/probe --name PROBE-1-probe --ziel <scratchpad> --warte-auf main` Exit 0:

```
Desktop 1280×900: … (1280×900 px), Touch aus, pointer: coarse nein, Konsolenfehler: 0
Tablet quer 1024×768, Touch: … (1024×768 px), Touch an, pointer: coarse ja, Konsolenfehler: 0
Handy hochkant 390×844, Touch: … (390×844 px), Touch an, pointer: coarse ja, Konsolenfehler: 0
```

Die Bilder zeigen „Desktop/nein“, „Tablet/ja“ und „Handy/ja“ (Beschreibung unter „Browserprüfung“). Dieselben Werte las ich mit Playwright aus `main.innerText()` und im eingebauten Browser mit `get_page_text` (Desktop) ab.

### 3. Anpassung ohne Neuladen

Playwright, Desktop-Kontext, einmal „Neu messen“ geklickt (Zähler 1), dann `setViewportSize` ohne Neuladen:

```
[grenze 1025] Geräteklasse: Desktop | Touch: nein | Breite: 1025 px | Messungen: 1
[grenze 1024] Geräteklasse: Tablet  | Touch: nein | Breite: 1024 px | Messungen: 1
[grenze 600]  Geräteklasse: Tablet  | Touch: nein | Breite: 600 px  | Messungen: 1
[grenze 599]  Geräteklasse: Handy   | Touch: nein | Breite: 599 px  | Messungen: 1
[grenze 320]  Geräteklasse: Handy   | Touch: nein | Breite: 320 px  | Messungen: 1
[grenze 1280] Geräteklasse: Desktop | Touch: nein | Breite: 1280 px | Messungen: 1
[nach Neuladen] Geräteklasse: Desktop | … | Messungen: 0
```

Der Zähler bleibt beim Ändern der Breite auf 1 und fällt erst beim Neuladen auf 0; die Seite wurde also nicht neu geladen. Auch im eingebauten Browser wechselte die Anzeige nach `resize_window` 800×900 auf „Tablet, Breite: 800 px“ bei weiter „Messungen: 2“. Unit-Test `PROBE-1: passt sich an, wenn sich die Fensterbreite ändert` grün; ohne den `resize`-Listener wird er rot (Gegenprobe 2).

### 4. Zähler mit Maus und Touch

Maus: eingebauter Browser der Desktop-App, `resize_window` 1280×900, `/probe` geöffnet, zweimal `left_click` auf den Knopf „Neu messen“ (ref aus `find`), danach `get_page_text`: „Messungen: 2“, übrige Werte unverändert (Desktop, nein, 1280 px). Touch: Playwright mit `kontextOptionen(tablet)` und `kontextOptionen(handy)`, je zweimal `getByRole('button', { name: 'Neu messen' }).tap()`: in beiden Kontexten „Messungen: 0“ nach dem Laden und „Messungen: 2“ nach den zwei Tipps, 0 Konsolenfehler.

### 5. Andere Adressen

`src/main.tsx` ändert nur die Zeile `{window.location.pathname === '/probe' ? <ProbeSeite /> : <App />}` und den Import; `App.tsx` ist nicht berührt. Im Browser: `/` zeigt in allen drei Klassen die Lobby (Bilder `PROBE-1-lobby-*.png`), `/game` den Spieltisch („Phase“, „Karten ausspielen“, „MÖGLICHE AKTIONEN“). Der Layout-Vertrag `lobby_erstbild.spec.ts` lief in `npm run test:layout` grün. Adressen, die `/probe` nur ähneln, siehe Grenzfall 3.

### 6. Gates

Siehe nächster Abschnitt; alle neun Befehle Exit 0.

## Gates

Jeder Befehl einzeln, Exit-Code einzeln gelesen (Git Bash `echo $?`, Ausgabe in eine Datei umgeleitet, nicht gepipt):

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | 0 | Test Files 84 passed (84), Tests 767 passed (767); Architekturtest: `U4: 17 Dateien unter src/engine …`, `U3: 0 Dateien unter src/ui und src/ki …`, `U5: 0 Dateien unter src/ki …` |
| `npm run typecheck` | 0 | `tsc -b` ohne Meldung |
| `npm run build` | 0 | `dist/assets/index-B7XOEga-.js 325.89 kB`, `✓ built in 612ms` |
| `npm run check:test-lines` | 0 | Alle Testdateien bleiben unter 500 Zeilen. |
| `npm run check:css-asserts` | 0 | CSS-Quelltext-Assertions: 1 in 1 Dateien (Baseline gehalten). |
| `npm run check:regeln` | 0 | 171 Dateien geprüft (U6); U1 50 Regeltestdateien/466 Namen; U7 90 Testdateien; Ausnahmen U1 48/464, U6 2/2, U7 0/0; keine Verstösse. `scripts/check_regeln_ausnahmen.json` ist im Diff nicht geändert. |
| `npx eslint .` | 0 | keine Ausgabe |
| `python scripts/regelcheck.py` | 0 | 13 Warnungen (Dateilängen in Altbestand, z. B. `src/engine/legalActions.ts` 1279 Zeilen), keine Fehler |
| `npm run test:layout` | 0 | 62 passed, 1 skipped (`brett_waechter.spec.ts:66` „höchstens 90 Elemente“, im Vertrag bedingt per `test.skip`, Altbestand) |

Ports vor `test:layout`: `netstat -ano | grep -E ':417[34] '` zeigte über hundert Zeilen, alle im Zustand `WARTEND` (TIME_WAIT) von früheren Läufen, keine im Zustand `ABHÖREN`. Mit `… | grep -v WARTEND` keine Ausgabe, die Ports waren also frei; Playwright startete beide Server ohne „already used“.

## Erster Commit

`git log --oneline --reverse origin/task/P0.3-pruefwerkzeuge..HEAD`:

```
722eb22 test: PROBE-1 verlangt die Anzeige der Geräteklasse
c033f50 feat: PROBE-1 zeigt unter /probe die Geräteklasse
59a50e2 fix: PROBE-1 bleibt auf dem App-Hintergrund lesbar
```

Erster Commit ist `722eb22`. `git show --stat 722eb22`: nur `src/probe/geraeteklasse.test.tsx | 62 +++`, also nur eine Testdatei. Auf `git switch --detach 722eb22` lieferte `npx vitest run src/probe/geraeteklasse.test.tsx` Exit 1:

```
FAIL  src/probe/geraeteklasse.test.tsx
Error: Failed to resolve import "./ProbeSeite" from "src/probe/geraeteklasse.test.tsx". Does the file exist?
Test Files  1 failed (1)
     Tests  no tests
```

Rot, weil das Modul fehlt, nicht wegen eines Tippfehlers im Test. `git diff 722eb22 HEAD -- src/probe/geraeteklasse.test.tsx` ist leer: Die Tests wurden später nicht geändert, also auch nicht geschwächt.

## Diff gegen das Feld „Dateien“

`git diff --stat origin/task/P0.3-pruefwerkzeuge...HEAD`:

```
 src/main.tsx                     |  3 +-
 src/probe/ProbeSeite.tsx         | 48 +++++++++++++++++++++++++++++++
 src/probe/geraeteklasse.test.tsx | 62 ++++++++++++++++++++++++++++++++++++++++
 src/probe/geraeteklasse.ts       | 14 +++++++++
 4 files changed, 126 insertions(+), 1 deletion(-)
```

| Datei | im Feld | Urteil |
|---|---|---|
| `src/main.tsx` | ja | Weiche auf `/probe`, sonst `<App />` |
| `src/probe/ProbeSeite.tsx` | ja | Seite mit Messung, `resize`-Listener und Zähler |
| `src/probe/geraeteklasse.test.tsx` | ja | Tests |
| `src/probe/geraeteklasse.ts` | ja | Grenzen 600 und 1024 als Konstanten |

U10: `package.json` und `package-lock.json` nicht im Diff, keine neue Abhängigkeit. U13: keine der vier geschützten Dateien im Diff. U9: Bezeichner und Kommentare deutsch; `geraeteklasse.ts` beginnt mit einer Zeile zum Zweck der Datei, ohne Author, Datum oder Version; keine `// ÄNDERUNG`-Kommentare. U11: kleine, eigenständige Dateien ohne Hinweis auf Altprojekte. U2: Der Task berührt keine Spielregel. U3: Die Probe-Seite importiert nichts aus `src/engine`.

## Gegenprobe

1. `src/probe/geraeteklasse.ts`, Zeile 11: `if (breite < TABLET_AB) return 'Handy'` → `if (breite <= TABLET_AB) return 'Handy'`. `npx vitest run src/probe/geraeteklasse.test.tsx` Exit 1: `× PROBE-1: 600 px ist Tablet` mit `AssertionError: expected 'Handy' to be 'Tablet'`, Tests 1 failed | 8 passed. Mit `git checkout -- src/probe/geraeteklasse.ts` wiederhergestellt, `git status --short` leer.
2. `src/probe/ProbeSeite.tsx`, Zeile 15: `window.addEventListener('resize', beiGroessenaenderung)` → `void beiGroessenaenderung` (Listener entfernt). Derselbe Befehl Exit 1: `× PROBE-1: passt sich an, wenn sich die Fensterbreite ändert` mit `Unable to find an element with the text: Geräteklasse: Tablet`. Mit `git checkout -- src/probe/ProbeSeite.tsx` wiederhergestellt, `git status --short` leer.

## Browserprüfung

Produktionsbuild aus diesem Worktree auf Port 4173 (`npm run preview -- --port 4173 --strictPort`, vorher Ports frei), Adresse `http://localhost:4173/probe` und für Kriterium 5 `/` und `/game`. Kein Testhook-Build nötig, weil der Task keinen Testhook nutzt. Fotos mit `scripts/pruefung/bildschirmfotos.mjs` zuerst in den Scratchpad, nach den Testregister-Läufen nach `docs/abnahme/bilder/` kopiert. Desktop mit der Maus im eingebauten Browser der Desktop-App, Tablet und Handy mit Touch über Playwright (`kontextOptionen` aus `scripts/pruefung/geraeteklassen.mjs`, `tap()`).

### Desktop 1280×900 – `bilder/PROBE-1-probe-desktop.png`

Weisser Grund über die ganze Fläche. Oben links gross „Probe-Seite“ in Dunkelgrün, darunter in normaler Schrift „Geräteklasse: Desktop“, „Touch: nein“, „Breite: 1280 px“, dann ein grauer Knopf „Neu messen“ und „Messungen: 0“. Alles links bündig mit Rand, gut lesbar, nichts abgeschnitten oder verdeckt, kein waagrechtes Scrollen. Werte plausibel für ein 1280 px breites Fenster ohne Touch. Bedient mit der Maus im eingebauten Browser: zwei Klicks auf „Neu messen“ ergaben „Messungen: 2“. Konsole: 0 Fehler laut Fotoskript; im eingebauten Browser nur vier Warnungen „Error with Permissions-Policy header: Unrecognized feature …“, die vom Vorschau-Server kommen.

Dazu `bilder/PROBE-1-lobby-desktop.png` (`/`): Lobby wie gewohnt, grüne Kopfleiste „DAS KARTENSPIEL · Schlangentanz · Bereit für deine nächste Schlange“ mit drei Schildern, gelbes Feld „LOBBY CODE XK9-B4Z“, Karte „Bereit im sonnigen Nest“, „Aktive Partie: Du + 1 KI“, vier Plätze (Slippy Host mit „DU“, Orange Crush mit „MUTIG“, zweimal „frei“), unten die drei gelben Knöpfe „Duell starten (1 KI)“, „Waldparty starten (2 KI)“, „Große Runde starten (3 KI)“, alle im Bild.

### Tablet quer 1024×768, Touch – `bilder/PROBE-1-probe-tablet.png`

Gleicher Aufbau, etwas kleinere Überschrift. Texte „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 1024 px“, Knopf „Neu messen“, „Messungen: 0“. Nichts abgeschnitten, lesbar. Plausibel, da 1024 genau die obere Tablet-Grenze ist und Touch an war (`pointer: coarse ja`). Mit Touch bedient: zweimal `tap()` auf „Neu messen“; `bilder/PROBE-1-zwei-tipps-tablet.png` zeigt danach dieselben Werte und „Messungen: 2“. 0 Konsolenfehler.

`bilder/PROBE-1-lobby-tablet.png` (`/`): dieselbe Lobby auf 1024×768, die vier Plätze nebeneinander, die drei Startknöpfe unten vollständig im Bild, nichts überlappt.

### Handy hochkant 390×844, Touch – `bilder/PROBE-1-probe-handy.png`

Schmale Spalte mit „Probe-Seite“ (kleiner gesetzt), „Geräteklasse: Handy“, „Touch: ja“, „Breite: 390 px“, Knopf „Neu messen“, „Messungen: 0“; darunter weisse Fläche. Kein Text umgebrochen oder abgeschnitten, kein waagrechtes Scrollen. Mit Touch bedient: zweimal `tap()`; `bilder/PROBE-1-zwei-tipps-handy.png` zeigt „Messungen: 2“, übrige Werte gleich. 0 Konsolenfehler.

`bilder/PROBE-1-lobby-handy.png` (`/`): Lobby einspaltig, Kopfleiste auf zwei Zeilen umbrochen, „LOBBY CODE XK9-B4Z“, „Bereit im sonnigen Nest“, „Aktive Partie: Du + 1 KI“, darunter Slippy Host mit „DU“ und der Anfang des zweiten Platzes; der Rest liegt unterhalb und wird senkrecht gescrollt. Nichts waagrecht abgeschnitten.

`bilder/PROBE-1-gedreht-handy.png` (Grenzfall 2): Handy gedreht auf 844×390, „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 844 px“, „Messungen: 1“, alles im niedrigen Bild sichtbar.

Server danach beendet: Der Hintergrundprozess wurde gestoppt; sein Kindprozess `node … vite.js preview --port 4173 --strictPort` (PID 52900, Befehlszeile geprüft, aus diesem Worktree) lief weiter und wurde gezielt beendet. Danach zeigte `netstat` keine Zeile im Zustand `ABHÖREN` auf 4173 oder 4174, nur Verbindungsversuche eines fremden Prozesses (`SYN_GESENDET`). Tab im eingebauten Browser geschlossen.

## Satz-für-Satz-Abdeckung

Entfällt, weil kein Engine-Task (der Probe-Task berührt keine Spielregel und keinen Spec-Abschnitt).

## Eigene Grenzfälle

1. **Breite genau auf und neben den Grenzen im echten Browser, ohne Neuladen.** Warum: Die Unit-Tests prüfen nur die reine Funktion; im Browser könnte die Seite die Breite anders messen (Scrollleiste, `innerWidth` gerundet) oder beim Wechsel hängen bleiben. Wie: Playwright `setViewportSize` auf 1025, 1024, 600, 599, 320, 1280 nach einem Klick, dann `reload()`. Ergebnis: Desktop, Tablet, Tablet, Handy, Handy, Desktop; „Breite“ jeweils exakt; Zähler blieb 1, nach Neuladen 0. Bestanden (TF-PROBE-002).
2. **Gerät drehen 390×844 → 844×390 → 390×844 mit Touch.** Warum: Ein gedrehtes Handy ist nach der Festlegung ein Tablet; das ist leicht falsch, wenn Höhe statt Breite oder `screen.width` gelesen würde. Wie: Playwright Handy-Kontext, ein Tipp, dann `setViewportSize`. Ergebnis: Handy → Tablet (844 px, Touch: ja) → Handy, Zähler durchgehend 1, quer nichts abgeschnitten (`bilder/PROBE-1-gedreht-handy.png`). Bestanden (TF-PROBE-003).
3. **Adressen, die `/probe` nur ähneln: `/probe/`, `/PROBE`, `/probe?x=1`.** Warum: Die Weiche vergleicht den Pfad wörtlich. Wie: Playwright Handy-Kontext und eingebauter Browser. Ergebnis: `/probe/` und `/PROBE` zeigen die Lobby, nicht die Probe-Seite; `/probe?x=1` zeigt die Probe-Seite (der Suchteil gehört nicht zum Pfad). Das widerspricht keinem Kriterium (Kriterium 5 verlangt für alle anderen Adressen die App), steht aber als Hinweis unten (TF-APP-002).
4. **Zweimal hintereinander und Neuladen.** Die zwei Drücke aus Kriterium 4 sind „zweimal hintereinander“; Neuladen setzt den Zähler auf 0 zurück und die Messung wird neu gemacht (siehe Grenzfall 1). Kein eigener Testfall, in TF-PROBE-002 enthalten.

## Testregister

`src/probe/**` fiel in keinen Bereich. Ich habe in `tagebuch/tests/bereiche.md` den Bereich `PROBE` mit dem Muster `src/probe/**` ergänzt; **Vorschlag an den Orchestrator**, da der Probe-Branch nie gemergt wird, bleibt er nur hier. `src/main.tsx` gehört zum bestehenden Bereich `APP`.

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| TF-PROBE-001 | `/probe` in drei Geräteklassen, Zähler mit Maus und Touch (Kriterien 2 und 4) | `2026-11-13-0906-TF-PROBE-001` | bestanden |
| TF-PROBE-002 | Grenzfall: Breiten 1025/1024/600/599/320/1280 ohne Neuladen, dann Neuladen (Kriterium 3) | `2026-11-13-0907-TF-PROBE-002` | bestanden |
| TF-PROBE-003 | Grenzfall: Handy drehen | `2026-11-13-0907-TF-PROBE-003` | bestanden |
| TF-APP-001 | `/` zeigt Lobby, `/game` Spiel (Kriterium 5) | `2026-11-13-0907-TF-APP-001` | bestanden |
| TF-APP-002 | Grenzfall: `/probe/` und `/PROBE` zeigen die App | `2026-11-13-0907-TF-APP-002` | bestanden |

Alle Läufe mit `python scripts/testregister_lauf.py` auf `59a50e2` geschrieben, ohne `sauber: nein` (ausserhalb von `tagebuch/` war zu dem Zeitpunkt nichts geändert). `python scripts/tagebuch_bauen.py` Exit 0, 40 Dateien geschrieben.

## Hinweise (kein Mangel)

1. **Schrägstrich am Ende.** `/probe/` zeigt die App statt der Probe-Seite, weil `src/main.tsx` den Pfad wörtlich mit `/probe` vergleicht. Nach Kriterium 5 korrekt, für einen Menschen aber überraschend.
2. **Vercel.** `vercel.json` schreibt nur `/game` und `/game/:path*` auf `index.html` um. Auf einer Vercel-Vorschau würde ein direkter Aufruf von `/probe` deshalb vermutlich 404 liefern. Nicht geprüft, weil der Task nur den lokalen Produktionsbuild verlangt und Deployments nicht zum Prüfauftrag gehören.
3. **Textfarbe.** `ProbeSeite` setzt `color: '#1a1a1a'` auf `<main>`, die Überschrift und die Zeilen erscheinen aber dunkelgrün; offenbar setzen die globalen Stile der App die Farbe direkt auf `h1` und `p`. Auf Weiss trotzdem gut lesbar.
4. **Layout-Verträge.** `npm run test:layout` misst `/probe` nicht; Kriterium 6 verlangt nur, dass das Gate grün ist. Die Messung der Probe-Seite steht in diesem Protokoll und im Testregister.
5. **Eingebauter Browser.** Direkt nach `resize_window` las `get_page_text` zweimal noch den alten Wert (bei 1024 noch „1025 px“, bei 599 noch „600 px“). Playwright mit `setViewportSize` lieferte jedes Mal genau den eingestellten Wert. Ich halte das für eine Verzögerung der Fensteremulation des Werkzeugs, nicht für einen Fehler der Seite; für Grenzwerte habe ich mich deshalb auf Playwright gestützt.
6. **Humanizer.** Die neuen Testfälle habe ich selbst auf Alltagssprache durchgesehen, den Skill `/baseline:humanizer` aus dem Testregister-Block der `AGENTS.md` aber nicht aufgerufen.
