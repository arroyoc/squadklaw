import chalk from "chalk";
import { loadCard, loadKeys, loadConfig, isInitialized } from "../config.js";
import { SquadKlawClient, type ErrorResponse } from "@squadklaw/core";

export async function sendCommand(
  agentIdArg: string,
  opts: {
    intent: string;
    payload: string;
    conversation?: string;
  }
) {
  if (!isInitialized()) {
    console.log(chalk.red("\n  Not initialized. Run `sklaw init` first.\n"));
    return;
  }

  const card = loadCard()!;
  const keys = loadKeys()!;
  const config = loadConfig();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(opts.payload);
  } catch {
    console.log(chalk.red("\n  Invalid JSON payload.\n"));
    return;
  }

  const client = new SquadKlawClient({
    agentCard: card,
    privateKey: keys.privateKey,
    directoryUrl: config.directoryUrl,
  });

  console.log(chalk.bold("\n  Sending message...\n"));
  console.log(`  To:     ${chalk.cyan(agentIdArg)}`);
  console.log(`  Intent: ${opts.intent}`);

  try {
    // Look up the target agent
    const target = await client.getAgent(agentIdArg);
    console.log(`  Name:   ${target.name}`);

    const response = await client.send(
      target,
      opts.intent,
      payload,
      opts.conversation
    );

    if ("error" in response) {
      const err = response as ErrorResponse;
      console.log(`\n  ${chalk.red("✗")} ${err.error.code}: ${err.error.message}\n`);
      return;
    }

    console.log(`\n  ${chalk.green("✓")} Message sent!`);
    console.log(`  Message ID:      ${chalk.dim(response.message_id)}`);
    console.log(`  Conversation ID: ${chalk.dim(response.conversation_id)}`);
    console.log(`\n  Response payload:`);
    console.log(chalk.dim(`  ${JSON.stringify(response.payload, null, 2).split("\n").join("\n  ")}`));
    console.log();
  } catch (err: any) {
    console.log(`\n  ${chalk.red("✗")} Send failed: ${err.message}\n`);
  }
}
