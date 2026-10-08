import {readFileSync} from 'node:fs';
// Never echo local CLI output: it can contain generated authentication keys.
const log=readFileSync(process.argv[2],'utf8');
const labels=[
 ['Docker daemon unavailable',/Cannot connect to the Docker daemon|docker daemon is not running/i],
 ['Image download failed',/failed to pull|toomanyrequests|manifest unknown/i],
 ['Migration replay failed',/ERROR:|SQLSTATE|migration.*failed/i],
 ['Local service health check failed',/unhealthy|health check|failed to start/i],
 ['Local port already occupied',/port is already allocated|address already in use/i],
];
console.error(labels.find(([,pattern])=>pattern.test(log))?.[0] ?? 'Local stack startup failed; raw credential-bearing logs withheld');
