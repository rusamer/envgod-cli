#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander13 = require("commander");

// src/commands/login.ts
var import_commander = require("commander");

// src/lib/config.ts
var DEFAULT_API_BASE_URL = "http://localhost:3000";
var API_BASE_URL = process.env.ENVGUARDS_API_URL || DEFAULT_API_BASE_URL;
async function resolveApiBaseUrl() {
  return process.env.ENVGUARDS_API_URL || API_BASE_URL || DEFAULT_API_BASE_URL;
}

// src/lib/store.ts
var import_keytar = __toESM(require("keytar"));
var SERVICE = "envguards";
function getCpAccountKey() {
  return `cp:${API_BASE_URL}`;
}
function getRuntimeAccountKey(scope) {
  const { orgId, projectId, envId, serviceId } = scope;
  return `runtime:${API_BASE_URL}:${orgId}:${projectId}:${envId}:${serviceId}`;
}
async function setTokens(refreshToken, accessToken) {
  const account = getCpAccountKey();
  const value = JSON.stringify({ refreshToken, accessToken });
  await import_keytar.default.setPassword(SERVICE, account, value);
}
async function getTokens() {
  const account = getCpAccountKey();
  const data = await import_keytar.default.getPassword(SERVICE, account);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
async function getAccessToken() {
  const tokens = await getTokens();
  return tokens?.accessToken ?? null;
}
async function clearTokens() {
  const account = getCpAccountKey();
  await import_keytar.default.deletePassword(SERVICE, account);
}
async function getRuntimeKey(scope) {
  const account = getRuntimeAccountKey(scope);
  return import_keytar.default.getPassword(SERVICE, account);
}
async function setRuntimeKey(scope, apiKey) {
  const account = getRuntimeAccountKey(scope);
  await import_keytar.default.setPassword(SERVICE, account, apiKey);
}

// src/lib/device-flow.ts
async function pollForToken(deviceCode, interval) {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cp/device/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_code: deviceCode })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cp_access_token) {
            clearInterval(intervalId);
            resolve(data);
          }
        }
      } catch (error) {
      }
    }, interval * 1e3);
  });
}
async function startDeviceFlow() {
  const response = await fetch(`${API_BASE_URL}/cp/device/start`, {
    method: "POST"
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error starting device flow: ${response.status} ${response.statusText}`);
    console.error(`Response body: ${errorBody}`);
    throw new Error("Failed to start device flow. See logs for details.");
  }
  const data = await response.json();
  console.log(`Please visit ${data.verification_url} and enter the code: ${data.user_code}`);
  const tokenResponse = await pollForToken(data.device_code, data.interval);
  await setTokens(tokenResponse.cp_access_token, tokenResponse.cp_access_token);
  console.log("Successfully logged in!");
}

// src/commands/login.ts
var loginCommand = new import_commander.Command("login").description("Log in to EnvGod").action(startDeviceFlow);

// src/commands/logout.ts
var import_commander2 = require("commander");
var handleLogout = async () => {
  await clearTokens();
  console.log("Successfully logged out!");
};
var logoutCommand = new import_commander2.Command("logout").description("Log out from EnvGod").action(handleLogout);

// src/commands/whoami.ts
var import_commander3 = require("commander");

// src/lib/api.ts
async function apiFetch(endpoint, options = {}) {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(errorBody.message || "An unknown error occurred");
  }
  return response.json();
}

// src/commands/whoami.ts
async function handleWhoami() {
  const tokens = await getTokens();
  if (!tokens) {
    console.log("You are not logged in. Please run `envgod login`.");
    return;
  }
  try {
    const user = await apiFetch("/cp/me");
    console.log("Logged in as:");
    console.log(`  Email: ${user.email}`);
    console.log(`  User ID: ${user.id}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to get user information: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}
var whoamiCommand = new import_commander3.Command("whoami").description("Show the current user").action(handleWhoami);

// src/commands/orgs.ts
var import_commander4 = require("commander");
async function handleOrgs() {
  try {
    const orgs = await apiFetch("/cp/orgs");
    if (orgs.length === 0) {
      console.log("You are not a member of any organizations.");
      return;
    }
    console.log("Organizations:");
    orgs.forEach((org) => {
      console.log(`  - ${org.name} (ID: ${org.id})`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to list organizations: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}
var orgsCommand = new import_commander4.Command("orgs").description("List organizations").action(handleOrgs);

// src/commands/projects.ts
var import_commander5 = require("commander");
async function handleProjects(options) {
  if (!options.org) {
    console.error("Error: Missing required option --org <orgId>");
    return;
  }
  try {
    const projects = await apiFetch(`/cp/orgs/${options.org}/projects`);
    if (projects.length === 0) {
      console.log("No projects found in this organization.");
      return;
    }
    console.log("Projects:");
    projects.forEach((project) => {
      console.log(`  - ${project.name} (ID: ${project.id})`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to list projects: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}
var projectsCommand = new import_commander5.Command("projects").description("List projects in an organization").requiredOption("--org <orgId>", "Organization ID").action(handleProjects);

// src/commands/request.ts
var import_commander6 = require("commander");
async function handleRequest(options) {
  try {
    const body = {
      orgId: options.org,
      projectId: options.project,
      envId: options.env,
      serviceId: options.service,
      reason: options.reason
    };
    await apiFetch("/cp/access-requests", {
      method: "POST",
      body: JSON.stringify(body)
    });
    console.log("Access request submitted successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to submit access request: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}
var requestCommand = new import_commander6.Command("request-runtime-key").description("Request a runtime key for a specific scope").requiredOption("--org <orgId>", "Organization ID").requiredOption("--project <projectId>", "Project ID or name").requiredOption("--env <envId>", "Environment ID or name").requiredOption("--service <serviceId>", "Service ID or name").option("--reason <reason>", "Reason for the request").action(handleRequest);

// src/commands/status.ts
var import_commander7 = require("commander");
async function handleStatus() {
  console.log("Checking local authentication status...");
  const tokens = await getTokens();
  if (tokens) {
    console.log("  \u2713 Logged in");
  } else {
    console.log("  \u2717 Not logged in");
  }
  console.log("\nChecking backend service status...");
  try {
    const health = await apiFetch("/");
    if (health.status === "healthy") {
      console.log(`  \u2713 Backend is healthy (version: ${health.version})`);
    } else {
      console.log(`  \u2717 Backend is reporting an unhealthy status: ${health.status}`);
    }
  } catch (error) {
    console.log("  \u2717 Failed to connect to the backend.");
    if (error instanceof Error) {
      console.error(`    Error: ${error.message}`);
    }
  }
}
var statusCommand = new import_commander7.Command("status").description("Check local auth status and backend connectivity").action(handleStatus);

// src/commands/run.ts
var import_commander8 = require("commander");

// src/lib/secrets.ts
async function fetchSecretsBundle(runtimeKey, scope) {
  const base = await resolveApiBaseUrl();
  const url = new URL("/v1/bundle", base);
  url.searchParams.set("orgId", scope.orgId);
  url.searchParams.set("projectId", scope.projectId);
  url.searchParams.set("envId", scope.envId);
  url.searchParams.set("serviceId", scope.serviceId);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${runtimeKey}`
    }
  });
  if (!res.ok) {
    const message = `Failed to fetch secrets (HTTP ${res.status})`;
    throw new Error(message);
  }
  const data = await res.json();
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") out[k] = v;
    else out[k] = String(v);
  }
  return out;
}

// src/lib/spawn.ts
var import_node_child_process = require("child_process");
function mergeEnvs(base, inject, override) {
  const out = { ...base };
  for (const [k, v] of Object.entries(inject)) {
    if (override || out[k] === void 0) {
      out[k] = v;
    }
  }
  return out;
}
async function spawnWithEnv(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(command, args, {
      stdio: "inherit",
      env,
      shell: process.platform === "win32"
    });
    child.on("error", (err) => reject(err));
    child.on("exit", (code) => resolve(code ?? 0));
  });
}

// src/commands/run.ts
async function handleRun(cmds, options) {
  if (!cmds || cmds.length === 0) {
    console.error("Missing command to run. Usage: envguards run --org <orgId> --project <projectId> --env <envId> --service <serviceId> -- <command...>");
    process.exitCode = 2;
    return;
  }
  const scope = {
    orgId: options.org,
    projectId: options.project,
    envId: options.env,
    serviceId: options.service
  };
  const runtimeKey = await getRuntimeKey(scope);
  if (!runtimeKey) {
    console.error("No runtime key found for this scope.");
    console.error('Request one with: envguards request-runtime-key --org <orgId> --project <projectId> --env <envId> --service <serviceId> --reason "<reason>"');
    process.exitCode = 1;
    return;
  }
  let bundle;
  try {
    bundle = await fetchSecretsBundle(runtimeKey, scope);
  } catch (err) {
    console.error("Failed to fetch secrets bundle.");
    process.exitCode = 1;
    return;
  }
  if (options.printKeys) {
    const keys = Object.keys(bundle).sort();
    for (const k of keys) console.log(k);
  }
  const envMerged = mergeEnvs(process.env, bundle, !!options.override);
  const command = cmds[0];
  const args = cmds.slice(1);
  try {
    const code = await spawnWithEnv(command, args, envMerged);
    process.exitCode = code;
  } catch (err) {
    console.error("Failed to spawn process.");
    process.exitCode = 1;
  }
}
var runCommand = new import_commander8.Command("run").description("Run a command with secrets injected into the environment (no files written).").requiredOption("--org <orgId>", "Organization ID").requiredOption("--project <projectId>", "Project ID or name").requiredOption("--env <envId>", "Environment ID or name").requiredOption("--service <serviceId>", "Service ID or name").option("--override", "Allow overwriting existing env vars", false).option("--redact", "Enable redaction (reserved flag, defaults to true)", true).option("--print-keys", "Print keys only (never values)", false).argument("<cmd...>", "Command to execute").action(handleRun);

// src/commands/export.ts
var import_commander9 = require("commander");

// src/lib/output.ts
var import_promises = __toESM(require("fs/promises"));
function redactBundle(bundle, redact) {
  if (!redact) return { ...bundle };
  const out = {};
  for (const k of Object.keys(bundle)) out[k] = "********";
  return out;
}
function formatDotenv(bundle) {
  const lines = [];
  const keys = Object.keys(bundle).sort((a, b) => a.localeCompare(b));
  for (const k of keys) {
    const v = bundle[k] ?? "";
    const needsQuote = /\s|[#'"\\]/.test(v);
    const safe = needsQuote ? JSON.stringify(v) : v;
    lines.push(`${k}=${safe}`);
  }
  return lines.join("\n") + (lines.length ? "\n" : "");
}
function formatJson(bundle) {
  return JSON.stringify(bundle, null, 2) + "\n";
}
async function writeFilePrompted(path, content, force) {
  if (!force) {
    try {
      await import_promises.default.access(path);
      throw new Error(`Refusing to overwrite existing file: ${path}. Re-run with --yes to confirm.`);
    } catch {
    }
  }
  await import_promises.default.writeFile(path, content, { encoding: "utf8", mode: 384 });
}
async function confirmPlainOutput(nonInteractiveYes) {
  if (nonInteractiveYes) return;
  const rl = await import("readline/promises");
  const { stdin: input, stdout: output } = await import("process");
  const rli = rl.createInterface({ input, output });
  try {
    const ans = (await rli.question("WARNING: You are about to output real secret values. Continue? (y/N) ")).trim().toLowerCase();
    if (ans !== "y" && ans !== "yes") {
      throw new Error("Aborted by user");
    }
  } finally {
    rli.close();
  }
}

// src/commands/export.ts
async function handleExport(options) {
  const scope = {
    orgId: options.org,
    projectId: options.project,
    envId: options.env,
    serviceId: options.service
  };
  const runtimeKey = await getRuntimeKey(scope);
  if (!runtimeKey) {
    console.error("No runtime key found for this scope.");
    console.error('Request one with: envguards request-runtime-key --org <orgId> --project <projectId> --env <envId> --service <serviceId> --reason "<reason>"');
    process.exitCode = 1;
    return;
  }
  let bundle;
  try {
    bundle = await fetchSecretsBundle(runtimeKey, scope);
  } catch {
    console.error("Failed to fetch secrets bundle.");
    process.exitCode = 1;
    return;
  }
  const fmt = options.format ?? "dotenv";
  const redact = options.plain ? false : options.redact ?? true;
  if (options.plain && !options.yes) {
    try {
      await confirmPlainOutput(false);
    } catch {
      console.error("Aborted.");
      process.exitCode = 1;
      return;
    }
  }
  const outBundle = redactBundle(bundle, redact);
  const content = fmt === "dotenv" ? formatDotenv(outBundle) : formatJson(outBundle);
  if (options.out) {
    try {
      await writeFilePrompted(options.out, content, !!options.yes);
      console.log(`Wrote ${fmt} to ${options.out}${redact ? " (redacted)" : ""}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Failed to write file");
      process.exitCode = 1;
    }
  } else {
    process.stdout.write(content);
  }
}
var exportCommand = new import_commander9.Command("export").description("Export secrets to STDOUT or a file (redacted by default).").requiredOption("--org <orgId>", "Organization ID").requiredOption("--project <projectId>", "Project ID or name").requiredOption("--env <envId>", "Environment ID or name").requiredOption("--service <serviceId>", "Service ID or name").option("--format <format>", "dotenv or json", "dotenv").option("--redact", "Redact values (default true)", true).option("--plain", "Output real values (requires confirmation unless --yes)", false).option("--out <path>", "Write output to file").option("--yes", "Skip confirmation prompts (dangerous with --plain)", false).action(handleExport);

// src/commands/env-example.ts
var import_commander10 = require("commander");
async function handleEnvExample(options) {
  const scope = {
    orgId: options.org,
    projectId: options.project,
    envId: options.env,
    serviceId: options.service
  };
  const runtimeKey = await getRuntimeKey(scope);
  if (!runtimeKey) {
    console.error("No runtime key found for this scope.");
    console.error('Request one with: envguards request-runtime-key --org <orgId> --project <projectId> --env <envId> --service <serviceId> --reason "<reason>"');
    process.exitCode = 1;
    return;
  }
  let bundle;
  try {
    bundle = await fetchSecretsBundle(runtimeKey, scope);
  } catch {
    console.error("Failed to fetch secrets bundle.");
    process.exitCode = 1;
    return;
  }
  const keysOnly = {};
  for (const k of Object.keys(bundle)) keysOnly[k] = "";
  const content = formatDotenv(keysOnly);
  if (options.out) {
    try {
      await writeFilePrompted(options.out, content, true);
      console.log(`Wrote .env.example to ${options.out}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Failed to write file");
      process.exitCode = 1;
    }
  } else {
    process.stdout.write(content);
  }
}
var envExampleCommand = new import_commander10.Command("env-example").description("Generate .env.example (keys only, no values).").requiredOption("--org <orgId>", "Organization ID").requiredOption("--project <projectId>", "Project ID or name").requiredOption("--env <envId>", "Environment ID or name").requiredOption("--service <serviceId>", "Service ID or name").option("--out <path>", "Write output to file (defaults to STDOUT)").action(handleEnvExample);

// src/commands/requests.ts
var import_commander11 = require("commander");
async function handleRequests(options) {
  try {
    const params = new URLSearchParams({ orgId: options.org });
    if (options.status) params.set("status", options.status);
    const data = await apiFetch(`/cp/access-requests?${params.toString()}`);
    const items = Array.isArray(data) ? data : data?.items ?? [];
    if (!items.length) {
      console.log("No requests found.");
      return;
    }
    for (const r of items) {
      const prefix = r.api_key_prefix ? `, key: ${r.api_key_prefix}\u2026 (delivered once)` : "";
      console.log(`- ${r.id} [${r.status}] org=${r.orgId} project=${r.projectId} env=${r.envId} service=${r.serviceId}${prefix}`);
    }
  } catch (error) {
    console.error("Failed to list requests.");
  }
}
var requestsCommand = new import_commander11.Command("requests").description("List my access requests (no api_key values shown)").requiredOption("--org <orgId>", "Organization ID").option("--status <STATUS>", "PENDING|APPROVED|DENIED").action(handleRequests);

// src/commands/add-key.ts
var import_commander12 = require("commander");
async function handleAddKey(options) {
  const { org, project, env, service, key } = options;
  if (!key || !/^envguards_sk_/.test(key)) {
    console.error("Invalid or missing key. Expected format envguards_sk_...");
    process.exitCode = 2;
    return;
  }
  try {
    await setRuntimeKey({ orgId: org, projectId: project, envId: env, serviceId: service }, key);
    console.log("Runtime key stored for the specified scope.");
  } catch (e) {
    console.error("Failed to store runtime key.");
    process.exitCode = 1;
  }
}
var addKeyCommand = new import_commander12.Command("add-runtime-key").description("Store a runtime key locally for a specific scope").requiredOption("--org <orgId>", "Organization ID").requiredOption("--project <projectId>", "Project ID or name").requiredOption("--env <envId>", "Environment ID or name").requiredOption("--service <serviceId>", "Service ID or name").requiredOption("--key <envguards_sk_...>", "Runtime API key to store").action(handleAddKey);

// src/index.ts
var program = new import_commander13.Command();
program.version("0.2.0").description("Env.Guards CLI");
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(orgsCommand);
program.addCommand(projectsCommand);
program.addCommand(requestCommand);
program.addCommand(statusCommand);
program.addCommand(runCommand);
program.addCommand(exportCommand);
program.addCommand(envExampleCommand);
program.addCommand(requestsCommand);
program.addCommand(addKeyCommand);
program.parse(process.argv);
