# Design

Gilt für jede Oberflächenarbeit in diesem Projekt. Grundlage sind die
Baseline-Designprinzipien; darunter steht, was für dieses Projekt gilt. Die
Werte stehen als CSS-Variablen in `src/ui/tokens.css`; neue Oberflächen
benutzen nur diese Variablen. Wie das zusammen aussieht, zeigen die Entwürfe
unter `/dev/entwurf` (Lobby, Tisch, Ergebnis; nur im Dev-Server und im
Testhook-Build).

## Prinzipien

- Keine blau-violetten Verläufe.
- Eine tragende Farbe, dazu Neutraltöne; weitere Farben nur mit Bedeutung.
- Höchstens zwei Schriftfamilien, eigenständig gewählt und zum Thema passend.
- Symbole sparsam; ohne Beschriftung nur, wenn sofort lesbar.
- Grosszügiger Weissraum, eine durchgehaltene Abstandsskala.

Für dieses Spiel kommt hinzu:

- **Die Karten sind die Farbe.** Die Kartenbilder des Autors sind bunt, kräftig
  und tragen das Spiel. Alles drumherum bleibt ruhig und warm, damit keine
  Fläche mit einer Karte um Aufmerksamkeit konkurriert und keine Farbe der
  Oberfläche mit einer Kartenfarbe verwechselt wird.
- **Der Mensch sitzt unten.** Eigene Schlangen, Hand und Zugleiste stehen fest
  am unteren Rand, auf dem Handy wie am Desktop. Was nicht passt (Gegner,
  Tischmitte, Auslage), scrollt in einem eigenen Bereich darüber. Die Seite
  selbst scrollt nie waagrecht.
- **Karte wählen, dann Ziel wählen.** Mit Maus und Finger gleich. Was wählbar
  ist, ist hervorgehoben und mindestens 44 × 44 px gross.

## Hell oder dunkel

**Nur hell.** `color-scheme: light`; `prefers-color-scheme` wird bewusst nicht
ausgewertet. Gründe:

- Die Kartenbilder haben helle, fast weisse untere Hälften und einen hellgrauen
  Verlauf. Auf dunklem Grund leuchten sie als grelle Flecken, und die feinen
  Kartenränder verschwinden.
- Die Website des Autors ist hell; Spiel und Website sollen zusammengehören.
- Jede zweite Farbwelt verdoppelt die Prüfung in drei Geräteklassen, ohne dass
  das Spiel dadurch besser lesbar würde.

Gegen das Blenden am Abend ist der Seitengrund kein reines Weiss, sondern ein
warmes, gedämpftes Papier (`--farbe-grund`).

## Palette

Tragende Farbe ist **Kürbis**, das Orange aus Logo und Website des Autors
(dort `#F97316`). Für Text und Flächen mit weisser Schrift ist es abgedunkelt,
damit der Kontrast reicht. Orange ist keine der sechs Kartenfarben, also nie
mit einer Karte zu verwechseln.

| Variable | Wert | Zweck | Kontrast |
|---|---|---|---|
| `--farbe-akzent` | `#C2410C` | Hauptknopf, Auswahl, Ziel-Umrandung | Weiss darauf 5,2 : 1 |
| `--farbe-akzent-stark` | `#9A3412` | Titel, Text in Akzentfarbe, Hover | auf Grund 6,8 : 1 |
| `--farbe-akzent-hell` | `#FFEDD5` | Fläche eines angebotenen Ziels | Tinte darauf 13,7 : 1 |
| `--farbe-auf-akzent` | `#FFFFFF` | Schrift auf Akzent | |

Neutraltöne, warm wie das Papier der Aufgabenkarten:

| Variable | Wert | Zweck |
|---|---|---|
| `--farbe-grund` | `#FBF6EE` | Seitengrund |
| `--farbe-flaeche` | `#FFFFFF` | Flächen, eigener Bereich am Tisch |
| `--farbe-tisch` | `#F1E7D6` | Tischfläche, Segmente |
| `--farbe-linie` | `#E0D3BF` | Rahmen und Trennlinien |
| `--farbe-tinte` | `#2B211C` | Text (14,6 : 1 auf Grund) |
| `--farbe-tinte-leise` | `#6B5B4E` | Nebentext (6,0 : 1 auf Grund, 5,3 : 1 auf Tisch) |

Signalfarben, je mit heller Fläche für Hinweise:

| Variable | Wert | Zweck |
|---|---|---|
| `--farbe-erfolg` / `-hell` | `#166534` / `#E9F5EC` | Schalter „An“, erfüllte Aufgabe |
| `--farbe-warnung` / `-hell` | `#92400E` / `#FEF3C7` | Hinweise, Entwurfsmeldungen |
| `--farbe-fehler` / `-hell` | `#B91C1C` / `#FDECEC` | Fehlermeldungen |

Text erreicht überall mindestens 4,5 : 1; die Layout-Verträge messen das
(`tests/layout/waechter.ts`). Farbe ist nie das einzige Merkmal: Ein Sieger
trägt das Abzeichen „Sieger“, ein Schalter zeigt „An“ oder „Aus“, eine
gewählte Karte ist angehoben und umrandet.

## Schrift

Beide Schriften liegen unter `public/schrift/` mit ihrer Lizenz (SIL Open Font
License 1.1), eingebunden in `src/ui/tokens.css`. Keine fremden Server.

- **Inter** (`--schrift-text`) für allen Text. Dieselbe Schrift wie auf der
  Website des Autors (die Dateien stammen von dort, Schnitte 400, 600, 700),
  sehr gut lesbar in kleinen Grössen auf dem Handy.
- **Lilita One** (`--schrift-titel`) nur für Titel, Spielernamen in der
  Kopfleiste und grosse Zahlen. Rund, kräftig und verspielt wie die Beschriftung
  auf den Karten. Nie für Fliesstext.

| Variable | Grösse | Verwendung |
|---|---|---|
| `--groesse-klein` | 0,875 rem | Nebentext, Bereichstitel, Zähler |
| `--groesse-text` | 1 rem | Text, Knöpfe |
| `--groesse-gross` | 1,25 rem | Zwischentitel, Punkte |
| `--groesse-titel` | 1,75 rem | Seitentitel |
| `--groesse-titel-gross` | 2,5 rem | Lobby-Titel, Sieger |

Zeilenhöhe 1,45 für Text, 1,1 für Titel.

## Abstände

Eine Skala, sonst nichts: `--abstand-1` bis `--abstand-7` = 4 / 8 / 12 / 16 /
24 / 32 / 48 px. Seitenränder auf dem Handy 16 px, zwischen Karten einer
Schlange 3 px (6 px, solange Ziele angeboten werden, damit die Umrandungen
nicht ineinanderlaufen).

## Radien und Schatten

| Variable | Wert | Verwendung |
|---|---|---|
| `--radius-klein` | 6 px | Segmente, Ziel-Felder |
| `--radius` | 12 px | Knöpfe, Gegner-Kästen, Ranglisten-Einträge |
| `--radius-gross` | 20 px | Flächen, Grossansicht |
| `--radius-voll` | rund | Schalter, Abzeichen |
| `--radius-karte` | 6 % / 4 % | Rahmen um eine Karte (wächst mit der Karte) |
| `--schatten-flaeche` | flach | Flächen auf dem Grund |
| `--schatten-erhoben` | weich, tief | Sieger, Grossansicht |
| `--schatten-karte` | `drop-shadow` | Karten (folgt den runden Ecken im Bild) |

Schatten sind warm getönt (aus `--farbe-tinte`), nie grau-blau.

## Karten

- **Bilder:** `public/karten/`, von schlangentanz.ch, zugeschnitten mit
  `scripts/kartenbilder_zuschneiden.py` (Aufruf und Quelle stehen im Skript).
  Farb- und Sonderkarten verlieren den grauen Rand, die Ecken werden
  durchsichtig. Aufgaben, Comeback und Risiko-Belohnung sind randlos gestaltet
  und werden nur auf dasselbe Format gebracht. Alle Karten haben das
  Seitenverhältnis 470 : 766 (`--kartenverhaeltnis`), WebP, 20 bis 70 KB.
- **Zuordnung:** `src/ui/karten/kartenbilder.ts` (Name in der Engine → Datei).
  Ein unbekannter Name wirft einen Fehler, statt ein leeres Bild zu zeigen.
- **Komponente:** `<Karte karte={…} />` aus `src/ui/karten/Karte.tsx`. Die
  Breite setzt der umgebende Bereich mit `--karte-breite`, die Höhe folgt aus
  dem Format. Der Alt-Text sagt die Karte an, wie ein Mensch sie nennt
  („Farbkarte Blau, 1 Punkt“, „Sonderkarte Farbendieb“, „Aufgabe Lila Riese,
  5 Punkte: …“); er kommt aus `src/ui/karten/kartentexte.ts`.
- **Rückseite:** `public/karten/rueckseite-platzhalter.svg` ist ein selbst
  gebauter Platzhalter (Schuppenmuster, Schlange im Oval, Farben aus der
  Palette). Liefert der Autor eine eigene Rückseite, wird nur diese Datei
  ersetzt und `RUECKSEITE_BILD` in `kartenbilder.ts` auf den neuen Namen
  gesetzt.
- **Logo und Favicon:** `public/karten/logo.webp` (Logo der Website, ohne
  durchsichtigen Rand), `public/favicon.ico` (Schlangenkopf aus dem Logo,
  16 bis 64 px) und `public/apple-touch-icon.png` (ganzes Logo auf
  `--farbe-grund`).
- **Grössen am Tisch** (Breite der Karte):

  | Bereich | Handy | ab 700 px | ab 1100 px |
  |---|---|---|---|
  | Gegner-Schlangen | 30 px | 34 px | 40 px |
  | Eigene Schlangen | 36 px | 48 px | 56 px |
  | Tischmitte, Auslage | 44 px | 52 px | 60 px |
  | Hand | 64 px | 80 px | 96 px |

  Was gewählt werden kann, ist mindestens 44 px breit, auch wenn die Karte
  sonst kleiner ist. Zum Lesen gibt es die Grossansicht.

## Tisch

Von oben nach unten, in allen Geräteklassen dieselbe Reihenfolge:

1. **Kopfleiste:** wer dran ist, Zug und gespielte Karten, „Menü“.
2. **Tischfläche** (scrollt senkrecht): Gegner mit Name, Zahl der Handkarten,
   oberster Karte ihres Ablagestapels und ihren Schlangen; Tischmitte mit
   Nachziehstapel und Zahl, offene Aufgaben; deine Auslage (geheime Aufgabe,
   Comeback, Risiko-Karten, Ablage). Gegner stehen auf dem Handy untereinander,
   ab 700 px nebeneinander.
3. **Unten fest, weiss abgesetzt:** deine Schlangen (scrollen in sich, wenn sie
   sehr lang werden), deine Hand und die Zugleiste. Ab 700 px steht die
   Zugleiste rechts neben Schlangen und Hand und zeigt die gewählte Karte gross.

Schlangen brechen bei Platzmangel um, statt die Seite zu verbreitern. Karten
einer Farbgruppe tragen einen durchgehenden Balken darunter.

## Komponenten

Jede Komponente kennt Ruhe, Hover (Maus), Fokus (Tastatur: doppelter Ring aus
Weiss und Tinte, `--fokus-ring`) und, wo es sie gibt, Gewählt und Gesperrt.

- **Hauptknopf** (`knopf--haupt`): Akzentfläche, weisse Schrift. Höchstens einer
  je Bildschirm (Lobby: „Weiterspielen“; Ergebnis: „Neue Partie“; Tisch:
  „Ausführen“).
- **Zweitknopf** (`knopf--zweit`): weisse Fläche, Akzent-Rand und -Schrift.
- **Leiser Knopf** (`knopf--leise`): nur Text, Tischfarbe beim Hover.
- Alle Knöpfe mindestens 44 × 44 px. Gesperrt: halbe Deckkraft, kein Hover,
  und daneben steht, warum.
- **Segmente** (Gegnerzahl): Knöpfe mit `aria-pressed`, der gewählte in
  Akzentfarbe.
- **Schalter** (Erweiterung): `role="switch"`, Schiene mit Knopf und dem Wort
  „An“ oder „Aus“; an ist grün.
- **Fläche:** weiss, 1 px Linie, grosser Radius, flacher Schatten. Gruppiert
  einen Abschnitt mit Titel.
- **Hinweis:** Fläche in einer Signalfarbe mit Text, `role="status"`.
  Fehlermeldungen in `--farbe-fehler` auf `--farbe-fehler-hell`, mit Grund und
  einem Weg zurück (etwa „Zur Lobby“).
- **Leerzustand:** sagt in einem Satz, was fehlt („Noch keine Schlange“,
  „Ablage leer“), in `--farbe-tinte-leise`; nie eine leere Fläche ohne Text.
- **Laden:** Karten haben ihre Grösse schon vor dem Bild (`width`/`height`),
  nichts springt. Längeres Laden zeigt „Lädt …“ an der Stelle des Inhalts.
- **Handkarte:** Knopf um die Karte, `aria-pressed`. Gewählt: 8 px angehoben,
  4 px Akzent-Umrandung.
- **Angebotenes Ziel:** gestrichelte Akzent-Umrandung auf `--farbe-akzent-hell`.
  Gewählt: durchgezogene Umrandung in Tinte. Schlangenenden erscheinen als
  Felder mit „+“ links und rechts der Schlange.
- **Kartenknopf** (offene Aufgabe, Auslage): öffnet die Grossansicht.
- **Grossansicht** (`<dialog>`): die Karte so gross, wie der Schirm erlaubt
  (bis 360 px breit), darunter „Schliessen“; Escape und Tippen daneben
  schliessen auch.
- **Zugleiste:** ein Satz, was jetzt zu tun ist, darunter die möglichen
  Schritte („Ansehen“, „Abbrechen“, „Ausführen“, „Zug beenden“). Wird
  vorgelesen, wenn sie sich ändert (`aria-live`).
- **Kopf- und Aktionsleiste:** weisse Leisten oben und unten; die Aktionsleiste
  trägt die Knöpfe eines Bildschirms rechtsbündig, den Hauptknopf zuletzt.
- **Rangliste:** ein Eintrag je Spieler mit Platz, Name, Gesamtpunkten und den
  Posten Farbgruppen, Vielfalt, Längste Kette, Aufgaben. Der Sieger trägt das
  Abzeichen „Sieger“ und einen Akzent-Rand.

## Bewegung

Übergänge dauern `--dauer` (150 ms) und entfallen bei „weniger Bewegung“
(`prefers-reduced-motion`, dann 0 ms).

## Bildquellen und Lizenzen

| Was | Quelle | Lizenz |
|---|---|---|
| Kartenbilder, Logo | schlangentanz.ch (Autor des Spiels) | Eigentum des Autors, für dieses Spiel |
| Inter | schlangentanz.ch, Original github.com/rsms/inter | SIL OFL 1.1, `public/schrift/OFL-Inter.txt` |
| Lilita One | github.com/google/fonts, unverändert | SIL OFL 1.1, `public/schrift/OFL-LilitaOne.txt` |
| Kartenrückseite | selbst gebaut (SVG) | Platzhalter dieses Projekts |
