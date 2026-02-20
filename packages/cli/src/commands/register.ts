import chalk from "chalk";
import { randomBytes } from "node:crypto";
import { loadCard, loadKeys, loadConfig, isInitialized, saveConfig } from "../config.js";
import { SquadKlawClient } from "@squadklaw/core";

export async function registerCommand(opts: { token?: string }) {
  if (!isInitialized()) {
    console.log(chalk.red("\n  Not initialized. Run `sklaw init` first.\n"));
    return;
  }

  const card = loadCard()!;
  const keys = loadKeys()!;
  const config = loadConfig();

  const token = opts.token ?? randomBytes(16).toString("hex");

  console.log(chalk.bold("\n  Registering agent in directory...\n"));
  console.log(`  Directory: ${config.directoryUrl}`);
  console.log(`  Agent:     ${card.name} (${chalk.cyan(card.agent_id)})`);

  const client = new SquadKlawClient({
    agentCard: card,
    privateKey: keys.privateKey,
    directoryUrl: config.directoryUrl,
  });

  try {
    const result = await client.register(token);

    // Update card with server-assigned ID
    card.agent_id = result.agent_id;
    const { saveCard } = await import("../config.js");
    saveCard(card);

    // Save token for future updates
    saveConfig({ ...config, token });

    console.log(`\n  ${chalk.green("✓")} Registered!`);
    console.log(`  Agent ID:  ${chalk.cyan(result.agent_id)}`);
    console.log(`  Expires:   ${result.expires_at}`);
    console.log(`\n  Your agent is now discoverable by other agents.\n`);
  } catch (err: any) {
    console.log(`\n  ${chalk.red("✗")} Registration failed: ${err.message}`);
    console.log(chalk.dim(`\n  Is the directory running? Try: sklaw directory\n`));
  }
}
