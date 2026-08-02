# Schlangentanz Game Spec

Status: **Aktive Projektspezifikation — inkrementell versioniert und noch nicht final gesperrt.**

Implementierte Regeln und offene Regelfragen werden pro R-Slice dokumentiert und verifiziert. Nicht bestätigte Regeln bleiben ausdrücklich offen und werden nicht geraten.

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

> **Arbeitsstatus.** Die folgenden Karten-Regeln wurden als aktuelle Spezifikationsgrundlage übernommen; offene Details bleiben in den jeweiligen R-Abschnitten ausdrücklich markiert.

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

### R1.3 Startkarten verteilen

- Jeder Spieler erhält 5 Startkarten vom Nachziehstapel.
- Verteilung erfolgt reihum (kein Durcheinander).
- Handkarten anderer Spieler dürfen nicht sichtbar sein.
- Handkartenlimit: 10 Karten.
- Mindesthandkarten nach Nachziehen: 5 Karten.

### R1.4 Aufgabenkarten auslegen

- Zu Spielbeginn werden 3 offene Aufgabenkarten neben den Spielbereich gelegt und sind für alle sichtbar.
- Jeder Spieler erhält genau 1 geheime Aufgabenkarte, die verdeckt vor dem Spieler liegt.
- Die Aufgabenkarten werden separat gemischt und nicht mit anderen Karten gemischt.
- Offene und geheime Aufgaben verwenden denselben Aufgabenpool; es gibt laut Website keine getrennten festen 8/7-Namenslisten.
- Offene Aufgaben können von jedem Spieler erfüllt werden; nach Erfüllung werden sie ersetzt, solange der Aufgabenkartenstapel nicht leer ist.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt und geben nur Punkte, wenn sie erfüllt wurden.

## 4. Turn Structure

> **Arbeitsstatus.** Die folgenden Zugstruktur-Regeln wurden als aktuelle Spezifikationsgrundlage übernommen; offene Details bleiben in den jeweiligen R-Abschnitten ausdrücklich markiert.

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
- Maximale Handkarten am Zugende: 10 Karten.
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

> **Arbeitsstatus.** Die folgenden Schlangenbau-Regeln wurden als aktuelle Spezifikationsgrundlage übernommen; offene Details bleiben in den jeweiligen R-Abschnitten ausdrücklich markiert.

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
neutrale, nicht farbige Karte auf die Zielschlange. Deren Wirkung ist eine
andere, nämlich die Unterbrechung — eine Sonderkarte trennt nach R3.3 die
Farbgruppen links und rechts von sich und kostet den Zielspieler damit Punkte.
Die Schlange bleibt erweiterbar.

Beides gleichzeitig zu tun wäre eine Regeländerung und bräuchte eine bestätigte
Normquelle. Bis dahin gilt R7.1 als die engere und aktuellere Angabe (siehe
Konfliktregeln in Abschnitt 7).

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
- Schlangenblockade: Der aktive Spieler wählt eine konkrete Zielschlange eines anderen Spielers und fügt ihr eine neutrale, nicht farbige Schlangenblockade-Karte hinzu, sofern der Zielspieler nicht mit Farbenschutz abwehrt.
- Farbendieb: Der aktive Spieler wählt eine **Farbkarte** aus einer gegnerischen Schlange und fügt sie an beliebiger Position in eine eigene Schlange ein. Sonderkarten sind nicht stehlbar. Die gestohlene Karte kann auch zwischen bereits vorhandenen Karten eingefügt werden; der Angriff kann mit Farbenschutz abgewehrt werden.
- Farbenschutz: Der aktive Spieler kann eine eigene aktive Schlange als `geschuetzt` markieren. Zusätzlich kann der betroffene Zielspieler Farbenschutz einmalig als Abwehr gegen gegnerische Angriffe einsetzen; im aktuellen R79-Engine-Scope ist diese Reaktion für Schlangengrube, Schlangenblockade, Farbendieb und Schlangenfrass umgesetzt.
- Schlangenfrass: Der aktive Spieler wählt genau 1 Karte aus einer eigenen Schlange oder genau 2 Karten aus gegnerischen Schlangen. Nur gegnerische geschützte Ziele lösen die Farbenschutz-Reaktionskette im Uhrzeigersinn aus; eigene Ziele werden immer sofort entfernt (keine Selbst-Reaktion).
- Farbenfusion: Der aktive Spieler wählt zwei nebeneinanderliegende Karten gleicher Farbe in einer eigenen Schlange aus und ersetzt sie durch die Farbenfusion-Karte. Die Fusion zählt als eine Punkteeinheit; für den Vielfaltbonus wird sie ignoriert.
- Verdoppler: Der aktive Spieler kann zu Beginn seiner Ausspielphase eine Verdopplerkarte spielen. Die Karte aktiviert für diesen Zug einen Bonuszug mit genau einer zusätzlichen Karte. Die zusätzliche Karte darf eine weitere Farbkarte oder eine weitere Sonderkarte sein; insgesamt sind dann bis zu 3 Karten möglich. Der Bonus gilt nur für den aktuellen Zug, und Verdoppler selbst zählt als Sonderkarte. Gegner können den Verdoppler mit Farbenschutz in der Reaktionskette abwehren.
- Regenbogenschlange: In der Wertungslogik wird sie als 0-Punkte-Wildcard der Farbe zugeordnet, die die betroffene Schlange maximal punktet.

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
- Spieler-Gesamtpunkte = Spieler-Farbgruppenpunkte + Spieler-Aufgabenpunkte.
- Die UI darf die Wertung pro Spieler zusätzlich in Farbgruppen- und Aufgabenpunkte aufschlüsseln.
- Spiel-Gesamtwertung wird über die Spieler-Liste des Spielzustands in stabiler Reihenfolge berechnet.

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
- Aktuell sind keine offenen normalen Sonderkartenwirkungen mehr vermerkt; weitere offene Regelfragen betreffen andere Bereiche.

### Geklärte Auslegungen

Diese Punkte sind entschieden und **keine** offenen Regelfragen. Sie stehen hier,
weil sie beim Lesen des Codes wie Lücken aussehen:

- **R3.5a — der Zustand `blockiert` wird von keiner Karte erzeugt** (02.08.2026).
  Die Schlangenblockade unterbricht die Farbgruppe, sie sperrt die Schlange
  nicht. Eine Änderung wäre eine Regeländerung und braucht eine bestätigte
  Normquelle.
- **R6.2a — „Lila Riese" und die Historie-Aufgaben.** Zwei Kartentexte sind am
  Tisch eindeutig, digital aber auslegungsbedürftig; die getroffene Auslegung
  steht in R6.2a.
