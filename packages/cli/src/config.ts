import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import {
  generateKeyPair,
  agentId,
  type AgentCard,
  type KeyPair,
} from "@squadklaw/core";

const CONFIG_DIR = join(homedir(), ".squadklaw");
const CARD_PATH = join(CONFIG_DIR, "agent-card.json");
const KEY_PATH = join(CONFIG_DIR, "keys.json");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface CLIConfig {
  directoryUrl: string;
  token?: string;
}

function ensureDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function saveKeys(keys: KeyPair): void {
  ensureDir();
  writeFileSync(KEY_PATH, JSON.stringify(keys, null, 2), { mode: 0o600 });
}

export function loadKeys(): KeyPair | null {
  if (!existsSync(KEY_PATH)) return null;
  return JSON.parse(readFileSync(KEY_PATH, "utf-8"));
}

export function saveCard(card: AgentCard): void {
  ensureDir();
  writeFileSync(CARD_PATH, JSON.stringify(card, null, 2));
}

export function loadCard(): AgentCard | null {
  if (!existsSync(CARD_PATH)) return null;
  return JSON.parse(readFileSync(CARD_PATH, "utf-8"));
}

export function saveConfig(config: CLIConfig): void {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function loadConfig(): CLIConfig {
  if (!existsSync(CONFIG_PATH)) {
    return { directoryUrl: "http://localhost:3141/v1" };
  }
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

export function isInitialized(): boolean {
  return existsSync(CARD_PATH) && existsSync(KEY_PATH);
}
