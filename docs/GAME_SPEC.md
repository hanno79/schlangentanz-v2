# Schlangentanz Game Spec

Status: **Gesperrt am 03.08.2026.**

Implementierte Regeln und offene Regelfragen werden pro R-Slice dokumentiert und verifiziert. Nicht bestätigte Regeln bleiben ausdrücklich offen und werden nicht geraten.

### Was „gesperrt" bedeutet

`CLAUDE.md` Schritt 1 verlangt die Sperre **vor** der Spielimplementierung. Sie
kam zu spät — die Umsetzung war längst fertig, und die Spec trug die Zeile „noch
nicht final gesperrt" bis zu diesem Datum. Nachgeholt wurde sie erst, als der
Abgleich mit der Normquelle abgeschlossen war; eine Spec zu sperren, deren
Abweichungen niemand kennt, wäre eine Unterschrift auf ein ungelesenes Dokument.

Ab jetzt gilt:

- **Jede Regeländerung braucht eine bestätigte Normquelle oder einen
  User-Signoff.** Ein Code-Fix allein reicht nie — auch dann nicht, wenn die
  Engine offensichtlich etwas anderes tut als dieses Dokument.
- **Widersprüche zwischen Spec und Code sind Spec-Fragen**, nicht Bugs. Sie
  werden in Abschnitt 11 aufgenommen, bevor jemand Code anfasst.
- **Änderungen werden mit `ÄNDERUNG [Datum]` und Begründung geführt**, nicht
  still eingearbeitet.
- **Offene Regelfragen stehen vollständig in Abschnitt 11.** Steht dort nichts,
  ist nichts offen — die frühere Formulierung „weitere offene Regelfragen
  betreffen andere Bereiche", die keine einzige benannte, gilt als überholt.

Normquelle ist `https://schlangentanz.ch/rules`. Wo diese Seite und die Spec
auseinandergehen, steht die Abweichung ausdrücklich im jeweiligen R-Abschnitt.

## 1. Overview

- Schlangentanz v2 ist ein frischer digitaler Greenfield-Rebuild des Brettspiels Schlangentanz.
- Zielplattform ist eine browserbasierte Web-App.
- Produktionsbereitstellung erfolgt über Vercel.
- Workflow: Hermes orchestriert Umsetzung und Verifikation; Claude Code implementiert kleine getestete Slices; Codex reviewt adversarial.
- Einzelspieler-Spiel gegen KI-Gegner.
- Der menschliche Spieler wählt zu Spielstart 1, 2 oder 3 KI-Gegner.
- Es gibt keine Zeitbegrenzung; die Partie endet regelbasiert, wenn der Nachziehstapel leer wird und die anschließende Endrunde abgeschlossen ist.

## 2. Entities

Die zentralen Spielobjekte sind im aktuellen Projektstand konkretisiert und werden in den folgenden Abschnitten weiter präzisiert: Spieler, Handkarten, Nachziehstapel, Ablagestapel, Farbkarten, Sonderkarten, Aufgaben, Schlangen, Schlangen-Zustände, Zugphasen, legale Aktionen und Wertung.

Noch offene Regelfragen bleiben in den jeweiligen R-Abschnitten markiert; sie sind keine Implementierungsfreigabe.

### R4.1 Farbkarten-Übersicht

- Insgesamt 78 Farbkarten in 6 Farben.
- Blau: 15 Karten, 1 Punkt pro Karte.
- Rot: 15 Karten, 1 Punkt pro Karte.
- Gelb: 15 Karten, 1 Punkt pro Karte.
- Violett: 12 Karten, 2 Punkte pro Karte.
- Braun: 12 Karten, 2 Punkte pro Karte.
- Grün: 9 Karten, 3 Punkte pro Karte.
- Häufige Farben: 45 Karten (3 x 15), je 1 Punkt.
- Mittlere Farben: 24 Karten (2 x 12), je 2 Punkte.
- Seltene Farben: 9 Karten (1 x 9), je 3 Punkte.
- Farben müssen eindeutig unterscheidbar und barrierefrei darstellbar sein.

### R4.2/R4.4 Wertung und Spielmechanik

- Punkte zählen nur in gültigen Farbgruppen ab 3 Karten.
- Einzelne Karten und 2er-Kombinationen zählen 0 Punkte.
- Jede Karte in einer gültigen Gruppe zählt ihren Punktwert.
- Nach jedem Anlegen muss geprüft werden, ob neue Farbgruppen entstanden sind.
- Sonderkarten unterbrechen Farbgruppen korrekt, außer wenn eine Regel ausdrücklich etwas anderes vorgibt (z. B. Regenbogenschlange als Wildcard mit 0 Punkten).

## 3. Setup

> **Normquelle aktualisiert.** Für Kartenmengen und Aufgabenkarten gilt die geprüfte Korrektur: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler; frühere Dart-Abweichungen werden nur noch als überholte Importquelle behandelt.

### R1.1/R1.2 Kartenstapel vorbereiten

- Alle Karten werden vor Spielbeginn nach Kartentyp sortiert.
- Basis-Spiel: 110 Karten = 78 Farbkarten + 32 Sonderkarten.
- Basis-Sonderkarten: 8 benannte Typen mit je 4 Karten — Farbenschutz, Regenbogenschlange, Schlangenfrass, Schlangenblockade, Farbendieb, Schlangengrube, Farbenfusion, Verdoppler.
- Erweiterung "Schlangenkorb des Glücks": 31 zusätzliche Karten = 4 Schlangenhäutung + 1 Schlangenkorb des Glücks + genau 14 Aufgabenkarten + 4 Comeback-Karten + 8 Risiko-Belohnungs-Karten.
- Gesamtanzahl mit Erweiterung: 141 Karten.
- Aufgabenkarten: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler; maßgeblich ist die vollständige Liste der 14 veröffentlichten Aufgabenkarten mit Name, Punktwert und Bedingung.
- Comeback-Karten: 4 Stück, je 1 pro Spieler.
- Risiko-Belohnungs-Karten: 8 Stück, je 2 pro Spieler.
- Digital: Hauptstapel wird per Fisher-Yates oder gleichwertigem Zufallsalgorithmus gemischt.
- Digitales Spieldeck: Der tatsächlich gemischte Nachziehstapel umfasst die 110 Basiskarten plus die 4 Schlangenhäutung-Karten der Erweiterung (114 Karten). Nur dadurch sind die Schlangenhäutung-Mechanik und die Aufgabe „Schlangentanz" erreichbar. Comeback, Risiko-Belohnung und „Schlangenkorb des Glücks" bleiben vorerst außerhalb des Spieldecks.
- Materialumfang (141 Karten) und digitales Spieldeck (114 Karten) sind also bewusst verschieden. Die 13 Karten `Comeback` (4), `Risiko-Belohnung` (8) und `Schlangenkorb des Glücks` (1) werden im Code weiterhin als Kartendefinitionen erzeugt, gelangen aber nie in eine Partie; ihr einziger Zweck ist die Namensvalidierung beim Deserialisieren von Spielzuständen. Sie sind kein toter Code und auch keine halbfertige Implementierung, sondern dokumentierter Materialumfang ohne Spielwirkung.

#### R1.2a Umfang der digitalen Fassung (ÄNDERUNG 03.08.2026)

Die digitale Fassung ist **kein reines Basisspiel und keine vollständige
Erweiterung**, sondern eine bewusst gewählte Teilmenge. Bis zum 03.08.2026 stand
das nirgends zusammenhängend; man musste es aus R1.1/R1.2, R6 und
`docs/WORKFLOW.md` zusammensuchen. Verbindlich gilt:

| Bestandteil | Herkunft | Digital |
|---|---|---|
| 78 Farbkarten, 32 Basis-Sonderkarten | Basisspiel | **ja** |
| Längste Farbkette (R8.4a) | Basisspiel | **ja** |
| 4 Schlangenhäutung-Karten | Erweiterung | **ja** (Audit-Fix H1) |
| 14 Aufgabenkarten (R6) | Erweiterung | **ja** |
| Vielfaltbonus | Erweiterung | **nein** |
| Comeback, Risiko-Belohnung, Schlangenkorb des Glücks | Erweiterung | **nein** |

Die Normquelle kennzeichnet Vielfaltbonus und Aufgabenkarten im
Wertungsabschnitt ausdrücklich mit dem Etikett „Erweiterung"; die längste
Farbkette trägt es **nicht** und ist deshalb Basisspielregel. Genau daran hängt,
warum R8.4a umgesetzt ist und der Vielfaltbonus nicht.

**Der Vielfaltbonus ist damit auch kein offener Punkt, sondern außerhalb des
Umfangs.** Ihn aufzunehmen wäre eine Erweiterung des Spielumfangs und braucht
einen User-Signoff — keinen Bugfix.

### R1.3 Startkarten verteilen

- Jeder Spieler erhält 5 Startkarten vom Nachziehstapel.
- Verteilung erfolgt reihum (kein Durcheinander).
- Handkarten anderer Spieler dürfen nicht sichtbar sein.
- Handkartenlimit: 5 Karten. (ÄNDERUNG 03.08.2026: zuvor 10 — eine Zahl, die in der Normquelle nirgends vorkommt. Die Anleitung sagt im Zugschritt c): „Wenn du mehr als 5 Karten auf der Hand hast, lege überzählige Karten ab.")
- Mindesthandkarten nach Nachziehen: 5 Karten.

### R1.4 Aufgabenkarten auslegen

- Zu Spielbeginn werden 3 offene Aufgabenkarten neben den Spielbereich gelegt und sind für alle sichtbar.
- Jeder Spieler erhält genau 1 geheime Aufgabenkarte, die verdeckt vor dem Spieler liegt.
- Die Aufgabenkarten werden separat gemischt und nicht mit anderen Karten gemischt.
- Offene und geheime Aufgaben verwenden denselben Aufgabenpool; es gibt laut Website keine getrennten festen 8/7-Namenslisten.
- Offene Aufgaben können von jedem Spieler erfüllt werden; nach Erfüllung werden sie ersetzt, solange der Aufgabenkartenstapel nicht leer ist.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt und geben nur Punkte, wenn sie erfüllt wurden.

## 4. Turn Structure

### R2 Zugstruktur

- R2 Zugstruktur beschreibt den Ablauf eines einzelnen Spielzugs.
- Zugphasen sind verbindlich in dieser Reihenfolge:
  1. Nachziehphase
  2. Ausspielphase
  3. Aufgabenprüfung
  4. Zugabschluss und Spielerwechsel
- Jede Zugphase muss eindeutig beschrieben sein.
- Ausnahmen und Sonderfälle müssen dokumentiert sein.
- Übergänge zwischen Phasen müssen klar sein.

### R2.1 Zugbeginn und Zugreihenfolge

- Der aktive Spieler wird nach Uhrzeigersinn-Reihenfolge ermittelt.
- Reihenfolge: Startspieler, dann im Uhrzeigersinn.
- Nach dem letzten Spieler beginnt wieder der erste Spieler.
- Die Reihenfolge ändert sich nicht während des Spiels.
- Nur der aktive Spieler kann Spielaktionen durchführen.
- Andere Spieler sind während des Zuges blockiert, außer Reaktionskarten erlauben etwas anderes.
- Der aktive Spieler muss visuell erkennbar sein.

### R2.2 Nachziehphase

- Zu Beginn jedes Zuges prüft der aktive Spieler seine Handkartenanzahl.
- Hat er weniger als 5 Karten, muss er nachziehen.
- Nachziehen endet, wenn exakt 5 Handkarten erreicht sind oder der Nachziehstapel leer ist.
- Hat der Spieler bereits 5 oder mehr Karten, wird die Nachziehphase übersprungen.
- Mindest-Handkarten nach Nachziehen: 5 Karten.
- Maximale Handkarten am Zugende: 5 Karten. Das Limit greift im Spielverlauf nie — man zieht auf 5 auf und muss mindestens 1 Karte spielen, hält am Zugende also höchstens 4. Es ist eine Absicherung, kein Alltagsfall.
- Nachziehen ist Pflicht, nicht optional.
- Gezogene Karten sind nur für den Spieler sichtbar.
- Endspurt-Phase wird aktiviert, wenn der Nachziehstapel durch das Nachziehen leer wird.
- Maßgeblich für das Spielende ist nur der Nachziehstapel.
- In der Endspurt-/Endrunde wird nicht mehr nachgezogen, weil der Nachziehstapel leer ist.

### R2.3 Ausspielphase

- Nach dem Nachziehen spielt der aktive Spieler Karten aus seiner Hand.
- Der aktive Spieler muss mindestens 1 Karte spielen.
- Der aktive Spieler darf ohne Verdoppler maximal 2 Karten spielen.
- Grundsätzlich gilt pro Zug: höchstens 1 Farbkarte und höchstens 1 Sonderkarte.
- Wird zu Beginn des Zuges ein Verdoppler gespielt, erhöht sich das Limit für diesen Zug auf höchstens 2 Farbkarten und höchstens 2 Sonderkarten; die zusätzliche Karte darf frei eine Farbkarte oder eine Sonderkarte sein.
- In einem Verdoppler-Zug sind insgesamt höchstens 3 Karten zulässig.
- Zulässig sind ohne Verdoppler: genau 1 Farbkarte, genau 1 Sonderkarte oder 1 Farbkarte plus 1 Sonderkarte.
- Zulässig sind mit aktivem Verdoppler: zwei Farbkarten, zwei Sonderkarten oder gemischte Kombinationen bis insgesamt 3 Karten.
- Die Reihenfolge ausgespielter Karten ist frei wählbar.
- Jede Karte wird einzeln ausgeführt und deren Effekt abgehandelt.
- Farbkarten können an eigene Schlangen angelegt oder zum Starten neuer Schlangen genutzt werden.
- Sonderkarten führen ihren Kartentext aus.
- Sonderkarten zählen für das 2-Karten-Limit; Kartentexte können später ausdrücklich zusätzliche Sonderregeln definieren.
- Farbenschutz kann als eigene Karte auf eine eigene aktive Schlange gespielt werden und deren Zustand auf `geschuetzt` setzen.
- Farbenschutz kann außerdem als einmalige Reaktion des betroffenen Zielspielers gegen gegnerische Angriffe eingesetzt werden: Die angesagte gegnerische Sonderkarte wird wirkungslos, die Angriffskarte und der Farbenschutz kommen auf den Ablagestapel, und der Angreifer darf denselben Angriff nicht auf ein anderes Ziel umlegen.
- R78 konkretisiert diese Reaktion zunächst für die bereits implementierte Angriffskarte `Schlangengrube`: Wird sie mit Farbenschutz abgewehrt, wird der Zielspieler nicht zum Aussetzen markiert.
- Verdoppler kann zu Beginn der Ausspielphase mit einer Verdopplerkarte gespielt werden und aktiviert für diesen Zug einen Bonuszug mit genau einer zusätzlichen Karte.
- Der aktuelle Reaktionsspieler kann den Verdoppler-Bonus mit Farbenschutz abwehren oder durchlassen.
- Verdoppler selbst zählt als Sonderkarte.
- Schlangengrube lässt einen anderen Spieler seinen nächsten Zug aussetzen; bei 3 oder mehr Spielern wählt der aktive Spieler den Zielspieler, bei 2 Spielern ist automatisch der andere Spieler betroffen.
- Kann der Spieler keine gültige Karte spielen, muss er eine Karte abwerfen.
- Abwerfen gilt als Karte gespielt für die Zugpflicht.
- Abgeworfene Karten kommen offen auf den Ablagestapel.
- Hat der aktive Spieler keine Handkarten (z. B. in der Endrunde, in der nicht mehr nachgezogen wird, nachdem Farbenschutz-Reaktionen außerhalb seines Zuges seine Karten verbraucht haben), entfällt die Zugpflicht: Der Zug ist ohne gespielte Karte beendbar. So kann kein Deadlock entstehen.

#### R2.3a Nachziehen nach einer Sonderkarte (ÄNDERUNG 03.08.2026)

Wörtlich aus der Normquelle, Abschnitt „Spielablauf und Timing von Sonderkarten":

> „Nach dem Ausspielen einer Sonderkarte darf sofort eine neue Karte nachgezogen
> werden, damit zu Beginn des eigenen Zuges wieder 5 Handkarten vorhanden sind."
> — „Alle Spieler, die eine Karte gespielt haben, dürfen sofort eine neue Karte
> nachziehen." — „Nach Abhandlung aller Effekte werden neue Karten nachgezogen.
> Das Nachziehen erfolgt ebenfalls im Uhrzeigersinn."

Diese Regel fehlte bis zum 03.08.2026 vollständig; die Engine zog ausschließlich
beim Zugwechsel. Sie war zuvor als offene Frage O-2 geführt.

- **Wer:** jeder, der in dieser Abhandlung eine Karte aus der Hand **gespielt**
  hat — der Angreifer und jeder Verteidiger, der einen Farbenschutz eingesetzt
  hat. Wer durchlässt, hat keine Karte gespielt und zieht nicht.
- **Wann:** erst **nach** Abhandlung aller Effekte, also am Ende der
  Reaktionskette — nicht beim Ablegen der Karte. Der Unterschied ist beobachtbar:
  Bei einem Schlangenfrass auf zwei Karten desselben Gegners könnte dieser sonst
  einen frisch gezogenen Farbenschutz gegen das zweite Ziel einsetzen, den er am
  Tisch noch gar nicht hätte.
- **Wie viel:** genau eine Karte je gespielter Sonderkarte.
- **Reihenfolge:** im Uhrzeigersinn ab dem aktiven Spieler. Sie entscheidet, wer
  die letzte Karte bekommt, wenn der Stapel dabei leer wird.
- **Nicht im Endspurt:** „Nach Spielende wird noch eine Runde gespielt, ohne neue
  Karten zu ziehen."
- **Leerer Stapel ist kein Fehler**, sondern schlicht keine Karte. Läuft der
  Stapel beim Nachziehen leer, löst das den Endspurt aus — dieselbe Zusicherung
  wie beim Nachziehen zu Zugbeginn.

**Digitale Auslegung:** Die Anleitung sagt „darf". Digital wird **immer**
gezogen. Ein optionales Nachziehen wäre ein zusätzlicher Klick, der nach Regel 7
der `SPIELBRETT_SPEC.md` eine echte Entscheidung verlangen müsste; die
Nichtziehen-Option hat außer einer marginalen Endspurt-Verzögerung keinen Zweck.

### R2.4 Aufgabenprüfung

- Nach dem Ausspielen prüft der Spieler offene Aufgaben und seine geheime Aufgabe.
- Aufgaben müssen im aktuellen Zustand der Schlange(n) vollständig erfüllt sein.
- Erfüllte Aufgaben werden sofort abgehandelt.
- Offene Aufgaben werden nach Erfüllung ersetzt, falls der Aufgaben-Nachziehstapel nicht leer ist.
- Geheime Aufgaben werden im Zug nur intern als erfüllt markiert; sie bleiben verdeckt und werden erst bei der Punktezählung aufgedeckt.
- Mehrere Aufgaben können in einem Zug erfüllt werden.
- Vergessenes „SchlangenSpass!“-Rufen verhindert die Erfüllung digital nicht.

### R2.5 Zugabschluss und Spielerwechsel

- Der Zug kann nur beendet werden, wenn alle Pflichten erfüllt sind.
- Vor Zugende wird geprüft, ob mindestens 1 Karte gespielt wurde.
- Alle Karteneffekte müssen abgehandelt sein.
- Erfüllte Aufgaben müssen geprüft sein.
- Bei mehr als 10 Handkarten muss der Spieler überzählige Karten abwerfen.
- Der Spieler wählt selbst, welche Karten abgeworfen werden: Im Zugabschluss mit Überhand markiert der menschliche Spieler genau die überzähligen Karten und bestätigt den Abwurf. Ein automatischer Abwurf der zuletzt gehaltenen Karten dient nur als Fallback für den generischen Phasenbutton und für KI-Gegner.
- Danach wird der nächste Spieler im Uhrzeigersinn aktiviert.
- Wenn der aktive Spieler in seinem Zug die letzte Karte vom Nachziehstapel gezogen hat, beendet er seinen laufenden Zug normal; danach erhalten alle anderen Spieler in Zugreihenfolge noch genau einen Zug.
- Der Spieler, der die letzte Nachziehkarte gezogen hat, wird in dieser Endrunde nicht erneut aktiviert.
- Nach dem letzten Endrunden-Zug wird die Spielphase auf beendet gesetzt und es folgt die Wertung.
- Spielende-Bedingung ist ausschließlich der leere Nachziehstapel; danach steuert die Endrunde den Übergang zur Wertung.

### R2.6 Sonderfälle

- Keine spielbare Karte: Spieler muss eine Karte abwerfen; das gilt als Karte gespielt für die Zugpflicht.
- Nachziehstapel wird leer: Spieler zieht alle verbleibenden Karten, Endspurt wird aktiviert, der Zug wird normal beendet; anschließend spielen alle anderen Spieler genau einen Zug ohne Nachziehen, der Auslöser nicht erneut.
- Sonderkarte würde ungültigen Zustand erzeugen: Die Sonderkarte darf nicht gespielt werden; das System verhindert die Aktion.
- Aufgabe durch Gegner-Aktion möglich erfüllt: keine sofortige Gutschrift; die Aufgabe wird spätestens in der Aufgabenprüfung des betroffenen Spielers gegen dessen eigene Schlangen geprüft.
- Mehrere Spieler erfüllen gleichzeitig dieselbe offene Aufgabe: Der aktive Spieler hat Vorrang.
- Kein Sonderfall darf zu Absturz oder Deadlock führen.

## 5. Legal Actions

### 5.1 Action matrix by phase

- **Nachziehphase**
  - Spieleraktionen sind nicht erlaubt.
  - Wenn die Mindesthandkarten erreicht sind, darf die UI die Phase mit `Ausspielphase starten` fortsetzen.
  - Voraussetzung: Der aktive Spieler hat mindestens die geforderte Mindesthand und die Nachziehphase ist abgeschlossen.

- **Ausspielphase**
  - `NeueSchlangeStarten`
    - Nur mit einer Farbkarte.
    - Nur für den aktiven Spieler.
    - Nur solange der Spieler weniger als 2 Schlangen besitzt.
    - Nur solange pro Zug die Farbkartenbegrenzung noch nicht erreicht ist.
  - `KarteAnlegen`
    - Nur mit einer Farbkarte.
    - Nur an eine existierende, nicht blockierte eigene Schlange.
    - Nur links oder rechts.
    - Nur für den aktiven Spieler.
    - Nur solange pro Zug die Farbkartenbegrenzung noch nicht erreicht ist.
  - `PflichtAbwurf`
    - Nur wenn keine spielbare Aktion verfügbar ist.
    - Nur für den aktiven Spieler.
    - Nur mit einer Karte auf der Hand des aktiven Spielers.
    - Pro Zug gelten die Kartenlimits der Ausspielphase; bei aktivem Verdoppler-Bonus sind bis zu 2 Farbkarten und bis zu 2 Sonderkarten möglich.
  - `SonderkarteSpielen`
    - Nur mit `Schlangengrube`.
    - Nur für den aktiven Spieler.
    - Nur auf einen anderen Spieler.
    - Ohne Farbenschutz-Abwehr markiert sie den gewählten Spieler für seinen nächsten Zug als ausgesetzt.
    - Mit `abwehrHandkartenId` darf genau der Zielspieler eine eigene `Farbenschutz`-Handkarte als Abwehr einsetzen; dann werden Schlangengrube und Farbenschutz abgelegt und der Aussetzen-Effekt entfällt.
  - `VerdopplerSpielen`
    - Nur mit `Verdoppler`.
    - Nur für den aktiven Spieler.
    - Nur zu Beginn der Ausspielphase.
    - Aktiviert für diesen Zug einen Bonuszug mit genau einer zusätzlichen Karte.
  - `VerdopplerAbwehren`
    - Nur während einer ausstehenden Verdoppler-Reaktion.
    - Nur mit `Farbenschutz`.
    - Nur durch den aktuellen Reaktionsspieler.
  - `VerdopplerDurchlassen`
    - Nur während einer ausstehenden Verdoppler-Reaktion.
    - Nur durch den aktuellen Reaktionsspieler.
    - Beendet die Reaktionsentscheidung ohne Abwehr.
  - `FarbenschutzSpielen`
    - Nur mit `Farbenschutz`.
    - Nur für den aktiven Spieler.
    - Nur auf eine eigene aktive Schlange.
    - Setzt den Zustand der gewählten Schlange auf `geschuetzt`.
  - `FarbendiebSpielen`
    - Nur mit `Farbendieb`.
    - Nur für den aktiven Spieler.
    - Nur auf eine gegnerische Schlange und eine **Farbkarte** daraus; Sonderkarten (inkl. fusionierter Farbenfusion- oder Regenbogenschlangen-Karten) sind nicht stehlbar.
    - Die gestohlene Karte kann an einer beliebigen Position in eine eigene Schlange eingefügt werden, auch zwischen bestehende Karten.
    - Der Angriff kann durch den Zielspieler mit Farbenschutz abgewehrt werden.
  - `SchlangenblockadeSpielen`
    - Nur mit `Schlangenblockade`.
    - Nur für den aktiven Spieler.
    - Nur auf eine konkrete Zielschlange eines anderen Spielers.
    - Der Angriff kann durch den Zielspieler mit Farbenschutz abgewehrt werden.
  - `SchlangenblockadeAbwehren`
    - Nur während einer ausstehenden Schlangenblockade-Reaktion.
    - Nur mit `Farbenschutz`.
    - Nur durch den aktuellen Zielspieler.
  - `SchlangenblockadeDurchlassen`
    - Nur während einer ausstehenden Schlangenblockade-Reaktion.
    - Nur durch den aktuellen Zielspieler.
  - `SchlangenfrassSpielen`
    - Nur mit `Schlangenfrass`.
    - Nur für den aktiven Spieler.
    - Wählt 1 oder 2 Karten aus beliebigen Schlangen.
    - Geschützte Ziele werden per Farbenschutz-Reaktionskette im Uhrzeigersinn abgewickelt.
  - `SchlangenfrassAbwehren`
    - Nur während einer ausstehenden Schlangenfrass-Reaktion.
    - Nur mit `Farbenschutz`.
    - Nur durch den aktuellen Reaktionsspieler.
  - `SchlangenfrassDurchlassen`
    - Nur während einer ausstehenden Schlangenfrass-Reaktion.
    - Nur durch den aktuellen Reaktionsspieler.
  - `FarbenfusionSpielen`
    - Nur mit `Farbenfusion`.
    - Nur für den aktiven Spieler.
    - Nur auf zwei nebeneinanderliegende Karten gleicher Farbe in einer eigenen Schlange.

- **Aufgabenprüfung**
  - Spieleraktionen sind nicht erlaubt.
  - Die Engine prüft offene Aufgaben und die geheime Aufgabe des aktiven Spielers automatisch.
  - Die UI darf nur Status, Ergebnis und Phasenfortschritt anzeigen; keine neue Spielaktion starten.

- **Zugabschluss**
  - Wenn überzählige Handkarten vorhanden sind: `Überzählige Karten abwerfen`.
  - Andernfalls: `Zug beenden`.
  - Voraussetzung für `Zug beenden`: Die Pflichtaktionen des Zuges sind erfüllt.
  - In der Endrunde werden nach `Zug beenden` die verbleibenden Spieler automatisch weitergeführt.

- **Spielende**
  - Keine Spieleraktionen mehr.
  - Nur Wertung, Ergebnis und Rückblick sind erlaubt.

### 5.2 Gemeinsame Voraussetzungen

- Nur der aktive Spieler darf eine Aktion ausführen.
- Aktionen außerhalb der passenden Zugphase sind verboten.
- Eine Karte muss sich auf der Hand des aktiven Spielers befinden, bevor sie gespielt oder abgeworfen werden kann.
- Die Engine lässt ohne Verdoppler pro Zug höchstens 2 gespielte Karten zu; mit aktivem Verdoppler sind bis zu 3 gespielte Karten zulässig.
- Nach dem letzten Zug der Endrunde wird automatisch in die Spielende-Phase gewechselt.

### R3.1 Neue Schlange starten

- Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.
- Sonderkarten können keine neue Schlange starten.
- Der Spieler muss weniger als 2 Schlangen haben.
- Es muss die Ausspielphase des Spielers sein.
- Eine neue Schlange startet mit genau 1 Karte.
- Die erste Karte definiert keinen festen Kopf/Schwanz; beide Enden sind gleichwertig.

### R3.2 Schlange erweitern

- Farbkarten können an beide Enden einer Schlange angelegt werden.
- Es gibt keine Farb-Einschränkungen beim Anlegen.
- Jede Farbkarte kann an jede Position am linken oder rechten Ende angelegt werden.
- Die Reihenfolge der Farben ist frei wählbar.
- Die Schlange wächst nach links oder rechts.
- Es gibt keine maximale Schlangenlänge.

### R3.3 Farbgruppen bilden

- Eine Farbgruppe besteht aus mindestens 3 direkt nebeneinander liegenden Karten derselben Farbe.
- Keine anderen Karten dürfen dazwischen liegen.
- Sonderkarten unterbrechen Farbgruppen, außer wenn eine Regel ausdrücklich etwas anderes vorgibt (z. B. Regenbogenschlange als Wildcard mit 0 Punkten).
- Regenbogenschlangen werden von der Wertungslogik so zugeordnet, dass die Gesamtpunktzahl der betroffenen Schlange maximal wird; bei Gleichstand ist jede gleich gute Zuordnung zulässig.
- Eine Schlange kann mehrere Farbgruppen enthalten.
- Jede Gruppe wird separat gewertet.
- Gruppen müssen nicht zusammenhängen.

### R3.5 Schlangenlimit und Verwaltung

- Jeder Spieler darf maximal 2 Schlangen pro Spieler gleichzeitig haben.
- Zu Spielbeginn sind 0 Schlangen erlaubt.
- Bei 2 Schlangen ist keine neue Schlange möglich.
- Schlangen können nicht zusammengeführt werden.
- Schlangen können nicht freiwillig aufgelöst werden.
- Schlangen-Zustände: aktiv, blockiert, geschützt.
- Eine blockierte Schlange kann nicht erweitert werden.
- Jede Schlange hat eine eindeutige ID.

#### R3.5a Der Zustand `blockiert` wird von keiner Karte erzeugt

*(Auslegung festgehalten am 02.08.2026.)*

Der Zustand `blockiert` ist im Datenmodell vorhanden und wird von der Engine
durchgesetzt — eine Schlange in diesem Zustand lässt sich nicht erweitern. Er
wird jedoch von **keiner** aktuell umgesetzten Karte gesetzt.

Insbesondere setzt ihn die Schlangenblockade nicht: Sie legt nach R7.1 eine
neutrale, nicht farbige Karte in die Zielschlange. Die Schlange bleibt
erweiterbar.

**ÄNDERUNG 04.08.2026 (O-1):** Hier stand bis zum Signoff das Gegenteil dessen,
was jetzt gilt — die Blockade hänge „ans Ende", zerreiße deshalb „**keine
bestehende** Farbgruppe" und koste im Moment des Ausspielens „**keine Punkte**".
Der Absatz war am 02.08.2026 eigens präzisiert worden und beschrieb die Engine
korrekt. Mit R7.1a ist er falsch geworden:

Eine Sonderkarte trennt nach R3.3 die Farbgruppen links und rechts von sich.
Da die Blockade seit O-1 an **jeder** Position liegen darf, zerreißt sie eine
bestehende Farbgruppe, sobald sie mitten hineingelegt wird, und kostet dann
sofort Punkte. Nur der Sonderfall „ans Ende" verhält sich wie zuvor: Dort liegt
rechts nichts, und die Wirkung ist eine rein künftige — wer danach rechts weiter
anlegt, beginnt hinter der Sperrkarte eine neue Gruppe und erreicht die
Dreiergrenze aus R3.3 dort erst wieder mit drei weiteren Karten. Anlegen nach
links bleibt unberührt.

Was **nicht** gilt: Die Blockade setzt trotzdem keinen Zustand `blockiert`. Sie
zerreißt die Gruppe, sperrt die Schlange aber nicht. Beides gleichzeitig zu tun
wäre eine weitere Regeländerung und bräuchte eine bestätigte Normquelle.

Der Zustand und seine Durchsetzung bleiben erhalten: Sie kosten nichts und stehen
bereit, falls eine Erweiterungskarte sie später braucht. Wer die beiden Prüfungen
in `legalActions.ts` und `turnState.ts` für toten Code hält, findet dort einen
Verweis auf diesen Abschnitt.

## 6. Illegal Actions

- Aktionen in der falschen Zugphase sind verboten.
- Aktionen eines nicht aktiven Spielers sind verboten.
- Karten, die nicht auf der Hand des aktiven Spielers liegen, können nicht gespielt oder abgeworfen werden.
- Farbkarten dürfen pro Zug nur im erlaubten Umfang gespielt werden.
- Sonderkarten dürfen pro Zug nur im erlaubten Umfang gespielt werden.
- Neue Schlangen sind nur mit einer Farbkarte und nur bis zum Schlangenlimit erlaubt.
- Karten können nur an eigene, existente und nicht blockierte Schlangen angelegt werden.
- `PflichtAbwurf` ist nur erlaubt, wenn keine spielbare Aktion verfügbar ist.
- Nach dem Erreichen des Zuglimits sind weitere Aktionen im selben Zug verboten.

**Erwartetes UI-Verhalten:**
- Nicht legale Aktionen werden gar nicht als Button angeboten.
- Wenn keine Aktion mehr möglich ist, zeigt die UI einen klaren Hinweis wie `Keine weiteren legalen Aktionen.` im Aktionsbereich oder `Aktuell keine legalen Aktionen in dieser Phase.` in den Phasenregeln.
- Pflichtaktionen werden vor Abschluss des Zuges sichtbar gemacht.
- Bei einem Verstoß soll die UI die deutsche Engine-Meldung sichtbar machen, statt still zu scheitern.

**Typische Engine-Fehler:**
- falsche Zugphase
- nicht aktiver Spieler
- Karte nicht auf der Hand
- Schlangenlimit erreicht
- blockierte Schlange
- Pflichtabwurf ohne tatsächlichen Zwang
- Zuglimit überschritten

## 7. Effects & Special Rules

- Reihenfolge im Zug: Nachziehphase → Ausspielphase → Aufgabenprüfung → Zugabschluss.
- Der Zugabschluss entscheidet, ob der Zug normal endet oder ob die Endrunde fortgesetzt wird.
- Wenn der Nachziehstapel während des Nachziehens leer wird, startet die Endspurt-/Endrunde.
- In der Endrunde wird nicht mehr nachgezogen; die verbleibenden Spieler werden nur noch einmal nacheinander aktiv.
- Der Auslöser der Endrunde spielt seinen begonnenen Zug normal zu Ende und wird danach nicht erneut aktiviert.
- Offene Aufgaben werden nach Erfüllung ersetzt, solange der Aufgabenkartenstapel noch Karten enthält.
- Geheime Aufgaben werden erst in der Wertung sichtbar.
- Wenn mehrere Spieler dieselbe offene Aufgabe gleichzeitig erfüllen könnten, hat der aktive Spieler Vorrang.
- Sonderkarten unterbrechen Farbreihen in Aufgaben, sofern die Aufgabe nichts anderes verlangt.
- Eine Partie endet erst, wenn die Endrunde abgeschlossen ist und anschließend die Wertung erfolgt.

**Konfliktregeln:**
- Explizite Zugregeln schlagen allgemeine Hinweise.
- Engine-Validierung schlägt UI-Hinweise.
- Wenn zwei Regeln im Widerspruch stehen, gilt die engere, aktuellere Spezifikation.

### R7.1 Umgesetzte Sonderkartenwirkungen

- Schlangengrube: Der aktive Spieler wählt einen anderen Spieler, der genau seinen nächsten Zug aussetzt, sofern der Zielspieler nicht mit Farbenschutz abwehrt.
- Bei 2 Spielern ist der Zielspieler automatisch der andere Spieler; bei 3 oder mehr Spielern entscheidet der aktive Spieler.
- Schlangenblockade: Der aktive Spieler wählt eine konkrete Zielschlange **und eine Einfügeposition darin** und fügt dort eine neutrale, nicht farbige Schlangenblockade-Karte ein, sofern der Zielspieler nicht mit Farbenschutz abwehrt. Zielschlange darf **jede** Schlange sein, auch eine eigene. Einzelheiten in R7.1a. (ÄNDERUNG 04.08.2026: Hier stand bis zum Signoff „ans Ende der Zielschlange angehängt; eine Einfügeposition gibt es nicht" und „nur eines anderen Spielers".)
- Farbendieb: Der aktive Spieler wählt eine **Farbkarte** aus einer gegnerischen Schlange und fügt sie an beliebiger Position in eine eigene Schlange ein. Sonderkarten sind nicht stehlbar. Die gestohlene Karte kann auch zwischen bereits vorhandenen Karten eingefügt werden; der Angriff kann mit Farbenschutz abgewehrt werden.
- Farbenschutz: Der aktive Spieler kann eine eigene aktive Schlange als `geschuetzt` markieren. Zusätzlich kann der betroffene Zielspieler Farbenschutz einmalig als Abwehr gegen gegnerische Angriffe einsetzen; im aktuellen R79-Engine-Scope ist diese Reaktion für Schlangengrube, Schlangenblockade, Farbendieb und Schlangenfrass umgesetzt. Mit dem Verdoppler (siehe unten) sind das **alle fünf** Wirkungen, die einen anderen Spieler treffen — die Abwehr ist damit vollständig und nicht etwa ein Zwischenstand. (ÄNDERUNG 04.08.2026: Eine Ausnahme kam mit O-1 dazu — eine Schlangenblockade auf die **eigene** Schlange trifft keinen anderen Spieler und löst deshalb keine Abwehr aus. Siehe R7.1a Punkt 4.) (ÄNDERUNG 03.08.2026: nachgezählt gegen `src/engine/legalActions.ts`; Farbenfusion und Schlangenhäutung wirken nur auf eigene Schlangen und brauchen keine Abwehr.)
- Schlangenfrass: Der aktive Spieler wählt genau 1 Karte aus einer eigenen Schlange oder genau 2 Karten aus gegnerischen Schlangen. Nur gegnerische geschützte Ziele lösen die Farbenschutz-Reaktionskette im Uhrzeigersinn aus; eigene Ziele werden immer sofort entfernt (keine Selbst-Reaktion).
- Farbenfusion: Der aktive Spieler wählt zwei nebeneinanderliegende Karten gleicher Farbe in einer eigenen Schlange aus und ersetzt sie durch die Farbenfusion-Karte. Die Fusion zählt als eine Punkteeinheit. Für die längste Farbkette (R8.4a) zählt sie **nicht** — sie ist eine Sonderkarte und unterbricht die Kette. (ÄNDERUNG 03.08.2026: Hier stand zuvor „für den Vielfaltbonus wird sie ignoriert" — ein Verweis auf eine Regel, die diese Spec nie definiert hat und die nach R1.2a außerhalb des digitalen Umfangs liegt.)
- Verdoppler: Der aktive Spieler kann zu Beginn seiner Ausspielphase eine Verdopplerkarte spielen. Die Karte aktiviert für diesen Zug einen Bonuszug mit genau einer zusätzlichen Karte. Die zusätzliche Karte darf eine weitere Farbkarte oder eine weitere Sonderkarte sein; insgesamt sind dann bis zu 3 Karten möglich. Der Bonus gilt nur für den aktuellen Zug, und Verdoppler selbst zählt als Sonderkarte. Gegner können den Verdoppler mit Farbenschutz in der Reaktionskette abwehren.
- Regenbogenschlange: In der Wertungslogik wird sie als 0-Punkte-Wildcard der Farbe zugeordnet, die die betroffene Schlange maximal punktet.

#### R7.1a Freie Einfügeposition der Schlangenblockade (ÄNDERUNG 04.08.2026, O-1)

*(Signoff des Auftraggebers vom 03.08.2026. Bis dahin stand O-1 in der Tabelle
der offenen Fragen in Abschnitt 11.)*

**Der Signoff im Wortlaut** — er steht hier vollständig, damit die Regel nie aus
einer Zusammenfassung rekonstruiert wird:

> Die Blockade darf an jeder beliebigen Stelle platziert werden — sowohl in der
> eigenen Schlange, was aber natürlich nicht so viel Sinn macht, als auch an
> beliebiger Stelle beim Gegner. Der Gegner darf ausgesucht werden. Zuerst
> kündigt der Spieler an: „Ich spiele eine Schlangenblockade auf Spieler X."
> Dann darf Spieler X entscheiden, ob er abwehrt oder nicht mit der
> Farbenschutzkarte. Wenn eine Farbenschutzkarte gespielt wird, sind beide
> Karten ausgespielt — der Spieler, der die Schlangenblockade spielt, darf sich
> dann nicht mehr umentscheiden und den anderen Spieler nehmen.

**Was daraus folgt:**

1. **Jede Schlange ist ein zulässiges Ziel**, auch eine eigene. Bis 03.08.2026
   verboten Engine und Spec das ausdrücklich.
2. **Die Position ist frei wählbar.** Gültig sind die Lücken `0` bis
   `karten.length`; `karten.length` hängt hinten an — das Verhalten von vor O-1.
3. **Die Position wird bei der Ansage festgelegt**, nicht nach der
   Abwehrentscheidung. Das ist eine **Auslegung**, keine wörtliche Folge: Der
   Signoff verbietet ausdrücklich nur, den *Zielspieler* zu wechseln. Die
   Position ebenso zu behandeln liegt nahe — wer sich nach der Entscheidung des
   Verteidigers nicht mehr umentscheiden darf, sollte sie auch nicht mehr
   verschieben können —, steht dort aber nicht. Wird das je anders gewollt,
   braucht es einen eigenen Signoff, keine Codeänderung.
4. **Auf die eigene Schlange gibt es keine Abwehr.** Gegen sich selbst wehrt man
   sich nicht; dieselbe Auslegung gilt beim Schlangenfrass („eigene Ziele werden
   immer sofort entfernt, keine Selbst-Reaktion"). Der Signoff nennt die eigene
   Schlange als das, was „nicht so viel Sinn macht" — nicht als neuen
   Reaktionsfall.

**Die Punktewirkung ist neu und beabsichtigt.** Eine Sonderkarte trennt nach R3.3
die Farbgruppen links und rechts von sich. Mitten in eine Dreiergruppe gelegt
zerreißt die Blockade sie deshalb sofort: Drei rote Karten (3 Punkte) werden zu
1 + 2 Karten und zählen nach R8 **null**. Genau das war vor O-1 unmöglich, und
genau darauf zielt der Signoff.

**Altstände.** Ein Spielstand, der mitten in einer Blockade-Reaktionskette
gespeichert wurde, kennt die Position nicht. `migriereSchlangenblockadePositionVorO1`
setzt sie auf das Ende der Zielschlange und stellt damit exakt das Verhalten von
vor O-1 her.

### R7.2 Keine offenen normalen Sonderkartenwirkungen

- Aktuell sind keine normalen Sonderkartenwirkungen offen.
- Neue offene Sonderkartenwirkungen werden nur mit bestätigter Normquelle ergänzt; sie dürfen nicht aus dem Kartennamen geraten werden.

> **Normquelle aktualisiert.** Für R6 gilt die geprüfte Korrektur zur Website: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler. Dart-R6.2/R6.3/R6.5-Abweichungen sind überholt und dürfen nicht als Implementierungsgrundlage verwendet werden.

### R6 Aufgabenkarten

Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler. Verbindlich ist die veröffentlichte Liste der 14 Aufgabenkarten mit Name, Punktwert und Bedingung.

#### R6.1 Allgemeine Aufgaben-Regeln

**Spielvorbereitung:**
- Aufgabenkarten werden separat gemischt und nicht mit anderen Karten gemischt.
- Zu Beginn des Spiels: 3 offene Aufgabenkarten werden neben den Spielbereich gelegt.
- Jeder Spieler erhält 1 geheime Aufgabenkarte, die verdeckt vor dem Spieler liegt.
- Alle Aufgaben funktionieren nach dem gleichen Prinzip - egal ob offen oder geheim.

**Aufgaben erfüllen:**
- Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist.
- Die Bedingungen dürfen im selben Zug geschaffen und die Aufgabe direkt erfüllt werden.
- Bei offenen Aufgaben ruft der Spieler „SchlangenSpass!", wenn er eine Aufgabe erfüllt.
- Offene Aufgaben werden nach Erfüllung ersetzt, solange der Aufgabenkartenstapel nicht leer ist; die erfüllte offene Aufgabe wandert zum Spieler.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt.
- Jede Aufgabe kann nur einmal erfüllt werden - wer zuerst die Bedingungen erfüllt und am Zug ist, bekommt die Punkte.
- Wenn der Aufgabenkartenstapel leer ist, werden keine neuen Aufgaben mehr aufgedeckt.

**Wichtig für Sonderkarten:** Wenn in den Aufgabenbeschreibungen nicht anders erwähnt, gelten Sonderkarten (wie Regenbogenschlange oder Farbenfusion) als Unterbrechung bei Farbreihen in Aufgaben. Sonderkarten zählen nicht für die Erfüllung von Aufgaben, es sei denn, die Aufgabe verlangt explizit nach Sonderkarten.

**SchlangenSpass!-Sequenz:** Erkennung → Animation „SchlangenSpass!" → Soundeffekt → Aufgabe hervorheben → Punkte gutschreiben → Karte zum Spieler → offene Aufgabe nachziehen (falls verfügbar).

#### R6.2 Veröffentlichte Aufgabenkarten laut Website

| # | Name | Punkte | Bedingung |
|---|------|--------|-----------|
| 1 | Farbenpracht | 8 | Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen. |
| 2 | Farbharmonie | 10 | Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe. |
| 3 | Farbkombination | 5 | Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange. |
| 4 | Farbvielfalt | 9 | Bilde eine Kette aus je einer Karte aller 6 Farben. |
| 5 | Farbwechsler | 6 | Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. |
| 6 | Fusionsexperte | 6 | Habe eine Schlange mit mindestens 2 Farbfusionen. |
| 7 | Schlangenbeschwörer | 7 | Habe min. 4 Sonderkarten in deinen Schlangen. |
| 8 | Schlangenmeister | 4 | Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus. |
| 9 | Schlangenrepertoire | 4 | Spiele min. 5 versch. Arten von Sonderkarten aus. |
| 10 | Schlangenbändiger | 7 | Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben. |
| 11 | Schlangentanz | 7 | Bilde durch Schlangenhäutung 2 neue Dreiergruppen. |
| 12 | Symmetriemeister | 10 | Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist. |
| 13 | Gelber Schatz | 5 | Bilde eine Gruppe aus min. 6 gelben Karten. |
| 14 | Lila Riese | 5 | Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3). |

Hinweis: Diese Liste ersetzt die alten Dart-Unterteilungen „8 offene Aufgabenkarten" und „7 geheime Aufgabenkarten". Offen/geheim ist nach Website-Regel eine Auslage-/Sichtbarkeitsform, keine getrennte Namenskategorie.

#### R6.2a Digitale Auslegung einzelner Kartentexte

Die Kartentexte oben sind die verbindliche Normquelle und werden **wörtlich** so geführt, wie sie auf der Karte stehen. Zwei Formulierungen sind am Tisch eindeutig, digital aber auslegungsbedürftig; hier gilt verbindlich:

- **Nr. 14 „Lila Riese" — „die längste ununterbrochene Kette violetter Karten (mindestens 3)".** Der Superlativ „längste" beschreibt am Tisch einen Vergleich zwischen den Spielern, der digital eine spielerübergreifende Auswertung mit Gleichstandsregel erfordern würde; die Karte nennt aber weder einen Auswertungszeitpunkt noch eine Gleichstandsregel dafür. Digital gilt deshalb die untere Schranke des Kartentexts als Bedingung: **mindestens eine ununterbrochene Violett-Kette aus 3 oder mehr Karten in einer eigenen Schlange.** Sonderkarten unterbrechen die Kette nach der allgemeinen Regel. Dies ist die implementierte Auslegung, keine Abweichung von der Normquelle.
- **Nr. 6 „Fusionsexperte" und Nr. 7 „Schlangenbeschwörer"** werden gegen den aktuellen Zustand der eigenen Schlangen geprüft (Karten *in* den Schlangen), nicht gegen die Historie ausgespielter Karten. Nr. 8 „Schlangenmeister" und Nr. 9 „Schlangenrepertoire" prüfen umgekehrt ausdrücklich die Historie („spiele … aus"), weil ihr Kartentext das so verlangt.

Eine Änderung dieser Auslegungen ist eine Regeländerung und braucht eine bestätigte Normquelle oder einen User-Signoff — nicht nur einen Code-Fix.

#### R6.3 SchlangenSpass!-Mechanik

- Aufgabenprüfung erfolgt nach relevanten Spielaktionen und spätestens vor Zugabschluss.
- Geprüft werden alle offenen Aufgaben sowie die geheime Aufgabe des aktiven Spielers gegen den aktuellen Zustand der eigenen Schlangen.
- Mehrfach-Erfüllungen werden nacheinander angezeigt, jede mit eigener Sequenz; offene Aufgaben werden einzeln nachgezogen.
- Vergessenes manuelles „SchlangenSpass!"-Rufen verhindert die digitale Erfüllung nicht, wenn die Bedingung eindeutig erfüllt ist.

#### R6.4 Endspurt-Verdopplung

- Endspurt-Phase beginnt, wenn der Nachziehstapel durch Nachziehen leer wird; der auslösende Spieler beendet seinen laufenden Zug normal, danach folgt die Endrunde ohne weiteres Nachziehen.
- Nur offene Aufgabenkarten werden im Endspurt verdoppelt; Berechnung: normaler Punktwert × 2 (Beispiel: Farbvielfalt 9 → 18).
- Offene Aufgaben zeigen im Endspurt den verdoppelten Wert mit ×2-Anzeige und ursprünglichem Wert.
- Nicht verdoppelt: geheime Aufgaben, bereits vor dem Endspurt erfüllte Aufgaben, Farbgruppen-Punkte, Risiko-Belohnungs-Punkte.
- Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht; es gilt nur eine Verdopplung.

#### R6 Konfliktauflösung

- Die Website-Regeln sind verbindlich: https://schlangentanz.ch/rules.
- Dart-R6.2/R6.3/R6.5-Abweichungen sind überholt.
- Nicht mehr gültige Dart-Namen/Punktwerte werden nicht implementiert; maßgeblich ist ausschließlich die veröffentlichte Aufgabenliste der Website.
- Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler und darf nicht als Material- oder Implementierungsregel übernommen werden.

## 8. Scoring & Win/Loss

### R8.4 Punktwertung

- Farbgruppenpunkte werden pro Schlange gemäß R3/R4 berechnet.
- Spieler-Farbgruppenpunkte sind die Summe aller Farbgruppenpunkte über beide Schlangen eines Spielers.
- Spieler-Aufgabenpunkte sind die Summe der Punkte bereits erfüllter Aufgaben.
- Spieler-Gesamtpunkte = Spieler-Farbgruppenpunkte + Spieler-Aufgabenpunkte + Kettenbonus (R8.4a).
- Die UI darf die Wertung pro Spieler zusätzlich in Farbgruppen-, Aufgaben- und Kettenpunkte aufschlüsseln.
- Spiel-Gesamtwertung wird über die Spieler-Liste des Spielzustands in stabiler Reihenfolge berechnet.

#### R8.4a Längste Farbkette (ÄNDERUNG 03.08.2026)

Wörtlich aus der Normquelle, Abschnitt „Punktewertung":

> „Der Spieler mit der längsten ununterbrochenen Kette einer Farbe (ohne
> Sonderkarten!) erhält **5 Bonuspunkte**. Bei Gleichstand erhalten alle
> beteiligten Spieler die vollen 5 Punkte."

Der Eintrag steht dort **ohne** das Etikett „Erweiterung" und ist damit
Basisspielregel (R1.2a). Er hat bis zum 03.08.2026 in dieser Spec und in der
Engine vollständig gefehlt — gefunden beim Abgleich vor dem Sperren.

- Eine Kette ist eine Folge **direkt benachbarter Farbkarten derselben Farbe**
  innerhalb **einer** Schlange.
- **Sonderkarten unterbrechen die Kette ausnahmslos.** Das gilt ausdrücklich
  auch für die Regenbogenschlange und die Farbenfusion. Damit ist eine Kette
  etwas anderes als eine Farbgruppe nach R3.3, wo die Regenbogenschlange als
  Wildcard zählt — der Klammerzusatz „ohne Sonderkarten!" lässt keinen Spielraum.
- Je Spieler zählt die längste Kette über **beide** Schlangen.
- Den Bonus erhält jeder Spieler, dessen längste Kette der längsten Kette im
  Spiel entspricht. Es wird nicht geteilt.
- **Digitale Auslegung (die einzige an dieser Regel):** Die Normquelle nennt
  keine Mindestlänge. Hat kein Spieler eine Kette (längste Kette = 0), erhält
  **niemand** den Bonus. Ohne diese Schranke bekäme zu Spielbeginn jeder Spieler
  5 Punkte für eine Kette, die es nicht gibt. Eine Mindestlänge von 3 analog zu
  R3.3 wäre dagegen geraten und wird deshalb **nicht** eingeführt.
- Der Bonus wird **laufend** gewertet, nicht erst bei Spielende — sonst zeigte
  das Brett während der ganzen Partie einen Stand, von dem bekannt ist, dass er
  falsch ist.
- Der Bonus ist **öffentliche Information**: Schlangen liegen offen, jeder kann
  nachzählen. Er wird deshalb — anders als erfüllte geheime Aufgaben — im
  angezeigten Punktestand jedes Spielers mitgeführt.

- Eine Partie endet, wenn der Nachziehstapel leer wird und die anschließende Endrunde abgeschlossen ist.
- Nach Partieende wird die Punktzahl gemäß den dokumentierten Wertungsregeln ermittelt.
- Wer die meisten Punkte hat, gewinnt.
- Gleichstand ist erlaubt, wenn zwei oder mehr Spieler dieselbe höchste Punktzahl haben.

## 9. UI Requirements

- Sichtbare Zustandsanzeige für Phase, aktiven Spieler, Wertung, Handkarten, Schlangen, offene Aufgaben und Materialstapel.
- Legale Aktionen werden als klickbare, textuell eindeutige UI-Affordances angezeigt.
- Ein klarer Hinweis auf die nächste legale bzw. verpflichtende Aktion ist sichtbar.
- Rückmeldungen nach Aktionen aktualisieren sich unmittelbar im aktiven Spielerbereich.
- Accessibility: semantische Bereiche, aussagekräftige Beschriftungen, `aria-current` für den aktiven Spieler und `aria-live="polite"` für den aktiven Spielerbereich.
- Verdeckte Information (R1.3/R1.4): Ist ein KI-Gegner am Zug, werden dessen Handkarten nur als verdeckte Rücken mit Anzahl gezeigt — keine Farbe, kein Typ, kein Name, keine konkreten Aktions-Labels (auch nicht in Entwicklungsdaten). Die angezeigte persönliche/geheime Aufgabe gehört stets dem menschlichen Spieler. Es gibt keine Ableitung gegnerischer Handkarten (kein „Peek").
- Mobile Mindestanforderung: einspaltiges Layout, gut lesbare Textblöcke und vollbreite Aktionsbuttons auf kleinen Viewports.

## 10. Non-Goals

- Kein Wiederverwenden des alten `schlangentanz-game`-Repositorys.
- Kein Paperclip-Implementierungspfad.
- Kein blindes Kopieren von altem Code, alten Build-Artefakten oder alten Vercel-Projektständen.
- Dart-Aufgaben sind Backlog-Input und keine automatische Wahrheit.
- Nicht-Ziele ändern keine offenen Spielregeln.

## 11. Status und offene Regelfragen

- Die Spezifikation ist die aktive Arbeitsgrundlage für die digitale Umsetzung.
- Bereits implementierte Regeln sind über Tests und Release-Gates abgesichert.
- Offene Regelfragen werden erst nach User-Signoff oder verlässlicher Normquelle implementiert.

### Offene Regelfragen (Stand 03.08.2026)

**ÄNDERUNG 03.08.2026:** Hier stand zuvor der Satz „*weitere offene Regelfragen
betreffen andere Bereiche*" — und keine einzige war benannt. Das war der Grund,
warum diese Spec nicht gesperrt werden konnte: Man kann nicht festschreiben, was
offen ist, wenn niemand weiß, was offen ist. Die Liste ist jetzt vollständig.
Steht hier nichts weiter, ist nichts weiter offen.

**ÄNDERUNG 03.08.2026 (Korrektur, noch am selben Tag).** Hier stand, ein
*vollständiger* Abgleich von R1–R8 gegen die Normquelle habe genau zwei
Abweichungen ergeben. Das war zu früh behauptet: Gründlich geprüft war der
**Wertungsabschnitt** der Anleitung, nicht der Abschnitt „Spielablauf und Timing
von Sonderkarten". Der zweite Durchgang hat dort weitere Abweichungen gefunden;
sie stehen unten als O-3 und O-4; die dritte (sofortiges Nachziehen, zuvor O-2) ist mit demselben Tag als R2.3a umgesetzt.

Übereinstimmend geprüft und in Ordnung sind: Kartenmengen und Punktwerte (R4.1),
die acht Sonderkartenwirkungen (R7.1), die Zugschritte „auf 5 auffüllen /
mindestens 1, höchstens 2 Karten spielen" (R2.2/R2.3), das Spielende samt
Endrunde (R8.4) und die Farbgruppenwertung (R3.3).

**Ein Fehlalarm gehört mit dokumentiert**, damit ihn niemand ein zweites Mal
meldet: Die Anleitung schreibt fett „Es zählt nur die längste Gruppe jeder
Farbe." Der Satz geht weiter — „Eine Vierergruppe zählt also nicht zusätzlich als
Dreiergruppe, eine Fünfergruppe nicht als Dreier- und Vierergruppe." Gemeint sind
Teilmengen **derselben** Gruppe, nicht zwei getrennte Gruppen gleicher Farbe. Die
Engine wertet genau so. Wer nur das fettgedruckte Fragment liest, findet einen
schweren Wertungsfehler, den es nicht gibt.

Geschlossen mit dem Slice vom 03.08.2026: die fehlende Regel R8.4a und der
hängende Verweis auf den Vielfaltbonus in R7.1.

| # | Frage | Status | Warum offen |
|---|---|---|---|
| **O-1** | Einfügeposition der Schlangenblockade | **entschieden und umgesetzt** (Signoff 03.08.2026, Umsetzung 04.08.2026) | Die Frage war, ob „kann an beliebiger Stelle eingefügt werden" aus Zugschritt b) auch für Angriffskarten in **fremde** Schlangen gilt. Der Auftraggeber hat sie bejaht und zugleich die eigene Schlange als Ziel freigegeben. Die Regel steht im Wortlaut in **R7.1a**; R7.1 und R3.5a sind entsprechend umgeschrieben. Diese Zeile bleibt als Spur stehen, damit die Frage nicht ein zweites Mal aufgemacht wird. |
| **O-3** | Eigener Ablagestapel je Spieler | bewusst nicht umgesetzt | Die Anleitung gibt jedem Spieler einen eigenen Ablagestapel („für gespielte Sonderkarten"); das Datenmodell hat einen gemeinsamen (`ablagestapel`). Ohne Spielwirkung im digitalen Umfang: Keine Regel des Basisspiels liest je aus einem *persönlichen* Stapel. Erst die Erweiterung täte das (Risiko-Belohnung, Aktion 4) — und die ist nach R1.2a außerhalb des Umfangs. |
| **O-4** | Zweite Spielende-Bedingung | nicht anwendbar | „Wenn der Ablagestapel leer ist und ein Spieler eine Karte vom Ablagestapel ziehen möchte, endet das Spiel ebenfalls." Vom Ablagestapel ziehen kann man nur mit Erweiterungskarten (R1.2a: nicht im Umfang). Die Bedingung ist digital unerreichbar und wird deshalb nicht nachgebildet. |

Nicht auf dieser Liste, weil es **keine** Regelfragen sind:

- **Der Vielfaltbonus** liegt nach R1.2a außerhalb des digitalen Umfangs. Ihn
  aufzunehmen ist eine Umfangsentscheidung, keine offene Regel.
- **Drag & Drop, Layout unter 1000 px, die gescrollte zweite Schlange** sind
  Bedien- und Darstellungsfragen. Sie stehen in `docs/PLAYABILITY_GATE.md`.

### Geklärte Auslegungen

Diese Punkte sind entschieden und **keine** offenen Regelfragen. Sie stehen hier,
weil sie beim Lesen des Codes wie Lücken aussehen:

- **R3.5a — der Zustand `blockiert` wird von keiner Karte erzeugt** (02.08.2026,
  überarbeitet 04.08.2026). Die Schlangenblockade sperrt die Zielschlange nicht.
  Sie *zerreißt* seit O-1 aber sehr wohl eine bestehende Farbgruppe, sobald sie
  mitten hineingelegt wird — hier stand bis zum Signoff das Gegenteil („hängt
  ans Ende … zerreißt keine bestehende Farbgruppe"). Den Zustand `blockiert` zu
  setzen wäre weiterhin eine eigene Regeländerung und bräuchte eine bestätigte
  Normquelle.
- **R6.2a — „Lila Riese“ und die Historie-Aufgaben.** Zwei Kartentexte sind am
  Tisch eindeutig, digital aber auslegungsbedürftig; die getroffene Auslegung
  steht in R6.2a.
- **R8.4a — der Nullfall der längsten Farbkette** (03.08.2026). Die Normquelle
  nennt keine Mindestlänge; ohne eine Schranke bei 0 bekäme zu Spielbeginn jeder
  Spieler 5 Punkte. Die Gleichstandsregel ist dagegen **keine** Auslegung — sie
  steht wörtlich in der Quelle.
- **R1.2a — der digitale Umfang** (03.08.2026). Basisspiel plus Aufgabenkarten
  plus Schlangenhäutung, ohne Vielfaltbonus. Eine bewusste Teilmenge, keine
  unfertige Umsetzung.
