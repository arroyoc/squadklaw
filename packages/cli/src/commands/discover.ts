import chalk from "chalk";
import { loadCard, loadKeys, loadConfig, isInitialized } from "../config.js";
import { SquadKlawClient } from "@squadklaw/core";

export async function discoverCommand(opts: {
  capability?: string;
  intent?: string;
  query?: string;
  limit: string;
}) {
  if (!isInitialized()) {
    console.log(chalk.red("\n  Not initialized. Run `sklaw init` first.\n"));
    return;
  }

  const card = loadCard()!;
  const keys = loadKeys()!;
  const config = loadConfig();

  const client = new SquadKlawClient({
    agentCard: card,
    privateKey: keys.privateKey,
    directoryUrl: config.directoryUrl,
  });

  console.log(chalk.bold("\n  Discovering agents...\n"));

  try {
    const result = await client.discover({
      capability: opts.capability,
      intent: opts.intent,
      q: opts.query,
      limit: parseInt(opts.limit, 10),
    });

    if (result.agents.length === 0) {
      console.log(chalk.dim("  No agents found.\n"));
      return;
    }

    console.log(`  Found ${chalk.cyan(String(result.agents.length))} agent(s):\n`);

    for (const agent of result.agents) {
      console.log(`  ${chalk.cyan(agent.agent_id)}`);
      console.log(`    Name:         ${agent.name}`);
      if (agent.description) {
        console.log(`    Description:  ${chalk.dim(agent.description)}`);
      }
      console.log(`    Capabilities: ${agent.capabilities.join(", ")}`);
      console.log(`    Intents:      ${agent.intents.join(", ")}`);
      console.log(`    Endpoint:     ${chalk.dim(agent.endpoint)}`);
      console.log();
    }
  } catch (err: any) {
    console.log(`  ${chalk.red("✗")} Discovery failed: ${err.message}`);
    console.log(chalk.dim(`\n  Is the directory running? Try: sklaw directory\n`));
  }
}
