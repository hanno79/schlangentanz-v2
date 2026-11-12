# Schlangentanz v2

Digitale Fassung des Kartenspiels Schlangentanz: ein Mensch gegen 1–3 KI-Gegner im Browser.

> Diese Datei ist die verbindliche Anweisung für alle Coding-Agenten.
> `CLAUDE.md`, `GEMINI.md` und `.cursor/rules/baseline.mdc` verweisen hierher.

<!-- baseline:kern v2.0 anfang -->
## Kernregeln

Verbindlich für dieses Projekt. Gepflegt in der Baseline; lokale Änderungen an
diesem Block gehen beim nächsten Sync verloren. Projektspezifisches gehört
unter die Marker, nicht hinein.

### Auftrag

- Verstehen vor Ändern. In einer unbekannten Codebase zuerst read-only
  einarbeiten.
- Der Auftrag ist der Umfang. Nicht stillschweigend erweitern, nicht
  verkleinern.
- Fixes beheben die Wurzelursache. Ein Workaround, der das Symptom verdeckt,
  ist kein Fix.
- Auffälligkeiten ausserhalb des Auftrags werden gemeldet, nicht nebenbei
  behoben.
- Bei zwei plausiblen Auslegungen: Annahme benennen und weiterarbeiten. Nur
  blockieren, wenn ein Irrtum die Arbeit wertlos oder unsicher machen würde.
- Vor grösseren Änderungen den Plan nennen und bestätigen lassen.

### Wahrhaftigkeit

- Keine Dummy- oder Fallback-Werte, die echte Daten vortäuschen. Fehlt etwas,
  wird das sichtbar: klarer Fehler statt stillem Ersatzwert.
- Fail-Fast. Kein `try`/`except`, das Fehler verschluckt. Fehler werden dort
  behandelt, wo sie behandelbar sind — sonst weitergereicht.
- Ergebnisse werden berichtet, wie sie sind. Fehlgeschlagene Tests werden
  genannt, samt Ausgabe. Übersprungene Schritte werden genannt.
- Nichts behaupten, was nicht ausgeführt und geprüft wurde.
- Ein ausnahmsweise nötiger Platzhalter wird markiert: `DUMMY:` bzw.
  `FALLBACK:` im Kommentar und ein Log-Eintrag auf WARNUNG.

### Änderungen

- Defekte Datei direkt editieren. Keine Zweitdatei mit Suffix (`_fixed`,
  `_final`, `_v2`) — Versionen verwaltet git.
- Kein Autor-Header, keine `# ÄNDERUNG [Datum]`-Kommentare. Wer, wann und
  warum steht im git-Log; im Code veraltet es.
- Kleinstmöglicher Eingriff, der das Problem tatsächlich löst.
- Bestehenden Mustern folgen: Benennung, Aufbau und Kommentardichte des
  umgebenden Codes.
- Eine Datei, eine Verantwortung. Ab etwa 400 Zeilen Aufteilung prüfen —
  Richtwert, kein Verbot; bewusst überschreiten ist in Ordnung, unbemerkt
  wachsen nicht.
- Keine Code-Duplikate. Wiederkehrende Logik wird zu einer Funktion.

### Sicherheit

- Keine Secrets im Repo: keine Keys, Tokens, Passwörter, keine `.env`. Auch
  nicht in privaten Repos.
- Konfiguration über Umgebungsvariablen; `.env.example` dokumentiert die Namen
  ohne Werte.
- Schwer umkehrbare Aktionen — Deploy, Migration, Löschung, Force-Push,
  externe API mit Seiteneffekt — nur nach ausdrücklicher Bestätigung.
- Commits und Pushes nur auf Ansage, nie automatisch.

### Sprache

- Doku, Kommentare und Commit-Messages: Deutsch.
- Code-Identifier: Englisch im Anwendungscode, weil Frameworks und
  Bibliotheken englisch sind und Mischformen sonst unvermeidlich werden. In
  eigenständigen Werkzeugen und Skripten ohne Framework-Umgebung ist
  Deutsch zulässig, wenn das Projekt es durchhält.
- Echte Umlaute (ä/ö/ü); kein Eszett einführen. UTF-8 ohne BOM, LF als
  Zeilenende.
- Commits nach Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`) mit deutscher Beschreibung; der Body erklärt das Warum.
- Neutrale Wortwahl: "Prozess beenden", nicht "Prozess töten".

### Qualität

- Feature und Bugfix kommen mit Test. Ein Bugfix wird zuerst mit einem Test
  belegt, der den Fehler reproduziert — dann behoben.
- Assert-Meldungen deutsch und aussagekräftig: was erwartet, was erhalten, in
  welcher Funktion.
- Vor jedem Commit-Angebot laufen `python scripts/regelcheck.py` sowie die
  unter "Befehle" genannten Checks. Grün — oder das Problem wird benannt.
  (`--geaendert` ist der Modus des pre-commit-Hooks, der nur die zum Commit
  vorgemerkten Änderungen prüft — vor einem Commit-Angebot ist typischerweise
  noch nichts gestaged.)
- Bei UI-Änderungen wird im Browser geprüft, nicht nur der Code gelesen:
  Funktion **und** Plausibilität der angezeigten Werte.
<!-- baseline:kern ende -->

## Vertiefungen

- Oberflächenarbeit: [docs/regeln/web.md](docs/regeln/web.md) und [DESIGN.md](DESIGN.md)

## Befehle

- `npm test -- --run`
- `npm run test:layout` — Playwright-Layout-Verträge gegen `vite preview`.
  Je Geräteklasse (`desktop`, `tablet`, `handy`) zwei Projekte: `<klasse>`
  (Port 4173, Produktionsbuild) und `<klasse>-testhooks` (Port 4174, Build mit
  `VITE_TEST_HOOKS=1`) für Verträge, die den Entwicklertisch unter `/dev`
  brauchen (`*.hooks.spec.ts`). Siehe `docs/WORKFLOW.md`.
  Beide Server laufen mit `reuseExistingServer: false`: antwortet unter der URL
  schon ein Server, bricht Playwright ab, statt ihn weiterzubenutzen und still
  einen alten Build zu messen.
- `npm run typecheck`
- `npm run build`
- `npm run check:test-lines`
- `npm run check:css-asserts`
- `npm run check:regeln` — Umsetzungsregeln U1, U6, U7 (`docs/UMSETZUNGSPLAN.md` 3.7)
- `npm run dev`

## Erste Aktion in einer neuen Session

Vor jeder Änderung die Codebase verstehen — read-only: Dokumentation und
Manifest-Dateien lesen, Verzeichnisstruktur und Einstiegspunkte kartieren, die
tragenden Module vollständig lesen, Test-Setup und Konventionen erfassen. Erst
danach ändern.

In Claude Code deckt `/baseline:onboard` diesen Ablauf ab.

## Projektspezifisches

### Abweichungen vom Kern (Entscheidung des Autors vom 12.11.2026)

- **Deutsche Bezeichner** auch im Anwendungscode. Der Bestand ist durchgehend
  deutsch benannt; Mischformen wären schlimmer als die Abweichung.
- **Kein Dateikopf, keine `// ÄNDERUNG`-Kommentare** in neuem Code: hier gilt der
  Kern, Plan-Regel U9 ist entsprechend angepasst.
- **Testregister und Merges:** Prüfer tragen ihre Prüfungen als Testfälle und
  Läufe ins Register ein. Ein Task-Merge in `neuaufbau` setzt das bestandene
  Prüfprotokoll `docs/abnahme/<ID>.md` voraus, keinen freigegebenen Durchgang.
  Vor jedem Merge nach `main` (geht sofort in Produktion) muss
  `python scripts/testregister_freigabe.py` mit 0 enden.

### Scope
This repository is a **fresh greenfield rebuild** of Schlangentanz.

Do **not** copy or import code from:
- `/home/projects/schlangentanz-game`
- Paperclip workspaces or artifacts
- old Vercel project output

Old work may be read only as historical reference after explicit Hermes approval, but no code should be copied blindly.

### Regelquelle (ÄNDERUNG 12.11.2026)

- **Einzige verbindliche Regelquelle ist die Website `https://schlangentanz.ch/rules`.**
- `docs/GAME_SPEC.md` spiegelt sie wörtlich (Teil A) und führt die Abweichungen der
  Engine als Arbeitsliste (Teil C) und offene Fragen an den Autor (Teil D).
- Dart-Tasks, Dart-Dokumente, `docs/release_status_*`, `docs/slice_plan_*` und
  `docs/PLAYABILITY_GATE.md` sind **keine** Regelquelle.
- Weicht der Code von der Website ab, ist der Code falsch. Gibt die Website etwas
  nicht her, wird gefragt und nicht geraten.
- `npm run abgleich:website` prüft, ob Teil A mit der Website übereinstimmt.

### Umsetzungsplan (ÄNDERUNG 12.11.2026)

**Die laufende Arbeit folgt `docs/UMSETZUNGSPLAN.md`.** Lies ihn vor jedem Task.
Er legt fest: Branches (`neuaufbau`, je Task `task/<ID>-<kurzname>`, `main` nur
für Meilensteine), Rollen (Orchestrator, Umsetzer, unabhängiger Prüfer, Codex),
Ablauf eines Tasks (Tests zuerst, `/simplify`, Gates, Codex, Abnahme im
Browser), Definition of Done, prüfbare Umsetzungsregeln U1–U13 und die
Reihenfolge der Tasks. Der Fortschritt steht in Dart, die Prüfprotokolle unter
`docs/abnahme/`. Bei Widerspruch zwischen diesem Dokument und dem Plan gilt der Plan.

### Roles
- Hermes: orchestrator, release manager, quality gatekeeper. Im Umsetzungsplan
  übernimmt die Claude-Code-Hauptsitzung die Rolle des Orchestrators.
- Claude Code: builder for implementation slices (Umsetzer) and independent
  reviewer without prior knowledge (Prüfer), each as a separate subagent.
- Codex: adversarial reviewer and verifier (`codex exec`, lokal mit Abo).
- Dart: backlog source and progress tracker (one task per plan task). Not a rules
  source — rules come from the website only.
- Paperclip: archived history/tracking only, **not** an implementation backend.

### Required workflow
1. Keep `docs/GAME_SPEC.md` in sync with the website before real game implementation.
2. Write acceptance tests before production game logic.
3. Implement in small slices.
4. After every coding pass, run Claude Code `/simplify` once as a simplification pre-check.
5. Run tests, typecheck, and build after each slice.
6. Codex reviews every rules/engine slice after the `/simplify` pre-check and before merge/release.
7. No release without `docs/PLAYABILITY_GATE.md` evidence.

### Layout-Verträge (ÄNDERUNG 30.07.2026, AP-2)

Layout-Verträge werden **gemessen, nicht im CSS-Quelltext gelesen**.

- Neue Layout-Zusicherungen gehören als Playwright-Messung nach `tests/layout/`
  und benutzen die Primitive aus `tests/layout/messung.ts`.
- **Keine neuen CSS-Quelltext-Parser.** Es wird kein `readFileSync('src/App.css')`
  mit selbstgebautem Klammer-Walker mehr in Testdateien eingeführt.
  `npm run check:css-asserts` bricht ab, sobald der Bestand steigt.
- `clamp()`-Verträge werden als **Bereich** geprüft (`erwarteHoeheImRemBereich`),
  nie als exakter Pixelwert — sonst ist es dieselbe Brüchigkeit in neuer Verpackung.
- Der Altbestand wird slice-weise abgebaut; die verbleibende Zahl steht in
  `scripts/css_source_asserts_baseline.json`.

<!-- baseline:tagebuch v2.1 anfang -->
## Projekttagebuch

Dieses Projekt führt ein Tagebuch unter `tagebuch/`. Aus den Quellen dort baut
`python scripts/tagebuch_bauen.py` eine Webseite unter `tagebuch/website/`, die
per Doppelklick im Browser aufgeht. Die Quellen schreibt der Agent, der am
Projekt arbeitet, nach dieser Regel; mit „du“ ist er gemeint.

Die Vorlagen liegen unter `tagebuch/vorlagen/`: `projekt.md`, `plan.md`,
`eintrag-fortschritt.md`, `eintrag-entscheidung.md`, `eintrag-sackgasse.md`,
`eintrag-auswertung.md`, `eintrag-meilenstein.md`, `datensatz.md` und
`abbildung.md`. Du kopierst eine Vorlage an ihren Ort und ersetzt jeden
Platzhalter `<…>`. Ein optionales Feld, zu dem nichts bekannt ist, löschst du
samt Zeile. Kein Platzhalter bleibt stehen; ein Kopffeld oder eine
Tabellenzelle, die noch ganz aus `<…>` besteht, bricht den Bau ab. Kein Feld
wird mit erfundenem Inhalt gefüllt, nur damit der Bau durchläuft. Unter `tagebuch/vorlagen/kapitel/`
liegen `1-auftrag.md` bis `6-offen.md` als Hinweistexte, was in welches Kapitel
gehört; sie werden nicht nach `tagebuch/kapitel/` kopiert. Der Bau liest
`tagebuch/vorlagen/` nicht. In `tagebuch/eintraege/` und `tagebuch/daten/`
liest er dagegen jede `.md` als Eintrag beziehungsweise Datensatz; ausser
ihnen liegt dort höchstens eine leere `.gitkeep`, die der Bau übergeht und
die nur dafür sorgt, dass git den Ordner auch leer mitführt.

### Wozu das Tagebuch da ist

Das Tagebuch hat drei Leserkreise. Während das Projekt läuft, belegt es den
Arbeitsfortschritt gegenüber Projektteam und Projektleitung. Die Seite wird bei
der internen Abnahme und bei der Diskussion über die nächsten Schritte geöffnet
und gezeigt; wer nicht dabei war, soll erkennen, was gemacht wurde, wie und mit
welchen Daten. Nach einer Pause dient es dem Wiedereinstieg: In wenigen
Minuten soll klar sein, wo das Projekt steht, was als Nächstes kommt und warum
es so gebaut ist. Schliesslich ist es die Grundlage des Projektberichts. Die
Seite selbst wird nicht abgegeben, sie hält aber alles vor, woraus ein
vollständiger und fehlerfreier Bericht entsteht: Auftrag, Datengrundlage mit
Quellen und Metadaten, Vorgehen, Ergebnisse mit Zahlen, Entscheidungen mit
Begründung, Abbildungen mit Bildunterschrift und Quelle.

Am Projektende muss sich ablesen lassen, welche Schritte wann und mit welcher
Begründung gegangen wurden und welche Meilensteine es gab. Daraus folgt die
Aufteilung. Die sechs Kapitel unter `tagebuch/kapitel/` sind der Rohbau des
Berichts und beschreiben immer den aktuellen Stand. Die Einträge unter
`tagebuch/eintraege/` sind das Protokoll; ein geschriebener Eintrag wird nicht
mehr umgeschrieben.

### Jede Angabe genau einmal

Jede Angabe wird an genau einer Stelle erfasst. Was auf mehreren Seiten
erscheint, verteilt der Bau; trägst du es an einer zweiten Stelle nach, laufen
die beiden Fassungen früher oder später auseinander.

| Angabe | Wird erfasst in | Erscheint auf |
|---|---|---|
| Projektname, Status, Beteiligte, Start | `projekt.md` (Kopf) | Kopf aller Seiten |
| Kurzfassung, Stand heute | `projekt.md` (Abschnitte) | Überblick |
| Kennzahlen des Projekts | `projekt.md` (Tabelle) | Überblick |
| Kapiteltexte | `kapitel/*.md` | jeweiliges Kapitel |
| Meilensteine (geplant) | `plan.md` | Überblick, Kapitel 6, Verlauf |
| Meilenstein erreicht | Eintrag der Art `meilenstein` | Überblick, Verlauf |
| Offene Punkte | `plan.md` | Überblick, Kapitel 6 |
| Entscheidung mit Begründung | Eintrag der Art `entscheidung` | Verlauf, Kapitel 5, Überblick |
| Datensatz mit Metadaten | `daten/*.md` | Kapitel 2 (Katalog, Fluss, Steckbrief) |
| Abbildung mit Unterschrift und Quelle | `abbildungen/*.md` | Kapitel, Einträge, Abbildungen, Überblick |

Manches wird gar nicht erfasst, sondern vom Bau abgeleitet, und bekommt deshalb
kein Feld. Erreicht ist ein Meilenstein am Datum des Eintrags, der ihn meldet.
Die Phasen im Verlauf sind die Strecken zwischen zwei Meilensteinen; ihre Titel
(„Bis X“, „Bis X (laufend)“, „Seit X“ oder „Projektverlauf“) setzt der Bau. Ob
ein Datensatz Original, aufbereitet oder Ergebnis ist, folgt aus `basiert_auf`.
Die Nummern „Abb. n“ und „Tab. n“ vergibt der Bau in der Reihenfolge der
Kapitel.

Kennzahlen in einem Eintrag halten den Stand am Tag des Eintrags fest, die
Kennzahlen in `projekt.md` den Stand von heute. Beide stehen nebeneinander und
werden nicht abgeglichen.

### Nach jedem abgeschlossenen Arbeitsschritt

Ein Arbeitsschritt ist abgeschlossen, wenn ein Vorhaben fertig ist: ein
Feature, eine Fehlersuche, eine Auswertung, eine Entscheidung oder eine
verworfene Richtung. Bevor du ihn als fertig meldest, gehst du diese Schritte
in dieser Reihenfolge durch:

1. Eintrag anlegen.
2. Betroffene Kapitel fortschreiben.
3. „Stand heute“ und Kennzahlen in `projekt.md` aktualisieren.
4. „Als Nächstes“ in `plan.md` pflegen.
5. Abbildungen ablegen.
6. Testläufe erfassen.
7. Alle neuen Texte mit dem Humanizer prüfen.
8. Die Seite neu bauen.

**Eintrag anlegen.** Lege `tagebuch/eintraege/JJJJ-MM-TT-kurzname.md` an, mit
dem Datum des Tages und einem Kurznamen aus Kleinbuchstaben, Ziffern und
Bindestrichen, Umlaute als ae, oe, ue. Ausgangspunkt ist die Vorlage der
passenden Art. Ein Eintrag hat genau eine Art; fällt während eines Schritts
eine Entscheidung oder erweist sich ein Weg als Sackgasse, bekommt das einen
eigenen Eintrag.

- `fortschritt` aus `eintrag-fortschritt.md`, wenn ein Stück Arbeit fertig ist:
  Fliesstext ohne Pflichtabschnitte.
- `entscheidung` aus `eintrag-entscheidung.md`, wenn zwischen mindestens zwei
  Wegen gewählt wurde: Abschnitte `## Frage`, `## Optionen`, `## Gewählt` und
  `## Begründung`, jeder mit Text.
- `sackgasse` aus `eintrag-sackgasse.md`, wenn ein Weg probiert und verworfen
  wurde: `## Versuch`, `## Woran es scheiterte` und `## Folge`.
- `auswertung` aus `eintrag-auswertung.md` für Messungen, Benchmarks,
  Prüfläufe und technische Auswertungen: `## Was gemessen wurde`,
  `## Ergebnis` und `## Einordnung`. Der Abschnitt Ergebnis erscheint allein
  in Kapitel 4 und muss ohne die anderen verständlich sein.
- `meilenstein` aus `eintrag-meilenstein.md`, wenn ein Meilenstein aus
  `plan.md` erreicht ist.

Pflicht im Kopf sind `datum` (JJJJ-MM-TT), `zeit` (HH:MM, die aktuelle Uhrzeit
beim Anlegen), `titel` (ein Satz, der sagt, was passiert ist), `art`, `wer` und
`kapitel`. Nach `datum` und `zeit` ordnet der Bau Verlauf, Phasen, Strahl und
alle Listen; ohne Uhrzeit bleibt bei mehreren Einträgen eines Tages nur der
Dateiname, und der gibt den Ablauf nicht wieder. In `wer` stehen die
Beteiligten mit Namen, ein mitschreibender Agent ebenfalls, etwa `Claude Code`.
`kapitel` ist eine Komma-Liste der Nummern 1 bis 6 mit mindestens einer Nummer,
jede höchstens einmal: die Kapitel, die dieser Schritt verändert hat. Hat der
Schritt keinen Kapiteltext verändert, nennst du das Kapitel, zu dem er dem
Inhalt nach gehört, meist 3 (Vorgehen); eine Sackgasse bei den Daten gehört zu
2. Unter jedem genannten Kapitel erscheint der Eintrag auf der Seite. Bei
`art: meilenstein` entfällt `kapitel`; Pflicht ist dort `meilenstein` mit der
ID aus `plan.md`. Optional sind `betrifft` (Teil des Projekts), `kennzahlen`
und `abbildungen`. In `kennzahlen` trennt ein Semikolon die Kennzahlen; in
jeder ist das erste Wort der Wert und der Rest die Bezeichnung, eine Einheit
gehört also in die Bezeichnung:
`kennzahlen: 3'898 Gebäude; 23 Dubletten entfernt`. `abbildungen` ist eine
Komma-Liste von Abbildungsnamen.

Den Eintrag der Art `meilenstein` schreibst du an dem Tag, an dem alles
vorliegt, was der Meilenstein in `plan.md` verspricht, zusätzlich zum Eintrag
des letzten Arbeitsschritts. Jeder Meilenstein wird genau einmal gemeldet. Er
bleibt danach in `plan.md` stehen, weil der Eintrag auf seine ID verweist.
Erreicht das Projekt einen wichtigen Abschnitt, der nicht geplant war, nimmst
du ihn zuerst in `plan.md` auf und meldest ihn dann.

**Sackgassen und falsche Richtungen gehören hinein.** Eine Arbeitsspur ohne sie
ist eine Werbebroschüre. Was nicht funktioniert hat und warum, ist beim
nächsten Mal mehr wert als das, was auf Anhieb ging.

**Fliesstext, keine Stichpunktsammlung.** Einträge und Kapitel sollen sich
lesen lassen, auch von jemandem, der nicht dabei war. Listen nur dort, wo der
Inhalt tatsächlich eine Liste ist.

**Kapitel fortschreiben.** Für jede Nummer in `kapitel` bringst du die Datei in
`tagebuch/kapitel/` auf den Stand, den sie im Bericht haben soll. Veraltetes
ersetzt du, statt Neues anzuhängen; wie es dazu kam, steht im Eintrag. Die
Kapitel nehmen auf:

- `1-auftrag.md`: Auftrag, Ziel, Auftraggeber, vereinbarte Ergebnisse,
  Rahmenbedingungen und was nicht dazugehört. Ändert sich nur mit dem Auftrag.
- `2-datengrundlage.md`: eine kurze Einleitung zu den Quellen. Datenfluss,
  Katalog und Steckbriefe erzeugt der Bau aus `daten/`.
- `3-vorgehen.md`: der Workflow beziehungsweise die Pipeline, wie sie heute
  läuft, mit Werkzeugen, Skripten, Regeln und den Datensätzen, die je Schritt
  entstehen.
- `4-ergebnisse.md`: die Ergebnisse und Befunde, die heute gelten, mit Zahlen
  und Abbildungen. Die Auswertungen listet der Bau darunter auf.
- `5-entscheidungen.md`: höchstens eine kurze Einleitung. Die Entscheidungen
  selbst kommen aus den Einträgen der Art `entscheidung`.
- `6-offen.md`: eine kurze Einordnung des Offenen. Offene Punkte und
  unerreichte Meilensteine kommen aus `plan.md`.

Bei den Kapiteln 2, 5 und 6 genügt es meist, dass der Eintrag dort erscheint;
den Text passt du nur an, wenn er nicht mehr stimmt. Ein Kapitel ist reiner
Markdown-Text ohne Kopf und darf leer sein, die Datei muss aber bestehen, und
`tagebuch/kapitel/` enthält genau diese sechs Dateien. Unterabschnitte beginnen
mit `##`, darunter `###` und `####`. Eine Abbildung bettest du mit einer
eigenen Zeile `![[name]]` an der Stelle ein, an die sie im Text gehört.

**`projekt.md` aktualisieren.** Der Kopf trägt die Pflichtfelder `projekt`,
`start` (JJJJ-MM-TT) und `stand` (`laufend`, `pausiert` oder `abgeschlossen`),
dazu optional `auftraggeber`, `beteiligte` und `stand_vom` (JJJJ-MM-TT). Das
Feld `umgestellt_am` setzt nur die Umstellung von v1. Im Rumpf stehen genau
`## Kurzfassung` und `## Stand heute`, beide mit Text, und optional
`## Kennzahlen`; jede andere `##`-Überschrift bricht den Bau ab, ebenso Text
vor `## Kurzfassung` und Text neben der Tabelle unter `## Kennzahlen`. Die
Kurzfassung sagt in zwei Sätzen, was für wen und wozu entsteht, und ändert sich
nur mit dem Auftrag. „Stand heute“ schreibst du nach jedem Schritt als kurzen
Absatz neu: wo das Projekt jetzt steht und was fehlt. Jedes Mal, wenn sich
„Stand heute“ ändert, setzt du `stand_vom` auf den Tag, an dem du ihn
schreibst; der Überblick zeigt den Abschnitt dann als „Stand vom TT.MM.JJJJ“,
und ein liegen gebliebener Stand fällt auf. Die Kennzahlen pflegst du nach dem
Abschnitt „Kennzahlen“ weiter unten. `stand` und `beteiligte` passt du an,
sobald sie sich ändern.

**`plan.md` pflegen.** Die Datei hat keinen Kopf und nur die Abschnitte
`## Meilensteine` und `## Als Nächstes`, je mit genau einer Tabelle ohne
Leerzeile darin. Text vor der ersten Überschrift oder neben einer Tabelle
zeigt die Seite nicht, deshalb bricht der Bau dort ab; Erläuterungen zum Plan
gehören nach Kapitel 3 oder 6. Die Meilenstein-Tabelle hat genau die Spalten `| ID | Meilenstein | geplant |`. Die
ID besteht aus Buchstaben, Ziffern, `-` und `_` (etwa `M1`), ist eindeutig und
wird nach einer Meldung nicht mehr geändert; `geplant` ist Freitext wie „Mitte
November“. Die Reihenfolge der Zeilen ist die geplante Reihenfolge. Die Tabelle
„Als Nächstes“ hat genau die Spalten `| Punkt | wer | blockiert | seit |`; nur
`Punkt` ist Pflicht, die oberste Zeile hat Vorrang. In `blockiert` steht, was
auf diesen Punkt wartet, ein Meilenstein oder ein anderer Punkt, in `seit` das
Datum der Aufnahme als TT.MM.JJJJ. Nach jedem Schritt löschst du erledigte
Punkte ganz; dass sie erledigt sind, belegt der Eintrag. Neue Punkte, die der
Schritt ergeben hat, nimmst du auf, und die Reihenfolge stellst du neu nach
Vorrang.

**Abbildungen ablegen.** Jede Abbildung, die ein Eintrag in `abbildungen`
nennt oder ein Kapitel mit `![[name]]` einbettet, liegt mit Datei und
Beschreibung unter `tagebuch/abbildungen/`. Wann welche Abbildung entsteht,
regelt der Abschnitt „Abbildungen“.

**Testläufe erfassen.** Führt das Projekt ein Testregister (`tagebuch/tests/`),
erfasst du jeden Test, den du in diesem Schritt ausgeführt hast, und jeden, den
der Nutzer dir gemeldet hat, nach `rules/testregister.md`. Im Projekt steht
diese Regel als Block `testregister` in der `AGENTS.md`. Ohne Register entfällt
der Schritt.

**Humanizer und Bau.** Alle Texte, die du in diesem Schritt neu geschrieben
hast, prüfst du nach dem Abschnitt „Humanizer“. Danach baust du die Seite neu:

```
python scripts/tagebuch_bauen.py
```

Der Bau prüft alle Quellen und bricht bei einem Fehler mit Dateiname und Feld
ab, ohne etwas zu schreiben. Du behebst den Fehler in der Quelle, nie in der
erzeugten Seite und nie mit einem erfundenen Wert. Ohne neuen Bau sieht ein
Aussenstehender einen veralteten Stand, ohne es zu merken; der Regelcheck
warnt, wenn die Seite nicht zu ihren Quellen passt.

### Abbildungen

Abbildungen entstehen bei festen Anlässen. In Projekten mit Oberfläche nimmst
du von jeder neuen oder geänderten Ansicht einen Screenshot im Browser auf
(`art: screenshot`). In GIS-Projekten
exportierst du jede Zwischen- und Ergebniskarte aus QGIS oder ArcGIS Pro, immer
mit Legende und Massstab (`art: karte`). Das Ergebnis einer Auswertung legst du
als CSV-Tabelle ab (`art: tabelle`); ein Diagramm (`art: diagramm`) kommt dazu,
wenn es eine Entwicklung oder einen Vergleich deutlicher zeigt als die Tabelle.

Zu jeder Abbildung gehören zwei Dateien in `tagebuch/abbildungen/`: die Datei
selbst und eine Beschreibung aus der Vorlage `abbildung.md` mit demselben
Namen, etwa `uebersichtskarte.png` und `uebersichtskarte.md`. Der Name der
Abbildung ist der Dateiname der `.md` ohne Endung. Er besteht aus
Kleinbuchstaben, Ziffern und Bindestrichen, Umlaute als ae, oe, ue, und
beschreibt den Inhalt, nicht das Datum. Erlaubte Endungen sind `.png`, `.jpg`,
`.jpeg`, `.webp` und `.svg` in Kleinbuchstaben, `.csv` nur bei
`art: tabelle`. Eine CSV hat in der ersten Zeile die Spaltenköpfe, Komma oder
Semikolon als Trennzeichen und in jeder Zeile gleich viele Spalten.

Pflicht in der Beschreibung sind `titel` (die Bildunterschrift ohne Nummer),
`quelle`, `datum` (JJJJ-MM-TT), `art` und `datei`; optional nennt
`basiert_auf` die Datensätze aus `daten/`, die in der Abbildung stecken. Die
Quelle steht immer da: bei eigenen Abbildungen „eigene Darstellung“ mit
Werkzeug und Version, bei Screenshots „Screenshot der Anwendung“, bei fremden
die Quelle mit Lizenz.

Richtwert für Bilddateien sind höchstens 1600 px Breite und 1 MB; grössere
Bilder verkleinerst du vor dem Ablegen, der Regelcheck warnt sonst. Ein Kapitel
bettet eine Abbildung mit der eigenen Zeile `![[name]]` ein, ein Eintrag nennt
sie im Kopffeld `abbildungen`; im Text eines Eintrags wird nichts eingebettet.
Eine Abbildung, auf die ein Eintrag verweist, ersetzt du nicht durch einen
neueren Stand. Der neue Stand bekommt einen eigenen Namen (etwa
`pruefansicht-2`), damit der ältere Eintrag weiterhin zeigt, was damals galt.
Im Kapitel stellst du die Zeile `![[name]]` auf den neuen Namen um; ältere
Einträge behalten den alten.

### Kennzahlen

Kennzahlen stehen nur dort, wo sie etwas aussagen. Auf dem Überblick erscheinen
die Kennzahlen aus `projekt.md` als Kacheln; drei bis sechs sind richtig, und
jede trägt ihre Herkunft. Die Tabelle unter `## Kennzahlen` hat genau die
Spalten `| Wert | Bezeichnung | Herkunft |`, und jede Zelle ist gefüllt. Der
Wert ist eine Zahl im Schweizer Format (`3'898`), die Bezeichnung sagt, was
gezählt wurde, und die Herkunft, woher die Zahl stammt und von wann, etwa
„Überlagerung vom 24.09.2026“. Nach jedem Schritt prüfst du, ob sich eine Zahl
geändert hat, und entfernst Kennzahlen, die nichts mehr aussagen. Zahlen, die
nur nach Fleiss aussehen, gehören nicht hinein: Commits, Codezeilen, Anzahl
Einträge. Hat ein Projekt keine solche Zahl, entfällt der Abschnitt ganz.

### Datensätze dokumentieren, bevor damit gearbeitet wird

Jede Datenquelle bekommt eine Datei unter `tagebuch/daten/`, und zwar **vor**
der ersten Nutzung, nicht danach. Dasselbe Muster wie beim Bugfix, der zuerst
einen Test bekommt: Wer erst arbeitet und später aufschreibt, schreibt nie auf.
Ausgangspunkt ist die Vorlage `datensatz.md`, Dateiname ist der Wert von
`name` mit `.md`.

Pflicht sind `name`, `quelle`, `bezogen_am`, `stand`, `format` und `ablage`.
`name` besteht aus Buchstaben, Ziffern, `_` und `-` und ist auch ohne Rücksicht
auf Gross- und Kleinschreibung eindeutig, weil er zum Dateinamen der
Datensatzseite wird. Abgeleitete Datensätze tragen `quelle: abgeleitet` und
nennen in `basiert_auf` ihre Ausgangsdatensätze, damit der Datenpfad begehbar
bleibt. Optional sind `anbieter`, `bezugsweg`, `lizenz`, `kontakt`, `umfang`,
`koordinatensystem`, `ausdehnung`, `schluesselfeld`, `felder` und
`pruefsumme`. `ausdehnung` schreibst du als vier Zahlen west, süd, ost, nord
mit Komma, dahinter der EPSG-Code:
`2681200, 1229400, 2686900, 1234100 EPSG:2056`. Was nicht in den Metadaten der
Quelle steht oder sich nicht prüfen lässt, lässt du weg, statt es zu ergänzen.

Ein Datensatz, der vorgesehen, aber noch nicht bezogen ist, bekommt
`status: geplant` und erscheint im Datenfluss gestrichelt. In `bezogen_am`
steht dann „noch nicht bezogen“, in `stand` das, was schon bekannt ist. Sobald
er da ist, entfernst du `status` und trägst das echte Datum ein. Im Rumpf
beschreibt `## Aufbereitung` je Schritt, was womit gemacht wurde und mit
welchem Ergebnis, in Zahlen, und `## Fallstricke`, was überrascht hat. Der
Bezug selbst ist ein Arbeitsschritt mit eigenem Eintrag, der Kapitel 2
nennt.

In `daten/` gehören nur Arbeitsdaten: was das Projekt liest oder erzeugt und
weiterverwendet. Messungen, Benchmarks und Prüfläufe sind keine Datensätze,
sondern Einträge der Art `auswertung`, ihre Ergebnistabelle eine Abbildung mit
`art: tabelle`.

### Humanizer

Jeder Text, den du neu ins Tagebuch schreibst, wird vor dem Abschluss des
Arbeitsschritts mit dem Humanizer-Skill der Baseline geprüft und überarbeitet:
Einträge, Kapiteltexte, Kurzfassung, „Stand heute“, offene Punkte, Datensätze
und Bildunterschriften. In Claude Code rufst du dafür `/baseline:humanizer` mit
den geänderten Dateien auf. In anderen Umgebungen liest du
`plugins/baseline/skills/humanizer/SKILL.md` aus dem Baseline-Repo und
befolgst sie. Das Repo findest du über die Umgebungsvariable `BASELINE_PFAD`,
sonst unter `~/Baseline` oder `C:\Work\Privat\Baseline`; unten heisst es
`<baseline>`.

Zusätzlich läuft die maschinelle Vorprüfung über die geänderten Dateien:

```
python <baseline>/plugins/baseline/skills/humanizer/scripts/pruefe_muster.py <dateien>
```

Sie muss mit 0 enden; die gemeldeten Hinweise beurteilst du und überarbeitest,
was tatsächlich stört. Fakten, Zahlen, Feldnamen, Pfade und Code bleiben dabei
unverändert. Text, der bei der Umstellung von v1 umgezogen ist, bleibt wörtlich
und wird nicht überarbeitet; dasselbe gilt für alle Einträge von vor der
Umstellung. Meldet die Vorprüfung Fehler, die nur in solchem Text stehen,
behebst du sie nicht, sondern nennst sie dem Nutzer; der Wortlaut geht vor.

### Wiedereinstieg nach einer Pause

Bevor du nach einer Pause weiterarbeitest, liest du zuerst den Überblick und
Kapitel 6. In den Quellen sind das `projekt.md` (Kurzfassung, Stand heute,
Kennzahlen), `plan.md` (Meilensteine und Als Nächstes) und
`kapitel/6-offen.md`; auf der Seite `tagebuch/website/index.html` und
`offen.html`. Danach die drei bis fünf neuesten Einträge und, wenn du am
Vorgehen weiterbaust, Kapitel 3.

Warnt der Regelcheck, dass das Tagebuch hinterherhinkt, rekonstruierst du die
Lücke nicht aus Commits. Du schreibst einen Eintrag für den laufenden, noch
nicht abgeschlossenen Schritt und meldest dem Nutzer, dass für die Zeit davor
Einträge fehlen. Meldet der Regelcheck eine veraltete Seite, baust du sie neu.
Dann arbeitest du am obersten Punkt unter „Als Nächstes“ weiter, sofern der
Nutzer nichts anderes vorgibt.

### Umstellung von v1

Ein Tagebuch ohne den Ordner `tagebuch/kapitel/` ist im Format v1. Der Bau
bricht dann ab und verweist auf diesen Abschnitt. Umgestellt wird beim ersten
Lauf von `/baseline:projekt-init` oder `/baseline:regeln-sync` im Projekt. Es
gilt: Nur übernehmen, was klar im bisherigen Tagebuch steht, nichts
rückwirkend erfassen, keine Metadaten ergänzen, die nicht dastehen, und kein
Absatz darf verloren gehen. Der Ablauf:

1. **Sichern.** Kopiere `tagebuch/projekt.md` in einen Ordner ausserhalb von
   `tagebuch/`, etwa in den Temp- oder Scratchpad-Ordner der Sitzung. Dieser
   Ordner heisst unten `<sicherung>`. Die Kopie wird nicht committet; die alte
   Fassung bleibt ohnehin im git-Verlauf.
2. **Zuordnungstabelle vorlegen.** Lege dem Nutzer eine Tabelle vor, in der
   jeder `##`-Abschnitt des alten `projekt.md` mit seinem neuen Ort steht. Text
   vor der ersten `##`-Überschrift bekommt eine eigene Zeile, weil v2 Text
   ausserhalb der erlaubten Abschnitte nicht liest; ebenso Text neben der
   Tabelle unter `## Kennzahlen`, denn dort lässt v2 nur die Tabelle zu. Die festen Zuordnungen sind
   „Auftrag“ nach `kapitel/1-auftrag.md`, „Vorgehen“ nach
   `kapitel/3-vorgehen.md`, „Aktueller Stand“ (oder ein ähnlich benannter
   Abschnitt zum Stand) nach `kapitel/4-ergebnisse.md` unter
   `## Stand vom <TT.MM.JJJJ>`, wenn die alte Überschrift ein Datum trägt,
   sonst unter `## Stand vor der Umstellung` ohne Datum, und „Offen“
   beziehungsweise „Weitere Arbeit“ nach `## Als Nächstes` in `plan.md`. Ein
   Datum, das nicht in der alten Überschrift steht, setzt du dort nicht ein,
   auch nicht aus den Einträgen. Abschnitte ausserhalb dieses Schemas ordnest
   du nach Inhalt zu: was beschreibt, wie etwas gebaut ist oder abläuft, nach
   Kapitel 3; was ein Ergebnis oder einen Befund festhält, nach Kapitel 4;
   Rahmenbedingungen des Auftrags nach Kapitel 1. Jeder davon wird dort ein
   Unterabschnitt `##` mit seinem bisherigen Titel. Historische Planungsstände
   kommen nach Kapitel 3 unter `## Frühere Planungsstände`, mit ihrem
   bisherigen Titel als `###`. Sagt das alte `projekt.md` selbst, dass die
   folgenden Abschnitte einen früheren Stand beschreiben, gehören diese mit
   dazu, auch „Vorgehen“ und „Offen“: Sie werden `####` unter diesem
   Planungsstand, und die feste Zuordnung gilt für sie nicht. Was sich nicht
   eindeutig zuordnen lässt, kommt unverändert in einen Abschnitt des passenden
   Kapitels mit der Überschrift
   `## <bisheriger Titel> (aus v1, Zuordnung offen)` und wird in der Tabelle
   eigens markiert. In dieselbe Übersicht gehören die Datensätze unter
   `daten/`, die erkennbar Auswertungen sind, mit der Frage, ob sie umziehen
   sollen. Dann wartest du auf die Bestätigung des Nutzers und schreibst vorher
   nichts.
3. **Wörtlich umziehen.** Lege `tagebuch/kapitel/` mit allen sechs Dateien an,
   leer, wo nichts hineinkommt, und `tagebuch/plan.md` nach der Vorlage. Der
   Text wandert Wort für Wort; ändern dürfen sich nur Überschriften: ihre
   Ebene, ein Zusatz wie „(aus v1, Zuordnung offen)“ und der neue Titel, den
   Schritt 2 vorgibt. Aus „Offen“ oder „Weitere Arbeit“ wird je Punkt oder
   Absatz eine Zeile mit dem Text in der Spalte `Punkt`, auf eine Zeile
   gebracht; enthält ein Text das Zeichen `|`, meldest du ihn, statt ihn
   umzuschreiben. Text, der selbst kein Punkt ist, etwa eine Einleitung,
   kommt wörtlich nach `kapitel/6-offen.md`: Neben der Tabelle bleibt in
   `plan.md` nichts stehen, weil der Bau dort nur die Tabelle zeigt. `wer`, `blockiert` und `seit` bleiben leer, solange der alte
   Text sie nicht nennt. In die Tabelle „Meilensteine“ kommen nur künftige
   Meilensteine, die klar im alten Tagebuch stehen; sonst bleibt sie leer, und
   du fragst den Nutzer nach geplanten Meilensteinen. In `projekt.md` bleiben
   danach nur der Kopf, `## Kurzfassung`, `## Stand heute` und, falls
   vorhanden, `## Kennzahlen`. Der Kopf bleibt, wie er ist; neu kommen
   `umgestellt_am` (JJJJ-MM-TT) und `stand_vom` dazu. `umgestellt_am` ist der
   spätere von zwei Tagen: der Tag der Umstellung oder der Tag nach dem
   neuesten vorhandenen Eintrag, einschliesslich der Auswertungen, die aus
   `daten/` umziehen (Schritt 5). So liegt jeder alte Eintrag vor
   `umgestellt_am` und gilt als v1-Eintrag. Hat `stand` einen anderen Wert als
   `laufend`, `pausiert` oder `abgeschlossen`, fragst du nach. Eine Kurzfassung
   hatte v1 nicht: Du schreibst sie neu, in zwei Sätzen aus dem Inhalt von
   Kapitel 1. Auch `## Stand heute` schreibst du neu, kurz und mit höchstens
   vier Sätzen, aus dem alten Stand und aus den Einträgen, die nachweislich
   jünger sind als er; gab es keinen alten Stand, aus den neuesten Einträgen.
   Trägt der alte Stand kein Datum, lässt sich nicht belegen, welche Einträge
   jünger sind. Dann ziehst du die neuesten Einträge mit heran und legst den
   neuen Text schon in Schritt 2 zusammen mit der Zuordnungstabelle zur
   Bestätigung vor; ein Datum für den alten Stand setzt du auch dafür nicht
   ein. Du übernimmst nur, was dort dokumentiert ist, und erfindest nichts
   dazu.
   `stand_vom` ist der Tag der Umstellung. Nur diese neuen Texte gehen durch
   den Humanizer.
4. **Einträge unverändert lassen.** Jeder Eintrag mit `datum` vor
   `umgestellt_am` gilt als v1-Eintrag und ist von `zeit`, `kapitel`,
   `meilenstein` und den Pflichtabschnitten ausgenommen; jeder andere Eintrag
   braucht `zeit`, sonst bricht der Bau ab. Das Kopffeld `kapitel` darfst du
   ergänzen, wo der Eintrag es eindeutig hergibt, ebenso die Überschriften der
   Pflichtabschnitte, wo der Text schon genau so gegliedert ist; der Wortlaut
   bleibt. Steht in `datum` ein Tag in anderer Schreibweise, etwa
   `17.10.2026`, bringst du ihn auf die Form JJJJ-MM-TT, weil der Bau jedes
   Datum prüft. Neben `kapitel` und den Überschriften ist das die einzige
   erlaubte Änderung an einem alten Eintrag; lässt sich der Tag nicht
   eindeutig ablesen, fragst du nach. Einträge mit `art: meilenstein` ohne ID bleiben, wie sie sind: Sie
   gelten als erreichte, vorher nicht geplante Meilensteine, bilden
   Phasengrenzen und stehen unter ihrem Titel auf dem Strahl. `zeit` trägst
   du nicht nach; v1-Einträge eines Tages ordnet der Bau deshalb nach
   Dateinamen, und das meldest du dem Nutzer, wenn an einem Tag mehrere
   Meilensteine liegen.
5. **Auswertungs-Datensätze nur auf Zusage.** Einen Datensatz, der eine
   Auswertung ist, ziehst du nur um, wenn der Nutzer „umziehen“ sagt. Dann
   wird daraus `tagebuch/eintraege/<bezogen_am>-<name>.md` mit
   `art: auswertung`, `datum` gleich `bezogen_am` und dem Rumpf unverändert;
   die bisherigen Kopffelder bleiben im Kopf stehen. `titel` und `wer` nimmst
   du aus dem Datensatz, wo er sie hergibt, sonst fragst du. Der Eintrag gilt
   als v1-Eintrag. Nennt ein anderer Datensatz oder eine Abbildung ihn in
   `basiert_auf`, meldest du das, bevor du ihn verschiebst. Steht in
   `bezogen_am` kein Datum der Form JJJJ-MM-TT, fragst du den Nutzer, statt
   ihn umzuziehen. Ohne Zusage bleibt er in `daten/`. Ist `daten/` nach dem
   Umzug leer, legst du dort eine leere `.gitkeep` an.
6. **Alte Vorlage entfernen.** Lösche `tagebuch/vorlagen/eintrag.md`. Die neuen
   Vorlagen legen `projekt-init` und `regeln-sync` unter `tagebuch/vorlagen/`
   ab.
7. **Prüfen.** Führe im Projektordner aus:

   ```
   python scripts/tagebuch_umstellung_pruefen.py <sicherung>/projekt.md
   ```

   Das Skript schreibt nichts und meldet jeden Satz des alten `projekt.md`, der
   in `projekt.md`, `plan.md` und `kapitel/` nicht mehr wörtlich vorkommt. Es
   muss mit 0 enden. Fehlt ein Satz, ziehst du ihn wörtlich nach und prüfst
   erneut.
8. **Bauen und berichten.** Baue mit `python scripts/tagebuch_bauen.py` und
   behebe Fehler in den Quellen, ohne Werte zu erfinden. Danach berichtest du
   dem Nutzer, was wohin gewandert ist, welche Abschnitte als „Zuordnung
   offen“ markiert sind, welche Datensätze du gefragt hast und welche Texte
   neu geschrieben wurden.

### Lokaler Modus

Dürfen Tagebuch und Testregister nicht auf den Server, liegen sie im lokalen
Modus. Dann ist `tagebuch/` ein eigenes git-Repo, und im Projekt-Repo steht
`/tagebuch/` in `.git/info/exclude`, nicht in der `.gitignore`, damit die
geteilte Datei unberührt bleibt. Die Werkzeuge erkennen den Modus an
`tagebuch/.git`; ein Feld dafür gibt es nicht. Eingerichtet wird er mit
`/baseline:projekt-init` beim Anlegen eines neuen Tagebuchs. Generator,
Vorlagen und `stil.css` liegen weiter im Projekt-Repo unter `scripts/` und
`templates/tagebuch/`, und die anderen im Team sehen sie. Das sagst du dem
Nutzer; will er auch sie lokal halten, nimmt er sie von Hand in
`.git/info/exclude` auf. Commits ins Tagebuch-Repo machst du nach denselben
Regeln wie im Projekt, also nur auf Ansage, mit `git -C tagebuch`. Der
Regelcheck warnt, wenn `tagebuch/.git` existiert, das Projekt-Repo den Ordner
aber nicht ausblendet; git nähme ihn sonst als eingebettetes Repo auf.

**Umzug von einem lokalen Branch.** Liegt das Tagebuch auf einem Branch, der nie
gepusht wird, sieht das Projekt auf jedem anderen Branch aus wie eines ohne
Tagebuch. Ein solches Tagebuch ziehst du in den lokalen Modus um. Jeder
Schritt läuft erst nach Bestätigung des Nutzers:

1. Den Branch mit dem Tagebuch auschecken und dessen Verlauf herausholen:
   `git subtree split --prefix=tagebuch <branch> -b tagebuch-verlauf`. Der
   Befehl verlangt, dass `tagebuch/` im ausgecheckten Stand existiert.
2. Zurück auf den Branch, auf dem das Projekt weiterläuft; dort gibt es kein
   `tagebuch/`. `/tagebuch/` in `.git/info/exclude` eintragen.
3. Das neue Repo anlegen und den Verlauf übernehmen: `git init tagebuch`, dann
   `git -C tagebuch pull .. tagebuch-verlauf`.
4. Mit `git status` prüfen, dass das Projekt-Repo `tagebuch/` nicht mehr sieht,
   und den Hilfsbranch mit `git branch -D tagebuch-verlauf` entfernen.

Den alten Branch löscht nur der Nutzer. Bis dahin wird er weder gepusht noch
in einen anderen Branch gemergt; beides brächte das Tagebuch doch auf das
Remote.

**Ein schon versioniertes Tagebuch lokal machen.** Das geht, aber mit Folgen,
die du dem Nutzer vor dem Umzug nennst: `.git/info/exclude` wirkt erst, wenn
`git rm -r --cached tagebuch` den Ordner aus dem Projekt-Repo genommen hat; was
schon gepusht ist, bleibt im Verlauf des Remotes; und wer den Commit holt,
verliert `tagebuch/` aus seinem Arbeitsstand, weil git die nicht mehr
versionierten Dateien dort entfernt. Erst nach Bestätigung führst du aus:
`git subtree split --prefix=tagebuch -b tagebuch-verlauf`, dann
`git rm -r --cached tagebuch` und der Commit dazu (auf Ansage), `/tagebuch/` in
`.git/info/exclude`, `git init tagebuch`, `git -C tagebuch fetch ..
tagebuch-verlauf` und `git -C tagebuch reset FETCH_HEAD`. Der letzte Befehl
setzt nur den Verlauf und lässt die Dateien im Ordner, wie sie sind. Danach
entfernst du den Hilfsbranch wie oben. Bei einem vorhandenen Tagebuch stellt
`/baseline:projekt-init` die Frage nach dem lokalen Modus nicht; ein Wechsel
läuft immer über diesen Umzug.

### Aussehen nur über eigen.css

`stil.css` gehört der Baseline. Die Vorlage unter `templates/tagebuch/` ersetzt
jeder `/baseline:regeln-sync`, die Kopie in `tagebuch/website/` jeder Bau; was
dort steht, ist danach weg. Anpassungen gehören nach
`tagebuch/eigen.css`. Der Bau lädt sie nach `stil.css`, sie gewinnt also; für
die meisten Fälle genügt es, die Farbvariablen auf `:root` zu überschreiben.
Nach einer Änderung neu bauen.

### Was nicht hineingehört

Keine Codezeilen, keine einzelnen Werkzeugaufrufe, keine Sitzungsprotokolle.
Ersichtlich sein muss dagegen, wie der Workflow beziehungsweise die Pipeline
gemacht wurde; das steht in Kapitel 3.
<!-- baseline:tagebuch ende -->

<!-- baseline:testregister v1.0 anfang -->
## Testregister

Dieses Projekt führt ein Testregister unter `tagebuch/tests/`. Es gehört zum
Tagebuch: `python scripts/tagebuch_bauen.py` prüft seine Quellen mit und baut
daraus die Seiten „Tests“ und „Durchgänge“. Die Quellen schreibt der Agent, der
am Projekt arbeitet, nach dieser Regel; mit „du“ ist er gemeint. Für alles
Übrige gilt die Regel des Tagebuchs, auch für den lokalen Modus.

Die Vorlagen liegen unter `tagebuch/vorlagen/`: `bereiche.md`, `testfall.md`,
`testlauf.md` und `durchgang.md`. Wie im Tagebuch ersetzt du jeden Platzhalter
`<…>` und löschst ein optionales Feld, zu dem nichts bekannt ist, samt Zeile;
ein stehen gebliebener Platzhalter bricht den Bau ab. `testfall.md` kopierst du
für jeden neuen Testfall. Läufe und Durchgänge legen die Werkzeuge an;
`testlauf.md` und `durchgang.md` zeigen, was darin steht, und werden nicht von
Hand kopiert. Ein vollständiges Beispiel liegt in der Baseline unter
`templates/tagebuch/beispiel/tests/`.

### Wozu das Register da ist

Das Register hält fest, was getestet wurde: welcher Testfall, mit welchen
Werten, auf welchem Commit, von wem und mit welchem Ergebnis. Vor einem
Deployment oder nach einem Merge fasst ein Durchgang die fälligen Testfälle
zusammen und gibt den Code-Stand frei oder sperrt ihn.

Der Ausgangspunkt ist die Änderung, nicht der Katalog. Wer an den Modulen
gearbeitet hat, will vor dem Deployment die Testfälle der Module sehen und
nicht prüfen, ob sich ein Benutzer anlegen lässt. Daneben gibt es Testfälle
ohne vorausgehende Änderung: Der Nutzer nimmt sich mit dir einen Bereich vor,
für den es noch keine gibt, und ihr legt sie gezielt an.

Drei Ansprüche gelten für jeden Testfall und jeden Lauf:

1. **Nachspielbar ohne Vorwissen.** Ein Tester, der das Projekt nicht kennt,
   führt jeden manuellen Testfall von Hand aus. Er weiss, wo er klickt, was er
   eingibt, worauf er achtet und welcher Wert erscheinen muss.
2. **Grenzfälle ausdrücklich.** NULL, 0, negative Werte, leere Mengen und
   ähnliche Spezialfälle sind eigene Testfälle, klar gekennzeichnet. Was
   bewusst nicht geprüft wird, steht mit Grund da.
3. **Eindeutiges Ergebnis.** Bei einem messbaren Kriterium steht im Lauf, ob
   es erfüllt ist. Lässt sich ein Lauf nicht eindeutig beurteilen, steht da,
   was unklar ist und was zur Klärung fehlt; dann entscheidet ein Mensch.

Massstab für den Detailgrad ist nicht „Seite Module geprüft“, sondern: „Kurs
3285 in einer Transaktion auf Kurstyp 5 setzen, `calculate_kurswerte(3285)`
aufrufen. Erwartet: Budget bleibt 3'675.00 CHF, verplantes Budget wird aus den
Stunden berechnet (3'695.00 CHF). Danach ROLLBACK.“

### Ablage

```
tagebuch/tests/
  bereiche.md
  faelle/TF-MOD-012.md
  laeufe/2026-10-22-1540-TF-MOD-012.md
  durchgaenge/D-014.md
  belege/2026-10-22-1540-TF-MOD-012-1.png
```

`faelle/`, `laeufe/`, `durchgaenge/` und `belege/` tragen je eine leere
`.gitkeep`, damit git sie auch leer mitführt.

### Ablauf bei jedem Test

Jeder Test, den du ausführst, wird erfasst. Gemeint ist jede Prüfung eines
Verhaltens, in der Oberfläche, an der Datenbank oder an einer API, auch ein
kurzer Blick, ob ein Wert stimmt. Die Testsuite des Projekts (pytest, npm test)
erfasst du nicht Test für Test; verweist ein Testfall mit `skript` auf einen
automatischen Test, ist dessen Ausführung ein Lauf. Ohne Lauf sieht später
niemand, dass getestet wurde. Der Regelcheck meldet den neuesten Eintrag der
Art `fortschritt` seit `eingerichtet`, auf den kein Lauf verweist, als
„Arbeitsschritt ohne Testlauf“; ältere Einträge ohne Lauf meldet er nicht.

1. **Testfall suchen.** Fehlt er, legst du ihn zuerst an, samt Grenzfällen
   (Abschnitt „Testfälle“), dann erst den Lauf.
2. **Testen.** Daten verändernde Tests laufen in einer Transaktion mit
   ROLLBACK oder setzen den Ausgangswert nachweislich zurück; das Ergebnis des
   Laufs nennt, woran sich das zeigte.
3. **Lauf eintragen** mit `testregister_lauf.py` (Abschnitt „Läufe“), mit
   `--eintrag` auf den Tagebucheintrag des Arbeitsschritts.
4. **Humanizer.** Die Abschnitte „Worum es geht“, „Bestanden, wenn“ und
   „Fehlgeschlagen, wenn“ neuer Testfälle prüfst du wie im Abschnitt
   „Humanizer“ der Tagebuchregel, in Claude Code mit `/baseline:humanizer`.
   Läufe gehen nicht durch den Humanizer; dort zählen die Werte.
5. **Bauen** mit `python scripts/tagebuch_bauen.py`. Der Bau bricht bei einem
   Fehler in den Quellen mit Datei und Feld ab; du behebst ihn in der Quelle,
   nie mit einem erfundenen Wert.

**Tests des Nutzers.** Meldet der Nutzer einen Test, erfasst du ihn im selben
Format mit `--ausfuehrung mensch` und seinem Namen in `--wer`. Was er nicht
gesagt hat, etwa welche Werte er sah oder auf welchem Stand er testete, fragst
du nach, statt es einzusetzen. Das Werkzeug nimmt den Stand aus dem
ausgecheckten Commit. Hat der Nutzer einen anderen Stand getestet, checkst du
diesen vorher aus. Geht das nicht, erfasst du den Lauf als `unklar` und
schreibst in `--unklar-was`, dass der getestete Stand nicht der ausgecheckte
ist, und in `--unklar-fehlt`, welcher Commit es war.

### Bereiche

`bereiche.md` listet die Bereiche des Projekts, benannt aus Sicht der
Anwendung, etwa „Module“ oder „Onboarding“. Der Kopf trägt `eingerichtet`, den
Tag, an dem das Register eingerichtet oder nachgerüstet wurde. Die Tabelle
unter `## Bereiche` hat genau die Spalten `| ID | Bereich | Pfade |`. Die ID
besteht aus 2 bis 6 Zeichen aus A-Z und 0-9 und steckt in jeder Testfall-ID
des Bereichs. `Pfade` ist optional: eine Komma-Liste von Glob-Mustern relativ
zur Projektwurzel, mit `/` geschrieben, etwa
`app/module/**, db/trigger/kurswerte*.sql`. Über die Pfade ergibt sich, welche
Bereiche eine Änderung berührt.

Ein neues Projekt beginnt mit leerer Tabelle; mit dem ersten Code kommt der
erste Bereich. In einem bestehenden Projekt schlägst du eine erste Liste aus
Ordnerstruktur und Oberfläche vor, und der Nutzer bestätigt sie. Berührt eine
Änderung Dateien, die in keinen Bereich fallen, schlägst du einen neuen Bereich
oder ein weiteres Muster vor. Dateien ohne Bereich kosten viel: Jede Änderung
an ihnen entwertet alle Läufe davor (Abschnitt „Freigabe“). Eine Bereichs-ID
änderst du nicht mehr, sobald Testfälle an ihr hängen.

### Testfälle

Jeder Testfall ist eine Datei `faelle/<ID>.md` aus der Vorlage `testfall.md`.
Die ID hat die Form `TF-<BEREICH>-<NNN>` mit der nächsten freien dreistelligen
Nummer im Bereich, etwa `TF-MOD-012`, und wird nach der Vergabe nie geändert.
Ein Testfall, der nicht mehr gilt, bekommt `status: stillgelegt` und bleibt
wegen seiner Läufe stehen; gelöscht wird er nicht.

Pflicht im Kopf sind `id`, `titel` (ein Satz, der sagt, was gelten muss),
`art` (`manuell`, `automatisch` oder `beides`), `regression`, `prioritaet`,
`herkunft` (`aenderung` oder `nachtrag`), `angelegt` und `veraendert_daten`.
Bei `art: automatisch` oder `beides` nennt `skript` den automatischen Test, bei
`herkunft: aenderung` nennt `aenderung` Commit, Branch oder Merge Request.
`regression: ja` heisst, dass der Testfall auch ohne Änderung in seinem Bereich
fällig wird, sobald er nie bestanden hat oder sein letzter bestandener Lauf
älter als 30 Tage ist.

Im Rumpf stehen die Abschnitte in der Reihenfolge der Vorlage:

- `## Worum es geht`, `## Bestanden, wenn` und `## Fehlgeschlagen, wenn` in
  Alltagssprache, die Kriterien mit konkreten Werten. Lässt sich kein
  messbares Kriterium angeben, etwa bei Verständlichkeit oder fachlicher
  Plausibilität, steht dort, woran ein Mensch es beurteilt.
- `## Vorbedingungen` als Tabelle `| Was | Wert |` mit den Zeilen Anwendung
  (Instanz, Stand ab Commit), Datenstand, Angemeldet als (Benutzer, Rolle) und
  Ausgangslage prüfen; was für den Testfall keine Rolle spielt, entfällt.
- `## Testdaten` mit den Werten, mit denen gearbeitet wird.
- `## Schritte` bei `manuell` und `beides`: Tabelle
  `| # | Wo | Tun | Eingabe | Worauf achten |`, fortlaufend ab 1. `Wo` nennt
  Menü, Seite, Maske oder Feld so, wie sie in der Oberfläche heissen;
  `Worauf achten` den sichtbaren Zustand mit Werten. Ein Playwright-Skript
  spielt genau diese Schritte nach.
- `## Zurücksetzen` bei `veraendert_daten: ja`: wie der Ausgangszustand
  zurückkommt und woran man sieht, dass es geklappt hat.
- `## Technische Prüfung` bei `automatisch` ohne Schritte, sonst nach Bedarf:
  die Prüfung an Datenbank oder API mit erwarteter Ausgabe, für dich und das
  Skript, nicht für den Tester.
- `## Nicht abgedeckte Grenzfälle` bei jedem normalen Testfall.

**Grenzfälle mitdenken.** Zu jedem neuen normalen Testfall gehst du NULL, 0,
negative Werte, leere Mengen, Maximalwerte und fehlende Rechte durch. Für jeden
Grenzfall legst du einen eigenen Testfall an, dessen `grenzfall_von` auf den
normalen Testfall im selben Bereich zeigt, oder du trägst ihn unter „Nicht
abgedeckte Grenzfälle“ mit Grund ein. „Keine“ steht dort nur, wenn alle
denkbaren Grenzfälle eigene Testfälle haben. Ein Grenzfall ist ein
vollständiger Testfall: Seine Schritte stehen ganz da, nicht als Verweis auf
den normalen Testfall, weil der Tester ohne Vorwissen auskommen muss.

### Läufe

Jede Durchführung eines Testfalls ist ein Lauf, eine Datei unter `laeufe/`.
Läufe schreibst du nur mit dem Werkzeug, nie von Hand:

```
python scripts/testregister_lauf.py --testfall TF-MOD-012 --status bestanden --wer "Claude Code" --ausfuehrung agent --ergebnis "Budget 3'675.00 CHF, verplant 3'695.00 CHF, nach ROLLBACK wieder Kurstyp 3"
```

| Schalter | Bedeutung |
|---|---|
| `--testfall` | ID des Testfalls; gibt es ihn nicht, bricht das Werkzeug ab |
| `--status` | `bestanden`, `fehlgeschlagen`, `unklar`, `blockiert` oder `uebersprungen` |
| `--wer` | Name des Menschen, des Agenten wie `Claude Code`, oder `Skript` |
| `--ausfuehrung` | `mensch`, `agent` oder `skript` |
| `--ergebnis` | was beobachtet wurde, mit Zahlen |
| `--durchgang` | ID des Durchgangs, zu dem der Lauf gehört |
| `--screenshot` | ein Beleg, mehrfach möglich; bei `fehlgeschlagen` mindestens einer |
| `--unklar-was`, `--unklar-fehlt` | bei `unklar` beide Pflicht |
| `--grund` | bei `blockiert` und `uebersprungen` Pflicht |
| `--fehler` | Kennung oder URL des Fehlers |
| `--eintrag` | Dateiname des Tagebucheintrags dieses Arbeitsschritts |
| `--datenstand`, `--browser` | womit geprüft wurde |
| `--projekt` | Projektwurzel, ohne Angabe der aktuelle Ordner |

Das Werkzeug liest Commit und Branch aus git, prüft Testfall, Durchgang und
Eintrag und kopiert jeden Beleg nach `tagebuch/tests/belege/`, benannt nach dem
Lauf mit fortlaufender Nummer. Ein Beleg muss kein Bild sein: Die Ausgabe einer
Abfrage speicherst du als `.txt` und gibst sie ebenso mit `--screenshot` mit.
Endet das Werkzeug mit Exit-Code 2, ist nichts geschrieben, und die Meldung
sagt, was fehlt.

Ein geschriebener Lauf wird nicht mehr geändert; eine Korrektur ist ein neuer
Lauf. Mehrere Läufe desselben Testfalls in derselben Minute bekommen `-2`,
`-3` und so weiter am Dateinamen; das macht das Werkzeug selbst. Den Stand
nimmt es aus dem ausgecheckten Commit, du erfasst einen Lauf also, solange der
geprüfte Stand ausgecheckt ist. Liegen ausserhalb von `tagebuch/` nicht
committete Änderungen, schreibt es `sauber: nein` in den Kopf, und der Lauf
zählt für keine Freigabe. Für einen Durchgang muss der Stand deshalb committet
sein, bevor getestet wird; committet wird nach den Regeln des Projekts, also
auf Ansage.

Playwright-Skripte in Python tragen ihre Läufe über die Funktion
`lauf_schreiben` ein, die dieselben Angaben nimmt und Playwright nicht braucht:

```python
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, "scripts")
from testregister_lauf import lauf_schreiben

# Screenshot ausserhalb des Projekts, etwa mit page.screenshot(path=bildpfad)
bildpfad = Path(tempfile.gettempdir()) / "TF-MOD-012.png"
lauf_schreiben(Path("."), "TF-MOD-012", "fehlgeschlagen", "Skript", "skript",
               "Budget zeigt 0.00 CHF statt 3'675.00 CHF",
               durchgang="D-014", screenshots=[bildpfad])
```

Den Screenshot legt das Skript ausserhalb des Projekts ab, etwa im Temp-Ordner,
oder unter `tagebuch/`. Eine neue Datei anderswo im Projekt gälte als nicht
committete Änderung.

**Welcher Status.** `bestanden` setzt du, wenn das Kriterium unter „Bestanden,
wenn“ erfüllt ist, `fehlgeschlagen`, wenn nicht; dazu gehört mindestens ein
Beleg. `unklar` setzt du, wenn das Kriterium nicht messbar ist oder die
Beobachtung mehrdeutig, und nennst, was unklar ist und was zur Klärung fehlt.
Für einen Testfall, dessen Kriterium ein menschliches Urteil verlangt, setzt du
nie selbst `bestanden`. Geklärt wird `unklar` durch einen Menschen; sein Urteil
trägst du als neuen Lauf mit `--ausfuehrung mensch` und seinem Namen ein.
`blockiert` heisst, dass der Test nicht laufen konnte, weil etwas fehlte, etwa
ein Zugang, ein Gerät oder Daten; `uebersprungen`, dass er bewusst nicht lief.
Beide brauchen einen Grund. In den Quellen steht `uebersprungen` ohne Umlaut,
auf den Seiten und in den Meldungen der Werkzeuge „übersprungen“.

### Durchgänge

Vor einem Deployment und nach einem Merge legst du einen Durchgang an:

```
python scripts/testregister_durchgang.py --anlass "vor Deployment 22.10.2026"
```

Das Werkzeug schreibt `durchgaenge/D-<NNN>.md` mit der nächsten Nummer, dem
aktuellen Commit und in `basis` dem Commit des neuesten freigegebenen
Durchgangs, beim ersten Durchgang `keine`. Unter `## Fällig` trägt es ein:

1. jeden nicht stillgelegten Testfall eines Bereichs, in dem sich zwischen
   `basis` und Commit eine Datei geändert hat (`Bereich geändert`);
2. jeden Regressionstestfall, der nie bestanden hat oder zuletzt vor mehr als
   30 Tagen (`Regression lange nicht gelaufen`), ohne Basis also alle;
3. was du mit `--bereich MOD` oder `--testfall TF-ONB-003` nennst, etwa einen
   Bereich ohne Pfade, den du geändert hast (`von Hand aufgenommen`). Beide
   Schalter lassen sich wiederholen.

Änderungen nur unter `tagebuch/` zählen dabei nie. Deshalb ordnest du
geänderte Dateien zuerst in `bereiche.md` einem Bereich zu und legst erst dann
den Durchgang an. Die Tabelle „Fällig“ steht mit dem Anlegen fest, und eine
spätere Änderung an `bereiche.md` liegt unter `tagebuch/` und macht keinen
Testfall fällig. Nennt das Werkzeug am Ende trotzdem geänderte Dateien ohne
Bereich, nimmst du die Testfälle, die sie betreffen, mit dem Grund
`von Hand aufgenommen` unter „Fällig“ auf. Ordnest du die Dateien nachträglich
einem Bereich zu, gilt dasselbe für alle Testfälle dieses Bereichs, oder du
legst einen neuen Durchgang mit `--bereich <ID>` an. Das Zuordnen allein macht
nie eine Freigabe gültig: Ohne die zusätzlichen Zeilen gälte der Durchgang als
freigegeben, obwohl niemand die Änderung geprüft hat. Zeilen unter „Fällig“
darfst du ergänzen, aber nie streichen.
`--datenstand` hält fest, mit welchem Datenstand geprüft wird, `--projekt`
nennt die Projektwurzel. Exit-Code 2 heisst, dass nichts angelegt wurde.

Dann führst du jeden fälligen Testfall aus und trägst den Lauf mit
`--durchgang D-<NNN>` ein. Schlägt einer fehl, wird der Fehler behoben, und ein
neuer Lauf im selben Durchgang ersetzt den alten für die Freigabe; der alte
bleibt stehen. Nach einem Fix laufen die Testfälle aller Bereiche, die der Fix
berührt, im selben Durchgang nochmal. Berührt er Dateien ohne Bereich, laufen
alle fälligen Testfälle nochmal.

### Freigabe

Ob ein Durchgang freigibt, wird nie erfasst, sondern abgeleitet. Für jeden
fälligen Testfall zählt sein neuester Lauf in diesem Durchgang. Freigegeben ist
der Durchgang, wenn dieser Lauf für jede Zeile `bestanden` ist oder `blockiert`
beziehungsweise `uebersprungen` mit einer Zeile unter `## Freigaben`, und wenn
er für den geprüften Stand noch gilt. Fehlt ein Lauf, ist er `fehlgeschlagen`
oder `unklar`, ist der Durchgang gesperrt.

Eine Freigabe gilt nur für den geprüften Code-Stand, das heisst für alle
Dateien ausserhalb von `tagebuch/`. Ein Lauf zählt nicht mehr, sobald nach
seinem Commit eine Datei seines Bereichs geändert wurde oder eine Datei, die zu
keinem Bereich gehört. Änderungen nur unter `tagebuch/` heben keine Freigabe
auf.

**Freigaben für blockierte oder übersprungene Testfälle** gibt nur ein Mensch,
mit Namen und Begründung, in der Tabelle `| Testfall | wer | Begründung |`
unter `## Freigaben`. Du trägst eine solche Zeile nur auf ausdrückliche
Anweisung des Nutzers ein, mit seinem Namen und seiner Begründung; in `wer`
steht nie ein Agent. Eine Freigabe für einen Testfall, dessen massgeblicher
Lauf weder blockiert noch übersprungen ist, bricht den Bau ab.

Ob der aktuelle Code ausgeliefert werden darf, sagt allein dieses Werkzeug:

```
python scripts/testregister_freigabe.py
```

Es prüft den neuesten Durchgang gegen `HEAD`, mit `--id D-014` einen
bestimmten Durchgang und mit `--commit <commit>` einen anderen Stand;
`--projekt` nennt die Projektwurzel. Es schreibt nichts und endet mit Exit-Code
0, wenn freigegeben, mit 1, wenn gesperrt oder kein Durchgang vorhanden ist,
und mit 2 bei einem Fehler in den Quellen, einer unbekannten Durchgangs-ID
oder einem unbekannten Commit. Projekte bauen den Aufruf in ihr
Deploy-Skript oder ihre CI ein. Für jeden Testfall, der die Freigabe
verhindert, nennt es den Grund: kein Lauf, den Status, „Lauf auf nicht
committetem Stand“, „Bereich seit dem Lauf geändert“ oder „Commit nicht mehr im
Repo“. Gesperrt ist ausserdem:

- gegen `HEAD` jeder Stand mit nicht committeten Änderungen ausserhalb von
  `tagebuch/`;
- ein Durchgang, nach dem ein Bereich geändert wurde, dessen Testfälle dort
  nicht alle fällig waren; dann legst du einen neuen Durchgang an;
- ein Durchgang, in dem ein seit seiner Basis geänderter Bereich nicht mit
  allen Testfällen unter „Fällig“ steht. Gemessen wird mit der aktuellen
  `bereiche.md`;
- ein Durchgang ohne fällige Testfälle, wenn seit seiner Basis Dateien ohne
  Bereich geändert wurden. Dann nimmst du die betroffenen Testfälle von Hand
  unter „Fällig“ auf. Oder du ordnest die Dateien einem Bereich zu und legst
  einen neuen Durchgang an. Der gibt nur frei, wenn sein „Fällig“ alle
  Testfälle dieses Bereichs enthält; das Werkzeug trägt sie ein und prüft es.
  Der alte Durchgang bleibt gesperrt.

Die letzten beiden Sperren gelten auch für die Seite und den Regelcheck. Ein
so gesperrter Durchgang wird nie zur Basis eines neuen, damit ein späterer
Durchgang ungeprüften Code nicht freigibt.

Mit `--warnungen` gibt es stattdessen die Hinweise für den Regelcheck aus, eine
Zeile je Warnung, und endet mit 0, bei einem Fehler in den Quellen mit 2; den
Aufruf macht der Regelcheck selbst.

Die Seite „Durchgänge“ bewertet jeden Durchgang auf seinem eigenen Stand, dem
Commit seines neuesten Laufs, und zeigt deshalb dasselbe, egal was gerade
ausgecheckt ist. Dort steht „freigegeben auf“ mit diesem Commit: Freigegeben
ist sein Stand, nicht der ausgecheckte. Ob der Code jetzt ausgeliefert werden
darf, beantwortet nur `testregister_freigabe.py`.

**Kein Merge und kein Deployment ohne freigegebenen Durchgang.** Du schlägst
beides nicht vor und führst es nicht aus, solange
`python scripts/testregister_freigabe.py` nicht mit 0 endet.

### Lokaler Modus

Das Register liegt unter `tagebuch/` und teilt deshalb den Modus des
Tagebuchs. Ist `tagebuch/` ein eigenes git-Repo, bleiben Testfälle, Läufe und
Belege mit dem Tagebuch lokal, und Commits dort machst du nur auf Ansage. Wie
der lokale Modus eingerichtet wird und wie ein Tagebuch dorthin umzieht,
steht im Abschnitt „Lokaler Modus“ der Tagebuchregel.
<!-- baseline:testregister ende -->
