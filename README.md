# CI Load Test - GitHub Action Workflow

## Overview

This GitHub Actions workflow automates load testing for your application using KinD (Kubernetes-in-Docker) clusters and the k6 load testing tool. The workflow runs on pull requests targeting the `main` branch and posts the test results as a comment on the pull request.

---

## Workflow Details

### Trigger
- **Event:** `pull_request`
- **Branch:** `main`

---

### Permissions
The workflow requires the following repository permissions:
- **Pull Requests:** Write
- **Contents:** Read

---

### Jobs
#### 1. **Load Test**
- **Runs on:** `ubuntu-latest`
- **Steps:**

##### a. **Checkout Repository**
Uses the `actions/checkout@v3` action to clone the repository.

##### b. **Set up KinD Cluster**
- Uses the `helm/kind-action@v1.4.0` action to set up a Kubernetes-in-Docker (KinD) cluster.
- **Config:** `kindCluster.yaml`
- **Version:** `v0.20.0`

##### c. **Install Ingress Controller**
- Deploys an NGINX ingress controller to the KinD Kubernetes cluster using `nginxIngress.yaml`.
- Waits for the ingress controller to be ready.

##### d. **Deploy HTTP Echo Applications**
- Deploys sample HTTP echo applications (e.g., `foo` and `bar`) using `deployment-foo-bar.yaml`.
- Verifies the deployment by making curl requests to `/foo` and `/bar`.

##### e. **Install k6**
- Installs the k6 load testing binary for Linux.
- Configures the necessary apt repository and imports the GPG key.

##### f. **Run k6 Performance Test**
- Executes the `loadtest.js` script using k6.
- Captures the test results in a `results.txt` file.
- Exports the results as an environment variable (`RESULT_OUTPUT`).

##### g. **Post k6 Output as PR Comment**
- Uses `actions/github-script@v6` to post the k6 test results as a comment on the pull request.
- Validates the pull request context and formats the output appropriately.

---

## Configuration Files
1. **`kindCluster.yaml`:** Configuration for the KinD Kubernetes cluster.
2. **`nginxIngress.yaml`:** YAML manifest for deploying the NGINX ingress controller.
3. **`deployment-foo-bar.yaml`:** YAML manifest for deploying the HTTP echo applications.
4. **`loadtest.js`:** k6 script for load testing.

---

## Environment Variables
- **`GITHUB_PR`:** Pull request number (automatically extracted).
- **`GITHUB_SHA`:** Commit SHA for the current workflow run.
- **`GITHUB_TOKEN`:** Token for authentication with GitHub.

---

## Outputs
- **PR Comment:** Includes the k6 performance test results.
- Example format:
  ```
  ### k6 Performance Test Results
  ```
  ```
  [k6 test results]
  ```

---

## Prerequisites
1. **k6 Script (`loadtest.js`):**
   - Ensure the k6 script is designed to test the endpoints `/foo` and `/bar`.
2. **Ingress and Deployment Manifests:**
   - The `nginxIngress.yaml` and `deployment-foo-bar.yaml` files must be correctly configured to align with your application's structure.

## tools
1. KinD 
2. k6

---

## Notes
- Customize the k6 script (`loadtest.js`) to match your testing requirements.
- Ensure sufficient resource allocation for KinD clusters to handle the load test effectively.
- The workflow posts test results directly to the corresponding pull request for better visibility. 