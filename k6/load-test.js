import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '1m',
};

const wizards = [
  'harry%20potter',
  'hermione%20granger',
  'ron%20weasley',
  'albus%20dumbledore',
  'severus%20snape',
  'draco%20malfoy',
  'minerva%20mcgonagall',
];

export default function () {
  const wizard = wizards[Math.floor(Math.random() * wizards.length)];

  const res = http.get(`http://192.168.58.2:30007/wizard/${wizard}`);

  check(res, {
    'status 200': (r) => r.status === 200,
    'tempo menor que 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
