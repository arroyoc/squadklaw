import chalk from "chalk";
import { generateKeyPair, agentId, STANDARD_INTENTS, type AgentCard } from "@squadklaw/core";
import { saveKeys, saveCard, saveConfig, loadCard, getConfigDir } from "../config.js";

export async function initCommand(opts: {
  name?: string;
  endpoint?: string;
  directory: string;
}) {
  // Check if already initialized
  const existing = loadCard();
  if (existing) {
    console.log(chalk.yellow("\n  Agent already initialized.\n"));
    console.log(`  ID:       ${chalk.cyan(existing.agent_id)}`);
    console.log(`  Name:     ${existing.name}`);
    console.log(`  Config:   ${getConfigDir()}\n`);
    console.log(chalk.dim("  Run `sklaw status` for full details.\n"));
    return;
  }

  const name = opts.name ?? `Agent ${Math.random().toString(36).slice(2, 6)}`;
  const endpoint = opts.endpoint ?? "http://localhost:3142/squadklaw";

  console.log(chalk.bold("\n  Initializing Squad Klaw agent...\n"));

  // Generate keypair
  const keys = generateKeyPair();
  saveKeys(keys);
  console.log(`  ${chalk.green("✓")} Generated Ed25519 keypair`);

  // Create agent card
  const card: AgentCard = {
    squadklaw: "0.1.0",
    agent_id: agentId(),
    name,
    endpoint,
    public_key: keys.publicKey,
    capabilities: ["scheduling", "communication", "research"],
    intents: [
      STANDARD_INTENTS.SCHEDULE,
      STANDARD_INTENTS.MESSAGE,
      STANDARD_INTENTS.REQUEST_INFO,
      STANDARD_INTENTS.HANDOFF,
    ],
    access_control: {
      mode: "open",
    },
  };

  saveCard(card);
  console.log(`  ${chalk.green("✓")} Created agent card`);

  // Save config
  saveConfig({ directoryUrl: opts.directory });
  console.log(`  ${chalk.green("✓")} Saved config`);

  console.log(`\n  ${chalk.bold("Your agent:")}`);
  console.log(`  ID:       ${chalk.cyan(card.agent_id)}`);
  console.log(`  Name:     ${card.name}`);
  console.log(`  Endpoint: ${card.endpoint}`);
  console.log(`  Config:   ${getConfigDir()}`);
  console.log(`\n  Next: ${chalk.dim("sklaw directory")} to start a local directory`);
  console.log(`        ${chalk.dim("sklaw register")}  to register in the directory`);
  console.log(`        ${chalk.dim("sklaw serve")}     to listen for messages\n`);
}
