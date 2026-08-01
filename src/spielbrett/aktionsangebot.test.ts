/*
Author: Claude Code (G-9)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Wie viele Aktionen die Seitenspalte zeigt — und welche.

Gemessen am 01.08.2026 auf `/game`, 1280×900, drei Spieler, nach acht Runden:
Die Aktionsliste war **8886 px** hoch — 45 Knöpfe in einer 423-px-Spalte, davon
allein 40 Varianten von „Schlangenfrass: X an Position Y". Der Wächter schwieg,
weil die Spalte scrollt: technisch erreichbar, praktisch 21 Bildschirme weit.

Die Engine enumeriert jede Kombination aus Handkarte und Ziel. Bei einem Gegner
fällt das nicht auf; bei zweien wächst es multiplikativ.

Zwei Regeln lösen das, ohne Regel 6 zu brechen (jede Aktion bleibt erreichbar):

1. Ist eine Handkarte gewählt, gehören nur *ihre* Aktionen in die Liste. Genau
   das hat der Spieler gerade ausgedrückt.
2. Ohne Auswahl wird gekürzt — aber sichtbar. Ein stiller Deckel liest sich wie
   Vollständigkeit; deshalb nennt das Angebot die Zahl der übrigen.
*/

import { describe, expect, it } from 'vitest'
import type { AktionsGruppe } from '../aktionsGruppen'
import { waehleAngebot } from './aktionsangebot'

function gruppe(handkartenId: string, typ = 'NeueSchlangeStarten'): AktionsGruppe {
  return { aktion: { typ, handkartenId } as AktionsGruppe['aktion'], anzahl: 1 }
}

describe('waehleAngebot', () => {
  it('zeigt bei gewählter Handkarte nur deren Aktionen', () => {
    const alle = [gruppe('a'), gruppe('b'), gruppe('a', 'KarteAnlegen'), gruppe('c')]

    const angebot = waehleAngebot(alle, 'a', 8)

    expect(angebot.eintraege).toHaveLength(2)
    expect(angebot.eintraege.every((e) => 'handkartenId' in e.aktion && e.aktion.handkartenId === 'a')).toBe(true)
    expect(angebot.weitere).toBe(0)
    expect(angebot.aufKarteGefiltert).toBe(true)
  })

  it('fällt auf das volle Angebot zurück, wenn die gewählte Karte nichts kann', () => {
    // Sonst stünde der Spieler vor einer leeren Liste und wüsste nicht, warum.
    const alle = [gruppe('a'), gruppe('b')]

    const angebot = waehleAngebot(alle, 'zauber-ohne-ziel', 8)

    expect(angebot.eintraege).toHaveLength(2)
    expect(angebot.aufKarteGefiltert).toBe(false)
  })

  it('kürzt ohne Auswahl auf die Höchstzahl und nennt den Rest', () => {
    const alle = Array.from({ length: 45 }, (_, index) => gruppe(`k${index}`))

    const angebot = waehleAngebot(alle, null, 8)

    expect(angebot.eintraege).toHaveLength(8)
    expect(angebot.weitere).toBe(37)
  })

  it('behält die empfohlene Aktion an erster Stelle', () => {
    const alle = [gruppe('empfohlen'), ...Array.from({ length: 20 }, (_, i) => gruppe(`k${i}`))]

    expect(waehleAngebot(alle, null, 8).eintraege[0]).toBe(alle[0])
  })

  it('kürzt nicht, solange das Angebot in die Höchstzahl passt', () => {
    const alle = [gruppe('a'), gruppe('b'), gruppe('c')]

    const angebot = waehleAngebot(alle, null, 8)

    expect(angebot.eintraege).toHaveLength(3)
    expect(angebot.weitere).toBe(0)
  })
})
