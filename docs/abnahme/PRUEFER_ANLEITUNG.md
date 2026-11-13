# Anleitung für Prüfer

Du nimmst einen Task des Umsetzungsplans ab. Du hast ihn nicht gebaut und kennst
den Bericht des Umsetzers nicht. Das ist gewollt: Du prüfst jedes
Abnahmekriterium selbst, am Code, mit den Gates und im echten Browser. Am Ende
steht ein Protokoll `docs/abnahme/<ID>.md` nach `docs/abnahme/VORLAGE.md`, das
ein Dritter ohne Rückfrage nachvollziehen kann.

Diese Anleitung setzt die Pflichten aus `docs/UMSETZUNGSPLAN.md`, Abschnitt 3.4
um. Gehe die Schritte in dieser Reihenfolge durch. Ein fertiges Beispiel ist
`docs/abnahme/P0.2.md`.

## 0. Was du bekommst und was du nicht tust

Du bekommst: die **Task-ID** (etwa `E3`), den **Branch** (etwa
`task/E3-verdoppler`) und diese Anleitung. Mehr nicht.

- Den **PR** liest du nur an zwei Stellen: die Begründung für Dateien ausserhalb
  des Felds „Dateien“ (Schritt 5) und die Liste der behobenen Zeilen aus Teil C.
  Was der PR über Gates oder Kriterien behauptet, übernimmst du nicht; du prüfst
  es selbst.
- Du **reparierst nichts**. Findest du einen Fehler, beschreibst du ihn im
  Protokoll so genau, dass der Umsetzer ihn ohne Rückfrage beheben kann.
- Kein Merge, kein Push auf `main` oder `neuaufbau`, keine Deployments, nichts
  Kostenpflichtiges. Den Dart-Status setzt nur der Orchestrator.
- Nichts behaupten, was du nicht ausgeführt hast. Konntest du etwas nicht
  prüfen, steht im Protokoll, was und warum.

**Andere Agenten arbeiten gleichzeitig** im selben Repo, jeder in seinem
Worktree. Deshalb: nur in deinem Worktree arbeiten, kein `git stash` ohne
eigenen Namen (der Stash-Stapel ist für alle Worktrees gemeinsam), keine
fremden Branches ändern, keine fremden Prozesse beenden. Zu den Ports 4173 und
4174 steht in Schritt 4 mehr.

**Eigener Ordner für Logs und Fotos.** Das Scratchpad (der Ordner für
Zwischenergebnisse, den dir deine Umgebung nennt) teilen sich oft mehrere
Agenten. Lege darin einen eigenen Unterordner an, etwa `P0.4-pruefer/`, und
schreib alles dorthin: Logs, Fotos, kleine Skripte. Im Protokoll heisst er
`<scratchpad>`. Logs schreibst du beim Lauf mit `tee` mit (Schritt 4), nicht
hinterher aus dem Gedächtnis.

**Verkettete Befehle.** Manche Umgebungen lehnen einen git-Befehl ab, der mit
`&&`, `|` oder `;` an andere Befehle gehängt ist, weil sie nicht prüfen können,
dass er im eigenen Worktree bleibt. Dann führst du die Teile einzeln aus, etwa
`git ls-files -z | xargs -0 rm -f` als einen Aufruf und `git checkout -- .` als
nächsten. Geht auch die Pipe nicht, schreibst du die Liste erst in eine Datei
(`git ls-files > <scratchpad>/dateien.txt`) und löschst im nächsten Aufruf.

## 1. Den Task finden und lesen

- Der Block des Tasks steht in `docs/UMSETZUNGSPLAN.md`, Abschnitte 4 bis 8,
  unter der Überschrift mit der Task-ID (`### P0.3 …`, `#### E3 …`). Er hat die
  Felder **Ziel**, **Dateien**, **Abnahmekriterien**, oft **Grenzfälle**,
  **Szenarien** und **Spec**.
- Der Probe-Task `PROBE-1` steht stattdessen in `docs/abnahme/probe/PROBE-1.md`.
  Er hat keinen PR und eine andere Basis als `neuaufbau`; wo diese Anleitung
  `origin/neuaufbau` schreibt, setzt du dort die Basis aus dem Task-Block ein
  (bei `check:regeln` mit `--vergleich <basis>`, Schritt 4).
- **Branch ohne PR** (Probe oder ein Branch, den dir der Orchestrator ohne PR
  gibt): Die Begründungen für Dateien ausserhalb des Felds „Dateien“ stehen
  dann im Body der Commits, nicht in einem PR. Du liest sie mit
  `git log --format='%h %s%n%b' <basis>..HEAD`. Sagt der Task-Block etwas
  anderes, gilt der Task-Block. Findest du für eine Datei keine Begründung, ist
  das ein Mangel wie beim fehlenden PR-Text.
- Lies ausserdem im Plan die Abschnitte 2 (Grundlagen) und 3 (Arbeitsweise,
  vor allem 3.4 bis 3.7) und bei Engine-Tasks Abschnitt 5 (Kopf).
- Nennt der Task Spec-Abschnitte (A5, A7.8, D11 …), lies sie in
  `docs/GAME_SPEC.md`. Die Website `https://schlangentanz.ch/rules` ist die
  einzige Regelquelle; Teil A spiegelt sie wörtlich, Teil B und D ergänzen sie.
  Alles andere (Dart, alte Release-Notizen, Kommentare im Code) ist keine
  Regelquelle.
- Kopiere jedes Abnahmekriterium **wörtlich** in die Tabelle des Protokolls.

## 2. Vorbereitung im eigenen Worktree

In Git Bash (PowerShell geht auch; Unterschiede stehen dabei):

```bash
git fetch origin
git switch -c pruefung-<id> origin/<branch>       # eigener lokaler Branch auf dem Prüfstand
git rev-parse --short HEAD                         # geprüfter Stand, ins Protokoll
git merge-base origin/neuaufbau HEAD               # Basis, ins Protokoll
```

1. **Zeilenenden:** `git ls-files --eol | grep -c w/crlf`. Ist die Zahl grösser
   als 0, alle getrackten Dateien löschen und neu holen:
   `git ls-files -z | xargs -0 rm -f`, danach einzeln `git checkout -- .`.
   Danach muss die Zahl 0 sein. Sonst schlagen Tests wegen CRLF fehl, die nichts
   mit dem Task zu tun haben.
2. **pre-commit-Hook:** `git config --get core.hooksPath` muss
   `scripts/githooks` zeigen. Fehlt er, den Orchestrator fragen; die Einstellung
   gilt für alle Worktrees.
3. **Abhängigkeiten:** `npm ci`, Exit-Code 0.
4. **Browser:** `npx playwright install chromium`, falls noch nicht geschehen.
   Ein eigenes Chromium nennst du nur über die Umgebungsvariable
   `PW_CHROMIUM_PFAD`; ohne sie nimmt Playwright sein eigenes.
5. Ins Protokoll: Umgebung (`node -v`, `npm -v`, `python --version`,
   `npx playwright --version`).

## 3. Erster Commit: nur Tests, dort rot

Plan 3.3 verlangt: Der erste Commit des Tasks enthält nur Tests, und sie
schlagen dort fehl.

```bash
git log --oneline --reverse origin/neuaufbau..HEAD
```

- Der älteste Commit dieser Liste, der zum Task gehört, ist der erste. Enthält
  die Liste Commits eines anderen, noch nicht gemergten Tasks (der PR sagt das),
  zählen sie nicht.
- `git show --stat <sha>`: Es dürfen nur Testdateien darin sein
  (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, Testdaten). Eine Produktionsdatei
  im ersten Commit ist ein Mangel.
- Rot sehen: `git switch --detach <sha>`, dann nur diese Tests ausführen, etwa
  `npx vitest run tests/x.test.ts` (Layout-Verträge: `npx playwright test
  <datei>`). Erwartet: Exit-Code ungleich 0, und zwar weil das Verhalten fehlt
  (Modul fehlt, falscher Wert), nicht wegen eines Tippfehlers im Test.
  Ausgabe gekürzt ins Protokoll. Zurück mit `git switch pruefung-<id>`.
- Haben spätere Commits die Tests geändert, prüfe mit
  `git diff <sha> HEAD -- <testdatei>`, ob sie dadurch schwächer wurden.

## 4. Gates: jeder Befehl einzeln, jeder Exit-Code einzeln

Plan 3.5. Führe jeden Befehl allein aus und lies danach seinen Exit-Code: in
Git Bash `echo $?`, in PowerShell `$LASTEXITCODE`. Die Ausgabe schreibst du
beim Lauf mit `tee` in deinen Ordner. Hinter einem `|` liefert `$?` den
Exit-Code von `tee`, nicht den des Gates; deshalb liest du in Git Bash
`${PIPESTATUS[0]}`:

```bash
npm test -- --run 2>&1 | tee <scratchpad>/npm-test.log; echo "exit ${PIPESTATUS[0]}"
npm run typecheck 2>&1 | tee <scratchpad>/typecheck.log; echo "exit ${PIPESTATUS[0]}"
npm run build 2>&1 | tee <scratchpad>/build.log; echo "exit ${PIPESTATUS[0]}"
npm run check:test-lines 2>&1 | tee <scratchpad>/test-lines.log; echo "exit ${PIPESTATUS[0]}"
npm run check:css-asserts 2>&1 | tee <scratchpad>/css-asserts.log; echo "exit ${PIPESTATUS[0]}"
npm run check:regeln 2>&1 | tee <scratchpad>/regeln.log; echo "exit ${PIPESTATUS[0]}"
npx eslint . 2>&1 | tee <scratchpad>/eslint.log; echo "exit ${PIPESTATUS[0]}"
python scripts/regelcheck.py 2>&1 | tee <scratchpad>/regelcheck.log; echo "exit ${PIPESTATUS[0]}"
npm run test:layout 2>&1 | tee <scratchpad>/layout.log; echo "exit ${PIPESTATUS[0]}"   # bei Oberflächen-Tasks und wenn tests/layout/ oder playwright.config.ts geändert sind
```

Jede Zeile ist ein eigener Aufruf. In PowerShell geht `tee` als
`Tee-Object -FilePath <datei>`; `$LASTEXITCODE` zeigt danach den Exit-Code von
`npm` oder `python`.

- `check:regeln` prüft U1, U6 und U7. Es nennt am Anfang, wie viele Dateien es
  geprüft hat, wie viel Altbestand `scripts/check_regeln_ausnahmen.json` noch
  duldet und mit welchem Stand es die Liste verglichen hat. Die Liste nennt
  jeden geduldeten Verstoss mit einem Merkmal (bei U1 der volle Testname, sonst
  der Inhalt der Zeile). Ein Verstoss ohne passendes Merkmal ist rot, auch wenn
  dafür ein alter verschwunden ist. Wächst die Liste gegenüber der Merge-Basis
  von `origin/neuaufbau` (neue Datei, neue Regel, neues Merkmal), endet es mit 1.
  Endet es mit 2 und „lässt sich nicht … vergleichen“, fehlt der Stand:
  `git fetch origin` und noch einmal. Bei der Probe nimmst du
  `npm run check:regeln -- --vergleich <basis>`.
- Der Architekturtest (`tests/architektur.test.ts`, U3 bis U5) läuft in
  `npm test` mit. Seine Testnamen nennen, wie viele Dateien er geprüft hat.
- `python scripts/regelcheck.py`: Warnungen sind erlaubt, Fehler nicht.

**Ports 4173 und 4174.** `npm run test:layout` startet zwei Server auf festen
Ports: 4173 (Produktionsbuild) und 4174 (Testhook-Build). Antwortet dort schon
etwas, bricht Playwright mit „… is already used“ ab, statt einen fremden Build
zu messen. Andere Agenten nutzen dieselben Ports.

1. **Vorher prüfen.** Belegt ist ein Port nur, wenn dort ein Socket lauscht: In
   der Spalte „Status“ von `netstat` steht dann `LISTENING`, auf einem
   deutschen Windows `ABHÖREN`. Zeilen mit `TIME_WAIT` (deutsch `WARTEND`) oder
   `ESTABLISHED` (`HERGESTELLT`) sind Reste beendeter Verbindungen; sie
   ignorierst du, der Port ist frei.

   ```bash
   netstat -ano | grep -E ':417[34] ' | grep -E 'LISTENING|ABH'
   ```

   PowerShell: `Get-NetTCPConnection -LocalPort 4173,4174 -State Listen -ErrorAction SilentlyContinue`.
   Ohne Ausgabe sind beide frei.
2. **Belegt:** Der Server gehört vermutlich einem anderen Agenten. Nicht
   beenden. Zwei bis fünf Minuten warten und erneut prüfen. Ist nach rund 20
   Minuten nichts frei, das Gate im Protokoll als „blockiert (Ports belegt)“
   mit der Ausgabe von `netstat` vermerken und dem Orchestrator melden.
3. **Eigene Server beenden** (auch die aus Schritt 7), sobald du fertig bist.
   Unter Windows reicht Strg+C oder das Stoppen der Hintergrundaufgabe oft
   nicht: `npm` endet, der Node-Kindprozess (`vite preview`) lauscht weiter.
   Deshalb nach jedem Beenden:

   1. Portprüfung aus Punkt 1. Lauscht noch etwas, steht die PID in der
      letzten Spalte von `netstat` (PowerShell: Spalte `OwningProcess`).
   2. Befehlszeile dieser PID lesen. PowerShell:
      `Get-CimInstance Win32_Process -Filter "ProcessId=<PID>" | Select-Object ProcessId, CommandLine`.
      Aus Git Bash: `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=<PID>').CommandLine"`.
   3. Steht in der `CommandLine` der Pfad **deines** Worktrees (etwa
      `…\worktrees\<dein-ordner>\node_modules\vite\bin\vite.js preview`), ist es
      dein Server: `Stop-Process -Id <PID>` (aus Git Bash:
      `powershell -NoProfile -Command "Stop-Process -Id <PID>"`). Steht dort ein
      anderer Pfad, ist es ein fremder Server: nicht beenden, warten.
   4. Portprüfung wiederholen; ohne Ausgabe ist der Port frei.

## 5. Diff gegen das Feld „Dateien“

```bash
git diff --stat origin/neuaufbau...HEAD      # drei Punkte: seit der Basis
```

- Jede Datei kommt in die Tabelle des Protokolls. Steht sie nicht im Feld
  „Dateien“ des Tasks, braucht sie eine Begründung im PR (`gh pr view <nr>`),
  bei einem Branch ohne PR im Body der Commits (Schritt 1). Fehlt sie oder
  trägt sie nicht, ist das ein Mangel.
- Prüfe dabei auch: **U10** keine neue Laufzeit-Abhängigkeit in
  `package.json`, neue Entwicklungs-Abhängigkeiten nur, wenn der Task sie
  nennt; **U13** `docs/GAME_SPEC.md`, `tests/spec_documentation.test.ts`,
  `src/engine/aktionen/typen.ts` und `src/engine/karten/register.ts` nur, wenn
  der Task sie nennt; **U9** kein Dateikopf mit Author, Datum oder Version und
  keine `// ÄNDERUNG`-Kommentare in neuen Dateien; **U11** kein Code aus
  Altprojekten; **U2** keine Regel, die nicht in Teil A, B oder D steht.
- Bei Oberflächen-Tasks: Die Oberfläche filtert die Aktionen der Engine und
  baut nie selbst eine (U3). Das liest du am Code.

## 6. Gegenprobe

Plan 3.4: Du kehrst mindestens eine Regel im **Code** um und siehst, dass ein
Test rot wird. Damit belegst du, dass die Tests das Verhalten wirklich
festhalten.

1. Such eine Stelle, die ein Kriterium umsetzt: eine Bedingung, eine Grenze,
   eine Zahl. Ändere sie minimal (`<` zu `<=`, `5` zu `4`, Bedingung
   verneinen). Ändere keine Testdatei.
2. Führe die passenden Tests aus. Erwartet: Exit-Code ungleich 0 und ein
   Testname, der zur geänderten Regel passt.
3. Stelle den Code wieder her: `git checkout -- <datei>`, danach zeigt
   `git status` nichts mehr.
4. Ins Protokoll: Datei und Zeile, alt und neu, Befehl, Exit-Code, Meldung.

Bleibt jeder Test grün, ist das ein Mangel: Die Regel ist ungetestet. Bei
Werkzeug-Tasks baust du statt einer umgekehrten Regel einen absichtlichen
Verstoss ein, den das Werkzeug melden muss.

## 7. Browserprüfung

Plan 3.4: Du prüfst im echten Browser, nie nur am Code.

**Server starten** (jeweils in eigener Konsole, nach der Portprüfung aus
Schritt 4):

| Build | Bauen | Starten | Adresse |
|---|---|---|---|
| Produktion | `npm run build` | `npm run preview -- --port 4173 --strictPort` | `http://localhost:4173/` |
| Testhooks | `npm run build:testhooks` | `npm run preview:testhooks` | `http://localhost:4174/` |

Testhooks sind Test-Hintertüren, etwa der Entwicklertisch `/dev` (ab P0.4). Sie
gibt es nur im Testhook-Build. Im Produktionsbuild dürfen sie nicht erreichbar
sein.

**Engine- und KI-Tasks** prüfst du am Entwicklertisch im Testhook-Build: das
Szenario des Tasks laden (`/dev?szenario=<name>`, Liste unter
`/dev/szenarien`), die Schritte des Tasks mit echten Klicks auf die
Aktionsknöpfe ausführen, das Ergebnis im angezeigten Zustand ablesen und mit
der Erwartung vergleichen. Ist der Entwicklertisch noch nicht gemergt (vor
P0.4), vermerkst du die Browserprüfung als „blockiert, Entwicklertisch fehlt“.

**Oberflächen-Tasks** prüfst du in allen fünf Geräteklassen (Plan 2.3 und
3.4; Tablet hochkant und Handy quer seit dem 13.11.2026):

| Geräteklasse | Name | Fenster | Bedienung |
|---|---|---|---|
| Desktop | `desktop` | 1280×900 | Maus |
| Tablet quer | `tablet-quer` | 1024×768 | Touch |
| Tablet hochkant | `tablet-hochkant` | 768×1024 | Touch |
| Handy hochkant | `handy-hochkant` | 390×844 | Touch |
| Handy quer | `handy-quer` | 844×390 | Touch |

Handy quer ist nur 390 px hoch: Was dort unter den Bildrand rutscht, ist nur
nach Scrollen erreichbar. Bekannte Befunde dieser Art stehen in
`tests/layout/geraeteklassen_ausnahmen.json`; was dort nicht steht und auf dem
Foto fehlt, ist ein Mangel.

1. **Fotos:** aus dem Repo heraus

   ```bash
   node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <ID>-<was> --ziel <ordner> [--warte-auf <css-selektor>]
   ```

   Das Skript schreibt `<ID>-<was>-desktop.png`, `-tablet-quer.png`,
   `-tablet-hochkant.png`, `-handy-hochkant.png` und `-handy-quer.png`, prüft
   die Bildgrössen und meldet je Bild, ob Touch an war (`pointer: coarse ja`)
   und wie viele Konsolenfehler die Seite hatte. Exit 0 heisst: fünf Bilder in
   der richtigen Grösse. Legt sich eine Seite breiter aus als das Fenster (ohne
   viewport-Meta-Tag 980 px), bricht es mit Exit 1 und diesem Hinweis ab. Als `--ziel` nimmst du zuerst
   einen Ordner **ausserhalb** des Repos (Scratchpad oder Temp); warum, steht in
   Schritt 9. Ohne `--ziel` landen die Bilder in `docs/abnahme/bilder/`.
2. **Ansehen:** Öffne jedes Bild (in Claude Code mit dem Read-Werkzeug) und
   sieh es dir wirklich an.
3. **Beschreiben:** Schreib ins Protokoll, was zu sehen ist: Aufbau, Texte und
   Zahlen, ob Werte plausibel sind, ob etwas abgeschnitten, verdeckt,
   überlappend oder unlesbar ist, ob man waagrecht scrollen müsste. Ein Foto
   ohne Beschreibung gilt nicht als Beleg.

   **Waagrechtes Scrollen und abgeschnittene Texte sind in jeder Geräteklasse
   ein Mangel**, auch auf dem Handy und auch dann, wenn der Task das nicht
   eigens nennt. Waagrecht scrollen muss man, wenn
   `scrollWidth > clientWidth` gilt; du misst es in jeder Klasse:

   ```js
   await seite.evaluate(() => ({
     scrollWidth: document.documentElement.scrollWidth,
     clientWidth: document.documentElement.clientWidth,
   }))
   ```

   Abgeschnitten ist ein Text, der am Rand oder in seinem Kasten endet, mit
   „…“ gekürzt ist, ohne dass der Task das vorsieht, oder hinter einem anderen
   Element verschwindet. Das siehst du auf dem Foto; im Protokoll nennst du
   Klasse, Stelle und Text.
4. **Bedienen mit der Maus (Desktop):** im eingebauten Browser der
   Desktop-App (Werkzeuge `mcp__Claude_Browser__*`): Adresse öffnen,
   Fenstergrösse 1280×900 setzen (`resize_window` mit `width` und `height`),
   klicken, mit `read_page` oder `get_page_text` den Zustand ablesen.
   Konsolenfehler mit `read_console_messages`. Der eingebaute Browser ist zum
   Ansehen und Bedienen da, nicht zum Messen: Direkt nach `resize_window`
   meldet er mitunter noch die alte Breite (`innerWidth`, `scrollWidth`).
   **Grenzwerte der Breite** (etwa 767 und 768 px oder genau die Grenze aus dem
   Task) misst du deshalb mit Playwright: `await seite.setViewportSize({ width: 768, height: 1024 })`,
   danach messen wie oben. Das Skript dafür baust du wie in Punkt 5.
5. **Bedienen mit Touch (Tablet und Handy, beide Ausrichtungen):** Der eingebaute Browser emuliert ein
   Touch-Gerät nur unter 768 px Breite und schickt Klicks auch dann als
   Mausklicks. Nimm deshalb Playwright mit denselben
   Geräteklassen. Lege das Skript im Scratchpad ab, nicht im Repo, und führe
   es aus dem Repo-Ordner aus; dann findet es `playwright` und die
   Geräteklassen:

   ```js
   import { chromium } from 'playwright'
   import { GERAETEKLASSEN, chromiumPfad, kontextOptionen } from './scripts/pruefung/geraeteklassen.mjs'

   const tablet = GERAETEKLASSEN.find((klasse) => klasse.name === 'tablet-quer')
   const browser = await chromium.launch({ executablePath: chromiumPfad() })
   const kontext = await browser.newContext({ ...kontextOptionen(tablet), reducedMotion: 'reduce' })
   const seite = await kontext.newPage()
   await seite.goto('http://localhost:4173/')
   await seite.getByRole('button', { name: 'Partie starten' }).tap()   // tap statt click: Touch
   console.log(await seite.locator('body').innerText())
   await seite.screenshot({ path: '<scratchpad>/tablet-nach-tipp.png' })
   await browser.close()
   ```

   Aufruf in Git Bash: `node --input-type=module < <scratchpad>/tipp.mjs`, in
   PowerShell: `Get-Content <scratchpad>\tipp.mjs -Raw | node --input-type=module`.
   Auch diese Bilder siehst du an und beschreibst sie.
6. Server beenden, wie in Schritt 4 unter „Eigene Server beenden“ beschrieben
   (Strg+C genügt unter Windows oft nicht), danach Ports prüfen.

## 8. Eigene Grenzfälle

Plan 3.4: Du suchst aktiv nach Fehlern. Mindestens **zwei** eigene
Grenzfälle je Task, die nicht in den Kriterien stehen. Denk an: genau auf der
Grenze und eins daneben, 0, leer, Maximum, zweimal hintereinander, falsche
Reihenfolge, Neuladen der Seite, Drehen des Geräts mitten in der Bedienung
(`setViewportSize` von 390×844 auf 844×390: bleibt der Zustand, etwa eine offene
Rückfrage?), schmaler als jede Klasse (320 px),
2, 3 und 4 Spieler, mit und ohne Erweiterung. Je Grenzfall ins Protokoll: was,
warum, wie geprüft, Ergebnis.

**Engine-Tasks zusätzlich (Plan Abschnitt 5):** Liste jede Regelaussage der
genannten Spec-Abschnitte und nenne den Test, der sie belegt. Fehlt für eine
Aussage ein Test, ist der Task nicht abgenommen.

## 9. Testregister

Die Quelle ist der Block „Testregister“ in `AGENTS.md` (zwischen
`<!-- baseline:testregister v1.0 anfang -->` und `… ende -->`); er ist
verbindlich. `AGENTS.md` verweist an anderer Stelle auf `rules/testregister.md`:
Diese Datei liegt im Baseline-Repo, nicht hier. Im Projekt gilt nur der Block.
Kurz:

1. **Bereich:** Jede geänderte Datei gehört über `tagebuch/tests/bereiche.md`
   zu einem Bereich (Spalte `Pfade`, Glob-Muster). Welche Dateien des Diffs in
   keinen Bereich fallen, zeigt dieses kleine Skript; leg es in deinen Ordner
   und ruf es aus dem Repo auf (`python <scratchpad>/ohne_bereich.py`, bei der
   Probe mit der Basis als Argument):

   ```python
   import subprocess, sys
   from pathlib import Path
   sys.path.insert(0, "scripts")
   from testregister_laeufe import lade_register
   from testregister_modell import bereiche_der_dateien

   basis = sys.argv[1] if len(sys.argv) > 1 else "origin/neuaufbau"
   dateien = subprocess.run(["git", "diff", "--name-only", f"{basis}...HEAD"],
                            capture_output=True, text=True, check=True).stdout.split()
   bereiche, ohne = bereiche_der_dateien(dateien, lade_register(Path(".")).bereiche)
   print("Bereiche:", ", ".join(sorted(bereiche)) or "keine")
   print("Ohne Bereich:", ", ".join(ohne) or "keine")
   ```

   **Dateien ohne Bereich:** Jede Änderung an ihnen entwertet alle Läufe davor.
   Ergänze deshalb in `bereiche.md` ein Muster in einem passenden Bereich (bei
   Werkzeugen meist `PRUEF`, bei Konfiguration `BUILD`) oder, wenn keiner
   passt, einen neuen Bereich. Eine vorhandene Bereichs-ID änderst du nie.
   Schreib die Muster so eng, dass Prüfprotokolle nicht hineinfallen
   (`docs/abnahme/VORLAGE.md` einzeln statt `docs/abnahme/**`). Im Protokoll
   nennst du die Änderung als Vorschlag an den Orchestrator. Arbeitet gerade ein
   anderer Task an `tagebuch/` und darfst du die Datei deshalb nicht ändern,
   nennst du die Dateien und das vorgeschlagene Muster nur im Protokoll.
2. **Testfälle:** Für jede Browserprüfung und jeden eigenen Grenzfall gibt es
   einen Testfall `tagebuch/tests/faelle/TF-<BEREICH>-<NNN>.md` aus der Vorlage
   `tagebuch/vorlagen/testfall.md` (nächste freie Nummer im Bereich; Grenzfälle
   mit `grenzfall_von`). Vorhandene Testfälle nimmst du, statt neue anzulegen.
   Schritte so, dass jemand ohne Vorwissen sie ausführen kann.
   **Humanizer vorher:** Die Abschnitte „Worum es geht“, „Bestanden, wenn“ und
   „Fehlgeschlagen, wenn“ eines neuen Testfalls prüfst du mit dem Humanizer, in
   Claude Code mit `/baseline:humanizer`, und überarbeitest sie, **bevor** du
   den ersten Lauf einträgst. Läufe selbst gehen nicht durch den Humanizer.
3. **Läufe** schreibt nur das Werkzeug, nie du von Hand:

   ```bash
   python scripts/testregister_lauf.py --testfall TF-<BEREICH>-<NNN> --status bestanden \
     --wer "Claude Code (Prüfer <ID>)" --ausfuehrung agent \
     --ergebnis "<was du gesehen hast, mit Zahlen>" \
     --browser "Playwright Chromium <Version>, 1024x768 Touch" \
     --screenshot <scratchpad>/<ID>-<was>-tablet-quer.png
   ```

   Status `bestanden`, `fehlgeschlagen` (mindestens ein Beleg), `unklar` (mit
   `--unklar-was` und `--unklar-fehlt`), `blockiert` oder `uebersprungen` (mit
   `--grund`). Das Werkzeug liest Commit und Branch aus git und kopiert die
   Belege nach `tagebuch/tests/belege/`.

   - **Textbelege:** Ein Beleg muss kein Bild sein. Für Prüfungen ohne Bild
     (Gates, Gegenprobe, Grenzfälle an der Kommandozeile) schreibst du die
     Ausgabe beim Lauf mit `tee` in eine `.txt`-Datei in deinem Ordner, etwa
     `npx vitest run tests/x.test.ts 2>&1 | tee <scratchpad>/<ID>-gegenprobe.txt`,
     und gibst sie mit `--screenshot <scratchpad>/<ID>-gegenprobe.txt` mit. Nicht
     nachträglich abtippen.
   - **`--eintrag`** nennt den Dateinamen eines Tagebucheintrags unter
     `tagebuch/eintraege/` (nur der Name, etwa
     `--eintrag 2026-11-13-p0-2-lokale-umgebung.md`), zu dem der Lauf gehört.
     Gibt es zu deinem Task einen Eintrag (`ls tagebuch/eintraege/`, der Name
     enthält die Task-ID), gibst du ihn mit; einen Namen, den es nicht gibt,
     lehnt das Werkzeug ab. Gibt es keinen, lässt du den Schalter weg; einen
     Eintrag schreibt der Prüfer nicht. Die Warnung „Arbeitsschritt ohne
     Testlauf“ von `regelcheck.py` betrifft dann den Eintrag eines anderen
     Arbeitsschritts und ist kein Mangel deines Tasks.
4. **Reihenfolge beachten:** Das Werkzeug vermerkt `sauber: nein`, sobald
   ausserhalb von `tagebuch/` etwas nicht committet ist, und so ein Lauf zählt
   für keine Freigabe. Deshalb: Fotos zuerst ausserhalb des Repos ablegen,
   alle Läufe eintragen, **danach** die Bilder nach `docs/abnahme/bilder/`
   kopieren und das Protokoll schreiben.
5. `python scripts/tagebuch_bauen.py` baut die Seiten; bricht es ab, behebst du
   den Fehler in der Quelle.

## 10. Protokoll, Urteil, Abgabe

1. Schreib `docs/abnahme/<ID>.md` nach `docs/abnahme/VORLAGE.md`. Bilder liegen
   unter `docs/abnahme/bilder/` und heissen `<ID>-<was>-<klasse>.png`.
2. **Urteil:** Es gibt genau zwei Wörter, **ABGENOMMEN** und **ABGELEHNT**.
   ABGENOMMEN nur, wenn jedes Kriterium erfüllt ist, jedes Gate mit 0 endet,
   der erste Commit nur Tests enthält und dort rot ist, jede Datei ausserhalb
   des Felds begründet ist, die Gegenprobe rot wurde und die Browserprüfung
   beschrieben ist. Sonst ABGELEHNT, mit nummerierten Mängeln.
3. `python scripts/regelcheck.py`, dann committen: Protokoll, Bilder und
   Testregister in einem Commit `docs: Prüfprotokoll <ID>` (Body mit dem
   Urteil, Ende `Co-Authored-By: …` wie im Repo üblich), und auf den
   Task-Branch pushen: `git push origin HEAD:<branch>`. Nie `--no-verify`.

   **Eszett in Zitaten:** Zitierst du einen Text der Oberfläche wörtlich und
   steht darin ein Eszett (etwa auf einem Knopf), bleibt das Zitat, wie es ist.
   Der pre-commit-Hook meldet dazu „neu eingeführtes Eszett“ als **Warnung**;
   der Commit geht trotzdem durch. Ausserhalb von Zitaten schreibst du „ss“.
4. Rückmeldung an den Orchestrator: Urteil, Pfad des Protokolls, Commit, die
   Mängel in je einem Satz.

## Kurzliste zum Abhaken

- [ ] Task-Block und Spec gelesen, Kriterien wörtlich übernommen
- [ ] Worktree vorbereitet: LF, Hook, `npm ci`, Stand und Basis notiert
- [ ] Erster Commit: nur Tests, auf ihm rot
- [ ] Gates einzeln mit `tee` in den eigenen Unterordner, jeder Exit-Code notiert, Ports vorher geprüft (nur `LISTENING`/`ABHÖREN` zählt)
- [ ] `git diff --stat` gegen „Dateien“, Begründungen geprüft, U2/U9/U10/U11/U13
- [ ] Gegenprobe: Regel im Code umgekehrt, Test rot, Code wiederhergestellt
- [ ] Browser: fünf Geräteklassen (Oberfläche) oder Entwicklertisch (Engine, KI), Fotos angesehen und beschrieben, `scrollWidth` gemessen, Grenzbreiten mit `setViewportSize`
- [ ] Mindestens zwei eigene Grenzfälle; bei Engine-Tasks Satz-für-Satz-Abdeckung
- [ ] Testregister: Bereich, Testfälle, Läufe mit dem Werkzeug, `tagebuch_bauen.py`
- [ ] Protokoll nach `VORLAGE.md`, Urteil ABGENOMMEN oder ABGELEHNT, Commit, Push auf den Task-Branch, eigene Server beendet (PID und Befehlszeile geprüft)
