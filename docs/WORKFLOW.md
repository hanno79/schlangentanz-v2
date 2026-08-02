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
   - tasks must be normalized into `GAME_SPEC.md`

5. **Paperclip is not used for implementation**
   - old Paperclip activity is treated as historical context only

## Project separation rules

- Do not reuse the old repo remote.
- Do not reuse the old Vercel project.
- Do not mix old build artifacts or Paperclip output into this repo.
- Any referenced old behavior must be converted into explicit spec text and tests first.

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

## Test-Hooks (ÄNDERUNG 05.07.2026 C4, überarbeitet 30.07.2026 AP-1)

Die Test-Hooks `window.__schlangentanzFixture` und der `?phase=`-URL-Hook sind
**nur im Dev-Build oder mit gesetztem `VITE_TEST_HOOKS=1`** aktiv (siehe
`src/testPhaseHook.ts` → `testHooksAktiv()`).

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
| `SMOKE_BASE_URL=<preview-url> npm run smoke:preview` | 0 Smokes | Preview-Deployment | erforderlich |

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

Die Tests lesen dieselbe Liste über `src/test/smokeKetten.ts`. Für Bestandstests,
die weiterhin auf einer Zeichenkette prüfen, liefert `produktionsKette()` die alte
`node a.mjs && node b.mjs`-Form — aber aus der Liste erzeugt, sodass Ausführung und
Prüfung nicht auseinanderlaufen können.

### Absicherung

- `src/App.hooks_production_guard.test.ts` schlägt fehl, sobald ein hook-abhängiger
  Smoke zurück in `smoke:production` wandert **oder** ein bestehender
  Production-Smoke neu einen Hook benutzt. Die Prüfung liest die Skript-Quelltexte,
  verlässt sich also nicht auf eine gepflegte Liste.
- `src/test/smokeKetten.ts` ist die einzige Stelle, die die Ketten liest — seit
  AP-4 aus `scripts/smoke_listen.mjs`, nicht mehr aus `package.json`. Tests fragen
  dort nach, statt selbst auf einer Kette zu suchen; sonst bricht jeder Wechsel
  der Kette gleich ein Dutzend Tests.

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

## Bewusst nicht implementiert (Stand 30.07.2026)

Damit diese Punkte nicht wiederholt als „toter Code" oder „vergessenes Feature"
aufschlagen, hier die bewussten Entscheidungen:

### Speichern/Laden einer Partie

`src/engine/serialization.ts` (rund 700 Zeilen inkl. sieben Migrationsschritten)
hat **keinen Produktionsaufrufer**. Es gibt kein Speichern/Laden; ein Reload
verwirft die laufende Partie. Das Modul ist Test-Infrastruktur: der
Vollpartie-Soak-Test prüft nach jedem Zug den Roundtrip
`deserialisiere(serialisiere(zustand))` und fängt damit strukturelle Engine-Fehler
früh ab. Die Migrationsschritte bleiben erhalten, weil sie ältere Testfixtures
lauffähig halten. Persistenz wäre ein eigener Slice inkl. Fehlerpfad für ungültige
gespeicherte Stände.

### Erweiterungskarten außerhalb des Spieldecks

`Comeback` (4), `Risiko-Belohnung` (8) und `Schlangenkorb des Glücks` (1) werden in
`src/engine/deck.ts` erzeugt, gelangen aber nicht ins gemischte Spieldeck. Ihr
einziger Zweck ist die Namensvalidierung in `serialization.ts`. Das digitale
Spieldeck umfasst 114 Karten: 110 Basiskarten plus die 4 Schlangenhäutung-Karten
der Erweiterung (Audit-Fix H1) — siehe `docs/GAME_SPEC.md` R1.1/R1.2.
