import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp up to 5 VUs over 10 seconds
    { duration: '20s', target: 10 }, // Stay at 10 VUs for 20 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 VUs over 10 seconds
  ],
};

export default function () {
  // Define the URLs to test
  const urls = ['http://localhost/foo', 'http://localhost/bar'];

  // Loop through each URL and make HTTP GET requests
  urls.forEach(url => {
    const res = http.get(url);
    if (res.status !== 200) {
      console.error(`Error: ${url} returned status ${res.status}`);
    }
  });

  // Add a pause between iterations
  sleep(1);
}
