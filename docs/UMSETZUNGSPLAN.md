# Umsetzungsplan Schlangentanz v2 — regelkonformes, spielbares Spiel

Stand: 12.11.2026 · 42 Tasks in fünf Phasen

## 1. Context

Das digitale Schlangentanz ist heute nicht spielbar. Drei Ursachen sind belegt:

- **Engine:** 15 Abweichungen von der Spielanleitung (`docs/GAME_SPEC.md`
  Teil C), dazu acht weitere, die erst beim Planen am Code aufgefallen sind
  (Abschnitt 2.4). Die Regenbogenschlange lässt sich gar nicht ausspielen;
  Nachziehen, Verdoppler, Ablagestapel und Pflichtkarte folgen alten Regeln.
- **KI:** spielt immer die erste erlaubte Aktion, höchstens eine Karte pro Zug.
- **Oberfläche:** zeigt den jeweils aktiven Spieler als „Deine …", keine
  Kartenbilder, KI-Züge laufen unsichtbar in einem Schritt durch, nur Desktop.

Die Regelbasis ist geklärt: Die Website `https://schlangentanz.ch/rules` ist
die einzige Regelquelle, `docs/GAME_SPEC.md` Teil A spiegelt sie wörtlich.

**Ziel:** ein regelkonformes, auf Desktop, Tablet und Handy spielbares Spiel,
ein Mensch gegen 1–3 KI-Gegner, Basis-Spiel und Erweiterung wählbar.

**Weg:** KI und Oberfläche entstehen neu. Die Engine behält ihren Aufbau
(reiner Zustand, erlaubte Aktionen aufzählen, prüfen, anwenden, Wertung,
Speichern). **Ehrliche Einordnung:** Mit den Entscheidungen D9–D13 ist der
Umbau grösser als eine Reparatur. Zugablauf, Aktionsschicht, Abwehr und
Speicherformat werden neu geschrieben, das ist etwa die Hälfte des
Engine-Codes. Die meisten Regeltests werden durch neue Tests je
Spec-Abschnitt ersetzt statt angepasst, weil sie altes Verhalten festhalten.

Jeder Task wird von einem Umsetzer gebaut und von einem unabhängigen Prüfer
ohne Vorkenntnisse abgenommen.

## 2. Verbindliche Grundlagen

### 2.1 Rangfolge

1. Website → 2. `docs/GAME_SPEC.md` Teil A (Spiegel) → 3. Teil B (digitale
Festlegungen) und Teil D (Antworten des Autors). Alles andere ist keine
Regelquelle. Gibt die Website etwas nicht her: fragen, nicht raten.

### 2.2 Entscheidungen des Autors vom 12.11.2026 (noch nicht auf der Website)

Sie gelten ab sofort. P0.1 trägt sie in Teil D ein und liefert dem Autor einen
Prompt, um die Website nachzuziehen.

| Nr. | Entscheidung |
|---|---|
| D9 | **Jede Karte darf in jede Schlange**, auch in gegnerische. Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle. |
| D10 | **Farbenschutz** wehrt jede Sonderkarte eines Gegners ab, die mich oder meine Schlange trifft (auch Farbenfusion, Schlangenhäutung, Regenbogenschlange). Gegen Farbkarten gibt es keine Abwehr. |
| D11 | **Verdoppler:** Im zweiten Zug ist kein weiterer Verdoppler erlaubt. |
| D12 | **Pflichtkarte:** mindestens 1, höchstens 2 Karten, davon höchstens eine Farbkarte und höchstens eine Sonderkarte. Eine Karte genügt, egal welcher Art. |
| D13 | **Sonderkarten ohne Nutzen:** Man darf jederzeit eine Sonderkarte spielen, auch wenn sie nichts bringt. Hat sie kein mögliches Ziel, kommt sie ohne Wirkung auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges. |

### 2.3 Produktentscheidungen

- **Eine solide KI**, keine Stufen. Sie bewertet Züge, nutzt beide Karten und
  erkennt, welche Karte beim Gegner schadet und welche bei ihr selbst nützt.
- **Kartenbilder** von schlangentanz.ch (gemessen: 604×900 Pixel, für alle
  Geräte ausreichend).
- **Geräte:** Desktop, Tablet quer, Handy hochkant; Maus und Touch.
- **Erweiterung:** komplett, ein Schalter vor der Partie.
- **Alte Spielstände** werden verworfen (neues Speicherformat).
- **Umsetzung läuft lokal auf dem Desktop**, dort ist Codex mit Abo verfügbar.
- **Merge:** Der Orchestrator merged Task-PRs nach bestandener Abnahme selbst.
- **Dart:** Jeder Task steht dort mit Abnahmekriterien und in Reihenfolge.

### 2.4 Weitere Abweichungen im Code (am 12.11.2026 gefunden)

P0.1 nimmt sie als C16–C23 in Teil C auf.

| Nr. | Befund | Fundstelle | Task |
|---|---|---|---|
| C16 | Farbenfusion legt die zwei Farbkarten auf die Ablage; A7.7 lässt sie unter der Fusion, A7.4 gibt sie beim Entfernen zurück. | `kartenwirkungen.ts:476`, `zugHelfer.ts:62` | E1, E7 |
| C17 | Schlangenfrass fragt die Abwehr je Karte und entfernt ungeschützte Ziele sofort; A6 entscheidet je Spieler, die Wirkung kommt nach allen Reaktionen. | `reaktionsaufloesung.ts:40` | E4, E6 |
| C18 | Die Schlangengrube geht sofort auf die Ablage; A7.6: nach dem ausgesetzten Zug. | `kartenwirkungen.ts:83` | E4 |
| C19 | Farbkarte, Farbenfusion und Schlangenhäutung gehen nur auf eigene Schlangen (D9). | `legalActions.ts:717`, `turnState.ts:412` | E5, E7, E9 |
| C20 | Aufgaben werden nur am Ende der Ausspielphase geprüft; A9: sobald erfüllt und am Zug. | `turnState.ts:249` | X1 |
| C21 | Farbwechsler prüft vier Einzelkarten; A9: „Es gelten auch Reihen". | `aufgabenPruefung.ts:92` | X2 |
| C22 | Comeback- und Risiko-Karten stehen als Sonderkarten im Deckmodul; sie sind kein Deckmaterial. | `deck.ts:41` | E1 |
| C23 | Symmetriemeister verlangt gerade Länge und nur Farbkarten; die Website sagt das nicht (Frage G6). | `aufgabenPruefung.ts:128` | X2 |

## 3. Arbeitsweise

### 3.1 Branches und Meilensteine

Jeder Push auf `main` geht sofort in Produktion (Vercel). Der Umbau macht die
alte Oberfläche zwischenzeitlich unbrauchbar. Deshalb:

- **Integrationsbranch `neuaufbau`**, abgezweigt von `main`. Jeder Task hat
  einen eigenen Branch `task/<ID>-<kurzname>` und einen PR **gegen `neuaufbau`**.
- **`main` bekommt nur Meilensteine**, wenn `neuaufbau` als Ganzes spielbar
  ist. Vorher spielt der Autor die Vercel-Vorschau und gibt frei.

| Meilenstein | Inhalt | nach `main` |
|---|---|---|
| M0 | Fundament: Plan im Repo, Prüfwerkzeuge, Entwicklertisch | nein |
| M1 | Basis-Engine regelkonform | nein |
| M2 | **Basis-Spiel spielbar:** neue Oberfläche, neue KI, drei Geräteklassen | ja, nach Freigabe |
| M3 | **Erweiterung spielbar** | ja, nach Freigabe |
| M4 | Release: Doku, Evidenz, Produktion geprüft | ja |

### 3.2 Rollen je Task

| Rolle | Wer | Aufgabe |
|---|---|---|
| Orchestrator | Hauptsitzung | vergibt Tasks, hält die Reihenfolge, merged, pflegt Dart, berichtet je Meilenstein |
| Umsetzer | Subagent, eigener Worktree | schreibt Tests, dann Code; liefert PR |
| Prüfer | **neuer** Subagent ohne Vorkenntnisse | nimmt anhand der Abnahmekriterien ab, prüft im Browser |
| Codex | `codex exec` lokal | adversariales Review jedes Engine- und KI-Tasks |

### 3.3 Ablauf eines Tasks

1. **Vergabe:** Der Umsetzer bekommt die Task-ID, diesen Plan (Abschnitte 2, 3
   und den Task-Block) und die Spec. Mehr nicht.
2. **Tests zuerst:** Der erste Commit enthält nur Tests. Sie schlagen dort fehl.
3. **Umsetzung**, danach `/simplify`, danach alle Gates (3.5).
4. **PR gegen `neuaufbau`** mit Task-ID, Abnahmekriterien, Ausgabe der Gates
   und Vermerk zu `/simplify`.
5. **Codex-Review** (Engine und KI): `codex exec` über den Diff mit dem
   Auftrag, Regelverstösse gegen die genannten Spec-Abschnitte und Fehler in
   Grenzfällen zu suchen. Kritische Befunde werden behoben oder mit Beleg
   widerlegt.
6. **Abnahme:** Ein frischer Prüfer bekommt nur Task-ID, Branchname und
   `docs/abnahme/PRUEFER_ANLEITUNG.md`, **nicht** den Bericht des Umsetzers.
   Er prüft jedes Kriterium selbst und schreibt `docs/abnahme/<ID>.md`
   (Kriterium, erfüllt ja/nein, Beleg).
7. **Urteil:** Sind alle Kriterien erfüllt, merged der Orchestrator. Sonst
   geht der Task mit dem Prüfprotokoll in die **nächste Iteration**; danach
   prüft wieder ein **neuer** Prüfer **alle** Kriterien. Nach drei abgelehnten
   Iterationen hält der Orchestrator an und fragt den Autor.

### 3.4 Pflichten des Prüfers

- Er führt die Gates selbst aus und prüft jeden Exit-Code einzeln.
- Er prüft den ersten Commit: nur Tests, dort rot.
- Er vergleicht `git diff --stat` mit dem Feld „Dateien" des Tasks. Jede Datei
  ausserhalb braucht eine Begründung im PR.
- **Gegenprobe:** Er kehrt mindestens eine Regel im Code um und sieht, dass
  ein Test rot wird.
- **Er prüft im echten Browser**, nie nur am Code:
  - Engine- und KI-Tasks am **Entwicklertisch** (P0.4): Szenario laden, die
    Schritte des Tasks mit echten Klicks ausführen, das Ergebnis ablesen.
  - Oberflächen-Tasks in **drei Geräteklassen**: Desktop 1280×900, Tablet quer
    1024×768 mit Touch, Handy hochkant 390×844 mit Touch.
  - Er macht Bildschirmfotos, **sieht sie an** und beschreibt im Protokoll,
    was zu sehen ist. Ein Foto ohne Beschreibung gilt nicht als Beleg.
- Er sucht aktiv nach Fehlern: mindestens zwei eigene Grenzfälle je Task, die
  nicht in den Kriterien stehen.

### 3.5 Gates (für jeden Task, Exit-Code einzeln prüfen)

`npm test -- --run` · `npm run typecheck` · `npm run build` ·
`npm run check:test-lines` · `npm run check:css-asserts` · `npx eslint .` ·
`npm run check:regeln` (neu, P0.3) · bei Oberflächen-Tasks zusätzlich
`npm run test:layout`.

### 3.6 Definition of Done (gilt für jeden Task)

1. Jedes Abnahmekriterium ist im Prüfprotokoll `docs/abnahme/<ID>.md` mit
   Beleg als erfüllt vermerkt, von einem Prüfer, der den Task nicht umgesetzt hat.
2. Erster Commit: nur Tests, dort rot.
3. Alle Gates grün, vom Prüfer selbst ausgeführt.
4. `/simplify` ist gelaufen, Befunde sind eingearbeitet.
5. Engine und KI: Codex-Review ohne offenen kritischen Befund, Ergebnis im PR.
6. Browserprüfung nach 3.4 ist erfolgt und beschrieben.
7. Engine ab E2: Dauerlauf grün (300 Zufallspartien mit 2, 3 und 4 Spielern,
   feste Saaten; alle enden, keine verletzt eine Invariante).
8. Behebt der Task eine Zeile aus Teil C, meldet er das im PR; der
   Orchestrator streicht sie beim Merge. Betroffene Doku ist nachgezogen.
9. PR ist in `neuaufbau` gemerged, der Dart-Task steht auf Done.

### 3.7 Umsetzungsregeln (prüfbar)

| Nr. | Regel | Wie geprüft |
|---|---|---|
| U1 | Jeder Regeltest nennt seinen Spec-Abschnitt im Namen, z. B. `A5: …`. Jedes Beispiel der Website ist ein Test. | `check:regeln`, Prüfer |
| U2 | Keine Regel im Code, die nicht in Teil A, B oder D steht. Bei einer Lücke: anhalten, Frage in Teil D. | Prüfer, Codex |
| U3 | Die Oberfläche enthält keine Regellogik. `src/ui/**` und `src/ki/**` importieren die Engine nur über `src/engine/index.ts`. Die Oberfläche filtert aufgezählte Aktionen und baut nie selbst eine. | Architekturtest |
| U4 | Die Engine ist rein: kein React, kein DOM, kein `Math.random`, kein `Date`. Zufall kommt als Parameter. | Architekturtest |
| U5 | Die KI sieht nur ihre **Sicht**. Nur `src/ki/sicht.ts` darf den vollen Spielzustand lesen. | Architekturtest, Test K2.7 |
| U6 | Kein `any`, kein `@ts-ignore`, kein `eslint-disable` ohne Begründung in derselben Zeile, kein `it.skip`, `it.only`, `describe.skip`. | `check:regeln` |
| U7 | Testdateien höchstens 499 Zeilen; neue Dateien in `src/ui` und `src/ki` höchstens 300 Zeilen. | `check:test-lines`, `check:regeln` |
| U8 | Layout wird gemessen (Playwright, `tests/layout/messung.ts`), nie im CSS-Quelltext gelesen. | `check:css-asserts` |
| U9 | Deutsche Bezeichner und Kommentare. Kein Dateikopf mit Author, Datum oder Version und keine `// ÄNDERUNG`-Kommentare: wer, wann und warum steht im git-Log (Kern in `AGENTS.md`, Entscheidung des Autors vom 12.11.2026). Bestehende Köpfe bleiben, bis die Datei ohnehin umgebaut wird. | Prüfer |
| U10 | Keine neue Laufzeit-Abhängigkeit. Neue Entwicklungs-Abhängigkeiten nur, wenn der Task sie nennt. | Prüfer liest `package.json`-Diff |
| U11 | Kein Code aus Altprojekten. | Prüfer |
| U12 | Fehlermeldungen der Engine sind deutsch und nennen den Grund. | Regeltests |
| U13 | `docs/GAME_SPEC.md`, `tests/spec_documentation.test.ts`, `src/engine/aktionen/typen.ts` und `src/engine/karten/register.ts` ändert nach E1 nur der Orchestrator oder ein Task, der es ausdrücklich nennt. | Prüfer liest Diff |

### 3.8 Kosten

Geplant ist nichts Kostenpflichtiges: Codex läuft über euer Abo, die
Kartenbilder kommen von der Website. Eine Stelle könnte kostenpflichtige
Bildwerkzeuge (Higgsfield) brauchen: Kartenrückseite und Tischhintergrund
(O1). Dort legt der Orchestrator **vorher** eine Kostenschätzung vor und fragt.

## 4. Phase 0 — Fundament (Meilenstein M0)

### P0.1 Plan und Grundlagen ins Repo, Tasks nach Dart

*Läuft in dieser Cloud-Sitzung direkt nach der Freigabe. Danach geht es lokal weiter.*

- **Ziel:** Nichts hängt mehr an dieser Sitzung.
- **Umfang:**
  - `docs/UMSETZUNGSPLAN.md`: dieser Plan.
  - `docs/GAME_SPEC.md`: D9–D13 in Teil D („beantwortet, Website folgt");
    Teil C um C16–C23 und die Folgen von D9–D13 ergänzt. Teil A bleibt unberührt.
  - `scripts/website_abgleich/`: die Abgleich-Skripte aus dem Zwischenspeicher
    als Node-Skripte, Aufruf `npm run abgleich:website`.
  - `CLAUDE.md`, `docs/WORKFLOW.md`: Rollen und Ablauf nach Abschnitt 3.
  - **Dart:** je Plan-Task ein Task auf dem Board `Schlangentanz/Tasks` mit
    Task-ID im Titel, Ziel, Abhängigkeiten, Abnahmekriterien und Verweis auf
    Abschnitt 3.6. Die Titel sind so nummeriert, dass die Reihenfolge der
    Wellen (Abschnitt 10) sichtbar ist. Kein Regeltext, nur Verweise auf die Spec.
  - Branch `neuaufbau` von `main`.
  - Prompt für den Website-Agenten zu D9–D13 an den Autor.
- **Abnahmekriterien:**
  1. `npm run abgleich:website` meldet: jede Zeile der Website steht in Teil A.
  2. `tests/spec_documentation.test.ts` ist grün; Teil A enthält D9–D13 **nicht**.
  3. In Dart gibt es je Plan-Task genau einen Task; Stichprobe von fünf Tasks
     stimmt wörtlich mit den Abnahmekriterien des Plans überein.
  4. Eine frische Sitzung findet mit „Lies `docs/UMSETZUNGSPLAN.md`" alles Nötige.

### P0.2 Lokale Umgebung

- **Ziel:** Die lokale Sitzung kann bauen, im Browser prüfen und Codex nutzen.
- **Dateien:** `package.json` (`build:testhooks` setzt die Variable heute in
  POSIX-Schreibweise und läuft unter Windows nicht; Ersatz durch `vite build
  --mode testhooks` mit `.env.testhooks`; `engines`-Angabe), `docs/WORKFLOW.md`.
- **Abnahmekriterien:**
  1. `npm ci` und alle Gates aus 3.5 laufen auf dem Desktop grün.
  2. `npx playwright install chromium` ist erfolgt, `npm run test:layout` grün.
  3. `codex exec` liefert auf eine Testfrage zum Repo eine Antwort (Abo-Login).
  4. `gh auth status` ist angemeldet; ein Test-PR gegen `neuaufbau` lässt sich
     anlegen und schliessen.
  5. Vercel baut für `neuaufbau` eine Vorschau; die Adresse steht im Protokoll.
  6. Dart ist aus der lokalen Sitzung erreichbar (Task lesen und Status setzen).
- **Grenzfall:** Scheitert Kriterium 3 oder 6, hält der Orchestrator an und fragt.

### P0.3 Prüfwerkzeuge

- **Ziel:** Regeln und Abnahme sind maschinell und für Prüfer ohne Vorwissen prüfbar.
- **Dateien:**
  - `scripts/check_regeln.mjs` + `npm run check:regeln` (U1, U6, U7).
  - `tests/architektur.test.ts` (U3, U4, U5).
  - `tsconfig.*.json`: `"strict": true` (gemessen: heute 0 Fehler).
  - `playwright.config.ts`: drei Geräteklassen, je für Produktions- und
    Testhook-Build; Browserpfad nur über die Umgebungsvariable `PW_CHROMIUM_PFAD`.
  - `scripts/pruefung/bildschirmfotos.mjs`: fotografiert eine Adresse in allen
    drei Geräteklassen.
  - `docs/abnahme/PRUEFER_ANLEITUNG.md`, `UMSETZER_ANLEITUNG.md`, `VORLAGE.md`.
- **Abnahmekriterien:**
  1. `check:regeln` schlägt bei je einer absichtlich eingebauten Verletzung von
     U1, U6 und U7 fehl und ist ohne sie grün (Gegenprobe im Protokoll).
  2. Der Architekturtest schlägt fehl, wenn eine Datei unter `src/engine`
     `react` importiert oder `Math.random` aufruft.
  3. `bildschirmfotos.mjs` liefert drei Bilder in den richtigen Grössen.
  4. Ein Subagent ohne Vorwissen kann allein mit `PRUEFER_ANLEITUNG.md` einen
     Probe-Task prüfen und ein vollständiges Protokoll schreiben.
  5. `strict` ist aktiv, alle Gates grün.

### P0.4 Abriss der alten Oberfläche und Entwicklertisch

- **Ziel:** Engine-Tasks lassen sich im Browser prüfen, ohne dass alte
  Oberfläche und alte KI mitgeschleppt werden. Ohne den Abriss blockiert der
  Typecheck jeden Engine-Task, weil 14 Dateien ausserhalb der Engine ihre
  Phasenfunktionen importieren.
- **Gelöscht:** `src/spielbrett/**`, `src/hooks/**`, `src/kiZug*.ts`,
  `src/components/{SonnigesNestLobby,Schlangenbuch,SiegerParty}.tsx`,
  `waldtanzFixtureLogik.ts`, `src/testPhaseHook.ts`, `src/App.css`,
  `phasenAktionen.ts`, `zugphaseLabels.ts`, `aktionsGruppen.ts`,
  `src/engine/questZugHinweise.ts`, alle `App.*.test.tsx`, die alten
  Layout-Verträge, ungenutzte Assets.
- **Bleibt:** `src/aktionsLabel.ts` (Wortlaut), `src/kartenTexte.ts`,
  `src/kartenfarben.ts`, `src/components/Fehlerfang.tsx`, `src/fehlerdienst.ts`,
  `src/spielstand.ts`, `tests/layout/{messung,waechter,oeffnen}.ts`.
- **Neu:** `src/entwicklung/Entwicklertisch.tsx` unter `/dev`, nur im
  Testhook-Build und dynamisch geladen.
  - Zeigt den ganzen Zustand lesbar: alle Hände offen, Schlangen, alle
    Stapel, Phase, Wertung, verletzte Invarianten in Rot.
  - Bietet **jede erlaubte Aktion als Knopf**.
  - `/dev/szenarien` listet alle Szenarien mit Beschreibung und erwartetem
    Verhalten; `/dev?szenario=<name>` lädt eines;
    `/dev?seed=<n>&spieler=<2–4>&erweiterung=<0|1>` startet eine Partie.
  - `/` zeigt bis O2 einen Platzhalter.
- **Abnahmekriterien:**
  1. `/dev?seed=1&spieler=2` zeigt eine Partie; zweimal geladen ist sie identisch.
  2. Jede Aktion aus der Aufzählung der Engine ist als Knopf da; ein Klick
     ändert den Zustand.
  3. Im Produktions-Build ist `/dev` nicht erreichbar und der Code nicht im
     Bundle (Test und Browserprüfung).
  4. `git grep` findet keine Importe der gelöschten Dateien; alle Gates grün.
- **Hinweis:** Die Regeln sind hier noch die alten. Der Task ändert kein
  Engine-Verhalten. E1 und E2 ziehen den Entwicklertisch auf die neue
  Aktionsschicht um.

### P0.5 Regelfragen an den Autor

*Läuft parallel zu Phase 1. Blockiert nur die Tasks, die eine Frage nennen.*

- **Ziel:** Jede Regel, die die Website offenlässt, ist entschieden, bevor
  Code dafür entsteht.
- **Umfang:** `docs/REGELFRAGEN.md` mit dem Katalog aus Abschnitt 9, je Frage
  mit Fundstelle, Auswahlmöglichkeiten und Vorschlag. Danach Antworten in
  Teil D, Prompt für die Website, neuer Abgleich.
- **Abnahmekriterien:**
  1. Jede Frage aus Abschnitt 9 hat eine Antwort des Autors mit Datum.
  2. Nach der Website-Änderung meldet `abgleich:website` volle Abdeckung.
  3. Jeder Task, der eine Frage nennt, verweist auf die Antwort.

## 5. Phasen 1 und 2 — Engine

Für **jeden** Engine-Task gilt zusätzlich zu 3.6:

- **Satz-für-Satz-Abdeckung:** Das Prüfprotokoll listet jede Regelaussage der
  genannten Spec-Abschnitte und nennt den Test, der sie belegt. Fehlt ein
  Test, ist der Task nicht abgenommen.
- **Browser:** Der Task liefert die Szenarien, die er nennt. Der Prüfer spielt
  sie am Entwicklertisch mit Klicks nach.

**Reihenfolge:** E1 bis E4 bauen die gemeinsamen Dateien einmal um und laufen
**nacheinander**. Danach hat jede Karte ihre eigene Datei, und E5 bis E9
laufen **gleichzeitig**. E10 (Wertung) fasst andere Dateien an und läuft ab E1
daneben.

### Phase 1 — Basis-Spiel (Meilenstein M1)

#### E1 Struktur: Zustand, Material, Speicherformat, Aktionsschicht

- **Behebt:** C1 (ohne Aufgaben), C5, C22; Vorarbeit für C6, C16.
- **Dateien:** `src/engine/{types,state,deck,constants,serialization,index}.ts`,
  neu `src/engine/aktionen/{typen,pruefen,enumerieren,anwenden}.ts`,
  `src/engine/karten/<karte>.ts` und `karten/register.ts`,
  `src/engine/invarianten.ts`, `src/engine/testing/{szenario,dauerlauf}.ts`,
  `src/spielstand.ts`, `src/entwicklung/**`. `legalActions.ts` und
  `kartenwirkungen.ts` werden aufgeteilt.
- **Abnahmekriterien:**
  1. A1/A4: Eine Partie ohne Erweiterung hat 108 Karten mit den Stückzahlen
     aus A1 und keine Aufgaben. Mit Erweiterung sind es 112 (3
     Schlangenhäutungen, 1 Schlangenkorb) und 15 Aufgaben (3 offen, je Spieler
     1 geheim). Jeder Spieler hat 5 Handkarten.
  2. A4: Jeder Spieler hat einen eigenen Ablagestapel; es gibt keinen gemeinsamen.
  3. Zustand im Format 2: Erweiterungs-Schalter; Zug mit Teilzug 1 oder 2;
     Partiephase `Laufend`, `Schlussrunde`, `Beendet`; ausliegende
     Schlangengruben; Karten unter einer Farbenfusion; Karten „aus dem Spiel".
     Entfernt: Schlangenzustand, `verdopplerBonusAktiv`,
     `nachziehBerechtigteIndizes`, `endspurtVerdoppelteAufgabenIds`.
  4. Die Aktionstypen sind vollständig festgelegt (auch die der späteren
     Tasks): Farbkarte legen, Regenbogenschlange legen, Blockade legen,
     Fusion legen, Farbendieb, Schlangenfrass, Schlangengrube, Verdoppler,
     Schlangenhäutung, Sonderkarte wirkungslos ablegen, Zug beenden, Überhand
     abwerfen, Reagieren. Das Kartenregister hat je Karte einen Eintrag;
     noch nicht umgesetzte Karten haben einen Platzhalter ohne Ziele.
  5. Die Partie wird mit Spielerzahl, Erweiterung und Zufallsquelle erzeugt;
     gleiche Saat ergibt denselben Anfang.
  6. Speichern und Laden ergibt für 200 Zufallszustände denselben Zustand; ein
     Stand im Format 1 wird abgelehnt; die neun alten Migrationen sind gelöscht.
  7. `pruefeInvarianten` meldet jede Verletzung von: jede Karte genau einmal
     an genau einem Ort (Hände, Schlangen, unter Fusionen, Nachziehstapel,
     Ablagestapel, ausliegende Gruben, schwebende Karte, aus dem Spiel);
     höchstens 2 Schlangen je Spieler; keine leere Schlange; eindeutige IDs.
     Je Invariante ein Test mit absichtlich kaputtem Zustand.
  8. Der Szenario-Baukasten baut Zustände nur aus echtem Material, sodass die
     Invarianten halten.
- **Grenzfälle:** 2, 3 und 4 Spieler; mit und ohne Erweiterung.
- **Hinweise:** Tests, die altes Verhalten festhalten, werden gelöscht, nicht
  angepasst. Der Golden-Master-Snapshot wird gelöscht; Ersatz kommt in E11.
  Nach E1 lässt sich eine Partie aufbauen, aber noch nicht spielen.
- **Szenarien:** `start-2`, `start-4`, `start-erweiterung`.

#### E2 Zugablauf

- **Behebt:** C3, C4, C12, Teil von C11. Spec: A5, A6 (Timing), A10, D12, D13.
  Fragen: F5, F8, F12.
- **Dateien:** neu `src/engine/zugablauf.ts`; `turnState.ts` und
  `ueberhand.ts` werden gelöscht; `aktionen/*`, `karten/farbkarte.ts`.
- **Abnahmekriterien:**
  1. Alles läuft über `anwendeAktion`. Danach rückt die Engine selbst bis zur
     nächsten Entscheidung vor.
  2. A5: Zu Zugbeginn füllt der Spieler auf 5 Handkarten auf.
  3. A5: Am Zugende füllt er wieder auf 5 auf; erst dann ist der Nächste dran.
  4. A6: Wer ausserhalb seines Zuges eine Karte spielt, zieht nicht nach.
  5. D12: Je Zug höchstens eine Farbkarte und eine Sonderkarte, Reihenfolge
     frei. „Zug beenden" ist erlaubt, sobald eine Karte gespielt ist oder die
     Hand leer ist.
  6. D13: Eine Sonderkarte ohne mögliches Ziel und jeder Farbenschutz lassen
     sich wirkungslos auf den eigenen Ablagestapel legen (F12).
  7. A5: Wer nur Farbenschutz hält, legt einen ab; der Zug endet regulär.
  8. A5: Mehr als 5 Handkarten am Zugende: Der Spieler wählt, welche auf
     seinen Ablagestapel gehen.
  9. A10: Wer die letzte Karte zieht, spielt seinen Zug zu Ende. Danach hat
     jeder andere genau einen Zug ohne Nachziehen. Dann ist Schluss.
  10. A7.6: Wer aussetzen muss, verliert seinen nächsten Zug ganz, ohne
      Auffüllen (F5). In der Schlussrunde ist das sein letzter Zug (F8).
  11. Die Engine liefert zu jeder Aktion Ereignisse (Karte gelegt, n Karten
      gezogen, ausgesetzt, Schlussrunde begonnen), damit die Oberfläche keine
      Zustände vergleichen muss.
  12. Es gibt keinen Zustand mit Handkarten, aber ohne erlaubte Aktion
      (der Dauerlauf prüft das in jedem Schritt).
- **Grenzfälle:** Stapel wird beim Auffüllen zu Zugbeginn leer, am Zugende
  leer; Stapel hat weniger Karten als nötig; leere Hand in der Schlussrunde;
  alle anderen setzen aus; 2, 3, 4 Spieler mit genau N−1 Schlusszügen; der
  Auslöser kommt nicht mehr dran.
- **Szenarien:** `stapel-fast-leer`, `schlussrunde-2`, `schlussrunde-4`,
  `aussetzen`, `nur-farbenschutz`, `nur-sonderkarten`.

#### E3 Verdoppler

- **Behebt:** C7. Spec: A5, A7.8, D11. Frage: F10.
- **Dateien:** `karten/verdoppler.ts`, `zugablauf.ts`.
- **Abnahmekriterien:**
  1. Der Verdoppler ist die Sonderkarte des Zuges; er geht vor oder nach der
     Farbkarte und auch allein.
  2. Beim Beenden des ersten Zuges: Auffüllen auf 5, dann sofort ein zweiter
     Zug desselben Spielers mit höchstens einer Farbkarte und einer Sonderkarte.
  3. D11: Im zweiten Zug gibt ein Verdoppler keinen weiteren Zug (F10); die
     Meldung nennt den Grund.
  4. Kein Mitspieler wird gefragt.
- **Grenzfälle:** Stapel wird beim Auffüllen zwischen den Zügen leer (der
  Spieler spielt den zweiten Zug noch, dann beginnt die Schlussrunde);
  Verdoppler in der Schlussrunde (zweiter Zug ohne Auffüllen); leere Hand im
  zweiten Zug; Verdoppler als einzige Handkarte; ein Gegner hält Farbenschutz.
- **Szenarien:** `verdoppler`, `verdoppler-schlussrunde`.

#### E4 Abwehr und Schlangengrube

- **Behebt:** C6, C17 (Rahmen), C18. Spec: A6, A7.2, A7.6, D10. Fragen: F1, F5, F8.
- **Dateien:** neu `src/engine/reaktion.ts`; `reaktionsaufloesung.ts` und
  `src/reaktionen.ts` werden gelöscht; `karten/{farbenschutz,schlangengrube}.ts`.
- **Abnahmekriterien:**
  1. Ein allgemeiner Reaktionsablauf ersetzt die fünf Sonderfälle: Die
     gespielte Karte schwebt; betroffen sind die Besitzer der Ziele ohne den
     Angreifer, im Uhrzeigersinn, jeder einmal.
  2. A6: Die Wirkung tritt erst ein, wenn alle Betroffenen entschieden haben.
     Das Ziel lässt sich nach der Ansage nicht mehr ändern.
  3. Gefragt wird nur, wer einen Farbenschutz hält.
  4. A7.2: Nach der Abwehr liegen Farbenschutz und abgewehrte Karte je auf dem
     Ablagestapel ihres Spielers; die Karte hatte für diesen Spieler keine Wirkung.
  5. Farbenschutz ist im eigenen Zug nicht mit Wirkung spielbar.
  6. Die Engine nennt jederzeit, wer als Nächster entscheidet.
  7. A7.6: Die Schlangengrube trifft einen Mitspieler und bleibt vor ihm
     liegen, bis er ausgesetzt hat; dann geht sie auf den Ablagestapel dessen,
     der sie gespielt hat. Abgewehrt hat sie keine Wirkung.
  8. Speichern und Laden mitten in einer offenen Frage setzt genau dort fort.
- **Grenzfälle:** zwei Schlangengruben auf einen Spieler (F1); zu zweit
  mehrmals hintereinander; Schlangengrube in der Schlussrunde und auf einen
  Spieler ohne weiteren Zug (F8); Abwehr mit der letzten Handkarte; Abwehr
  während des Aussetzens (F5); Verteidiger mit zwei Farbenschutz verbraucht einen.
- **Szenarien:** `schlangengrube`, `abwehr-schlangengrube`, `doppelangriff`.

*E5 bis E9 laufen nach E4 gleichzeitig. Jeder Task ändert nur seine Kartendateien und schreibt nur neue Testdateien (U13).*

#### E5 Legen: Farbkarte in jede Schlange, Regenbogenschlange, Schlangenblockade

- **Behebt:** C2, Teil von C19. Spec: A5, A7.3, A7.5, D9, D10. Fragen: F3, F6.
- **Dateien:** `karten/{farbkarte,regenbogenschlange,schlangenblockade}.ts`.
- **Abnahmekriterien:**
  1. D9: Eine Farbkarte geht an beide Enden **jeder** Schlange am Tisch und
     als neue eigene Schlange, solange der Spieler weniger als zwei hat. Gegen
     eine Farbkarte gibt es keine Abwehr.
  2. A7.3: Die Regenbogenschlange geht als Sonderkarte des Zuges an jede
     Stelle jeder Schlange. Legt ein Gegner sie in meine Schlange, kann ich abwehren.
  3. A7.5: Die Blockade geht an jede Stelle jeder Schlange, auch an die Enden
     und in die eigene. Sie ist abwehrbar; abgewehrt darf sie nicht auf ein
     anderes Ziel gelenkt werden (A6, Beispiel 1 als Test).
- **Grenzfälle:** dritte eigene Schlange abgelehnt; Farbkarte vollendet eine
  gegnerische Gruppe; Regenbogenschlange am Anfang, in der Mitte, am Ende;
  drei Joker nebeneinander; kein Schlange am Tisch (nur wirkungslos); Blockade
  in eigener Schlange ohne Rückfrage.
- **Szenarien:** `farbkarte-beim-gegner`, `regenbogen`, `blockade-abwehr`.

#### E6 Schlangenfrass

- **Behebt:** C8, C17. Spec: A7.4, A6 Beispiel 2. Frage: F2.
- **Dateien:** `karten/schlangenfrass.ts`.
- **Abnahmekriterien:**
  1. a) entfernt eine beliebige eigene Karte; b) eine eigene Blockade;
     c) zwei Karten der Mitspieler aus einer oder zwei Schlangen.
  2. c) verlangt zwei Karten, wenn es zwei erlaubte Ziele gibt; sonst eine.
  3. Gegnerische Blockaden sind bei c) kein Ziel.
  4. A6 Beispiel 2: Jeder betroffene Spieler entscheidet einmal; wer abwehrt,
     behält seine Karten, die übrigen werden gefressen (alle vier Kombinationen).
  5. Gefressene Karten und der Schlangenfrass liegen auf dem Ablagestapel des
     Angreifers.
  6. Wird eine Farbenfusion gefressen, liegen die beiden Karten darunter
     wieder einzeln an ihrer Stelle.
- **Grenzfälle:** letzte Karte einer Schlange (die Schlange verschwindet);
  Karte aus der Mitte (Nachbarn schliessen auf); nur ein gegnerisches Ziel am
  Tisch; nur Blockaden beim Gegner; zwei Karten desselben Spielers (F2); ein
  gefressener Joker lässt eine Gruppe zerfallen.
- **Szenarien:** `frass-eigen`, `frass-zwei-spieler`, `frass-fusion`.

#### E7 Farbenfusion

- **Behebt:** C16, Teil von C19. Spec: A7.7, A7.4, D9, D10. Fragen: F7, F14.
- **Dateien:** `karten/farbenfusion.ts`.
- **Abnahmekriterien:**
  1. Die beiden Farbkarten bleiben unter der Fusion in der Schlange erhalten.
  2. Die Fusion zählt als eine Karte beliebiger Farbe und bringt in einer
     Gruppe die Punkte beider Karten (Beispiele aus A7.7 und A11 als Tests).
  3. Höchstens eine Farbenfusion pro Zug (F14).
  4. Sie geht auch in gegnerische Schlangen und ist dort abwehrbar.
- **Grenzfälle:** Fusion zerstört eine gegnerische Dreiergruppe; zwei Fusionen
  in einer Schlange; Fusion neben Fusion; Fusion am Schlangenende.
- **Szenarien:** `fusion-eigen`, `fusion-beim-gegner`.

#### E8 Farbendieb

- **Spec:** A7.1, Teil D (D2). Frage: F4.
- **Dateien:** `karten/farbendieb.ts`.
- **Abnahmekriterien:**
  1. Gestohlen werden nur Farbkarten aus gegnerischen Schlangen; nie Karten
     unter einer Fusion, nie Sonderkarten.
  2. Die Karte kommt an eine beliebige Stelle einer eigenen Schlange.
  3. Abgewehrt bleibt die Karte beim Gegner; der Farbendieb liegt auf dem
     Ablagestapel des Angreifers.
- **Grenzfälle:** Dieb ohne eigene Schlange (F4); keine gegnerische Farbkarte
  am Tisch; gestohlen wird die letzte Karte einer Schlange; die Lücke vereint
  beim Gegner zwei Gruppen.
- **Szenarien:** `farbendieb`, `farbendieb-abwehr`.

#### E9 Schlangenhäutung

*Karte der Erweiterung; läuft technisch mit den übrigen Kartentasks.*

- **Behebt:** C9, Teil von C19. Spec: A7.9, D9, D10. Frage: F13.
- **Dateien:** `karten/schlangenhaeutung.ts`.
- **Abnahmekriterien:**
  1. Gewählt wird ein Abschnitt von 3 bis 5 aufeinanderfolgenden Farbkarten
     einer Schlange; nur dieser wird neu geordnet.
  2. Sonderkarten (auch Joker) gehören nie zum Abschnitt und bleiben liegen.
  3. Die Engine nennt alle wählbaren Abschnitte; ohne einen ist die Karte nur
     wirkungslos ablegbar (A7.9, Beispiel 2).
  4. In einer gegnerischen Schlange ist sie abwehrbar.
  5. Die Zahl neu entstandener Dreiergruppen wird für die Aufgabe
     „Schlangentanz" festgehalten.
- **Grenzfälle:** Abschnitt am Schlangenende; Schlange mit genau 3 Farbkarten;
  Abschnitt von 6 abgelehnt; unveränderte Reihenfolge (F13); eine neue Gruppe
  entsteht nur zusammen mit einem Nachbarn ausserhalb des Abschnitts.
- **Szenarien:** `haeutung`, `haeutung-nicht-moeglich`.

#### E10 Wertung

*Läuft ab E1 neben den anderen Tasks.*

- **Behebt:** C11, C13. Spec: A11, A7.3, A7.7. Fragen: F9, F11.
- **Dateien:** `src/engine/scoring.ts`, neu `src/engine/jokerGruppen.ts`.
  `colorGroups.ts` bleibt unverändert (der Kettenbonus braucht die rohe Sicht).
- **Abnahmekriterien:**
  1. Alle Rechenbeispiele aus A11, A7.3 und A7.7 ergeben die genannten Punkte.
  2. Mehrere Gruppen derselben Farbe zählen je voll (Beispiel 3 + 4 = 7).
  3. Joker zählen als die Farbe, die dem Spieler **insgesamt** die meisten
     Punkte bringt. Mit Erweiterung heisst das: Gruppenpunkte plus
     Vielfaltbonus gemeinsam am höchsten.
  4. Vielfaltbonus (nur mit Erweiterung): je Schlange berechnet, der höchste
     zählt; 1/2/3/4 Punkte für 2/3/4/5 und mehr Farben; beide Beispiele aus A11.
  5. Längste Farbkette: 5 Punkte für jeden Spieler mit der längsten einzelnen
     Kette; Joker und Sonderkarten unterbrechen (Beispiel Länge 4).
  6. Es gibt einen **Zwischenstand** (ohne Kettenbonus, ohne fremde geheime
     Aufgaben) und eine **Endwertung** mit Aufschlüsselung je Spieler: Gruppen
     je Schlange, Farbe jedes Jokers, Vielfaltbonus, Kette, Aufgaben, Summe.
  7. Die Endspurt-Verdopplung ist entfernt.
  8. Bei gleich guten Jokerfarben wählt die Wertung immer dieselbe.
- **Grenzfälle:** Spieler ohne Schlange; der Vielfaltbonus kippt eine
  Jokerfarbe (weniger Gruppenpunkte, mehr Summe); 5 und 6 Farben geben beide 4;
  Gleichstand beim Kettenbonus; niemand hat eine Kette (F11); Gleichstand beim
  Sieg (F9); ein Joker verbindet zwei Gruppen.
- **Szenarien:** `wertung-beispiele`, `wertung-joker`.

#### E11 Abnahme Basis-Engine (M1)

- **Dateien:** Regeltests, `legal_actions_umfang.test.ts`, neuer Golden
  Master, `tests/architecture_r84.test.ts`, `docs/GAME_SPEC.md` Teil C.
- **Abnahmekriterien:**
  1. Teil C enthält nur noch Punkte der Erweiterung (Aufgaben, Schlangenkorb,
     Comeback, Risiko).
  2. Für A4, A5, A6, A7.1–A7.9, A10, A11 gibt es je eine Regeltestdatei unter
     `src/engine/__tests__/regeln/`; ein Meta-Test stellt sicher, dass kein
     Abschnitt fehlt; die Satz-für-Satz-Tabelle ist vollständig.
  3. Dauerlauf: 2 000 Zufallspartien (2, 3, 4 Spieler) enden alle. In jedem
     Schritt gilt: Invarianten, Speichern und Laden, jede aufgezählte Aktion
     ist erlaubt, eine zufällig verfälschte Aktion wird abgelehnt, höchstens 5
     Handkarten nach dem eigenen Zugende, Stapel leer genau dann, wenn
     Schlussrunde oder beendet.
  4. Die Zahl der erlaubten Aktionen ist neu gemessen und im Test begrenzt.
  5. Neuer Golden Master mit drei Partien fester Saat. **Vor** dem Einfrieren
     liest ein Prüfer das Protokoll einer Partie zu zweit Zug für Zug gegen
     Teil A. Der Test sichert zusätzlich: eine Abwehr kommt vor, ein
     Verdoppler-Zweitzug kommt vor, die Schlussrunde hat N−1 Züge.
  6. Ein Prüfer spielt am Entwicklertisch eine ganze Partie zu zweit durch und
     rechnet die Endwertung von Hand nach.

### Phase 2 — Erweiterung in der Engine (Teil von M3)

*Beginnt, sobald P0.5 beantwortet und E11 abgenommen ist. Läuft neben KI und Oberfläche des Basis-Spiels.*

#### X1 Aufgaben: Rahmen

- **Behebt:** C15, C20, Rest von C1. Spec: A4, A5, A9. Fragen: G1, G2.
- **Dateien:** `src/engine/aufgabenKarten.ts`, `zugablauf.ts` (Prüfstellen),
  neu `src/engine/aufgaben/rahmen.ts`.
- **Abnahmekriterien:**
  1. Aufgaben gibt es nur mit Erweiterung; es sind 15, nummeriert wie in A9.
  2. A9: Geprüft wird für den Spieler am Zug, zu Zugbeginn und nach jeder
     vollständig aufgelösten Aktion. Eine erfüllte offene Aufgabe geht an ihn
     und wird vom Stapel ersetzt.
  3. Die neu aufgedeckte Aufgabe wird sofort mitgeprüft, auch in Kette.
  4. Bei leerem Aufgabenstapel bleibt der Platz leer.
  5. Die geheime Aufgabe wird nach G2 gewertet und erst in der Endwertung offen.
- **Grenzfälle:** zwei offene Aufgaben gleichzeitig erfüllt; Kette über mehr
  als zwei; durch einen Gegnerzug erfüllt (Einlösen am eigenen Zugbeginn);
  erfüllt und im selben Zug wieder zerstört; Erfüllung im Verdoppler-Zweitzug.

#### X2 Die 15 Aufgaben mit Jokern

- **Behebt:** C10, C14, C21, C23. Spec: A9, A7.3, A7.7. Fragen: G3–G8.
- **Dateien:** `src/engine/aufgaben/<name>.ts` je Aufgabe, gemeinsame Helfer
  in `jokerGruppen.ts`. **Drei gleichzeitige Pakete zu je fünf Aufgaben.**
- **Abnahmekriterien:**
  1. A9: Joker zählen bei jeder Aufgabe als die Farbe, mit der sie erfüllt
     ist; derselbe Joker darf bei zwei Aufgaben verschiedene Farben haben.
  2. Je Aufgabe eine Entscheidungstabelle mit mindestens sechs Stellungen als
     Tests: erfüllt, knapp nicht, mit Regenbogenschlange, mit Farbenfusion,
     mit Blockade dazwischen, über zwei Schlangen.
  3. Jedes Beispiel aus A9 ist ein Test.
  4. Eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt.
  5. Lila Riese: Reihe aus mindestens 5 violetten Karten (Tests mit 4 und 5).
  6. Farbwechsler: Reihen gleicher Farbe gelten als eine Farbe in der Folge.

#### X3 Rahmen für Zusatzaktionen und Entscheidungen

- **Spec:** A7.10, A8. Fragen: G14, G15.
- **Dateien:** `zugablauf.ts`, `aktionen/*`, `reaktion.ts` (erweitert zu
  einem allgemeinen Entscheidungsablauf, auch für Entscheidungen eines Gegners).
- **Abnahmekriterien:**
  1. Ein Zug kann zusätzliche Aktionen haben; die Grenzen stehen an **einer**
     Stelle im Code.
  2. Karten können mitten im Zug gezogen und offen aufgedeckt werden; der
     Auslöser der Schlussrunde bleibt richtig; die Kartenerhaltung hält.
  3. Ein Gegner kann zu einer Entscheidung aufgefordert werden; die Engine
     nennt den Entscheider; Speichern und Laden mitten darin funktioniert.
  4. Mehr als 5 Handkarten bei einem nicht aktiven Spieler werden an seinem
     eigenen Zugende abgebaut (A8.2).

#### X4 Comeback-Karte · X5 Risiko-Belohnungs-Karten · X6 Schlangenkorb des Glücks

*Drei Tasks, gleichzeitig nach X3. Die genauen Kriterien entstehen aus den Antworten in P0.5 und werden vor Taskbeginn in Plan und Dart nachgetragen.*

- **X4** (A8.1, Fragen G16, G17): Bedingung zu Zugbeginn (5 Karten Rückstand,
  Grenze bei 4 und 5 getestet); je Spieler einmal; zwei Zusatzaktionen aus
  drei Möglichkeiten; danach verbraucht. Datei `src/engine/erweiterung/comeback.ts`.
- **X5** (A8.2, Fragen G18–G23): je Spieler zwei Karten; höchstens eine pro
  Runde; aufgedeckte Farbkarte heisst Erfolg, Sonderkarte Misserfolg; vier
  Aktionen, je Erfolg und Misserfolg ein Test; Wahl des begünstigten Gegners;
  Karte danach aus dem Spiel. Datei `src/engine/erweiterung/risiko.ts`.
- **X6** (A7.10, Fragen G10–G13): einmal im Deck; vier Effekte je mit Test;
  danach aus dem Spiel; nicht vom Ablagestapel zurückholbar. Datei
  `src/engine/karten/schlangenkorb.ts`.
- **Für alle drei:** jeder Regelsatz des Abschnitts hat einen Test; Dauerlauf
  mit Erweiterung grün; Szenarien am Entwicklertisch.

#### X7 Abnahme Erweiterung

- **Abnahmekriterien:** Teil C ist leer; Regeltestdateien für A7.10, A8, A9;
  Dauerlauf 2 000 Partien mit Erweiterung; neuer Golden Master mit
  Erweiterung, vor dem Einfrieren gegengelesen; ein Prüfer spielt eine Partie
  mit Erweiterung am Entwicklertisch durch.

## 6. Phase 3 — KI (Teil von M2, Erweiterung in M3)

Neu unter `src/ki/`. Reine Funktionen: Zustand hinein, ein Schritt heraus.

### K1 Schnittstelle, Sicht und Zufalls-KI

- **Hängt ab von:** E2.
- **Dateien:** `src/ki/sicht.ts` (einzige Datei mit Zugriff auf den vollen
  Zustand), `src/ki/schritt.ts` (`naechsterKiSchritt(zustand)`: liefert genau
  eine Aktion oder nichts, wenn ein Mensch entscheidet), `src/ki/zufallsKi.ts`,
  `src/ki/turnier.ts` (N Partien mit Saat, Sitz rotierend).
- **Abnahmekriterien:**
  1. Die Sicht enthält: eigene Hand, alle Schlangen, Ablagestapel (nach F15),
     Handgrössen, Stapelgrösse, offene Aufgaben, eigene geheime Aufgabe, die
     angesagte Aktion. Sie enthält keine fremde Hand, keine Stapelreihenfolge,
     keine fremde geheime Aufgabe.
  2. 200 Partien Zufalls-KI gegen Zufalls-KI enden alle ohne Invariantenverletzung.
  3. Gleiche Saat ergibt denselben Verlauf.
  4. Am Entwicklertisch spielt „KI-Schritt" genau einen Schritt.

### K2 Bewertung und Zugplanung (Basis-Spiel)

- **Hängt ab von:** E5–E10.
- **Dateien:** `src/ki/bewertung.ts`, `src/ki/zugsuche.ts`, `src/ki/solideKi.ts`.
- **Vorgehen:** Bewertet wird der eigene Zwischenstand plus Aussichten (Paare,
  offene Enden, Joker, Rennen um die längste Kette) minus der stärkste Gegner.
  Die Zugsuche rechnet die Folgen eines Zuges durch (nur Farbkarte, nur
  Sonderkarte, beide Reihenfolgen) und prüft für jedes Ziel, wem die Karte
  dort nützt. Nach einem Verdoppler plant sie den zweiten Zug neu.
- **Abnahmekriterien** (je als Szenariotest und am Entwicklertisch):
  1. Kann die KI mit einer Handkarte eine Dreiergruppe vollenden, tut sie es.
  2. Hat sie eine passende Farbkarte **und** eine nützliche Sonderkarte, spielt
     sie beide.
  3. Sie legt eine Regenbogenschlange nie in eine gegnerische Schlange, wenn
     eine eigene sie aufnehmen kann.
  4. Sie spielt keine Farbenfusion, die ihre eigenen Punkte senkt.
  5. Sie legt keine Karte wirkungslos ab, wenn ein besser bewerteter Zug möglich ist.
  6. Mit Verdoppler nutzt sie den zweiten Zug.
  7. **Keine verdeckte Information:** In 200 Zufallsstellungen bleibt ihre
     Entscheidung gleich, wenn fremde Hände, Stapelreihenfolge und fremde
     geheime Aufgaben neu gemischt werden.
  8. Jede gewählte Aktion besteht die Prüfung der Engine; die Zahl der
     Bewertungen je Schritt bleibt unter einer im Test festgelegten Grenze.

### K3 Angriff und Abwehr

- **Dateien:** `src/ki/zugsuche.ts`, `src/ki/abwehr.ts`.
- **Abnahmekriterien:**
  1. Schlangenfrass: Liegt eine Blockade in einer eigenen Gruppe und hat kein
     Gegner ein lohnendes Ziel, entfernt sie die Blockade; hat der Führende
     eine wertvolle Gruppe, frisst sie dort. Je ein Szenario.
  2. Schlangenblockade und Farbendieb treffen die Gruppe mit dem höchsten
     Punktverlust für den Führenden.
  3. Eine störende Farbkarte legt sie beim Gegner nur, wenn die eigene Hand
     nichts Besseres hergibt.
  4. Abwehr: Sie spielt Farbenschutz bei einem Angriff auf eine Dreiergruppe
     und lässt Harmloses durch; in der Schlussrunde wehrt sie jeden Schaden ab.
  5. Bei 3–4 Spielern greift sie bevorzugt den Führenden an.
  6. K2.7 gilt weiter.

### K4 KI für die Erweiterung (M3)

- **Hängt ab von:** X1–X6.
- **Abnahmekriterien:**
  1. Fehlt ihr eine Karte zu einer offenen oder ihrer geheimen Aufgabe und
     hält sie sie, spielt sie sie.
  2. Sie nutzt Comeback-Karte, Risiko-Karte und Schlangenkorb, wenn die
     Bewertung steigt, und nicht im ersten Zug ohne Nutzen.
  3. Sie plant eine Schlangenhäutung, die neue Gruppen bildet.
  4. K2.7 und K2.8 gelten weiter.

### K5 Stärkenachweis

- **Abnahmekriterien** (Turnier mit festen Saaten, im Test hinterlegt; die
  Schwellen werden nach der ersten Messung nach oben festgeschrieben, nie
  nach unten):
  1. 500 Partien zu zweit gegen die Zufalls-KI: mindestens 80 % Siege.
  2. 500 Partien gegen „erste erlaubte Aktion": mindestens 80 % Siege.
  3. 300 Partien zu viert gegen drei Zufalls-KIs: mindestens 50 % Siege.
  4. Alle Partien enden; keine verletzt eine Invariante.
  5. Für M3 dasselbe mit Erweiterung.

## 7. Phase 4 — Oberfläche (M2, Erweiterung in M3)

Neubau unter `src/ui/`. Bedienung: **Karte wählen, dann Ziel wählen**, mit
Maus und Finger gleich. Was wählbar ist, kommt allein aus den erlaubten
Aktionen der Engine (U3). Ziehen und Ablegen gehört nicht zu M2.

### O1 Gestaltungsgrundlage und Bilder

*Ab Welle 1, unabhängig von der Engine.*

- **Dateien:** `public/karten/*` (6 Farbschlangen, 10 Sonderkarten, Comeback,
  Risiko-Belohnung, 15 Aufgaben, Logo; der graue Rand um die Karte wird
  weggeschnitten), `src/ui/karten/{Karte.tsx,kartenbilder.ts}`,
  Kartenrückseite, Schrift lokal eingebunden, `src/ui/tokens.css`, Favicon.
  Dazu drei Entwurfsseiten unter `/dev/entwurf` (Lobby, Tisch, Ergebnis) mit
  festen Beispieldaten.
- **Abnahmekriterien:**
  1. Für jeden Kartennamen des Materials (mit Erweiterung) und jede Aufgabe
     gibt es ein Bild; ein Test schlägt fehl, wenn eines fehlt.
  2. Jedes Bild lädt in der Vorschau und ist auf dem Handy lesbar (der Prüfer
     beschreibt drei Karten).
  3. Die Entwurfsseiten zeigen in jeder Geräteklasse alles ohne waagrechtes
     Scrollen; nichts ist abgeschnitten oder überdeckt (Messung).
  4. **Der Autor hat die Entwürfe gesehen und freigegeben.**
- **Offen:** Die Website zeigt keine Kartenrückseite. Der Orchestrator fragt
  den Autor nach einer Datei; sonst Vorschlag mit Kostenschätzung (3.8).

### O2 App-Rahmen und Lobby

*Ab Welle 1.*

- **Dateien:** `src/App.tsx`, `src/ui/lobby/**`, `index.html` (`lang="de"`,
  Titel, Favicon). Seiten: `/` Lobby, `/spiel`, `/regeln`.
- **Abnahmekriterien:**
  1. Die Lobby bietet: 1, 2 oder 3 Gegner; Erweiterung an/aus; „Neue Partie".
  2. Gibt es einen Spielstand, bietet sie „Weiterspielen" und fragt vor einer
     neuen Partie nach.
  3. Vor und Zurück im Browser wechseln die Ansicht richtig.
  4. Ein Fehler beim Start wird sichtbar gemeldet.
  5. In der Lobby läuft keine Partie im Hintergrund.

### O3 Partie-Steuerung

- **Hängt ab von:** E4, K1.
- **Dateien:** `src/ui/spiel/{useSpiel.ts,tischAnsicht.ts,auswahl.ts}`.
  `tischAnsicht` macht aus dem Zustand das, was der Mensch sehen darf;
  `auswahl` führt von der Karte über die Ziele zur fertigen Aktion.
- **Abnahmekriterien:**
  1. Jeder KI-Schritt wird einzeln ausgeführt und ist sichtbar, bevor der
     nächste folgt (etwa 700 ms; sofort bei „weniger Bewegung" und im Test).
  2. Neu laden mitten in der Partie, auch während einer offenen Abwehrfrage,
     setzt genau dort fort.
  3. Ein alter Spielstand wird verworfen; die Lobby sagt es einmal.
  4. Wirft Engine oder KI einen Fehler, friert nichts ein: Meldung und Weg
     zurück zur Lobby.
  5. `tischAnsicht` enthält keine fremde Handkarte und keine fremde geheime
     Aufgabe (Test).
  6. Im Testhook-Build: `/spiel?szenario=<name>`, `?seed=`, `?tempo=sofort`.

### O4 Spieltisch

- **Hängt ab von:** E1 (zunächst statisch gegen Szenarien), O1.
- **Dateien:** `src/ui/tisch/**`. Feste Sicht: **der Mensch sitzt immer
  unten.** Gegner oben mit Namen, Kartenzahl, Schlangen, Ablagestapel. Mitte:
  Nachziehstapel mit Anzahl. Unten: eigene Schlangen, Hand, eigener
  Ablagestapel. Statuszeile: wer ist dran, was ist zu tun. Auf dem Handy:
  Gegner als kompakte, seitlich scrollbare Zeilen, Hand unten fest.
- **Abnahmekriterien:**
  1. Während eines KI-Zuges bleiben eigene Hand und eigene Schlangen unten
     sichtbar und als „deine" beschriftet.
  2. Fremde Handkarten sind nie lesbar; im Seitenquelltext steht weder Name
     noch ID einer fremden Handkarte (Test nach jedem Schritt einer Partie).
  3. **Volltisch-Szenario** (4 Spieler, je 2 Schlangen, 11 Karten je
     Schlange): in jeder Geräteklasse ist jede Karte erreichbar. Dieses
     Szenario wird zuerst gebaut, vor aller Bedienung.
  4. Farbgruppen ab drei Karten sind hervorgehoben; eine Farbenfusion zeigt
     die Karten darunter; eine ausliegende Schlangengrube ist sichtbar.
  5. Kein waagrechtes Scrollen der Seite; Bedienflächen mindestens 44 px.

### O5 Karten spielen

- **Hängt ab von:** E5–E9, O3, O4.
- **Dateien:** `src/ui/tisch/{Hand,Ziele,Zugleiste,UeberhandDialog}.tsx`.
- **Abnahmekriterien:**
  1. Nach dem Antippen einer Handkarte sind genau die erlaubten Ziele markiert;
     nochmaliges Antippen oder Escape hebt die Auswahl auf.
  2. Farbkarte: beide Enden jeder Schlange (auch gegnerischer) und „neue Schlange".
  3. Jede Sonderkarte ist ohne Liste spielbar: Farbendieb (Karte, dann Platz),
     Schlangenfrass (a, b oder c mit einer oder zwei Karten),
     Schlangenblockade und Regenbogenschlange (Schlange, dann Lücke),
     Farbenfusion (Kartenpaar), Schlangengrube (Gegner), Verdoppler,
     wirkungslos ablegen (eigener Ablagestapel).
  4. Mehrstufige Karten zeigen vor dem Ausführen eine Zusammenfassung zum
     Bestätigen (die „Ansage" aus Teil B).
  5. „Zug beenden" ist genau dann bedienbar, wenn die Engine es erlaubt.
  6. Nach einem Verdoppler zeigt die Statuszeile den zweiten Zug an.
  7. Eine abgelehnte Aktion zeigt den deutschen Grund.
  8. Mehr als 5 Handkarten am Zugende: Der Mensch wählt, was er ablegt.
  9. Alles geht mit Maus und mit Touch (Handy-Projekt).

### O6 Gegnerzüge, Abwehr, Protokoll

- **Dateien:** `src/ui/tisch/{ReaktionsDialog,Zugprotokoll}.tsx`.
- **Abnahmekriterien:**
  1. Jeder KI-Schritt ist einzeln sichtbar (Karte, Ziel) und steht im
     Protokoll; „Schneller" verkürzt die Pause.
  2. Wird der Mensch angegriffen, erscheint eine Frage mit Angreifer, Karte
     und Ziel; seine Hand ist dabei sichtbar; „Abwehren" gibt es nur mit
     Farbenschutz auf der Hand.
  3. Nach der Abwehr ist die Hand um eine Karte kleiner und wird nicht sofort
     aufgefüllt.
  4. Muss der Mensch aussetzen, sagt die Oberfläche es und spielt weiter.
  5. Wird eine KI angegriffen, sieht der Ablauf gleich aus, ob sie einen
     Farbenschutz hält oder nicht (gleiche Pause); nur eine tatsächliche
     Abwehr wird gezeigt.

### O7 Schlangenhäutung

- **Hängt ab von:** E9.
- **Abnahmekriterien:**
  1. Schlange wählen, Abschnitt von 3–5 Farbkarten wählen, Karten durch
     Antippen tauschen oder mit Pfeiltasten verschieben, bestätigen; Abbrechen
     stellt den Ausgangszustand her.
  2. Wählbar sind nur die Abschnitte, die die Engine nennt.
  3. Punkte vorher und nachher stammen aus der Engine.
  4. Bedienbar mit Touch auf dem Handy.

### O8 Spielende und Wertung

- **Hängt ab von:** E10.
- **Abnahmekriterien:**
  1. Die Wertung zeigt je Spieler getrennt: Farbgruppen je Schlange, längste
     Farbkette, mit Erweiterung Vielfaltbonus und Aufgaben. Die Summe stimmt
     mit der Endwertung der Engine überein (Test über 50 Endstände).
  2. Bei Jokern steht, als welche Farbe sie gewertet wurden.
  3. Gleichstand zeigt alle Sieger.
  4. „Noch einmal" startet mit denselben Einstellungen, „Lobby" führt zurück.
  5. Während der Partie zeigt der Tisch den Zwischenstand ohne Kettenbonus.

### O9 Regelhilfe

*Ab Welle 1.*

- **Abnahmekriterien:**
  1. Jede Karte zeigt auf Wunsch ihren Text; er stammt wörtlich aus Teil A
     (Test vergleicht mit der Spec).
  2. `/regeln` verweist auf die Website und fasst einen Zug in fünf Schritten zusammen.

### O10 Erweiterung in der Oberfläche (M3)

- **Hängt ab von:** X1–X6.
- **Abnahmekriterien:**
  1. Drei offene Aufgaben und die eigene geheime Aufgabe sind sichtbar; fremde
     geheime Aufgaben nie.
  2. Eine erfüllte Aufgabe wird sichtbar gemeldet und ersetzt.
  3. Comeback-Karte, Risiko-Karte und Schlangenkorb sind bedienbar; jede
     Entscheidung (auch die des begünstigten Gegners) ist nachvollziehbar.
  4. Ohne Erweiterung ist nichts davon zu sehen.

### O11 Barrierefreiheit und Feinschliff

- **Dateien:** neue Entwicklungs-Abhängigkeit `@axe-core/playwright`.
- **Abnahmekriterien:**
  1. Jede Aktion geht allein mit der Tastatur; der Fokus ist immer sichtbar.
  2. Ereignisse (Gegnerzug, Angriff, erfüllte Aufgabe) werden vorgelesen;
     jede Karte hat einen eindeutigen Namen („Blaue Karte, 1 Punkt").
  3. Farbe ist nie das einzige Merkmal; Kontrast mindestens 4,5:1 (Messung);
     axe meldet keine schweren Befunde.
  4. Mit „weniger Bewegung" laufen keine Animationen.
  5. Drehen des Geräts mitten in der Partie verliert nichts.

## 8. Phase 5 — Abschluss (M4)

### Z1 Vollpartien im Browser

- **Abnahmekriterien:**
  1. Ein Playwright-Lauf spielt als Mensch über echte Klicks ganze Partien bis
     zur Wertung: Basis und Erweiterung, je zu zweit und zu viert, je auf
     Desktop und Handy (8 Läufe, feste Saaten).
  2. Kein Konsolenfehler; die angezeigte Endwertung stimmt mit der Engine
     überein; nach keinem Schritt steht eine fremde Handkarte im Seitenquelltext.
  3. Der Lauf ist gegen die Vercel-Vorschau wiederholbar.
- **Für M2** laufen die vier Basis-Läufe, für M3 alle acht.

### Z2 Doku und Evidenz

- **Abnahmekriterien:**
  1. `docs/GAME_SPEC.md` Teil C ist leer; B1 nennt alles als umgesetzt.
  2. `docs/OBERFLAECHE_SPEC.md` ersetzt `docs/SPIELBRETT_SPEC.md`.
  3. `docs/WORKFLOW.md`, `docs/RELEASE_CHECKLIST.md` und
     `docs/PLAYABILITY_GATE.md` (neuer Abschnitt mit Evidenz) sind aktuell.
  4. `abgleich:website` meldet volle Abdeckung am Tag des Release.

### Z3 Release

- **Abnahmekriterien:**
  1. Der Autor hat auf der Vorschau je eine Partie mit und ohne Erweiterung
     gespielt und freigegeben.
  2. `main` ist aktualisiert; die Bundle-Namen der Produktion stimmen mit dem
     lokalen Build überein; die Produktions-Smokes sind grün.

## 9. Offene Regelfragen (Task P0.5)

Die Website lässt diese Punkte offen. Ein Vorschlag gilt **nicht**, bevor der
Autor ihn bestätigt hat. Fragen F blockieren Basis-Tasks, Fragen G nur die
Erweiterung.

### Basis-Spiel

| Nr. | Stelle | Frage | Vorschlag |
|---|---|---|---|
| F1 | A7.6 | Treffen zwei Schlangengruben denselben Spieler, bevor er ausgesetzt hat: setzt er einen oder zwei Züge aus? | zwei |
| F2 | A6 | Schlangenfrass c) frisst zwei Karten **desselben** Spielers: Wehrt ein Farbenschutz beide ab? | ja |
| F3 | A5, D9 | Kann eine Sonderkarte (etwa die Regenbogenschlange) eine neue Schlange beginnen? | nein, nur eine Farbkarte |
| F4 | A7.1, D9 | Farbendieb: Muss die gestohlene Karte in eine eigene Schlange, oder darf sie nach D9 in jede? Was gilt, wenn der Dieb keine Schlange hat? | eigene Schlange, beliebige Stelle; ohne Schlange beginnt sie eine neue |
| F5 | A7.6 | Füllt ein aussetzender Spieler seine Hand auf? Darf er mit Farbenschutz reagieren? | kein Auffüllen; Reaktion erlaubt |
| F6 | D9 | Farbkarte beim Gegner: nur an bestehende Schlangen, oder darf man ihm auch eine neue beginnen? | nur bestehende |
| F7 | A7.7 | Farbenfusion: Gelten eine Farbkarte und eine Regenbogenschlange als „zwei Karten gleicher Farbe"? | nein, nur zwei Farbkarten |
| F8 | A10, A7.6 | Verfällt der letzte Zug eines Spielers, der in der Schlussrunde aussetzen muss? Darf man die Schlangengrube auf jemanden spielen, der keinen Zug mehr hat? | ja; nein |
| F9 | A11 | Gleichstand bei den Punkten: geteilter Sieg? | ja |
| F10 | A7.8, D11 | Verdoppler im zweiten Zug: Darf er wirkungslos abgelegt werden? | ja, ohne weiteren Zug |
| F11 | A11 | Längste Farbkette: Gibt es eine Mindestlänge? Was gilt bei lauter Einzelkarten und für Spieler ohne Schlange? | Mindestlänge 2; ohne Kette kein Bonus |
| F12 | D13 | Darf man eine Sonderkarte, die ein mögliches Ziel hätte, trotzdem ohne Wirkung ablegen? | nein; nur ohne Ziel, Farbenschutz immer |
| F13 | A7.9 | Schlangenhäutung: Muss sich die Reihenfolge ändern? | ja |
| F14 | A7.7 | „Pro Zug nur eine Farbenfusion": Darf im zweiten Zug nach einem Verdoppler eine weitere gespielt werden? | ja, je Zug eine |
| F15 | A4 | Sind die Ablagestapel für alle vollständig einsehbar, oder nur die oberste Karte? | vollständig einsehbar |

### Erweiterung

| Nr. | Stelle | Frage |
|---|---|---|
| G1 | A1, B1 | Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Vielfaltbonus (ein Schalter für alles). Richtig? |
| G2 | A9 | Geheime Aufgabe: Zählt sie, sobald sie in einem eigenen Zug einmal erfüllt war, oder muss sie am Spielende erfüllt sein? |
| G3 | A9 | Zählen für „Schlangenmeister" und „Schlangenrepertoire" als „ausgespielt": ein zur Abwehr gespielter Farbenschutz, eine wirkungslos abgelegte und eine abgewehrte Sonderkarte, der Schlangenkorb? |
| G4 | A9 | „Schlangentanz": Zählt nur eine Schlangenhäutung in der eigenen Schlange? Dürfen die zwei Gruppen aus zwei Häutungen stammen? |
| G5 | A9 | „Vielfaltskönig" und „Farbenpracht": Braucht es zwei Schlangen, oder genügt eine? |
| G6 | A9 | „Symmetriemeister": Muss die Kartenzahl gerade sein? Dürfen Joker oder andere Sonderkarten in der Schlange liegen? |
| G7 | A9 | „Schlangenbändiger": Muss das Muster zweimal direkt hintereinander liegen (ABCABC)? |
| G8 | A9 | „Farbkombination": Müssen die fünf Karten nebeneinander liegen? Zählen Joker bei „Gelber Schatz" und „Lila Riese" mit? |
| G9 | A11, A9 | Zählt eine Gruppe nur aus Jokern (drei nebeneinander) für Vielfaltbonus und „Farbharmonie"? |
| G10 | A7.10 | Schlangenkorb: Liegt er auf der Hand (zählt zu den 5)? Kostet sein Einsatz die Sonderkarte des Zuges? Sind die vier Beispiele die vollständige Liste der Effekte? |
| G11 | A7.10 | „Ziehe 3 Karten und spiele sofort bis zu 2 davon": zusätzlich zu den Karten des Zuges, beliebige Arten, auch ein gezogener Verdoppler? Was bei weniger als 3 Karten im Stapel? |
| G12 | A7.10 | „Tausche bis zu 2 Karten aus deiner Schlange mit Handkarten": beliebige Karten, gleicher Platz, getauschte Karte auf die Hand? |
| G13 | A7.10 | „Sonderkarte aus gegnerischer Schlange entfernen": welche Karten (auch Blockade), abwehrbar mit Farbenschutz, auf wessen Ablagestapel? |
| G14 | A7.10, A8.1 | „Zwei zusätzliche Aktionen": dieselben drei Möglichkeiten wie bei der Comeback-Karte? Gelten die Grenzen (eine Farbkarte, eine Sonderkarte) dann nicht? Zweite Farbenfusion, zweiter Verdoppler? |
| G15 | A7.8, A8 | „Nicht mit anderen zugerweiternden Effekten kombinierbar": Schliessen sich Verdoppler, Comeback und Schlangenkorb im selben Zug aus? |
| G16 | A8.1 | Schlangenlänge für die Comeback-Bedingung: Zählt jede Karte eins, die Farbenfusion eins oder drei, ein Spieler ohne Schlange null? Ist die Karte später im Zug und im zweiten Zug nach Verdoppler einsetzbar? |
| G17 | A8.1 | „Zwei Karten abwerfen, drei ziehen": mit weniger als zwei Handkarten, bei weniger als drei im Stapel, in der Schlussrunde, zweimal? |
| G18 | A8.2 | „Pro Runde eine Risiko-Karte": pro eigenem Zug? Gilt der zweite Zug nach Verdoppler als neue Runde? |
| G19 | A8.2 | Wohin kommt die aufgedeckte Karte bei Aktion 2 (Misserfolg), Aktion 3 (Erfolg, samt der ersetzten Schlangenkarte) und Aktion 4 (beide Fälle)? |
| G20 | A8.2 | Aktion 2: Muss die „geplante Farbkarte" vorher benannt werden? Wer wählt bei Misserfolg zwischen ihr und der obersten Stapelkarte? Was gilt ohne Farbkarte auf der Hand? Nur eigene Schlange? |
| G21 | A8.2 | Aktion 3: Welche Handkarte darf ersetzen, und wird bei „anderer Punktewert" die aufgedeckte Karte vor oder nach der gewählten Karte eingefügt? |
| G22 | A8.2 | Aktion 4: Zählt die aufgedeckte Karte zu den „zwei Karten vom Nachziehstapel"? Was bei leerem Ablagestapel? Wie kann eine Risiko-Karte auf einem Ablagestapel liegen, wenn sie aus dem Spiel kommt? |
| G23 | A8.2, A10 | Ist eine Risiko-Karte bei leerem Stapel oder in der Schlussrunde spielbar? Wer löst die Schlussrunde aus, wenn ein Effekt oder ein Gegner die letzte Karte nimmt? |

## 10. Reihenfolge und Parallelisierung

Gleichzeitig läuft nur, was keine gemeinsamen Dateien anfasst. Höchstens fünf
Umsetzer zugleich, damit der Orchestrator jede Abnahme wirklich liest.

| Welle | Gleichzeitig | Voraussetzung |
|---|---|---|
| 0 | P0.1 (Cloud), dann P0.2 (lokal) | Freigabe dieses Plans |
| 1 | P0.3 · P0.4 · P0.5 · O1 · O2 · O9 | P0.2 |
| 2 | **E1** | P0.3, P0.4 |
| 3 | **E2** · E10 · O4 (statisch) | E1, O1 |
| 4 | **E3 → E4** · K1 | E2 |
| 5 | E5 · E6 · E7 · E8 · E9 (gleichzeitig) · O3 | E4, K1 |
| 6 | **E11 (M1)** · K2 · O5 | Welle 5 |
| 7 | K3 · O6 · O7 · O8 | K2, O5 |
| 8 | K5 · O11 · Z1 (Basis) → **M2: Freigabe durch den Autor, Merge nach `main`** | Welle 7 |
| 9 | X1 → X2 (drei Pakete) · X3 | P0.5 beantwortet, E11 |
| 10 | X4 · X5 · X6 (gleichzeitig) | X3 |
| 11 | X7 · K4 · O10 → K5 und Z1 mit Erweiterung → **M3: Freigabe, Merge nach `main`** | Welle 10 |
| 12 | Z2 · Z3 (M4) | M3 |

Die Wellen 9 und 10 dürfen neben den Wellen 6 bis 8 laufen, sobald P0.5
beantwortet ist. X1 und X3 ändern `zugablauf.ts` und laufen deshalb
nacheinander.

**Stabile Schnittstelle für Oberfläche und KI:** `src/engine/index.ts`. E1
legt Zustand und Aktionstypen fest, E2 den Zugablauf. Ändert ein späterer
Task diese Signaturen, passt derselbe PR alle Nutzer an.

## 11. Verifikation des Ganzen

- **Je Task:** Abschnitt 3 (Gates, Prüfer im Browser, Codex bei Engine und KI).
- **Je Meilenstein:**
  - M1: E11. M3: X7.
  - M2 und M3: Z1 (ganze Partien über echte Klicks, Desktop und Handy), K5
    (Stärke der KI), dann **spielt der Autor die Vercel-Vorschau** und gibt frei.
- **Am Ende (Z2, Z3):** Teil C leer, `abgleich:website` vollständig,
  Bundle-Abgleich mit der Produktion, Produktions-Smoke.
- **Befehle:** `npm test -- --run`, `npm run typecheck`, `npm run build`,
  `npm run check:test-lines`, `npm run check:css-asserts`,
  `npm run check:regeln`, `npx eslint .`, `npm run test:layout`,
  `npm run abgleich:website`.

## 12. Risiken

| Risiko | Vorkehrung |
|---|---|
| E1 und E2 brechen fast alle Engine-Tests (27 Testdateien nennen die alten Phasen). | Alte Regeltests werden durch Tests je Spec-Abschnitt ersetzt, nicht angepasst. Bis E11 sichern Invarianten und Dauerlauf jeden Task. |
| Ein neu erzeugter Golden Master zementiert Fehler. | Er entsteht erst in E11 und X7 und wird vorher Zug für Zug gegen Teil A gelesen. |
| Regeln der Erweiterung bleiben unklar. | P0.5 läuft ab Welle 1; X4–X6 starten erst nach den Antworten. Das Basis-Spiel (M2) hängt nur an den Fragen F. |
| Die Website ändert sich während der Umsetzung. | `abgleich:website` vor jedem Meilenstein; Abweichungen werden zu Zeilen in Teil C. |
| Handy-Layout mit vier Spielern und vollen Schlangen. | O4 baut das Volltisch-Szenario zuerst, vor aller Bedienung. |
| Die Engine rückt selbst vor (Aussetzen, Schlussrunde) und könnte kreisen. | Der Dauerlauf prüft, dass jede Partie unter einer Schrittgrenze endet. |
| Codex oder Dart sind lokal nicht nutzbar. | P0.2 prüft es zuerst; sonst hält der Orchestrator an und fragt. |
| Parallele Tasks kollidieren. | Jede Karte hat eine eigene Datei; Regel U13; der Prüfer vergleicht den Diff mit dem Feld „Dateien". |
| Der Entwicklertisch verrät verdeckte Karten. | Er existiert nur im Testhook-Build; ein Test belegt, dass er im Produktions-Bundle fehlt. |

## 13. Wo der Autor gebraucht wird

| Wann | Was |
|---|---|
| Welle 1 | Regelfragen aus Abschnitt 9 beantworten und die Website nachziehen (P0.5); D9–D13 auf die Website bringen (Prompt kommt mit P0.1). |
| Welle 1 | Entwürfe für Lobby, Tisch und Ergebnis ansehen und freigeben; Kartenrückseite liefern oder erzeugen lassen (O1). |
| M2, M3 | Die Vercel-Vorschau spielen und den Merge nach `main` freigeben. |
| Bei Bedarf | Kostenfreigabe vor jeder kostenpflichtigen Bilderzeugung; Entscheidung, wenn ein Task dreimal abgelehnt wurde oder Codex lokal nicht läuft. |

## 14. Übergabe an die lokale Sitzung

Nach P0.1 liegt alles im Repo und in Dart. Auf dem Desktop:

1. Im Repo-Ordner `git fetch` und `git switch neuaufbau`.
2. Claude Code dort starten.
3. Erster Auftrag: „Lies `docs/UMSETZUNGSPLAN.md`. Du bist der Orchestrator
   nach Abschnitt 3. Beginne mit P0.2 und arbeite die Wellen aus Abschnitt 10
   ab. Melde dich nach jedem Meilenstein und an den Stellen aus Abschnitt 13."

Der Fortschritt steht in Dart (ein Task je Plan-Task) und in den
Prüfprotokollen unter `docs/abnahme/`. Eine neue Sitzung kann daran jederzeit
anknüpfen.
