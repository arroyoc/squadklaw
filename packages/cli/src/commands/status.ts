import chalk from "chalk";
import { loadCard, loadKeys, loadConfig, getConfigDir, isInitialized } from "../config.js";

export async function statusCommand() {
  if (!isInitialized()) {
    console.log(chalk.red("\n  Not initialized. Run `sklaw init` first.\n"));
    return;
  }

  const card = loadCard()!;
  const keys = loadKeys()!;
  const config = loadConfig();

  console.log(chalk.bold("\n  Squad Klaw Agent Status\n"));
  console.log(`  ID:           ${chalk.cyan(card.agent_id)}`);
  console.log(`  Name:         ${card.name}`);
  console.log(`  Endpoint:     ${card.endpoint}`);
  console.log(`  Capabilities: ${card.capabilities.join(", ")}`);
  console.log(`  Intents:      ${card.intents.join(", ")}`);
  console.log(`  Access:       ${card.access_control?.mode ?? "open"}`);
  console.log(`  Directory:    ${config.directoryUrl}`);
  console.log(`  Config dir:   ${getConfigDir()}`);
  console.log(`  Public key:   ${chalk.dim(keys.publicKey.split("\n")[1]?.slice(0, 40) + "...")}`);
  console.log();
}
