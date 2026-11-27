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
  auf den Karten. Nie für Fliesstext. Seit O11 als WOFF2 (12 statt 28 KB), mit
  fontTools aus der TTF von Google Fonts verpackt, die Glyphen unverändert.

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
  Von jeder Karte gibt es eine kleine Fassung, 240 px breit, 7 bis 16 KB, unter
  `public/karten-klein/` (`scripts/kartenbilder_zuschneiden.py --nur-klein`).
  Am Tisch bekommt `<Karte>` die Höchstbreite seines Bereichs als `sizes`, und
  der Browser lädt die kleine Fassung, solange sie für die Pixeldichte reicht;
  die Grossansicht nimmt immer die grosse.
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
  durchsichtigen Rand, 480 px hoch für dreifache Pixeldichte, 28 KB),
  `public/favicon.ico` (Schlangenkopf aus dem Logo,
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

1. **Kopfleiste:** wer dran ist, Zug und gespielte Karten, Zahl des
   Nachziehstapels, „Zur Lobby“. Der Entwurf aus O1 zeigt an dieser Stelle
   „Menü“; kein Task des Plans (O3 bis O8, O11) baut ein Menü, deshalb bleibt
   es bei „Zur Lobby“, bis eines geplant wird.
2. **Tischfläche** (scrollt senkrecht): Gegner mit Name, Zahl der Handkarten,
   Punkten, oberster Karte ihres Ablagestapels und ihren Schlangen; Tischmitte mit
   Nachziehstapel und Zahl, offene Aufgaben; deine Auslage (geheime Aufgabe,
   Comeback, Risiko-Karten, Ablage), darunter das Protokoll. Gegner stehen auf
   dem Handy untereinander, ab 700 px nebeneinander. Ab 1100 px steht das
   Protokoll rechts neben Gegnern, Mitte und Auslage und beginnt oben, damit es
   ohne Scrollen mehr als zwei, drei Einträge zeigt (O11).
3. **Unten fest, weiss abgesetzt:** deine Schlangen mit deinen Punkten neben dem
   Titel (scrollen in sich, wenn sie sehr lang werden), deine Hand und die
   Zugleiste. Ab 700 px steht die
   Zugleiste rechts neben Schlangen und Hand (22rem, ab 1000 px 26rem) und zeigt
   die gewählte Karte gross.
   Auf dem Handy hochkant steht sie über deinen Schlangen: So bleibt die Hand am
   unteren Rand, auch wenn die Leiste mit einer gewählten Karte wächst. Im Handy
   quer steht sie links unter der Tischfläche, weil rechts deine Schlangen und
   die Hand die ganze Höhe brauchen.

Schlangen der Gegner brechen bei Platzmangel um, statt die Seite zu
verbreitern; der Zeilenabstand (10 px) lässt Platz für die Balken. Karten einer
Farbgruppe tragen einen durchgehenden Balken direkt unter der Karte; eine
Farbenfusion zeigt die zwei Karten, auf denen sie liegt, als halbe Karten unter
diesem Balken. **Deine Schlangen** stehen immer als je eine Zeile, die seitlich
scrollt, wenn sie zu lang wird: So sind beide in der Höhe stets ganz zu sehen,
mit Fusionskarten und Balken. Die Zahl des Nachziehstapels steht zusätzlich in
der Kopfleiste („Stapel 68“), damit man sie ohne Scrollen liest.

**Geht weiter:** Jeder Bereich, der scrollt (Schlangen als Zeilen, die Hand mit
mehr als fünf Karten in Handy quer, die Tischfläche), zeigt an jedem Rand, hinter
dem noch etwas liegt, ein Zeichen: einen Verlauf in den Grund der Fläche und
darauf ein Abzeichen in Weiss mit Linie, an einer Zeile „+3 ›“ (so viele Karten
liegen noch hinter dem Rand, links „‹ +3“), an der Tischfläche „mehr ↓“ bzw.
„mehr ↑“. Es nimmt keine Klicks an und wird nicht vorgelesen (die Kartenzahl
steht im Namen der Schlange). Auf Touch-Geräten gibt es keinen Scrollbalken;
ohne dieses Zeichen sähe eine Zeile, deren Rand zwischen zwei Karten liegt, aus
wie zu Ende. Im Querformat bis 380 px Höhe (etwa 740×360) werden die Karten
etwas kleiner, damit deine zwei Schlangen samt Fusion über der Hand Platz haben.

**Handy** (schmaler als 700 px, oder niedriger als 500 px im Querformat): Auch
die Schlangen der Gegner stehen als kompakte Zeilen, die seitlich scrollen.
**Handy quer** (niedriger als 500 px im Querformat): Dein Platz steht rechts
neben der Tischfläche und reicht über die ganze Höhe, deine Schlangen oben und
die Hand unten in dieser Spalte; die Kopfleiste steht nur über der Tischfläche.
Dein Platz ist 26rem breit, höchstens aber 55 % des Fensters. Unter den
Geräteklassen (568 × 320) bleibt der Tischfläche so genug Breite; die
Kopfleiste stellt dort die Statuszeile in eine eigene Zeile, statt sie Wort für
Wort umzubrechen, und ab 340 px Höhe abwärts werden deine Karten und
Handkarten noch etwas kleiner. Passen Kopfleiste, Tischfläche und Zugleiste
nicht übereinander ins Fenster (568 × 320 im eigenen Zug), wird der Tisch höher
als das Fenster und die Seite scrollt; die Tischfläche behält 8rem. Ab 340 px
Höhe abwärts steht der Grund neben einem gesperrten Knopf über ihm statt
daneben (TF-TISCH-049).
Alle Karten haben Handygrösse. **Hand:** Die Handkarten teilen sich die Breite
der Hand (höchstens so gross wie in der Tabelle, mindestens 44 px), damit bei
fünf und mehr Karten keine angeschnitten ist.

## Komponenten

Jede Komponente kennt Ruhe, Hover (Maus), Fokus (Tastatur: doppelter Ring aus
Weiss und Tinte, `--fokus-ring`) und, wo es sie gibt, Gewählt und Gesperrt.

- **Hauptknopf** (`knopf--haupt`): Akzentfläche, weisse Schrift. Höchstens einer
  je Bildschirm (Lobby: „Weiterspielen“; Ergebnis: „Noch einmal“; Tisch:
  „Ausführen“).
- **Zweitknopf** (`knopf--zweit`): weisse Fläche, Akzent-Rand und -Schrift.
- **Leiser Knopf** (`knopf--leise`): nur Text, Tischfarbe beim Hover.
- Alle Knöpfe mindestens 44 × 44 px. Gesperrt: halbe Deckkraft, kein Hover,
  und daneben steht, warum. Gesperrt liegt ihr Text deshalb unter 4,5 : 1
  (etwa 2,4 : 1); WCAG 1.4.3 nimmt inaktive Bedienelemente vom
  Kontrastverhältnis aus, der Grund daneben erreicht es.
- **Segmente** (Gegnerzahl): Knöpfe mit `aria-pressed`, der gewählte in
  Akzentfarbe und mit Haken (✓). In sehr flachen Fenstern im Querformat
  (bis 22rem hoch, etwa 568 × 320) steht der Kopf der Lobby als eine Zeile über
  dem Inhalt, Gegnerzahl und Erweiterung nebeneinander, damit Partie, Wahl und
  Rückfrage ohne Scrollen ins Bild passen. Knöpfe brechen nie mitten im Wort um.
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
  4 px Akzent-Umrandung (innen, damit eine scrollende Hand sie nicht
  abschneidet). Eine Karte, die die Engine gerade nicht spielen lässt, ist
  gesperrt: halbe Deckkraft, im Namen „(jetzt nicht spielbar)“. Ist ein Gegner
  dran, zeigt die Hand nur Bilder.
- **Angebotenes Ziel:** gestrichelte Akzent-Umrandung auf `--farbe-akzent-hell`.
  Gewählt: durchgezogene Umrandung in Tinte. Schlangenenden erscheinen als
  Felder mit „+“ links und rechts der Schlange, Lücken (Schlangenblockade,
  Regenbogenschlange, Platz für den Farbendieb) als Felder „+“ zwischen den
  Karten. Ist die ganze Schlange das Ziel, liegt eine gestrichelte Fläche über
  ihr; gewählt ist sie in Tinte umrandet. Karten als Ziel sind Knöpfe um die
  Karte, mindestens 44 px breit. Ein Gegner als Ziel bekommt „Wählen“ im Kopf,
  deine Ablage wird zum Ziel, wenn eine Karte ohne Wirkung abgelegt wird, und
  „+ Neue Schlange“ steht neben „Deine Schlangen“. Liegt ein Ziel hinter dem
  Rand einer scrollenden Zeile, sagt das Zeichen am Rand „Ziel“ und trägt die
  Farbe der Ziele.
- **Kartenknopf** (offene Aufgabe, Auslage): öffnet die Grossansicht.
- **Grossansicht** (`<dialog>`, `src/ui/karten/Grossansicht.tsx`): die Karte so
  gross, wie der Schirm erlaubt (bis 360 px breit), mit ihrem Text aus der
  Spielanleitung, darunter „Schliessen“; Escape und Tippen daneben schliessen
  auch. Am Tisch dieselbe wie unter `/regeln`.
- **Zugleiste:** ein Satz, was jetzt zu tun ist, darunter die möglichen
  Schritte („Zug beenden“, „Ansehen“, „Abbrechen“, „Ausführen“, der Hauptknopf
  zuletzt). Ist die Auswahl vollständig, steht dort die Ansage („Ansage: Rot an
  das Ende der Schlange 1 von KI-Gegner 1.“), und erst „Ausführen“ spielt sie.
  „Zug beenden“ ist gesperrt, bis die Engine es erlaubt; daneben steht dann
  ihr Grund (`zugBeendenGesperrt`, etwa „Spieler 1 muss erst mindestens eine
  Karte spielen; …“), auch mit gewählter Karte. Nur in Handy quer entfällt ein
  gesperrtes „Zug beenden“ samt Grund, solange eine Karte gewählt ist: Dort nahm
  der dreizeilige Grund der Tischfläche die meiste Höhe (O11); nach
  „Abbrechen“ oder „Ausführen“ steht es wieder da. Die Möglichkeiten des
  Schlangenfrass stehen hier als Knöpfe. Lehnt die Engine eine Aktion ab, steht
  ihr Grund in `--farbe-fehler` darunter. In der Tab-Reihe kommt die Leiste vor
  deinen Schlangen und deiner Hand.
- **Schlangenhäutung** (O7): Nach der Karte wählt man die Schlange wie bei der
  Schlangenblockade, dann tippt man die Karten an beiden Enden des Abschnitts
  an. Angeboten sind nur Karten, die mit einer anderen einen Abschnitt bilden,
  den die Engine nennt; die erste bleibt gedrückt. Danach sind die Karten des
  Abschnitts Ziele in der Schlange: Zwei antippen tauscht sie, die Pfeiltasten
  links und rechts verschieben die Karte mit dem Fokus. Die Schlange zeigt die
  neue Anordnung mit den Farbgruppen, die die Engine danach wertet. Die
  Zugleiste nennt die Punkte des Besitzers vorher und nachher und, sobald die
  Farbfolge neu ist, die Ansage. Solange sie gleich ist, steht „Ausführen“
  gesperrt in der Reihe der Knöpfe, und der Satz darüber nennt den Grund
  (D26); eine eigene Zeile mit dem Grund nähme der Tischfläche in Handy quer
  so viel Höhe, dass das Zeichen „mehr ↑“ die Karten des Gegners verdeckte.
  „Abbrechen“ zeigt die Schlange wieder, wie sie liegt.
- **Erweiterung** (O10): Comeback- und Risiko-Karte beginnen mit Knöpfen in der
  Zugleiste („Comeback einsetzen“, „Risiko spielen“), ebenso „2 abwerfen,
  3 ziehen“, solange nichts gewählt ist und die Engine sie anbietet. Die vier
  Risiko-Aktionen, die Boni des Korbs und die Möglichkeiten einer Entscheidung
  stehen als Ziele nebeneinander (mindestens 5rem breit, Text trennt nach Silben
  und bricht im Knopf um), damit die Leiste in Handy quer niedrig bleibt; ihre kurzen Namen ergänzt
  danach die Ansage. Nennt eine Möglichkeit eine Karte (die angesagte Karte,
  eine Karte deiner Ablage), trägt der Knopf ein kleines Bild und den kurzen
  Namen. Die benannte Karte einer Risiko-Aktion tippt man in Hand oder Schlange
  an, die zusätzliche Farbkarte wie sonst mit Karte und Ende. Beim Tausch des
  Korbs tippt man erst die Karte der Schlange (sie bleibt gedrückt), dann die
  Handkarte. Solange du über eine Entscheidung wählst, gibt es kein „Zug
  beenden“; die Statuszeile sagt „Du entscheidest.“ Eine erfüllte Aufgabe
  meldet eine Zeile in Erfolgsfarbe in der Zugleiste, bis du wieder handelst.
  Deine Auslage zeigt „einsetzbar“ nur, wenn die Engine die Comeback-Karte
  jetzt anbietet; eine verbrauchte liegt umgedreht da (Rückseite, A8.1) und
  heisst „verbraucht“. Die Statuszeile nennt die noch übrigen Zusatzaktionen; erfüllte Aufgaben
  stehen darunter, beim Gegner als Zeile im Kopf mit seiner Auslage. Eine
  aufgedeckte Karte liegt in der Tischmitte unter „Aufgedeckt“.
- **Dialog „Zu viele Handkarten“** (`<dialog>`): alle Handkarten als Knöpfe,
  wie viele abzulegen sind, „Gewählt: n von m“, „Zum Tisch“ und „Ablegen“
  (Hauptknopf, gesperrt mit dem Grund daneben, bis genau so viele gewählt
  sind). „Zum Tisch“ und Escape schliessen ihn, ohne die Wahl zu verlieren;
  „Karten wählen“ in der Zugleiste öffnet ihn wieder.
- **Kopf- und Aktionsleiste:** weisse Leisten oben und unten; die Aktionsleiste
  trägt die Knöpfe eines Bildschirms rechtsbündig, den Hauptknopf zuletzt.
- **Punkte am Tisch:** der Zwischenstand der Engine ohne Kettenbonus, bei den
  Gegnern im Kopf, bei dir neben „Deine Schlangen“ („12 Punkte“, halbfett);
  „Zwischenstand ohne Kettenbonus“ wird davor vorgelesen.
- **Rangliste:** ein Eintrag je Spieler mit Platz, Name, Gesamtpunkten und den
  Posten Farbgruppen, Vielfalt, Längste Kette, Aufgaben; ohne Erweiterung
  entfallen Vielfalt und Aufgaben. Jeder Sieger trägt das Abzeichen „Sieger“ und
  einen Akzent-Rand, bei Gleichstand alle. Darunter, durch eine Linie
  getrennt, woher die Zahlen kommen: je Schlange die Karten mit den Balken der
  Gruppen (wie am Tisch, in Gegnergrösse), jede Gruppe als „Rot × 3: 3 Punkte“,
  jeder Joker als „Regenbogenschlange als Rot“ oder „… in keiner Gruppe“, mit
  Erweiterung die Farben für den Vielfaltbonus, dann die längste Kette und die
  Aufgaben.
- **Ergebnis** (`/spiel` nach Spielende, `src/ui/ergebnis/`): Der Titel nennt
  den Sieger („Du gewinnst!“, „KI-Gegner 2 gewinnt!“, „Gleichstand: Du und
  KI-Gegner 1 gewinnen!“), darunter die höchste Punktzahl und, wenn du nicht
  gewonnen hast, dein Platz. Es folgt die Rangliste, am Fuss „Zur Lobby“
  (Zweitknopf) und „Noch einmal“ (Hauptknopf). Die Seite ist so hoch wie das
  Fenster, und wie im Entwurf scrollt nur die Rangliste, mit „mehr ↓“ und
  „mehr ↑“ am Rand; Titel und Knöpfe bleiben im Bild. Die Spalte ist 48rem breit
  statt 32rem wie in der Lobby. In der Lobby steht eine beendete Partie als „Letzte
  Partie: …, beendet“ mit dem Zweitknopf „Ergebnis ansehen“.

## Bewegung

Übergänge dauern `--dauer` (150 ms) und entfallen bei „weniger Bewegung“
(`prefers-reduced-motion`, dann 0 ms). Die KI-Gegner warten dann statt 700 ms
nur eine kleine feste Mindestpause (100 ms), nicht 0: Sonst verriete die
Rechenzeit der KI, ob sie einen Farbenschutz hält.

## Barrierefreiheit (O11)

- **Vorlesen:** Am Tisch liest genau eine Stelle von selbst vor, der Ansager
  (`src/ui/tisch/Ansager.tsx`, nicht zu sehen): der jüngste Schritt aus dem
  Protokoll (Gegnerzug, Angriff, Abwehr, erfüllte Aufgabe, auch deine eigene
  Aktion) und, wenn du entscheidest, was jetzt zu tun ist, bei einer
  Abwehrfrage mit dem Hinweis auf den Farbenschutz; fehlt die Ansage im
  Protokoll (nach dem Neuladen), nennt er auch sie. Statuszeile, Satz der
  Zugleiste und Protokoll lesen nicht selbst vor, sonst hörte man alles doppelt.
  Nach dem Spielende liest die Wertung vor, wer gewinnt und mit wie vielen
  Punkten, und der Fokus steht auf ihrem Titel.
- **Fokus:** Verschwindet der Knopf mit dem Fokus („Ausführen“, deine
  Handkarten, wenn ein Gegner dran ist), springt der Fokus auf den ersten
  bedienbaren Knopf der Zugleiste, sonst auf deine erste spielbare Handkarte,
  sonst auf die Zugleiste selbst (`src/ui/tisch/fokus.ts`). Ein Bereich, der
  gerade scrollt (Tischfläche, Schlangen als Zeile, Hand, Rangliste), nimmt den
  Fokus an; sein Ring liegt innen, ebenso eine Linie innen an Knöpfen in einer
  scrollenden Zeile, deren äusseren Ring die Zeile abschneidet. Holt die
  Tastatur ein Element in einem scrollenden Bereich, scrollt es ganz ins Bild,
  mit so viel Rand (`scroll-padding`), dass kein Zeichen „geht weiter“ darauf
  liegt. In Tablet und Desktop steht die Zugleiste rechts neben deinem Platz,
  kommt in der Tab-Reihe aber vor ihm: Eine Reihenfolge im Quelltext kann nicht
  allen Anordnungen folgen, und der Satz, was zu tun ist, gehört vor die Karten.
- **Nicht nur Farbe:** Gewählte Gegnerzahl in der Lobby und ein
  eingeschaltetes „Schneller“ tragen zusätzlich einen Haken (✓), der nicht
  vorgelesen wird; den Zustand sagen Auswahlfeld und `aria-pressed`.
- **Gemessen** wird in allen fünf Geräteklassen: axe ohne Befund der Stufen
  „serious“ und „critical“, Kontrast ab 4,5 : 1, bei „weniger Bewegung“ kein
  Übergang, sichtbarer Fokus an jedem Tab-Halt (`tests/layout/barrierefreiheit*`,
  `tastatur.hooks.spec.ts`).

## Bildquellen und Lizenzen

| Was | Quelle | Lizenz |
|---|---|---|
| Kartenbilder, Logo | schlangentanz.ch (Autor des Spiels) | Eigentum des Autors, für dieses Spiel |
| Inter | schlangentanz.ch, Original github.com/rsms/inter | SIL OFL 1.1, `public/schrift/OFL-Inter.txt` |
| Lilita One | github.com/google/fonts, Glyphen unverändert, als WOFF2 verpackt | SIL OFL 1.1, `public/schrift/OFL-LilitaOne.txt` |
| Kartenrückseite | selbst gebaut (SVG) | Platzhalter dieses Projekts |
