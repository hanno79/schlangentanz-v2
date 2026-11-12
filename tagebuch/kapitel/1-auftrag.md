Das digitale Schlangentanz ist heute nicht spielbar. Die Engine weicht an über zwanzig Stellen von der Spielanleitung ab, die KI spielt stets die erste erlaubte Aktion, und die Oberfläche läuft nur auf dem Desktop. Der Auftrag ist ein regelkonformes Spiel, in dem ein Mensch gegen eine bis drei KI-Gegner antritt, auf Desktop, Tablet quer und Handy hochkant, mit Maus und Touch. Basis-Spiel und Erweiterung sind vor der Partie wählbar.

Einzige Regelquelle ist die Website schlangentanz.ch/rules. `docs/GAME_SPEC.md` spiegelt sie wörtlich; Dart, Release-Notizen und Slice-Pläne sind keine Regelquelle. Wo die Website etwas offenlässt, entscheidet der Autor, und erst danach entsteht Code dafür.

KI und Oberfläche entstehen neu. Die Engine behält ihren Aufbau, Zugablauf, Aktionsschicht, Abwehr und Speicherformat werden neu geschrieben. Es gibt eine solide KI ohne Stufen, die Kartenbilder kommen von schlangentanz.ch, alte Spielstände werden verworfen. Die Arbeit folgt `docs/UMSETZUNGSPLAN.md` in fünf Phasen bis zu den Meilensteinen M0 bis M4. `main` geht sofort in Produktion und bekommt nur Meilensteine nach Freigabe durch den Autor.

Nicht zum Auftrag gehört, Code aus dem alten Repository `schlangentanz-game`, aus Paperclip oder aus alten Vercel-Ständen zu übernehmen. Paperclip bleibt Archiv und ist kein Umsetzungsweg.
