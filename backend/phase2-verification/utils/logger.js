const formatMeta = (meta = {}) =>
  Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

export const logger = {
  info(message, meta = {}) {
    console.log(`[verification] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta = {}) {
    console.warn(`[verification] ${message}${formatMeta(meta)}`);
  },
  error(message, meta = {}) {
    console.error(`[verification] ${message}${formatMeta(meta)}`);
  },
};
