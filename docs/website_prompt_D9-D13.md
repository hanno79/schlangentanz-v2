# Prompt für den Website-Agenten: Entscheidungen D9–D13

Stand: 12.11.2026. Nach der Änderung auf der Website: `npm run abgleich:website -- --schreiben`,
dann in `docs/GAME_SPEC.md` Teil D bei D9–D13 „Website folgt" durch „Website geändert" ersetzen.

```text
Bitte passe auf schlangentanz.ch/rules (Spielanleitung inkl. Karten-Dialoge) folgende
Stellen an. Ändere nur die genannten Stellen und lass alles andere unverändert.
Gibt es weitere Sprachfassungen, passe sie sinngemäss gleich an.

=== 1. Karten in jede Schlange (Abschnitt „Spielablauf", Basis-Spiel) ===

- ALT: „Eine Farbkarte, um eine Schlange zu beginnen oder fortzusetzen (muss an einem
  beliebigen Ende der Schlange angelegt werden)"
  NEU: „Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange
  fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt
  werden)"
- ALT: „Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle
  eingefügt werden)"
  NEU: „Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle
  jeder Schlange eingefügt werden, auch bei einem Mitspieler)"

=== 2. Pflichtkarte (Abschnitt „Spielablauf", Absatz „Wichtig:") ===

- ALT: „Wichtig: Du musst immer mindestens eine Karte spielen. Wenn du nur Sonderkarten
  auf der Hand hast, musst du eine davon spielen, auch wenn sie keinen optimalen Effekt in
  deiner eigenen Schlange hat. In diesem Fall kannst du sie auch bei einem Gegner
  ausspielen."
  NEU: „Wichtig: Du musst immer mindestens eine Karte spielen. Welche, ist dir überlassen:
  Eine Sonderkarte allein genügt, auch wenn du eine Farbkarte hättest. Du darfst auch eine
  Sonderkarte spielen, die dir gerade nichts bringt. Hat sie kein mögliches Ziel, legst du
  sie ohne Wirkung auf deinen Ablagestapel; sie zählt dann als die Sonderkarte deines
  Zuges."
  Die folgenden Sätze („Hast du nur Farbenschutz-Karten auf der Hand …") bleiben.

=== 3. Farbenschutz wirkt gegen jede Sonderkarte ===

a) Abschnitt „Sonderkarten-Timing", Grundregeln:
   - ALT: „Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren. Eine
     andere Karte ist als Reaktion nicht erlaubt."
     NEU: „Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren. Das gilt
     für jede Sonderkarte, die ein Mitspieler gegen ihn oder in seine Schlange spielt.
     Gegen Farbkarten gibt es keine Abwehr. Eine andere Karte als Farbenschutz ist als
     Reaktion nicht erlaubt."
b) Dialog „Farbenschutz", Abschnitt „Wichtige Regeln":
   - ALT: „Schützt vor allen negativen Effekten von Sonderkarten"
     NEU: „Wirkt gegen jede Sonderkarte, die ein Mitspieler gegen dich oder in deine
     Schlange spielt, auch gegen Farbenfusion, Schlangenhäutung und Regenbogenschlange"
   - NEU anfügen: „Gegen Farbkarten gibt es keine Abwehr"

=== 4. Verdoppler ===

Dialog „Verdoppler", Abschnitt „Wichtige Regeln":
- NEU anfügen: „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen"

Zum Schluss: Prüfe, dass der Satz „In diesem Fall kannst du sie auch bei einem Gegner
ausspielen." nicht mehr vorkommt.
```
