// Typen zu scripts/pruefung/quelldateien.mjs für den Architekturtest.

import type ts from 'typescript'

export declare const CODE_ENDUNGEN: ReadonlySet<string>
export declare const TESTDATEI: RegExp
export declare function zuPosix(pfad: string): string
export declare function sammleDateien(wurzel: string, ordner: string): string[]
export declare function parse(pfad: string, quelltext: string): ts.SourceFile
export declare function zeileVon(knoten: ts.Node, pos?: number): number
