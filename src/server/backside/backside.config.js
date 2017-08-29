import url from 'url';

export const DEFAULT_URL = 'http://localhost:8888';

export function parseBacksideUrl(str) {
  const parsed = url.parse(str);
  const protocol = parsed.protocol.slice(0, -1);
  const {hostname: host, port} = parsed;
  return {protocol, host, port};
}

const defaults = parseBacksideUrl(DEFAULT_URL);
const env = process.env.BACKSIDE_URL ? parseBacksideUrl(process.env.BACKSIDE_URL) : {};

export default {...defaults, ...env};
