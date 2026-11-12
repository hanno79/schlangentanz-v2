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

## 1. Den Task finden und lesen

- Der Block des Tasks steht in `docs/UMSETZUNGSPLAN.md`, Abschnitte 4 bis 8,
  unter der Überschrift mit der Task-ID (`### P0.3 …`, `#### E3 …`). Er hat die
  Felder **Ziel**, **Dateien**, **Abnahmekriterien**, oft **Grenzfälle**,
  **Szenarien** und **Spec**.
- Der Probe-Task `PROBE-1` steht stattdessen in `docs/abnahme/probe/PROBE-1.md`.
  Er hat keinen PR und eine andere Basis als `neuaufbau`; wo diese Anleitung
  `origin/neuaufbau` schreibt, setzt du dort die Basis aus dem Task-Block ein.
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
   `git ls-files -z | xargs -0 rm -f` und `git checkout -- .`. Danach muss die
   Zahl 0 sein. Sonst schlagen Tests wegen CRLF fehl, die nichts mit dem Task zu
   tun haben.
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
Git Bash `echo $?`, in PowerShell `$LASTEXITCODE`. Hänge nichts mit `|` an,
sonst liest du den Exit-Code des letzten Befehls der Kette (in Git Bash hilft
`${PIPESTATUS[0]}`).

```bash
npm test -- --run
npm run typecheck
npm run build
npm run check:test-lines
npm run check:css-asserts
npm run check:regeln
npx eslint .
python scripts/regelcheck.py
npm run test:layout        # bei Oberflächen-Tasks und wenn tests/layout/ oder playwright.config.ts geändert sind
```

- `check:regeln` prüft U1, U6 und U7. Es nennt am Anfang, wie viele Dateien es
  geprüft hat, und wie viel Altbestand `scripts/check_regeln_ausnahmen.json`
  noch duldet. Wächst diese Liste im Diff, ist das ein Mangel (sie darf nur
  schrumpfen).
- Der Architekturtest (`tests/architektur.test.ts`, U3 bis U5) läuft in
  `npm test` mit. Seine Testnamen nennen, wie viele Dateien er geprüft hat.
- `python scripts/regelcheck.py`: Warnungen sind erlaubt, Fehler nicht.

**Ports 4173 und 4174.** `npm run test:layout` startet zwei Server auf festen
Ports: 4173 (Produktionsbuild) und 4174 (Testhook-Build). Antwortet dort schon
etwas, bricht Playwright mit „… is already used“ ab, statt einen fremden Build
zu messen. Andere Agenten nutzen dieselben Ports.

1. Vorher prüfen: Git Bash `netstat -ano | grep -E ':417[34] '`, PowerShell
   `netstat -ano | findstr ":4173 :4174"`. Ohne Ausgabe sind beide frei.
2. Belegt: Der Server gehört vermutlich einem anderen Agenten. Nicht beenden.
   Zwei bis fünf Minuten warten und erneut prüfen. Ist nach rund 20 Minuten
   nichts frei, das Gate im Protokoll als „blockiert (Ports belegt)“ mit der
   Ausgabe von `netstat` vermerken und dem Orchestrator melden.
3. Eigene Server (auch die aus Schritt 7) beendest du, sobald du fertig bist,
   und prüfst danach, dass die Ports frei sind.

## 5. Diff gegen das Feld „Dateien“

```bash
git diff --stat origin/neuaufbau...HEAD      # drei Punkte: seit der Basis
```

- Jede Datei kommt in die Tabelle des Protokolls. Steht sie nicht im Feld
  „Dateien“ des Tasks, braucht sie eine Begründung im PR (`gh pr view <nr>`).
  Fehlt sie oder trägt sie nicht, ist das ein Mangel.
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

**Oberflächen-Tasks** prüfst du in allen drei Geräteklassen:

| Geräteklasse | Fenster | Bedienung |
|---|---|---|
| Desktop | 1280×900 | Maus |
| Tablet quer | 1024×768 | Touch |
| Handy hochkant | 390×844 | Touch |

1. **Fotos:** aus dem Repo heraus

   ```bash
   node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <ID>-<was> --ziel <ordner> [--warte-auf <css-selektor>]
   ```

   Das Skript schreibt `<ID>-<was>-desktop.png`, `-tablet.png` und
   `-handy.png`, prüft die Bildgrössen und meldet je Bild, ob Touch an war
   (`pointer: coarse ja`) und wie viele Konsolenfehler die Seite hatte. Exit 0
   heisst: drei Bilder in der richtigen Grösse. Als `--ziel` nimmst du zuerst
   einen Ordner **ausserhalb** des Repos (Scratchpad oder Temp); warum, steht in
   Schritt 9. Ohne `--ziel` landen die Bilder in `docs/abnahme/bilder/`.
2. **Ansehen:** Öffne jedes Bild (in Claude Code mit dem Read-Werkzeug) und
   sieh es dir wirklich an.
3. **Beschreiben:** Schreib ins Protokoll, was zu sehen ist: Aufbau, Texte und
   Zahlen, ob Werte plausibel sind, ob etwas abgeschnitten, verdeckt,
   überlappend oder unlesbar ist, ob man waagrecht scrollen müsste. Ein Foto
   ohne Beschreibung gilt nicht als Beleg.
4. **Bedienen mit der Maus (Desktop):** im eingebauten Browser der
   Desktop-App (Werkzeuge `mcp__Claude_Browser__*`): Adresse öffnen,
   Fenstergrösse 1280×900 setzen (`resize_window` mit `width` und `height`),
   klicken, mit `read_page` oder `get_page_text` den Zustand ablesen.
   Konsolenfehler mit `read_console_messages`.
5. **Bedienen mit Touch (Tablet, Handy):** Der eingebaute Browser emuliert ein
   Touch-Gerät nur unter 768 px Breite und schickt Klicks auch dann als
   Mausklicks. Nimm deshalb Playwright mit denselben
   Geräteklassen. Lege das Skript im Scratchpad ab, nicht im Repo, und führe
   es aus dem Repo-Ordner aus; dann findet es `playwright` und die
   Geräteklassen:

   ```js
   import { chromium } from 'playwright'
   import { GERAETEKLASSEN, chromiumPfad } from './scripts/pruefung/geraeteklassen.mjs'

   const { viewport, deviceScaleFactor, hasTouch, isMobile } = GERAETEKLASSEN.find((k) => k.name === 'tablet')
   const browser = await chromium.launch({ executablePath: chromiumPfad() })
   const kontext = await browser.newContext({ viewport, deviceScaleFactor, hasTouch, isMobile, reducedMotion: 'reduce' })
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
6. Server beenden (Strg+C in ihrer Konsole), Ports prüfen.

## 8. Eigene Grenzfälle

Plan 3.4: Du suchst aktiv nach Fehlern. Mindestens **zwei** eigene
Grenzfälle je Task, die nicht in den Kriterien stehen. Denk an: genau auf der
Grenze und eins daneben, 0, leer, Maximum, zweimal hintereinander, falsche
Reihenfolge, Neuladen der Seite, Drehen des Geräts (390×844 wird 844×390),
2, 3 und 4 Spieler, mit und ohne Erweiterung. Je Grenzfall ins Protokoll: was,
warum, wie geprüft, Ergebnis.

**Engine-Tasks zusätzlich (Plan Abschnitt 5):** Liste jede Regelaussage der
genannten Spec-Abschnitte und nenne den Test, der sie belegt. Fehlt für eine
Aussage ein Test, ist der Task nicht abgenommen.

## 9. Testregister

`AGENTS.md`, Block „Testregister“, ist verbindlich. Kurz:

1. **Bereich:** Jede geänderte Datei gehört über `tagebuch/tests/bereiche.md`
   zu einem Bereich (Spalte `Pfade`, Glob-Muster). Fällt eine Datei in keinen,
   ergänze ein Muster oder einen neuen Bereich und nenne das im Protokoll als
   Vorschlag an den Orchestrator.
2. **Testfälle:** Für jede Browserprüfung und jeden eigenen Grenzfall gibt es
   einen Testfall `tagebuch/tests/faelle/TF-<BEREICH>-<NNN>.md` aus der Vorlage
   `tagebuch/vorlagen/testfall.md` (nächste freie Nummer im Bereich; Grenzfälle
   mit `grenzfall_von`). Vorhandene Testfälle nimmst du, statt neue anzulegen.
   Schritte so, dass jemand ohne Vorwissen sie ausführen kann.
3. **Läufe** schreibt nur das Werkzeug, nie du von Hand:

   ```bash
   python scripts/testregister_lauf.py --testfall TF-<BEREICH>-<NNN> --status bestanden \
     --wer "Claude Code (Prüfer <ID>)" --ausfuehrung agent \
     --ergebnis "<was du gesehen hast, mit Zahlen>" \
     --browser "Playwright Chromium <Version>, 1024x768 Touch" \
     --screenshot <scratchpad>/<ID>-<was>-tablet.png
   ```

   Status `bestanden`, `fehlgeschlagen` (mindestens ein Beleg), `unklar` (mit
   `--unklar-was` und `--unklar-fehlt`), `blockiert` oder `uebersprungen` (mit
   `--grund`). Das Werkzeug liest Commit und Branch aus git und kopiert die
   Belege nach `tagebuch/tests/belege/`.
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
2. **Urteil:** ABGENOMMEN nur, wenn jedes Kriterium erfüllt ist, jedes Gate mit
   0 endet, der erste Commit nur Tests enthält und dort rot ist, jede Datei
   ausserhalb des Felds begründet ist, die Gegenprobe rot wurde und die
   Browserprüfung beschrieben ist. Sonst NICHT ABGENOMMEN, mit nummerierten
   Mängeln.
3. `python scripts/regelcheck.py`, dann committen: Protokoll, Bilder und
   Testregister in einem Commit `docs: Prüfprotokoll <ID>` (Body mit dem
   Urteil, Ende `Co-Authored-By: …` wie im Repo üblich), und auf den
   Task-Branch pushen: `git push origin HEAD:<branch>`. Nie `--no-verify`.
4. Rückmeldung an den Orchestrator: Urteil, Pfad des Protokolls, Commit, die
   Mängel in je einem Satz.

## Kurzliste zum Abhaken

- [ ] Task-Block und Spec gelesen, Kriterien wörtlich übernommen
- [ ] Worktree vorbereitet: LF, Hook, `npm ci`, Stand und Basis notiert
- [ ] Erster Commit: nur Tests, auf ihm rot
- [ ] Gates einzeln, jeder Exit-Code notiert, Ports vorher geprüft
- [ ] `git diff --stat` gegen „Dateien“, Begründungen geprüft, U2/U9/U10/U11/U13
- [ ] Gegenprobe: Regel im Code umgekehrt, Test rot, Code wiederhergestellt
- [ ] Browser: drei Geräteklassen (Oberfläche) oder Entwicklertisch (Engine, KI), Fotos angesehen und beschrieben
- [ ] Mindestens zwei eigene Grenzfälle; bei Engine-Tasks Satz-für-Satz-Abdeckung
- [ ] Testregister: Bereich, Testfälle, Läufe mit dem Werkzeug, `tagebuch_bauen.py`
- [ ] Protokoll nach `VORLAGE.md`, Urteil, Commit, Push auf den Task-Branch, eigene Server beendet
