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
var import_commander8 = require("commander");

// src/commands/login.ts
var import_commander = require("commander");

// src/lib/config.ts
var API_BASE_URL = "https://glorious-elle-rusamer-131a45de.koyeb.app";

// src/lib/store.ts
var import_keytar = __toESM(require("keytar"));
var SERVICE = "envgod-cli";
var ACCOUNT = "default";
async function setTokens(refreshToken, accessToken) {
  await import_keytar.default.setPassword(SERVICE, ACCOUNT, JSON.stringify({ refreshToken, accessToken }));
}
async function getTokens() {
  const data = await import_keytar.default.getPassword(SERVICE, ACCOUNT);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}
async function getAccessToken() {
  const tokens = await getTokens();
  return tokens?.accessToken || null;
}
async function clearTokens() {
  await import_keytar.default.deletePassword(SERVICE, ACCOUNT);
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

// src/index.ts
var program = new import_commander8.Command();
program.version("0.1.0").description("EnvGod CLI");
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(orgsCommand);
program.addCommand(projectsCommand);
program.addCommand(requestCommand);
program.addCommand(statusCommand);
program.parse(process.argv);
