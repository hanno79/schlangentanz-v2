# Anleitung für Umsetzer

Du baust einen Task des Umsetzungsplans. Danach nimmt ihn ein Prüfer ab, der
nur die Task-ID, den Branch und `docs/abnahme/PRUEFER_ANLEITUNG.md` bekommt.
Was er dort prüft, prüfst du vorher selbst. Verbindlich sind `AGENTS.md`
(besonders „Abweichungen vom Kern“) und `docs/UMSETZUNGSPLAN.md`; diese
Anleitung fasst den Ablauf aus Plan 3.3 bis 3.7 zusammen und erklärt die
Prüfwerkzeuge.

## 1. Lesen

`AGENTS.md`, im Plan die Abschnitte 2 und 3 und den Block deines Tasks
(Abschnitte 4 bis 8, Überschrift mit der Task-ID), dazu `docs/GAME_SPEC.md`,
soweit der Task Regeln berührt. Regelquelle ist allein die Website, gespiegelt
in Teil A, ergänzt durch Teil B und D. Fehlt dort eine Regel, die du brauchst:
anhalten und berichten, nicht raten (U2).

## 2. Vorbereitung im Worktree

```bash
git fetch origin
git switch -c task/<ID>-<kurzname> origin/neuaufbau
git ls-files --eol | grep -c w/crlf      # > 0: erst git ls-files -z | xargs -0 rm -f, dann git checkout -- .
git config --get core.hooksPath          # muss scripts/githooks zeigen
npm ci
```

Jede Zeile ist ein eigener Aufruf. Lehnt deine Umgebung einen verketteten
git-Befehl ab (mit `&&`, `|` oder `;`), führst du die Teile einzeln aus; geht
die Pipe nicht, schreibst du die Liste erst in eine Datei
(`git ls-files > <scratchpad>/dateien.txt`).

Andere Umsetzer und Prüfer arbeiten gleichzeitig. Fass nur die Dateien deines
Tasks an, benutze `git stash` nicht ohne eigenen Namen, und beende keine
fremden Prozesse. Im gemeinsamen Scratchpad legst du einen eigenen
Unterordner an (`<ID>-umsetzer/`); dorthin gehen Logs, Fotos und kleine
Skripte. Er heisst unten `<scratchpad>`.

## 3. Ablauf

1. **Erster Commit nur Tests, dort rot.** Tests schreiben, ausführen, rot
   sehen, dann committen (`test: …`). Der Prüfer checkt diesen Commit aus und
   führt die Tests aus; sie müssen fehlschlagen, weil das Verhalten fehlt.
   Testnamen nennen den Spec-Abschnitt (`A5: …`, `D12: …`) oder die Task-ID
   (`P0.3: …`). Für Regeltests unter `src/engine/` ist der Spec-Abschnitt
   Pflicht (U1), und jedes Beispiel der Website ist ein Test.
2. **Umsetzung** im Feld „Dateien“. Jede Datei ausserhalb begründest du im PR.
3. **`/simplify`** einmal laufen lassen, Befunde einarbeiten oder begründet
   ablehnen.
4. **Gates** (unten), jedes einzeln mit Exit-Code.
5. **Codex-Review** bei Engine- und KI-Tasks (Plan 3.3, Schritt 5).
6. **Selbst im Browser ansehen**, was du gebaut hast (unten).
7. **Push und PR gegen `neuaufbau`** (unten).

## 4. Gates

Jeder Befehl allein, danach den Exit-Code lesen (Git Bash `echo $?`,
PowerShell `$LASTEXITCODE`). Die Ausgabe schreibst du beim Lauf mit `tee` in
deinen Ordner; hinter dem `|` liest du in Git Bash `${PIPESTATUS[0]}`, sonst
bekommst du den Exit-Code von `tee`:

```bash
npm test -- --run 2>&1 | tee <scratchpad>/npm-test.log; echo "exit ${PIPESTATUS[0]}"
npm run typecheck 2>&1 | tee <scratchpad>/typecheck.log; echo "exit ${PIPESTATUS[0]}"
npm run build 2>&1 | tee <scratchpad>/build.log; echo "exit ${PIPESTATUS[0]}"
npm run check:test-lines 2>&1 | tee <scratchpad>/test-lines.log; echo "exit ${PIPESTATUS[0]}"
npm run check:css-asserts 2>&1 | tee <scratchpad>/css-asserts.log; echo "exit ${PIPESTATUS[0]}"
npm run check:regeln 2>&1 | tee <scratchpad>/regeln.log; echo "exit ${PIPESTATUS[0]}"
npx eslint . 2>&1 | tee <scratchpad>/eslint.log; echo "exit ${PIPESTATUS[0]}"
python scripts/regelcheck.py 2>&1 | tee <scratchpad>/regelcheck.log; echo "exit ${PIPESTATUS[0]}"
npm run test:layout 2>&1 | tee <scratchpad>/layout.log; echo "exit ${PIPESTATUS[0]}"   # bei Oberflächen-Tasks und Änderungen an tests/layout/ oder playwright.config.ts
```

Im Hauptordner des Repos liegen unter `.claude/worktrees/` vollständige Kopien
(die Worktrees der Agenten). Kein Gate erfasst sie: Vitest sucht nur unter
`src/` und `tests/`, ESLint schliesst `.claude/` aus, `check:regeln`, `check:test-lines` und `check:css-asserts`
lesen nur `src/`, `tests/`, `scripts/` und den Wurzelordner, `regelcheck.py`
nur, was git kennt (`tests/claude_ordner.test.ts` hält das fest).

**`npm run check:regeln`** (`scripts/check_regeln.mjs`) prüft:

| Regel | Was | Wo |
|---|---|---|
| U1 | Testname oder umgebendes `describe` nennt einen Spec-Abschnitt (`A…`, `B…`, `D…`, etwa `A7.4`) | Testdateien unter `src/engine/` |
| U6 | kein `any`, keine Direktive `@ts-ignore` oder `@ts-nocheck`, `eslint-disable` nur mit `-- Grund` in derselben Zeile, kein `skip`, `skipIf`, `runIf`, `only`, `todo`, `fixme` an `it`, `test`, `describe` | alle Code-Dateien unter `src/`, `tests/`, `scripts/` und im Wurzelordner |
| U7 | Testdateien höchstens 499 Zeilen; andere Dateien unter `src/ui/` und `src/ki/` (Code und CSS) höchstens 300 | |

Der Altbestand steht in `scripts/check_regeln_ausnahmen.json`, je Regel und
Datei jeder geduldete Verstoss mit einem Merkmal: bei U1 der volle Testname
(`describe › it`), bei U4 und U6 der Inhalt der Zeile mit zusammengezogenem
Leerraum, bei U7 die Art der Grenze. Geduldet ist genau diese Liste:

- Ein Verstoss ohne passendes Merkmal ist rot, auch wenn du dafür einen alten
  behoben hast. Änderst du eine gelistete Zeile, behebst du ihren Verstoss.
- Die Liste darf nur schrumpfen. `check:regeln` vergleicht sie mit ihrer Fassung
  auf der Merge-Basis von `HEAD` und `origin/neuaufbau`; eine neue Datei, eine
  neue Regel oder ein neues Merkmal ist rot („wächst gegenüber …“). Du trägst
  also nie etwas ein.
- Löschst oder ersetzt du alte Tests, meldet `check:regeln` die Merkmale als
  veraltet; dann `npm run check:regeln -- --ausnahmen-schrumpfen` und die
  geänderte Liste mit committen. Der Schalter löscht nur, er fügt nie etwas
  hinzu. Die Merkmale unter `U4` pflegt er nicht; die löschst du von Hand, wenn
  der Architekturtest sie als veraltet meldet.
- Endet `check:regeln` mit 2 und „lässt sich nicht … vergleichen“, fehlt
  `origin/neuaufbau`: `git fetch origin` und noch einmal. Einen anderen
  Vergleichsstand nennst du mit `-- --vergleich <ref>`; `--ohne-vergleich` ist
  nur für Probe-Bäume ohne git gedacht und schreibt das in die Ausgabe.

**Der Architekturtest** `tests/architektur.test.ts` läuft in `npm test`:

- **U3:** Dateien unter `src/ui/` und `src/ki/` (ohne Tests) importieren aus
  der Engine nur `src/engine/index.ts`, auch keine Typen an ihr vorbei.
- **U4:** Dateien unter `src/engine/` (ohne Tests) nutzen kein React, kein DOM
  (`window`, `document`, `localStorage` …), kein `Math.random`, keinen
  `crypto`-Zufall und kein `Date` (auch nicht `new Date` oder `Date.now()`).
  Zufall kommt als Parameter. Der Test erkennt auch die Umwege:
  `Math['random']`, `globalThis.Math.random()`, `window.Math.random()`,
  `const { random } = Math`, einen berechneten Schlüssel an `Math` und `Math`
  als weitergereichten Wert; ebenso `globalThis.Date` und `import()` oder
  `require()` mit einem berechneten Modulnamen.
  Altbestand: Schlüssel `U4` in `scripts/check_regeln_ausnahmen.json`, je
  Verstoss mit dem Inhalt seiner Zeile; darf nur schrumpfen und wird von Hand
  gekürzt (E1 löscht den Eintrag für `src/engine/state.ts`); ein veraltetes
  Merkmal meldet der Test.
- **U5:** Unter `src/ki/` liest nur `src/ki/sicht.ts` den vollen Zustand
  (Typ `Spielzustand`, Konstante `VOLLER_ZUSTAND_TYP`). Andere Dateien dürfen
  ihn entgegennehmen und an die Engine oder an `sicht.ts` weiterreichen, aber
  keine Eigenschaft lesen, ihn nicht zerlegen und nicht spreizen. Benennt E1
  den Typ um, ziehst du `VOLLER_ZUSTAND_TYP` nach; der Test meldet es.

Die Testnamen nennen, wie viele Dateien geprüft wurden. Solange `src/ui/` und
`src/ki/` leer sind, steht dort 0, und der Lauf warnt darüber.

**Ports 4173 und 4174.** `npm run test:layout` startet zwei Server auf festen
Ports: 4173 Produktionsbuild, 4174 Testhook-Build. Antwortet dort schon etwas,
bricht Playwright ab.

1. Vorher prüfen. Belegt ist ein Port nur bei einem lauschenden Socket, Status
   `LISTENING` (deutsches Windows: `ABHÖREN`). `TIME_WAIT` (`WARTEND`) und
   `ESTABLISHED` (`HERGESTELLT`) ignorierst du.

   ```bash
   netstat -ano | grep -E ':417[34] ' | grep -E 'LISTENING|ABH'
   ```

   PowerShell: `Get-NetTCPConnection -LocalPort 4173,4174 -State Listen -ErrorAction SilentlyContinue`.
   Ohne Ausgabe sind beide frei.
2. Belegt heisst meist: ein anderer Agent läuft. Ein paar Minuten warten und
   erneut versuchen, nie fremde Prozesse beenden.
3. Eigene Server danach beenden. Unter Windows überlebt der Node-Kindprozess
   (`vite preview`) oft, wenn `npm` oder die Hintergrundaufgabe endet. Dann:
   PID aus der letzten Spalte von `netstat` (PowerShell: `OwningProcess`),
   Befehlszeile lesen mit
   `Get-CimInstance Win32_Process -Filter "ProcessId=<PID>" | Select-Object ProcessId, CommandLine`
   (aus Git Bash: `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=<PID>').CommandLine"`).
   Steht dort der Pfad deines Worktrees, beendest du ihn mit
   `Stop-Process -Id <PID>`; sonst gehört er einem anderen, und du wartest.
   Danach die Portprüfung wiederholen.

## 5. Playwright und Geräteklassen

`scripts/pruefung/geraeteklassen.mjs` ist die einzige Quelle für die drei
Geräteklassen: `desktop` 1280×900, `tablet` 1024×768 mit Touch, `handy`
390×844 mit Touch. `playwright.config.ts` baut daraus je Klasse zwei Projekte:
`<klasse>` gegen den Produktionsbuild (alle Verträge ausser `*.hooks.spec.ts`)
und `<klasse>-testhooks` gegen den Testhook-Build (nur `*.hooks.spec.ts`).

- Neue Verträge unter `tests/layout/` laufen in allen drei Klassen. Sie messen
  mit `tests/layout/messung.ts` (U8), nie im CSS-Quelltext.
- Nur eine Klasse: `npx playwright test --project=handy`.
- Ein eigenes Chromium nennst du nur über `PW_CHROMIUM_PFAD`. Kein Pfad im Code.

## 6. Selbst im Browser ansehen

Bevor du den PR öffnest, siehst du dir an, was du gebaut hast, so wie es der
Prüfer tun wird (`PRUEFER_ANLEITUNG.md`, Schritt 7):

- Oberfläche: `node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <ID>-<was> --ziel <scratchpad>`
  liefert drei Bilder; ansehen, nicht nur erzeugen. Bedienen im eingebauten
  Browser (`mcp__Claude_Browser__*`) oder mit Playwright und `tap()` für Touch.
- Waagrechtes Scrollen und abgeschnittene Texte sind in **jeder** Geräteklasse
  ein Mangel. Waagrecht scrollen muss man, wenn auf `document.documentElement`
  `scrollWidth > clientWidth` gilt; das misst du in allen drei Klassen.
- Der eingebaute Browser ist zum Ansehen da; direkt nach `resize_window`
  meldet er mitunter noch die alte Breite. Grenzwerte der Breite (etwa 767 und
  768 px) misst du mit Playwright: `await seite.setViewportSize({ width: 768, height: 1024 })`,
  danach `scrollWidth` und `clientWidth` lesen. Ein Beispielskript steht in
  `PRUEFER_ANLEITUNG.md`, Schritt 7.
- Engine und KI: am Entwicklertisch (`/dev`, Testhook-Build auf 4174), das
  Szenario des Tasks mit Klicks durchspielen.

Bilder für den PR gehören nicht ins Repo; Belege im Repo legt der Prüfer an.

## 7. Commits und PR

- Conventional Commits auf Deutsch, der Body erklärt das Warum, am Ende
  `Co-Authored-By: …` wie im Repo üblich. Nie `--no-verify`.
- Kein Dateikopf mit Author, Datum oder Version, keine `// ÄNDERUNG`-Kommentare
  (U9). Deutsche Bezeichner und Kommentare. Keine neue Laufzeit-Abhängigkeit;
  Entwicklungs-Abhängigkeiten nur, wenn der Task sie nennt (U10). Kein Code aus
  Altprojekten (U11). Keine `.env.*`-Dateien.
- Kein Merge, kein Push auf `main` oder `neuaufbau`, nichts Kostenpflichtiges.
- **PR gegen `neuaufbau`** (`gh pr create --base neuaufbau`), Task-ID im Titel.
  Inhalt:
  - Abnahmekriterien als Checkliste, je mit Beleg;
  - erster Commit (nur Tests) mit der roten Ausgabe;
  - Ausgabe jedes Gates, gekürzt, mit Exit-Code;
  - Vermerk zu `/simplify` und zum Codex-Review;
  - Begründung für jede Datei ausserhalb des Felds „Dateien“;
  - behobene Zeilen aus Teil C von `docs/GAME_SPEC.md`;
  - Abweichungen vom Plan und offene Fragen.
- Nichts behaupten, was du nicht ausgeführt hast. Fehlgeschlagenes mit Ausgabe
  nennen.

## 8. Nach einer Ablehnung

Lehnt der Prüfer ab, steht im Protokoll `docs/abnahme/<ID>.md` jeder Mangel.
Du behebst sie auf demselben Branch (neue Commits, kein Umschreiben der
Geschichte), nennst im PR, was du je Mangel getan hast, und lässt die Gates
neu laufen. Ein neuer Prüfer prüft danach wieder alle Kriterien.
