# EnvGod CLI (@rusamer/envgod-cli)

Official command-line interface for EnvGod.

## Installation

```bash
npm install -g @rusamer/envgod-cli
```

## Configuration

- API base URL: the CLI targets your backend via `ENVGOD_API_URL`.
  - If unset, it defaults to `http://localhost:3000` (local dev).
  - For your temporary Koyeb backend, set it before running commands:

  PowerShell (current session):
  ```powershell
  $env:ENVGOD_API_URL = 'https://glorious-elle-rusamer-131a45de.koyeb.app'
  ```

  Bash (current session):
  ```bash
  export ENVGOD_API_URL="https://glorious-elle-rusamer-131a45de.koyeb.app"
  ```

## Login

To get started, log in to your EnvGod account:

```bash
envgod login
```

This starts the device login flow. You will be prompted to open a URL in your browser and enter a code to authorize the CLI.

## Usage

### `whoami`

Check the identity of the currently logged-in user.

```bash
envgod whoami
```

### `orgs`

List the organizations you are a member of.

```bash
envgod orgs
```

### `projects`

List projects within an organization.

```bash
envgod projects --org <org-id>
```

### `request-runtime-key`

Request a runtime API key for a specific scope.

```bash
envgod request-runtime-key --org <org-id> --project <project-id> --env <env-id> --service <service-id> --reason "Your reason here"
```

### `status`

Check your local authentication status and connectivity to the EnvGod backend.

```bash
envgod status
```

### `logout`

Log out and clear your local credentials.

```bash
envgod logout
```

## Troubleshooting

- Login approved but no token: Ensure the backend `/cp/device/token` response schema includes `cp_access_token` and redeploy.
- 401 or session expired: Re-login. The dashboard redirects to `/login?expired=1` when the session expires.
- whoami fails: Verify the backend exposes `GET /cp/me`.
- Targeting the wrong backend: set `ENVGOD_API_URL` to your intended API base URL.

Made by Rusamer
