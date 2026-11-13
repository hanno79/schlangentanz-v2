import { hilfeId, reihe, type Kartenhilfe, type Textbaustein } from './typen'

/*
Die 15 Aufgaben aus A9 (Erweiterung): Bedingung und Punkte aus der Tabelle
„Verfügbare Aufgabenkarten“, dazu das Beispiel, wo die Spielanleitung eines hat.

Lila Riese: Das Kartenbild sagt „mindestens 3“, die Spielanleitung „min. 5“.
Es gilt die Spielanleitung; die Antwort des Autors (D3) steht als Ergänzung darunter.
*/

function aufgabe(name: string, punkte: number, bedingung: string, ...beispiel: Textbaustein[]): Kartenhilfe {
  return {
    karte: { typ: 'Aufgabenkarte', id: hilfeId(name), name, punkte, bedingung },
    quellen: ['A9'],
    kurz: bedingung,
    abschnitte: beispiel.length === 0 ? [] : [{ titel: 'Beispiel', inhalt: beispiel }],
  }
}

export const AUFGABEN_HILFE: readonly Kartenhilfe[] = [
  aufgabe(
    'Farbenpracht',
    8,
    'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.',
  ),
  aufgabe(
    'Farbharmonie',
    10,
    'Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.',
    'Ein Spieler hat zwei Schlangen. In Schlange 1 hat er: Blau - Blau - Blau - Rot - Rot - Rot - Grün - Grün - Grün. In Schlange 2 hat er: Gelb - Gelb - Gelb - Braun - Braun - Braun - Violett - Violett - Violett. Er erfüllt diese Aufgabe und erhält 10 Punkte.',
    reihe('Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Grün', 'Grün', 'Grün', 'Gelb', 'Gelb', 'Gelb', 'Braun', 'Braun', 'Braun', 'Violett', 'Violett', 'Violett'),
  ),
  aufgabe(
    'Farbkombination',
    5,
    'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
    'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Blau - Blau - Blau - Blau. Er erfüllt diese Aufgabe und erhält 5 Punkte.',
    reihe('Blau', 'Blau', 'Blau', 'Blau', 'Blau'),
  ),
  aufgabe(
    'Farbvielfalt',
    9,
    'Bilde eine Kette aus je einer Karte aller 6 Farben.',
    'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Braun - Violett - Grün. Er erfüllt diese Aufgabe und erhält 9 Punkte. Eine Regenbogenschlange oder eine Farbenfusion in der Kette würde als die Farbe zählen, die dem Spieler noch fehlt.',
    reihe('Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün'),
  ),
  aufgabe('Vielfaltskönig', 9, 'Habe in jeder deiner Schlangen min. 4 versch. Farben.'),
  aufgabe(
    'Farbwechsler',
    6,
    'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. Es müssen nicht einzelne Farben aufeinander folgen. Es gelten auch Reihen.',
    'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Rot - Gelb - Grün - Blau. Er erfüllt diese Aufgabe, da er vier verschiedene Farben direkt hintereinander in der Schlange liegen hat und erhält 6 Punkte.',
    reihe('Blau', 'Rot', 'Gelb', 'Grün', 'Blau'),
  ),
  aufgabe('Fusionsexperte', 6, 'Habe eine Schlange mit mindestens 2 Farbfusionen.'),
  aufgabe('Schlangenbeschwörer', 7, 'Habe min. 4 Sonderkarten in deinen Schlangen.'),
  aufgabe('Schlangenmeister', 4, 'Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.'),
  aufgabe('Schlangenrepertoire', 4, 'Spiele min. 5 versch. Arten von Sonderkarten aus.'),
  aufgabe(
    'Schlangenbändiger',
    7,
    'Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.',
    'Ein Spieler hat folgende Karten in seiner Schlange: Rot - Blau - Grün - Rot - Blau - Grün. Er erfüllt diese Aufgabe und erhält 7 Punkte.',
    reihe('Rot', 'Blau', 'Grün', 'Rot', 'Blau', 'Grün'),
  ),
  aufgabe(
    'Schlangentanz',
    7,
    'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.',
    'Ein Spieler hat folgende Karten in seiner Schlange: Blau - Grün - Grün - Blau - Grün - Rot - Rot - Violet - Violet - Rot - Violet. Er spielt die Sonderkarte Schlangenhäutung und wählt die letzten 5 Karten aus (Rot - Violet - Violet - Rot - Violet). Durch geschicktes Umordnen bildet er zwei neue Dreiergruppen: Blau - Grün - Grün - Blau - Grün - Rot - Rot - Rot - Violet - Violet - Violet. Er ruft "Schlangenspass!" und erfüllt die Aufgabe "Schlangentanz".',
    'Vorher:',
    reihe('Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Violett', 'Violett', 'Rot', 'Violett'),
    'Nachher:',
    reihe('Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett'),
  ),
  aufgabe(
    'Symmetriemeister',
    10,
    'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
    'Ein Spieler hat am Ende des Spiels folgende Schlange: Blau - Rot - Gelb - Grün - Grün - Gelb - Rot - Blau. Die erste Hälfte (Blau - Rot - Gelb - Grün) ist das Spiegelbild der zweiten Hälfte (Grün - Gelb - Rot - Blau). Der Spieler erhält 10 Punkte.',
    reihe('Blau', 'Rot', 'Gelb', 'Grün', 'Grün', 'Gelb', 'Rot', 'Blau'),
  ),
  aufgabe('Gelber Schatz', 5, 'Bilde eine Gruppe aus min. 6 gelben Karten.'),
  {
    ...aufgabe('Lila Riese', 5, 'Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.'),
    // Das Kartenbild sagt noch „mindestens 3“; die Antwort des Autors erklärt den Unterschied.
    ergaenzungen: [{ text: 'Website geändert: mindestens 5 violette Karten in einer Reihe.', quelle: 'D3' }],
  },
]
