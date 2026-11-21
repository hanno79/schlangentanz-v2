import type { Fabrik } from '../../src/ki/strategien/strategie'
import { erstelleSpionAnker } from './spion_anker'
import { erstelleSpionMap } from './spion_map'
import { erstelleSpionNewTarget } from './spion_newtarget'
import { erstelleSpionRuecksetzer } from './spion_ruecksetzer'

/** Registry der Gegenproben zum Isolationstest, aufgebaut wie src/ki/strategien/index.ts. */
export const SPIONE: Readonly<Record<string, Fabrik>> = {
  anker: erstelleSpionAnker,
  map: erstelleSpionMap,
  newTarget: erstelleSpionNewTarget,
  ruecksetzer: erstelleSpionRuecksetzer,
}
