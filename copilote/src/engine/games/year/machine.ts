/** « Quelle année ? » utilise la machine commune des jeux « au plus proche ». */
export {
  initClosestRound,
  reduceClosest,
  skipClosest,
  restartClosest,
  type ClosestAction as YearAction,
  type ClosestRoundState as YearRoundState,
} from '../closest/machine.ts';
