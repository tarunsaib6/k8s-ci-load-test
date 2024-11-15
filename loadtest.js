import http from 'k6/http';
import { sleep } from 'k6';
import { check } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { githubComment } from "https://raw.githubusercontent.com/dotansimha/k6-github-pr-comment/master/lib.js";




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

export function handleSummary(data) {
  githubComment(data, {
    token: __ENV.GITHUB_TOKEN, 
    commit: __ENV.GITHUB_SHA,
    pr: __ENV.GITHUB_PR,
    org: "tarunsaib6",
    repo: "k8s-ci-load-test",
    renderTitle({ passes }) {
      return passes ? "✅ Benchmark Results" : "❌ Benchmark Failed"; // Here you can choose how to build the title
    },
    renderMessage({ passes, checks, thresholds }) { // Customize the output and the comment text
      const result = [];

      // In case of failures in thresholds, you can customize the message
      if (thresholds.failures) {
        result.push(
          `**Performance regression detected**: it seems like your Pull Request adds some extra latency to the GraphQL requests, or to envelop runtime.`
        );
      }

      // In case of failing execution of K6, you can customize the output
      if (checks.failures) {
        result.push("**Failed assertions detected**: some GraphQL operations included in the loadtest are failing.");
      }

      if (!passes) {
        result.push(`> If the performance regression is expected, please increase the failing threshold.`);
      }

      // Make sure to return a string
      return result.join("\n");
    },
  });

  // This will preserve the original output of K6 to the console, while still publishing to GH.
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
};

