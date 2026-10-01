/** Journal circulaire des 200 derniers événements et erreurs (consulté et exporté depuis le debug). */

export interface LogEntry {
  readonly at: number;
  readonly level: 'info' | 'warn' | 'error';
  readonly message: string;
  readonly data?: unknown;
}

const MAX = 200;
const entries: LogEntry[] = [];

export const logger = {
  log(level: LogEntry['level'], message: string, data?: unknown) {
    entries.push(
      data === undefined
        ? { at: Date.now(), level, message }
        : { at: Date.now(), level, message, data },
    );
    if (entries.length > MAX) entries.splice(0, entries.length - MAX);
    if (level === 'error') console.error(message, data);
  },
  info(message: string, data?: unknown) {
    logger.log('info', message, data);
  },
  warn(message: string, data?: unknown) {
    logger.log('warn', message, data);
  },
  error(message: string, data?: unknown) {
    logger.log('error', message, data);
  },
  entries(): readonly LogEntry[] {
    return entries;
  },
};
