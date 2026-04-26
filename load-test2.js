import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // smoke
    { duration: '2m', target: 50 },   // carga normal
    { duration: '2m', target: 100 },  // stress leve
    { duration: '2m', target: 200 },  // stress
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],      // erro menor que 2%
    http_req_duration: ['p(95)<1000'],   // p95 menor que 1s
    checks: ['rate>0.95'],               // 95% dos checks OK
  },
};

const BASE_URL = 'http://192.168.58.2:30007';

const names = [
  'harry potter',
  'hermione granger',
  'ron weasley',
  'severus snape',
  'minerva mcgonagall',
];

export default function () {
  const name = names[Math.floor(Math.random() * names.length)];
  const url = `${BASE_URL}/wizard/${encodeURIComponent(name)}`;

  const res = http.get(url, {
    timeout: '5s',
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'tempo menor que 1s': (r) => r.timings.duration < 1000,
    'retornou body': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
