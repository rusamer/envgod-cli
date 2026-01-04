# Env.Guards CLI (`@rusamer/envguards-cli`)

Official command-line interface for Env.Guards.
Built for **secure runtime secrets injection** and **team workflows** (RBAC + approvals) without printing or persisting secrets.

- Backend: Control Plane (CP) + Data Plane (DP)
- Dashboard: approve devices + requests
- CLI: login + request access + run apps with injected env
- SDK: `@rusamer/envguards` is used internally by the CLI for Data Plane secret retrieval

---

## Install

### Global (recommended)
```bash
npm i -g @rusamer/envguards-cli
```

### Local (CI / repo)
```bash
npm i -D @rusamer/envguards-cli
# or
pnpm add -D @rusamer/envguards-cli
```

Run locally:
```bash
npx envguards --help
# or
pnpm envguards --help
```

## Configuration

### Backend URL
The CLI targets your Env.Guards backend via `ENV_GUARDS_API_URL`.

Default: `http://localhost:3000`

PowerShell:
```powershell
$env:ENV_GUARDS_API_URL="https://your-backend.example.com"
```

Bash:
```bash
export ENV_GUARDS_API_URL="https://your-backend.example.com"
```

## Security Model (Short)
- Device login (Vercel-style): CLI gets a short CP token only after browser approval.
- Runtime keys are show-once: approver sees the raw API key once; later only prefix.
- No secrets printed by default: `run` injects into a child process env only.
- Local storage: CLI stores tokens/keys locally (do not commit them).

## Quick Start (Teams Flow)

### 1) Login (device code)
```bash
envguards login
```
The CLI prints a `user_code` and `verification_url`. Open the URL, enter the code, approve the device.

### 2) Select scope (org/project/env/service)
You can list and choose scope:
```bash
envguards orgs
envguards projects --org <org-id>
```

### 3) Request a runtime key (approval required)
```bash
envguards request-runtime-key \
  --org <org-id> \
  --project <project-id> \
  --env <env-id> \
  --service <service-id> \
  --reason "CI runtime access"
```
A Maintainer/Owner approves in the dashboard.

### 4) Add the approved key (local)
Copy the key from the approval (shown once), then store it locally:
```bash
envguards add-runtime-key \
  --org <org-id> \
  --project <project-id> \
  --env <env-id> \
  --service <service-id> \
  --key envguards_sk_XXXXXXXXXXXXXXXXXXXXXXXX
```

### 5) Run your app with injected secrets (MOST IMPORTANT)
```bash
envguards run \
  --org <org-id> \
  --project <project-id> \
  --env <env-id> \
  --service <service-id> -- \
  node -e "console.log('HAS_SECRET=', Boolean(process.env.MY_SECRET))"
```
This does not print secret values. It injects them into the child process environment only.

## Commands (v0.2.0)

### login
Start device login flow.
```bash
envguards login
```

### whoami
Show the current user.
```bash
envguards whoami
```

### orgs
List organizations you belong to.
```bash
envguards orgs
```

### projects
List projects within an org.
```bash
envguards projects --org <org-id>
```

### request-runtime-key
Create an access request for a scoped runtime key (CP). Requires Maintainer/Owner approval.
```bash
envguards request-runtime-key \
  --org <org-id> \
  --project <project-id> \
  --env <env-id> \
  --service <service-id> \
  --reason "Your reason here"
```

### requests
List access requests (no secret values are shown). Optionally filter by status.
```bash
envguards requests --org <org-id>
envguards requests --org <org-id> --status PENDING
envguards requests --org <org-id> --status APPROVED
envguards requests --org <org-id> --status DENIED
```

### add-runtime-key
Store an approved runtime key locally for a scope. Used by `run`/`export`/`env-example`.
```bash
envguards add-runtime-key \
  --org <org-id> \
  --project <project-id> \
  --env <env-id> \
  --service <service-id> \
  --key envguards_sk_XXXXXXXXXXXXXXXXXXXXXXXX
```

### run
Fetch secrets securely and inject into a child process environment.

Default: no printing, no writing to disk

Flags:
- `--override` allow overwriting existing env vars
- `--print-keys` print keys only (no values)

```bash
envguards run --org <org> --project <project> --env <env> --service <service> -- \
  node -e "console.log(Object.keys(process.env).includes('MY_SECRET'))"
```

### export
Safe export. Redacted by default. Use `--plain` to output real values (requires confirmation or `--yes`).
```bash
# Redacted dotenv to STDOUT
envguards export --org <org> --project <project> --env <env> --service <service> --format dotenv

# Plain JSON to a file (dangerous)
envguards export --org <org> --project <project> --env <env> --service <service> \
  --format json --plain --out secrets.json --yes
```

### env-example
Generate `.env.example` (keys only; no values). Defaults to STDOUT.
```bash
envguards env-example --org <org> --project <project> --env <env> --service <service> --out .env.example
```

### status
Check local auth status and connectivity.
```bash
envguards status
```

### logout
Log out and clear local credentials.
```bash
envguards logout
```

## CI / Deployment Notes
CLI is for build/runtime injection, but you must decide where the runtime key lives:

- Preferred: obtain key via approval, store it as a secure secret in your CI provider, then use `envguards run`.
- Never commit runtime keys or tokens to git.

Example (CI):
```bash
envguards add-runtime-key --org $ORG --project $PROJECT --env $ENV --service $SERVICE --key "$ENV_GUARDS_RUNTIME_KEY"
envguards run --org $ORG --project $PROJECT --env $ENV --service $SERVICE -- pnpm start
```

## Troubleshooting
- Login approved but no token:
  - Ensure backend `/cp/device/token` returns `cp_access_token`.
  - Ensure `ENV_GUARDS_API_URL` is correct.
- 401 / session expired:
  - Re-run `envguards login`.
- Targeting wrong backend:
  - Set `ENV_GUARDS_API_URL` explicitly.
- Request approved but key missing:
  - Approve returns raw `api_key` only once. After that, only `api_key_prefix` is returned.

## Author
Made by Rusamer
Email: rusamer@gmail.com
