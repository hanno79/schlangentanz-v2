// Typen zu scripts/pruefung/geraeteklassen.mjs, damit playwright.config.ts und die
// Tests dieselbe Quelle lesen wie das Fotoskript.

export type Geraeteklasse = {
  name: 'desktop' | 'tablet' | 'handy'
  titel: string
  viewport: { width: number; height: number }
  deviceScaleFactor: number
  hasTouch: boolean
  isMobile: boolean
}

export declare const GERAETEKLASSEN: ReadonlyArray<Geraeteklasse>
export declare function kontextOptionen(
  klasse: Geraeteklasse,
): Pick<Geraeteklasse, 'viewport' | 'deviceScaleFactor' | 'hasTouch' | 'isMobile'>
export declare function chromiumPfad(): string | undefined
