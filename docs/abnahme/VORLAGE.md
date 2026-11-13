# Prüfprotokoll <ID> – <Titel des Tasks>

<!--
Vorlage für docs/abnahme/<ID>.md. Anleitung: docs/abnahme/PRUEFER_ANLEITUNG.md.
Jeden Platzhalter <…> ersetzen. Abschnitte, die für den Task nicht gelten, nicht
löschen, sondern mit einem Satz begründen („entfällt, weil …“). Diesen Kommentar
löschen. Beispiel eines fertigen Protokolls: docs/abnahme/P0.2.md.
-->

| Feld | Wert |
|---|---|
| Task | <ID> <Titel> (Dart `<Dart-ID, falls bekannt>`) |
| Branch | `<task/ID-kurzname>`, PR #<Nummer> gegen `neuaufbau` |
| Geprüfter Stand | `<kurzer SHA von HEAD>` (Basis `<SHA von git merge-base origin/neuaufbau HEAD>`, `origin/neuaufbau` steht auf `<SHA>`) |
| Prüfer | <Name des Agenten> als unabhängiger Prüfer, eigener Worktree, ohne Kenntnis des Umsetzerberichts |
| Iteration | <1, 2 oder 3; ab 2: Protokoll der Vorgänger-Iteration> |
| Datum | <TT.MM.JJJJ> |
| Umgebung | <Windows-Version>, Node <v…>, npm <…>, Python <…>, Playwright <…> |

Vorbereitung: <Zeilenenden geprüft (Zahl der `w/crlf`-Dateien vorher und nachher), `core.hooksPath`, `npm ci` mit Exit-Code.>

## Urteil: <ABGENOMMEN oder ABGELEHNT>

<Ein bis zwei Sätze. Bei ABGELEHNT: jeder Mangel als nummerierte Zeile mit Kriterium, Beobachtung und Beleg, damit der Umsetzer ihn ohne Rückfrage beheben kann.>

## Abnahmekriterien

| # | Kriterium (wörtlich aus dem Plan) | erfüllt | Kernbeleg |
|---|---|---|---|
| 1 | <Kriterium 1> | <ja/nein> | <Befehl mit Exit-Code, Testname oder Bild> |

### 1. <Kurzname von Kriterium 1>

<Was du getan hast, mit Befehlen, Exit-Codes und gekürzter Ausgabe. Was du gesehen hast. Warum das das Kriterium belegt oder nicht.>

## Gates

Jeder Befehl einzeln, Exit-Code einzeln gelesen (<PowerShell `$LASTEXITCODE` oder Git Bash `${PIPESTATUS[0]}` hinter `tee`>), Logs unter `<scratchpad>/<ID>-pruefer/`:

| Befehl | Exit | gekürzte Ausgabe |
|---|---|---|
| `npm test -- --run` | <0> | <Test Files … passed, Tests … passed> |
| `npm run typecheck` | | |
| `npm run build` | | |
| `npm run check:test-lines` | | |
| `npm run check:css-asserts` | | |
| `npm run check:regeln` | | |
| `npx eslint .` | | |
| `python scripts/regelcheck.py` | | |
| `npm run test:layout` | | <nur bei Oberflächen-Tasks oder Änderungen an Playwright; sonst „entfällt, weil …“> |

Ports vor `test:layout`: <Ausgabe der Portprüfung (nur `LISTENING`/`ABHÖREN` zählt, `TIME_WAIT`/`WARTEND` nicht); wann frei>.

## Erster Commit

`git log --oneline --reverse origin/neuaufbau..HEAD`:

```
<Ausgabe>
```

<Welcher Commit der erste des Tasks ist, welche Dateien er enthält (`git show --stat`), dass es nur Tests sind, und die Ausgabe der Tests auf diesem Commit (rot, mit Grund).>

## Diff gegen das Feld „Dateien“

`git diff --stat origin/neuaufbau...HEAD`:

```
<Ausgabe>
```

| Datei | im Feld | Urteil |
|---|---|---|
| `<Pfad>` | <ja/nein> | <bei nein: Begründung aus dem PR, und ob sie trägt> |

<U10 (`package.json`), U11, U13 und Dateiköpfe nach U9 geprüft: Ergebnis.>

## Gegenprobe

<Welche Regel im Code du umgekehrt hast (Datei, Zeile, alt → neu), welcher Test danach rot war (Befehl, Exit-Code, Meldung), und dass der Code danach wiederhergestellt ist (`git status` leer).>

## Browserprüfung

<Welcher Build auf welchem Port, welche Adresse. Engine- und KI-Tasks: Entwicklertisch, Szenario, geklickte Schritte, abgelesenes Ergebnis.>

### Desktop 1280×900 – `bilder/<ID>-<was>-desktop.png`

<Beschreibung dessen, was auf dem Bild zu sehen ist: Aufbau, Texte und Zahlen, ob etwas abgeschnitten, verdeckt oder unlesbar ist, ob die Werte plausibel sind. Konsolenfehler.>

### Tablet quer 1024×768, Touch – `bilder/<ID>-<was>-tablet-quer.png`

<Beschreibung, dazu was mit Touch bedient wurde und was geschah.>

### Tablet hochkant 768×1024, Touch – `bilder/<ID>-<was>-tablet-hochkant.png`

<Beschreibung, dazu was mit Touch bedient wurde und was geschah.>

### Handy hochkant 390×844, Touch – `bilder/<ID>-<was>-handy-hochkant.png`

<Beschreibung, dazu was mit Touch bedient wurde und was geschah.>

### Handy quer 844×390, Touch – `bilder/<ID>-<was>-handy-quer.png`

<Beschreibung, dazu was mit Touch bedient wurde und was geschah. Was liegt unter dem Bildrand?>

Waagrechtes Scrollen je Klasse: <`scrollWidth` und `clientWidth` von `document.documentElement`; `scrollWidth > clientWidth` oder ein abgeschnittener Text ist ein Mangel>.

Server danach beendet: <PID und Befehlszeile der eigenen Server, Portprüfung ohne `LISTENING`/`ABHÖREN` auf 4173/4174>.

## Satz-für-Satz-Abdeckung

<Nur Engine-Tasks (Plan Abschnitt 5), sonst „entfällt, weil kein Engine-Task“.>

| Spec-Abschnitt | Regelaussage | Test (Datei › Name) |
|---|---|---|
| <A5> | <eine Aussage der Website> | <Test oder „fehlt“> |

## Eigene Grenzfälle

<Mindestens zwei, die nicht in den Kriterien stehen. Je: was, warum, wie geprüft, Ergebnis.>

1. **<Grenzfall>.** <…>
2. **<Grenzfall>.** <…>

## Testregister

<Bereich in `tagebuch/tests/bereiche.md` (neu oder bestehend, mit Grund). Tabelle der Testfälle und Läufe.>

| Testfall | Inhalt | Lauf | Status |
|---|---|---|---|
| <TF-…> | <…> | `<Dateiname des Laufs ohne .md>` | <bestanden/…> |

## Hinweise (kein Mangel)

<Beobachtungen ohne Einfluss auf das Urteil, auch ausserhalb des Auftrags. Sonst „keine“.>
