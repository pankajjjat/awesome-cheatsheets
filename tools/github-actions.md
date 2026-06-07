# GitHub Actions — Cheatsheet

*GitHub Actions is a CI/CD platform integrated with GitHub.
Automate builds, tests, deployments, and any workflow triggered by GitHub events.*

---

## Workflow Syntax — Basic Structure

```yaml
# .github/workflows/<name>.yml

name: CI                          # Workflow name (displayed in GitHub UI)
run-name: Deploy by @${{ github.actor }}  # Dynamic run name (GitHub 2023+)

on:                               # Trigger(s)
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:                              # Environment variables (all jobs)
  NODE_VERSION: 20
  REGISTRY: ghcr.io

jobs:
  test:                           # Job ID
    name: Run Tests               # Display name
    runs-on: ubuntu-latest        # Runner type
    if: github.event_name != 'push' || !contains(github.event.head_commit.message, '[skip ci]')

    env:                          # Job-level env vars
      CI: true

    defaults:                     # Defaults for all steps
      run:
        shell: bash
        working-directory: ./app

    strategy:
      matrix:                     # Matrix strategy (see below)
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload test results
        if: always()              # Run even if previous step failed
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.os }}-${{ matrix.node-version }}
          path: junit.xml
```

## Triggers (`on:`)

```yaml
on:
  push:                                    # Push to any branch
    branches: [main, 'feature/**']
    tags: ['v*']
    paths: ['src/**', '!docs/**']          # Include/exclude paths
    paths-ignore: ['*.md']

  pull_request:                            # PR events
    branches: [main]
    types: [opened, synchronize, reopened]

  schedule:                                # Cron (UTC)
    - cron: '0 6 * * 1'                   # Every Monday at 6 AM
    - cron: '*/15 * * * *'               # Every 15 minutes

  workflow_dispatch:                       # Manual trigger
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: staging
        type: choice
        options:
          - staging
          - production
      debug:
        description: 'Enable debug mode'
        required: false
        default: false
        type: boolean

  release:                                 # GitHub Release events
    types: [published, created, edited]

  workflow_call:                           # Reusable workflow (see below)

  repository_dispatch:                     # External API trigger
    types: [deploy-command]

  page_build:                              # GitHub Pages build

  # Multiple triggers
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  workflow_dispatch: {}
  schedule:
    - cron: '0 0 * * *'
```

## Runners

```yaml
# GitHub-hosted runners
runs-on: ubuntu-latest            # Ubuntu 22.04 (or 24.04)
runs-on: ubuntu-22.04            # Pinned version
runs-on: windows-latest          # Windows Server 2022
runs-on: windows-2022            # Pinned
runs-on: macos-latest            # macOS 14 (M1)
runs-on: macos-14                # Pinned
runs-on: macos-13                # Intel macOS

# Labels for self-hosted runners
runs-on: [self-hosted, linux, x64, gpu]

# Arm runners (GitHub hosted)
runs-on: ubuntu-24.04-arm        # Arm64

# Matrix with runner combinations
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
runs-on: ${{ matrix.os }}
```

## Matrix Builds

```yaml
strategy:
  matrix:                                  # Build matrix
    node: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
    include:                               # Add extra combo
      - os: macos-latest
        node: 22
        experimental: true
    exclude:                               # Remove combo
      - os: windows-latest
        node: 18

  fail-fast: false                         # Don't cancel all if one fails
  max-parallel: 4                          # Max concurrent jobs

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
  - run: npm test
    continue-on-error: ${{ matrix.experimental }}
```

## Common Actions

```yaml
# Checkout
- uses: actions/checkout@v4
  with:
    fetch-depth: 0                  # Full git history (for tags, sonar, etc.)
    fetch-tags: true
    lfs: true                       # Git LFS
    submodules: recursive
    ref: ${{ github.event.pull_request.head.sha }}

# Setup Node.js
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'                    # Auto-cache node_modules
    cache-dependency-path: '**/package-lock.json'
    registry-url: 'https://npm.pkg.github.com'

# Setup Python
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'

# Setup Java
- uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
    cache: 'gradle'

# Cache (generic)
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache/pip
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-deps-

# Upload/Download artifacts
- uses: actions/upload-artifact@v4
  with:
    name: dist-${{ runner.os }}
    path: dist/
    retention-days: 5

- uses: actions/download-artifact@v4
  with:
    name: dist-${{ runner.os }}
    path: dist/

# Docker login + build
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}

# GitHub Pages deployment
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist/

- uses: actions/deploy-pages@v4

# GitHub Release
- uses: softprops/action-gh-release@v2
  with:
    files: |
      dist/*.zip
      dist/*.tar.gz
    generate_release_notes: true
```

## Environment & Secrets

```yaml
# Environment (with protection rules)
jobs:
  deploy:
    environment: production
    # Can also set URL:
    # environment:
    #   name: production
    #   url: https://app.example.com

    env:
      NODE_ENV: production

    steps:
      - run: deploy.sh
        env:
          # Secret from org/repo settings
          API_KEY: ${{ secrets.API_KEY }}
          # GitHub-provided token (auto-generated)
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Environment variable from workflow
          ENVIRONMENT: ${{ vars.ENVIRONMENT_NAME }}

# References:
# secrets:  Repo/org/environment secrets (encrypted)
# vars:     Repo/org/environment variables (plaintext)
# GITHUB_TOKEN: Auto-generated, scoped to workflow
```

## Contexts & Expressions

```yaml
# Contexts
${{ github.repository }}          # owner/repo
${{ github.repository_owner }}    # owner
${{ github.ref }}                 # refs/heads/main
${{ github.ref_name }}            # main (branch/tag name)
${{ github.sha }}                 # commit SHA
${{ github.actor }}               # username who triggered run
${{ github.event_name }}          # push, pull_request, etc.
${{ github.workflow }}            # workflow name
${{ github.run_id }}              # unique run ID
${{ github.run_number }}          # run number
${{ github.job }}                 # current job ID
${{ github.action }}              # current action
${{ github.action_path }}         # path where action is located
${{ github.action_status }}       # status (success/failure/cancelled)
${{ github.server_url }}          # https://github.com
${{ github.api_url }}             # https://api.github.com
${{ github.env }}                 # GITHUB_ENV file path

# Job status check functions
${{ success() }}                  # All previous steps succeeded
${{ failure() }}                  # Any previous step failed
${{ cancelled() }}                # Workflow was cancelled
${{ always() }}                   # Always runs

# Conditional steps
if: github.ref == 'refs/heads/main'
if: startsWith(github.ref, 'refs/tags/v')
if: contains(github.event.head_commit.message, '[deploy]')
if: github.actor != 'dependabot[bot]'

# Expression syntax
${{ env.NODE_VERSION }}
${{ runner.os }}
${{ runner.arch }}

# String functions
${{ format('v{0}.{1}.{2}', 1, 2, 3) }}
${{ join(env.LIST, ',') }}
${{ hashFiles('**/package-lock.json') }}
```

## Job Dependencies & Outputs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    outputs:
      lint_status: ${{ steps.lint_check.outputs.status }}
    steps:
      - run: npm run lint
      - id: lint_check
        run: echo "status=passed" >> $GITHUB_OUTPUT

  test:
    needs: lint                     # Depends on lint
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    needs: [lint, test]             # Multiple dependencies
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
      - name: Use output from lint
        run: echo "${{ needs.lint.outputs.lint_status }}"

  # Matrix dependency
  all-tests-pass:
    if: always()                    # Run even if some matrix jobs fail
    needs: test                     # A matrix with strategy
    runs-on: ubuntu-latest
    steps:
      - run: echo "All tests passed"  # Only runs if all test jobs succeeded
```

## Reusable Workflows (`workflow_call`)

```yaml
# === .github/workflows/deploy.yml (reusable) ===
name: Deploy
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      version:
        required: false
        type: string
        default: latest
    secrets:
      CLOUD_API_KEY:
        required: true
    outputs:
      deploy_url:
        description: "Deployment URL"
        value: ${{ jobs.deploy.outputs.url }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    outputs:
      url: ${{ steps.set_url.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying ${{ inputs.version }} to ${{ inputs.environment }}"
      - id: set_url
        run: echo "url=https://${{ inputs.environment }}.example.com" >> $GITHUB_OUTPUT

# === Calling workflow ===
jobs:
  call-deploy:
    uses: ./.github/workflows/deploy.yml      # Same repo
    # uses: org/repo/.github/workflows/deploy.yml@main  # Different repo
    with:
      environment: staging
      version: v2.0.0
    secrets:
      CLOUD_API_KEY: ${{ secrets.CLOUD_API_KEY }}
```

## Self-Hosted Runners

```yaml
# Setup (on your machine):
# https://github.com/<org>/<repo>/settings/actions/runners/new
# ./config.sh --url https://github.com/org/repo --token <token>
# ./run.sh
# Or install as service: sudo ./svc.sh install && sudo ./svc.sh start

# Job targeting self-hosted runners
jobs:
  build:
    runs-on: [self-hosted, linux, gpu]
    steps:
      - uses: actions/checkout@v4
      - run: nvidia-smi

# Runner groups for org-level control
# runs-on: [self-hosted, group-gpu-runners]

# Ephemeral runners (auto-teardown after job)
# ./config.sh --ephemeral --url ... --token ...
```

## Common CI/CD Patterns

### Node.js CI

```yaml
name: Node.js CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Docker Build & Push

```yaml
name: Docker
on:
  push:
    branches: [main]
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Multi-stage Deploy

```yaml
name: Deploy
on: workflow_dispatch

jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
    secrets:
      CLOUD_API_KEY: ${{ secrets.STAGING_API_KEY }}

  approve-production:
    needs: deploy-staging
    environment: production
    runs-on: ubuntu-latest
    steps:
      - run: echo "Approved for production"

  deploy-production:
    needs: approve-production
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
    secrets:
      CLOUD_API_KEY: ${{ secrets.PROD_API_KEY }}
```

### Semantic Release (Automated Versioning)

```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: cycjimmy/semantic-release-action@v4
        with:
          extra_plugins: |
            @semantic-release/git
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Dependabot Integration

```yaml
# dependabot.yml (in .github/, not workflows)
# version: 2
# updates:
#   - package-ecosystem: npm
#     directory: /
#     schedule:
#       interval: weekly
#     open-pull-requests-limit: 10
#
# Auto-merge dependabot PRs (in workflow):
# if: github.actor == 'dependabot[bot]'
# uses: dependabot/fetch-metadata@v2
```

## Security Hardening

```yaml
# Limit token permissions
permissions:
  contents: read                   # Read-only by default
  actions: read
  checks: none
  issues: write                    # Explicitly grant write for issues
  pull-requests: write
  deployments: read
  id-token: write                  # Needed for OIDC

# OIDC (OpenID Connect) — authenticate to cloud without static secrets
# AWS:
# - uses: aws-actions/configure-aws-credentials@v4
#   with:
#     role-to-assume: arn:aws:iam::123456:role/github-actions-role
#     role-session-name: github-actions
#     aws-region: us-east-1
#
# GCP:
# - uses: google-github-actions/auth@v2
#   with:
#     workload_identity_provider: projects/.../locations/global/workloadIdentityPools/...
#     service_account: deploy@project.iam.gserviceaccount.com
#
# Azure:
# - uses: azure/login@v2
#   with:
#     client-id: ...
#     tenant-id: ...
#     subscription-id: ...
#     allow-no-subscriptions: true

# Review step for security-sensitive actions
# Use: actions that require explicit review for external PRs
```

## Best Practices

```
1. Pin action versions by SHA (not tags) for security:
   uses: actions/checkout@<full-sha>  # instead of @v4

2. Use `actions/cache` to speed up dependency installs

3. Minimize permissions — default read-only, grant write per scope

4. Use OIDC over static secrets for cloud provider access

5. Use environments with required reviewers for production deploys

6. Keep workflows focused — one workflow per concern

7. Use matrix strategy instead of duplicating jobs

8. Use actions/{setup-*} instead of manual install

9. Make reusable workflows for common patterns

10. Use `if:` conditions to skip unnecessary work

11. Use `concurrency` to cancel redundant runs:
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true
```

## Actions Marketplace — Popular Picks

| Action | Purpose |
|--------|---------|
| `actions/checkout` | Checkout code |
| `actions/setup-node` | Node.js setup |
| `actions/setup-python` | Python setup |
| `actions/setup-java` | Java/JDK setup |
| `actions/cache` | Generic caching |
| `actions/upload-artifact` | Persist build artifacts |
| `actions/download-artifact` | Download artifacts |
| `docker/login-action` | Docker registry login |
| `docker/build-push-action` | Build & push Docker images |
| `docker/setup-buildx-action` | Docker BuildKit setup |
| `aws-actions/configure-aws-credentials` | AWS auth via OIDC |
| `google-github-actions/auth` | GCP auth via OIDC |
| `azure/login` | Azure auth |
| `softprops/action-gh-release` | GitHub Release creation |
| `cycjimmy/semantic-release-action` | Auto versioning |
| `dependabot/fetch-metadata` | Dependabot PR info |
| `github/codeql-action` | Code security scanning |
| `super-linter/super-linter` | Multi-language linting |
| `stefanzweifel/git-auto-commit-action` | Auto-commit changes |
