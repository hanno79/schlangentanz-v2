# Schlangentanz v2 Workflow

This project starts cleanly in a new local folder, new GitHub repository, and new Vercel project.

- Local project: `/home/projects/schlangentanz-v2`
- GitHub repo: `hanno79/schlangentanz-v2`
- Vercel project: `schlangentanz-v2`

## Architecture of work

1. **Hermes orchestrates**
   - owns scope, gates, verification, GitHub/Vercel coordination
   - rejects “looks clickable” as completion evidence

2. **Claude Code builds**
   - uses small, spec-linked implementation slices
   - starts from failing tests for behavior changes

3. **Codex reviews adversarially**
   - checks rules, tests, edge cases, illegal actions, security, and production readiness

4. **Dart provides backlog input**
   - tasks are requirements candidates, not automatically truth
   - Dart is never a rules source; rules come from the website only (see „Regelquelle")

5. **Paperclip is not used for implementation**
   - old Paperclip activity is treated as historical context only

## Project separation rules

- Do not reuse the old repo remote.
- Do not reuse the old Vercel project.
- Do not mix old build artifacts or Paperclip output into this repo.
- Any referenced old behavior must be converted into explicit spec text and tests first.

## Regelquelle (ÄNDERUNG 12.11.2026)

Einzige verbindliche Regelquelle ist `https://schlangentanz.ch/rules`. Der Autor
hat die Spielanleitung dort überarbeitet und zur alleinigen Grundlage erklärt.

- `docs/GAME_SPEC.md` spiegelt die Website wörtlich (Teil A). Regeln ändern sich
  nur auf der Website; danach wird Teil A aus ihrem Wortlaut neu übernommen
  (`npm run abgleich:website`, mit `-- --schreiben` zum Übernehmen).
- Abweichungen der Engine stehen in Teil C, offene Auslegungsfragen in Teil D.
- Dart-Tasks, Dart-Dokumente, `docs/release_status_*`, `docs/slice_plan_*` und
  die Belege in `docs/PLAYABILITY_GATE.md` sind keine Regelquelle. Sie
  beschreiben frühere Stände und können überholte Regeln enthalten.

Hintergrund: Bis zu diesem Datum gab es drei Regelstände nebeneinander, nämlich
Dart (zwei sich widersprechende Serien vom Januar), die Website und die Spec
vom 03.08.2026. Die Engine folgte der Spec, die Spec einem älteren Stand der
Website.

## Umsetzungsplan (ÄNDERUNG 12.11.2026)

Ab dem 12.11.2026 gilt für alle Arbeit `docs/UMSETZUNGSPLAN.md`. Er ersetzt für
die Dauer des Neuaufbaus den Abschnitt „Direkt auf `main`" weiter unten:

- Arbeit läuft auf dem Integrationsbranch `neuaufbau`; jeder Task hat einen
  eigenen Branch `task/<ID>-<kurzname>` und einen PR gegen `neuaufbau`.
- `main` bekommt nur Meilensteine (M2, M3, M4), jeweils nach Freigabe des Autors
  auf der Vercel-Vorschau.
- Jeder Task wird von einem unabhängigen Prüfer ohne Vorkenntnisse abgenommen,
  auch im Browser; das Protokoll liegt unter `docs/abnahme/<ID>.md`.
- Der Abschnitt „Bewusst nicht implementiert" ist überholt: Die Erweiterung
  kommt vollständig (`docs/GAME_SPEC.md` Teil B1).

## Lokale Einrichtung unter Windows

Seit dem 12.11.2026 läuft die Umsetzung lokal auf dem Desktop unter Windows 11.
Eingerichtet und geprüft wurde sie mit Node 25.2, npm 11.5, Python 3.13, Git for
Windows 2.55, gh 2.102 und codex-cli 0.166. Alle Befehle laufen in PowerShell
und in Git Bash.

**npm-Skripte laufen unter Windows in `cmd.exe`.** Die Schreibweise
`VAR=wert befehl` gibt es dort nicht, deshalb steht sie in keinem Skript in
`package.json` (`tests/lokale_umgebung.test.ts` hält das fest). Der
Testhook-Build nutzt den Vite-Modus `testhooks`; warum, steht in
`vite.config.ts`.

1. **Node ab 22.13** (`engines.node`): die Untergrenze von eslint 10 und
   jsdom 29. Vercel baut mit der neuesten passenden Hauptversion.
2. **Abhängigkeiten:** `npm ci`.
3. **pre-commit-Hook:** `git config core.hooksPath scripts/githooks`. Der Hook
   ruft `python scripts/regelcheck.py --geaendert` auf und gilt für alle
   Worktrees des Repos.
   **Zeilenenden:** `.gitattributes` verlangt LF. Eine Arbeitskopie, die mit
   `core.autocrlf=true` vor dieser Datei ausgecheckt wurde, behält CRLF, und
   `tests/spec_documentation.test.ts` schlägt dann fehl. `git ls-files --eol`
   zeigt solche Dateien als `w/crlf`; löschen und mit `git checkout -- .` neu
   holen schreibt sie mit LF.
4. **Browser für die Layout-Verträge:** `npx playwright install chromium`,
   einmal je Rechner und Playwright-Version.
5. **Gates**, jedes einzeln und mit eigenem Exit-Code (PowerShell:
   `$LASTEXITCODE`, Git Bash: `$?`):

   ```
   npm test -- --run
   npm run typecheck
   npm run build
   npm run build:testhooks
   npm run check:test-lines
   npm run check:css-asserts
   npm run check:regeln
   npx eslint .
   python scripts/regelcheck.py
   npm run test:layout
   ```

   `npm run check:regeln` prüft die Umsetzungsregeln U1, U6 und U7 (Plan 3.7);
   den Altbestand duldet `scripts/check_regeln_ausnahmen.json`, die nur
   schrumpfen darf. Umsetzer und Prüfer folgen `docs/abnahme/UMSETZER_ANLEITUNG.md`
   und `docs/abnahme/PRUEFER_ANLEITUNG.md`.
6. **Ports 4173 und 4174** müssen vor `npm run test:layout` frei sein. Unter
   Windows ersetzt `netstat -ano | findstr ":4173 :4174"`
   (PowerShell oder cmd) die Vorprüfung mit `ss`; ohne Ausgabe sind beide frei.
7. **Codex:** einmal `codex login` mit dem Abo. Probe:
   `codex exec --sandbox read-only -C <repo> "Welche npm-Skripte definiert package.json?"`.
8. **GitHub:** `gh auth login` (HTTPS), danach zeigt `gh auth status` das
   angemeldete Konto. Task-PRs gehen mit `gh pr create --base neuaufbau` gegen
   den Integrationsbranch.
9. **Dart:** über den Dart-Connector der Claude-Code-Sitzung, Board
   `Schlangentanz/Tasks`. Die Status heissen `To-do`, `Doing` und `Done`.
10. **Vercel-Vorschau:** Ein Vercel-CLI ist nicht nötig. Jeder Push auf einen
    Branch baut eine Vorschau, und ihre Adresse steht bei GitHub:
    `gh api "repos/hanno79/schlangentanz-v2/deployments?sha=<sha>"` liefert die
    Deployment-ID, `gh api repos/hanno79/schlangentanz-v2/deployments/<id>/statuses`
    unter `environment_url` die Adresse. Die Vorschauen sind durch die
    Vercel-Anmeldung geschützt. Solange `neuaufbau` auf demselben Commit steht
    wie `main`, gibt es für diesen Commit nur das Production-Deployment; eine
    eigene Vorschau entsteht mit dem ersten eigenen Commit auf `neuaufbau`.

## Gates

1. Toolchain gate
2. Backlog ingestion gate
3. Spec lock gate
4. Acceptance-test gate
5. Engine implementation gate
6. UI binding gate
7. Codex adversarial review gate
8. Vercel production gate
9. Human playability gate

## Direkt auf `main` (ÄNDERUNG 03.08.2026)

Slices gehen **direkt auf `main`**, ohne Branch und ohne Pull Request. Seit das
GitHub-Repo im Vercel-Projekt verbunden ist, deployt jeder Push sofort — es gibt
also kein Review-Fenster zwischen Commit und Production.

Das ist eine bewusste Entscheidung, und sie hängt an einer Bedingung: **Die
Gate-Kette läuft vollständig vor dem Push, nicht danach.**

```bash
npm test -- --run          # Exit-Code einzeln prüfen, nicht den einer Pipe
npm run typecheck
npm run build
npm run check:test-lines
npm run check:css-asserts
npx eslint .
npx playwright test        # bei allem, was die Oberfläche berührt
```

Dazu Gate 7 als `codex exec` mit gezielten Fragen zum Diff — der in dieser
Sitzung zweimal echte Fehler gefunden hat, die alle grünen Tests durchgelassen
hatten.

**Was dadurch entfällt:** Die PR-Bots (CodeRabbit, Kilo) laufen nur an Pull
Requests. CodeRabbit hat am 02.08.2026 einen echten Fehler in einer
GAME_SPEC-Änderung gefunden. Der Verlust ist trotzdem verkraftbar, weil beide
Bots nie Teil dieses Workflows waren: Gate 7 heißt „Codex adversarial review",
und Codex läuft lokal.

**Wann trotzdem ein Branch:** wenn ein Slice über mehrere Sitzungen läuft, wenn
er die Engine-Regeln ändert und der Diff gelesen werden soll, bevor er live geht,
oder wenn ausdrücklich ein PR gewünscht ist.

### Vor jedem Merge: `npm run check:merge-bereit` (ÄNDERUNG 04.08.2026, Etappe 7)

`gh pr checks` allein genügt **nicht**. Drei Fehler an einem Tag, alle echt:

1. **Der Merge nahm nur den halben Branch.** `gh pr merge` merged den *PR-HEAD*,
   nicht den lokalen Stand. Bei PR #2 lag der zweite Commit vier Minuten daneben und
   fiel heraus; `gh pr checks` meldete weiter grün, weil es den geschlossenen PR
   nicht kennt. Aufgefallen ist es eine Stunde später.
2. **„Alles grün" hieß „noch nichts angetreten".** Bei PR #8 zeigte `gh pr checks`
   nur die zwei Vercel-Einträge, weil Kilo und CodeRabbit ihre Checks noch nicht
   angelegt hatten. Eine Wartebedingung darauf war sofort erfüllt. **Fehlende
   Prüfung ist nicht bestandene Prüfung.**
3. **Checks vom Vorgänger-Commit galten als aktuell.** Nach einem Push zeigte
   `gh pr checks` die Ergebnisse des vorigen Commits — gleicher Kilo-Link, gleiches
   Vercel-Deployment — und `mergeStateStatus: UNKNOWN`.

Das Skript fragt deshalb **commit-bezogen** (`commits/<sha>/check-runs` *und*
`commits/<sha>/status`, weil CodeRabbit ein Status-Context ist und kein Check-Run),
verlangt, dass jeder erwartete Prüfer *angetreten* ist, prüft `PR-HEAD == lokaler
HEAD` und liest `UNKNOWN` als „noch nicht entschieden". Bewegtes `origin/main` wird
gemeldet, weil ein Rebase-Merge denselben Inhalt als neuen Commit schreibt und der
Branch ihn danach doppelt trägt — genau daran scheiterte PR #5.

## Test-Hooks und Entwicklertisch

Seit P0.4 gibt es genau einen Test-Hook: den **Entwicklertisch unter `/dev`**
(`src/entwicklung/`). Die alten Hooks `window.__schlangentanzFixture` und
`?phase=` sind mit der alten Oberfläche entfallen.

Der Tisch ist **nur im Dev-Server und im Testhook-Build** erreichbar
(`npm run build:testhooks`, Vite-Modus `testhooks`, setzt `VITE_TEST_HOOKS=1`).
Der Schalter steht als Konstante in `src/App.tsx`; im Produktionsbuild wird er
zu `false`, und der Bundler lässt den dynamischen Import weg. Dass der Code
dann nicht im Bundle steht, prüft `tests/entwicklertisch_bundle.test.ts` bei
jedem `npm test`; `tests/layout/entwicklertisch_produktion.hooks.spec.ts`
prüft im Browser, dass `/dev` dort nur den Platzhalter zeigt.

| Adresse | Inhalt |
|---|---|
| `/dev` | Startseite mit Formular für eine Partie |
| `/dev/szenarien` | alle Szenarien mit Beschreibung und erwartetem Verhalten |
| `/dev?szenario=<name>` | lädt ein Szenario |
| `/dev?seed=<n>&spieler=<2–4>&erweiterung=<0\|1>` | Partie aus Saat; gleiche Saat, gleiche Partie |

Der Tisch zeigt den ganzen Zustand offen: alle Hände, Schlangen samt Karten
unter einer Farbenfusion, die Ablagestapel je Spieler, ausliegende Gruben,
die schwebende Karte, Karten aus dem Spiel, Partiephase, Zug mit Teilzug, wer
gerade entscheidet, die Wertung und verletzte Invarianten in Rot. Knöpfe gibt
es für jede Aktion, die die Engine aufzählt; lehnt die Engine eine ab, steht
ihr Grund da. Seit E1 kennt die Engine den Erweiterungs-Schalter, der Parameter
`erweiterung` baut die Partie also mit oder ohne Erweiterung. Nach E1 zählt die
Engine noch keine Aktion auf (alle Karten sind Platzhalter); die Knöpfe kommen
mit E2 und den Kartentasks. Szenarien entstehen aus `erstellePartie` mit
fester Saat oder aus dem Szenario-Baukasten `src/engine/testing/szenario.ts`.

Lokal: `npm run build:testhooks`, dann `npm run preview:testhooks` und
`http://localhost:4174/dev` öffnen.

**Bildschirmfotos vom Tisch:** Er wird nachgeladen; ohne Warten zeigt das Foto
nur „Lädt …“. Deshalb immer mit
`node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <ID>-<was> --ziel <ordner> --warte-auf '[data-testid="verlauf"]'`.

> **`VITE_TEST_HOOKS` gehört ausschließlich in die Vercel-Preview-Umgebung —
> ausdrücklich NICHT in Production.**
>
> Bis AP-1 verlangte diese Doku die Variable auch in Production, damit sechs
> Smokes durchliefen. Damit war der Hook in der ausgelieferten App wieder
> erreichbar und konnte beliebige Spielzustände injizieren — der Sicherheitsgewinn
> von C4 war faktisch aufgehoben. Seit AP-1 laufen genau diese sechs Smokes in
> einer eigenen Kette gegen ein Preview-Deployment.

### Zwei Smoke-Ketten (Stand 02.08.2026)

| Script | Umfang | Ziel | Test-Hooks |
|---|---|---|---|
| `npm run smoke:production` | 1 Smoke | Production-URL | nicht nötig |
| `SMOKE_BASE_URL=<preview-url> npm run smoke:preview` | 0 Smokes | Preview-Deployment | für den aktuellen Lauf nicht nötig (Kette leer); erforderlich für künftig hinzukommende hook-abhängige Smokes |

Maßgeblich ist `scripts/smoke_listen.mjs`; die Zahlen hier sind nur ihre Ansicht.

**Die Production-Kette enthält genau `brett_smoke.mjs`.** Bis G-8 standen dort 91
Skripte, die einzelne Objekte des alten Waldtanz-Bretts prüften — Steinkreis,
Lichtungsstein, Zauberpfad, Unterholzleiste. Mit dem Brett sind sie
gegenstandslos geworden. Der Nachfolger prüft nicht mehr einzelne Brettobjekte,
sondern ob ein Mensch mit einer Maus spielen kann, und stellt der Seite dieselben
vier Fragen wie `tests/layout/brett_waechter.spec.ts`. Genau das haben die 91
zusammen nicht erwischt: Sie meldeten grün, während der Startfährte-Knopf 481 px
unter dem Bildrand lag.

**Die Preview-Kette ist leer — und bleibt bestehen.** Die sechs hook-abhängigen
Smokes prüften ebenfalls das alte Brett und sind mit ihm entfallen. Die Kette
selbst ist der Kern der AP-1-Trennung „keine Test-Hooks in Production": Sobald
wieder ein Smoke die Fixture-Hooks braucht, gehört er dorthin und nicht in die
Production-Kette. Die Sperre wird von `src/App.hooks_production_guard.test.ts`
gehalten, nicht von dieser Doku.

Ein Smoke der Preview-Kette liest `SMOKE_BASE_URL` aus der Umgebung; ohne die
Variable liefe er gegen die Production-URL und würde dort scheitern.

### Runner statt &&-Kette (ÄNDERUNG 30.07.2026, AP-4)

Beide npm-Skripte rufen nur noch `scripts/run_smokes.mjs` auf; die Skriptlisten
stehen in `scripts/smoke_listen.mjs`.

Vorher war `smoke:production` eine Kette aus 83 mit `&&` verbundenen node-Aufrufen
in einer einzigen `package.json`-Zeile (rund 8000 Zeichen). Das kostete zweimal:

- **Fail-fast.** Fiel Smoke 3 um, liefen 74 weitere nie. Jede Korrektur bedeutete,
  die ganze Kette neu zu starten, um den nächsten Fehler überhaupt zu sehen.
- **Unlesbarkeit.** Über 80 Wiring-Tests zerlegten diesen String, um Mitgliedschaft
  und Reihenfolge zu prüfen.

Der Runner fährt alle Smokes einer Liste, sammelt die Ergebnisse und meldet am Ende
**alle** Fehlschläge mit den letzten Ausgabezeilen. Der Exit-Code bleibt 1, sobald
einer scheitert — die Gate-Semantik ist unverändert.

Die Tests lesen dieselbe Liste über `src/test/smokeKetten.ts`.

Bis 02.08.2026 bot dieses Modul zusätzlich `produktionsKette()`, das die Liste
wieder in die alte `node a.mjs && node b.mjs`-Form goss — ein Zugeständnis an die
Bestandstests, die auf einer Zeichenkette prüften. Diese Tests prüften das alte
Brett und sind mit G-8 entfallen; die Ansicht ist mit ihnen gegangen. Ein neuer
Test fragt `produktionsSchritte()` und arbeitet auf der Liste.

### Absicherung

- `src/App.hooks_production_guard.test.ts` schlägt fehl, sobald ein hook-abhängiger
  Smoke zurück in `smoke:production` wandert **oder** ein bestehender
  Production-Smoke neu einen Hook benutzt. Die Prüfung liest die Skript-Quelltexte,
  verlässt sich also nicht auf eine gepflegte Liste.
- `src/test/smokeKetten.ts` ist die Test-Schnittstelle auf die Ketten — seit
  AP-4 aus `scripts/smoke_listen.mjs`, nicht mehr aus `package.json`. Für die
  Ausführung liest der Runner (`scripts/run_smokes.mjs`) dieselbe Liste direkt.
  Tests fragen über diese Schnittstelle nach, statt selbst auf einer Kette zu
  suchen; sonst bricht jeder Wechsel der Kette gleich ein Dutzend Tests.

### Was im Production-Bundle steht

`testHooksAktiv()` kompiliert im Production-Build zu `return false`. Erneut
geprüft am 02.08.2026 an `dist/assets/index-DSoCa4lI.js`: Die Guard-Funktion
heißt dort `pn` und lautet `function pn(){return!1}`. Der Installationspfad des
Hooks ist damit **statisch unerreichbar**.

Der Bezeichner `__schlangentanzFixture` ist im Bundle trotzdem noch als Zeichenkette
zu finden: Vite entfernt den toten Zweig hinter `if (… || !testHooksAktiv()) return`
nicht. Ein `grep` nach dem Hook-Namen ist deshalb **kein** taugliches Kriterium.

Der Kurzname der Guard-Funktion wechselt mit jedem Build — am 30.07.2026 hieß sie
noch `Qr`, und im selben Bundle steht mehr als eine Funktion mit dem Rumpf
`return!1`. Verlässlich ist nur der Aufrufkontext: Wer prüfen will, sucht den
Hook-Namen und liest die Bedingung unmittelbar davor. Dort steht heute
`if(typeof window>"u"||!pn())return;` — der Hook wird nur installiert, wenn der
Guard `true` liefert, und er liefert `false`.

### Vitest

Vitest-Tests brauchen keine Sonderkonfiguration: im Testlauf ist
`import.meta.env.DEV` ohnehin `true`, sodass die Hooks dort aktiv bleiben.

## Layout-Verträge (ÄNDERUNG 30.07.2026, AP-2)

Layout-Zusicherungen werden im Browser **gemessen**, nicht im CSS-Quelltext gelesen.

### Warum

177 Testdateien lasen `src/App.css` als Text und prüften mit selbstgebauten
Klammer-Parsern auf exakte `clamp()`-Werte — rund 740 solcher Assertions. Die
Absicht dahinter ist fast immer geometrisch („der Arenastein darf nicht so hoch
werden, dass die Hand aus dem 1280×900-Erstbild rutscht"). Der Umweg über den
Quelltext hatte drei Kosten: jede Layout-Änderung erzwang eine Migration fremder
Testdateien („Pitfall #48"), die Prüfung sagte nichts über das tatsächliche
Rendering, und einzelne Asserts waren wirkungslos, ohne dass es auffiel.

### Wie

- `npm run test:layout` startet Playwright gegen `vite preview`
  (`playwright.config.ts`, Viewport 1280×900, `reducedMotion: 'reduce'` — dieselben
  Parameter wie die Production-Smokes, damit die Werte vergleichbar bleiben).
- Verträge liegen unter `tests/layout/` und benutzen die Primitive aus
  `tests/layout/messung.ts` (die einzige Quelle für Messungen).
- `clamp()` wird als **Bereich** in `rem` geprüft, nie als exakter Pixelwert.
- `tests/layout/**` hat ein eigenes TS-Projekt (`tsconfig.layout.json`), weil die
  `page.evaluate`-Callbacks DOM-Typen brauchen, und ist in `vite.config.ts` von
  Vitest ausgeschlossen.
- Der Lauf ist **nicht** Teil von `npm test`: er braucht einen Production-Build und
  ist um Größenordnungen langsamer.

### Zwei Aufträge (ÄNDERUNG 03.08.2026, Punkt 1b)

`npm run test:layout` fährt seither je Geräteklasse **zwei** Playwright-Projekte.
Die Geräteklassen stehen in `scripts/pruefung/geraeteklassen.mjs`; seit P0.3c
sind es fünf: `desktop` 1280×900, `tablet-quer` 1024×768, `tablet-hochkant`
768×1024, `handy-hochkant` 390×844 und `handy-quer` 844×390, alle ausser
`desktop` mit Touch.

| Projekt | Port | Verzeichnis | Build | Verträge |
|---|---|---|---|---|
| `desktop`, `tablet-quer`, `tablet-hochkant`, `handy-hochkant`, `handy-quer` | 4173 | `dist` | `vite build` | alle ausser `*.hooks.spec.ts` |
| dieselben mit `-testhooks`, etwa `handy-quer-testhooks` | 4174 | `dist-testhooks` | `npm run build:testhooks` (Modus `testhooks`, setzt `VITE_TEST_HOOKS=1`) | nur `*.hooks.spec.ts` |

Alle Verträge laufen in allen fünf Geräteklassen. Bekannte Befunde in den mit
P0.3c neuen Klassen stehen in `tests/layout/geraeteklassen_ausnahmen.json`;
die Liste darf nur schrumpfen. Ein eigenes Chromium nennt nur die
Umgebungsvariable `PW_CHROMIUM_PFAD`.

**Warum.** Bis P0.4 war die Sieger-Party nur über `/game?phase=spielende`
erreichbar, und dieser Hook war im Produktionsbuild aus. Der Bildschirm war deshalb von keinem
Vertrag gedeckt — und genau dort saßen vier Fehler, alle alt, alle an einem Tag
gefunden, als ihn zum ersten Mal jemand ansah. Ein Vertrag, den man nur dadurch
bekommt, dass man `VITE_TEST_HOOKS` in Production setzt, wäre die Rücknahme von
AP-1; ein zweiter Auftrag ist es nicht.

Die beiden Builds unterscheiden sich um **genau eine Flagge**. Verträge für
Bildschirme, die ein Spieler ohne Hook erreicht, bleiben am Produktionsbuild und
messen genau den Build, der ausgeliefert wird. Seit P0.4 (alte Oberfläche
entfernt) sind das `platzhalter.spec.ts`; der zweite Auftrag misst den
Entwicklertisch (`entwicklertisch*.hooks.spec.ts`).

**Der verwaiste Preview-Server ist mechanisch ausgeschlossen**, nicht per
Merkzettel. `reuseExistingServer` steht auf `false` — auch lokal, wo vorher
`!process.env.CI` stand. Lief noch ein `vite preview`, baute Playwright nicht
neu und maß still den alten Build; das Ergebnis ist grün und bescheinigt einen
Build, den es nicht gibt. Beim Bauen dieses Slices sind daran drei Gegenproben
wertlos geworden, bevor es auffiel. Mit `false` benutzt Playwright einen
erreichbaren bestehenden Server nicht mehr weiter, sondern bricht den Start
sofort ab, sobald unter der URL schon etwas antwortet („… is already used").
Der Preis ist ein Neubau je Lauf.

Der Abbruch ist damit die Absicherung — und weil er **beabsichtigt** ist, ist er
selbst erklärungsbedürftig: Playwright sagt `… is already used` und nennt die
URL, aber nicht, *wer* dort antwortet. Dafür ist

```bash
ss -ltn | grep -E '4173|4174'
```

die Vorprüfung: Sie macht einen verwaisten `vite preview` aus einem früheren Lauf
sichtbar, bevor man vor dem Abbruch steht und rät. Sie ist ausdrücklich **kein**
Ersatz für die Mechanik — dieses Repo ersetzt Merkzettel durch Messungen, und
genau deshalb stand hier zwischenzeitlich die Anweisung, `ss` *statt*
`reuseExistingServer: false` zu benutzen. Das war das falsche Mittel. Als
Diagnose neben dem Abbruch ist derselbe Befehl richtig: Er verhindert nichts, er
beantwortet nur die Frage, die der Abbruch stellt.

Beide Server bauen mit `vite build`, nicht mit `npm run build` — also ohne
`tsc -b`. Der Typecheck ist ein eigenes Gate und kostete hier gemessen 5,0 s je
Server, während der Bau selbst 0,17 s braucht. Playwright startet **alle**
`webServer`-Einträge, auch bei `--project=…`.

**Ein hook-abhängiger Vertrag heißt `*.hooks.spec.ts`** — die Zuordnung läuft
allein über den Dateinamen. `src/layout_hooks_namensgebung.test.ts` hält beide
Richtungen fest: kein Vertrag mit Hook-Bedarf ohne Suffix, kein Suffix ohne
Hook-Bedarf. Die zweite Richtung ist die wichtigere, weil sie sonst still wäre —
ein falsch benannter Vertrag misst für immer `dist-testhooks` und bleibt grün,
obwohl sein Urteil den ausgelieferten Build nicht mehr betrifft.

**Ein hook-abhängiger Vertrag braucht eine Vorbedingung im `beforeEach`**, die
prüft, dass der Bildschirm überhaupt da ist. Ohne sie messen die generischen
Wächter die Seite *ohne* den Bildschirm und bleiben grün — gemessen: fünf von
acht Tests blieben gegen den Produktionsbuild grün, obwohl es dort gar keine
Sieger-Party gibt. Mit der Vorbedingung fallen acht von acht.

### Abbau des Altbestands

`npm run check:css-asserts` zählt die verbliebenen CSS-Quelltext-Assertions und
schlägt fehl, sobald die Zahl über `scripts/css_source_asserts_baseline.json`
steigt. Sinkt sie, fordert der Guard das Nachziehen der Baseline ein
(`npm run check:css-asserts -- --update-baseline`). Damit friert ein Abbruch der
Migration den erreichten Stand ein, statt ihn zurückrollen zu lassen.

Stand 02.08.2026: **1 Treffer in 1 Datei** (Start 741/184) — die Migration ist
**abgeschlossen**.

Der letzte Treffer ist keine Assertion mehr, sondern die Erwähnung von `appCss`
in einem Kommentar in `tests/layout/lobby_erstbild.spec.ts`, der festhält, warum
der frühere Oder-Zweig auf den CSS-Quelltext wirkungslos war. Das Muster in
`scripts/check_css_source_asserts.mjs` ist bewusst zeilenweise und konservativ
und kann Kommentar nicht von Code unterscheiden. Der Kommentar ist die
Begründung wert; die Baseline bleibt deshalb bei 1 statt bei 0.

Der Guard bleibt trotz abgeschlossener Migration bestehen — jetzt nicht mehr als
Abbau-Ratsche, sondern als Sperre gegen den Rückfall: Ein neuer
CSS-Quelltext-Vertrag in einer Testdatei lässt ihn sofort rot werden.

Den Bestand abgebaut haben:

| Familie | Ersetzt durch |
|---|---|
| Arena-/Hand-Caps (Pilot, AP-2) | in `tests/layout/brett_waechter.spec.ts` aufgegangen |
| Dokumentrahmen (AP-4) | `tests/layout/app_shell.spec.ts` |
| Lobby (AP-6) | `tests/layout/lobby_erstbild.spec.ts` |
| das gesamte Waldtanz-Brett (G-8) | mit der alten Ansicht entfallen; `tests/layout/brett_waechter.spec.ts` und `tests/layout/brett_dauerlauf.spec.ts` prüfen das neue Brett |

Der große Sprung kam nicht aus der Migration, sondern aus G-8: Die 177
Testdateien, die `src/App.css` als Text lasen, prüften fast alle das alte Brett
und sind mit ihm entfallen. Was blieb, war bereits gemessen.

Die Lobby-Migration hat nebenbei einen regredierten Vertrag aufgedeckt — siehe
`docs/PLAYABILITY_GATE.md`, Abschnitt „AP-6: M3g-Erstbild-Vertrag ist regrediert".

## Bewusst nicht implementiert (Stand 30.07.2026, überholt seit 12.11.2026)

Damit diese Punkte nicht wiederholt als „toter Code" oder „vergessenes Feature"
aufschlagen, hier die bewussten Entscheidungen:

### Erweiterungskarten außerhalb des Spieldecks

`Comeback` (4), `Risiko-Belohnung` (8) und `Schlangenkorb des Glücks` (1) werden in
`src/engine/deck.ts` erzeugt, gelangen aber nicht ins gemischte Spieldeck. Ihr
einziger Zweck ist die Namensvalidierung in `serialization.ts`.

**ÄNDERUNG 03.08.2026:** Der digitale Umfang steht jetzt vollständig und an
einer Stelle in `docs/GAME_SPEC.md` **R1.2a** — welche Bestandteile aus Basis-
spiel und Erweiterung übernommen sind und welche nicht. Hier stand er zuvor
zur Hälfte; die andere Hälfte lag in R1.1/R1.2 und in R6. Wer wissen will, ob
etwas zum Spiel gehört, liest R1.2a.

Dazugekommen ist dabei eine Regel, die überall gefehlt hat: der Bonus für die
längste Farbkette (R8.4a). Weggefallen ist der **Vielfaltbonus** — die
Normquelle weist ihn als Erweiterung aus, und `ermittleFarbenFuerFarbvielfalt`
samt Kartenfeld `vielfaltbonusIgnorieren` ist mit demselben Slice aus der Engine
entfernt worden. Beides hatte keinen Produktionsaufrufer.

**ÄNDERUNG 12.11.2026:** Die genannten R-Nummern gehören zur Spec-Fassung bis
04.08.2026. Der digitale Umfang steht jetzt in `docs/GAME_SPEC.md` Teil B1, die
längste Farbkette und der Vielfaltbonus in A11. Der Autor hat entschieden: die
ganze Erweiterung, vor der Partie wählbar (Teil B1).

## Speichern und Laden (ÄNDERUNG 03.08.2026)

Die laufende Partie überlebt einen Reload. Bis zu diesem Datum stand hier das
Gegenteil: `serialization.ts` habe keinen Produktionsaufrufer, ein Reload
verwerfe die Partie, Persistenz wäre ein eigener Slice. Das ist erledigt.

**Wie es läuft.** `src/spielstand.ts` schreibt den Spielzustand nach jeder
Änderung in `localStorage` und liest ihn beim Start zurück. Kein Knopf, keine
Anzeige, keine neue Region — nach Regel 7 der `SPIELBRETT_SPEC.md` gehören nur
Klicks aufs Brett, die eine Entscheidung verlangen. Der Spieler merkt es nur
daran, dass ein Reload nichts mehr kostet.

Die Datei liegt **nicht** in `engine/`: Speichern ist keine Spielregel, und die
Engine soll frei von Browser-APIs bleiben. Angebunden ist sie in
`src/hooks/usePartie.ts` — geladen in der Startkette, gespeichert in einem
Effekt auf `zustand`. Der Effekt ist der eine Ort, an dem jede Änderung ankommt;
in `wechsleZustand` allein zu speichern hätte den Gegnerzug und den Neustart
verpasst.

**Reihenfolge beim Laden:** `initialZustand` → `?phase=`-Hook → gespeicherte
Partie → neue Partie. Tests und Smokes behalten Vorrang, sonst hinge die Suite
davon ab, was ein früherer Lauf im Speicher hinterlassen hat.

**Ungültige Stände werden still verworfen.** Jeder Fehler beim Lesen — kaputtes
JSON, ungültige Struktur, ein nicht mehr migrierbares Format — führt zu einer
frischen Partie und zum Löschen des Eintrags. Der Spieler hat einen kaputten
Stand weder verursacht noch kann er ihn beheben; ihm eine Fehlermeldung zu
zeigen hilft nicht, und ihn stehen zu lassen sperrt ihn beim nächsten Reload
erneut aus.

**Die Falle, die dabei entsteht.** Ein Zustand, den `deserialisiere` durchlässt,
der aber beim Zeichnen die Wertung wirft, käme nach jedem Reload zurück — der
Spieler säße dauerhaft im Fehlerfang. Deshalb verwirft der Weg zurück zur Lobby
(`App.tsx`) den Spielstand.

Beim Bauen gemessen: `serialisiere` lässt mehr durch als `deserialisiere` prüft.
Ein Zustand mit Farbenfusion-Karte ohne `farbenfusionen`-Eintrag wird
geschrieben, aber beim Lesen abgelehnt — und damit gelöscht. Die
Persistenz-Validierung ist also **strenger als die Wertung**, und ein Teil der
möglichen Fallen räumt sich selbst auf. Ausgeschlossen ist sie nicht:
`scoring.ts` hat Laufzeitpfade, die keine Strukturprüfung sieht.

**Ein Stand, überschrieben.** Kein Mehrfach-Speicherplatz, kein Export. Bei
Spielende wird *nicht* gelöscht — die Schlusswertung soll einen Reload
überleben; eine neue Partie überschreibt den Eintrag ohnehin.
