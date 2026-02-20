import chalk from "chalk";

export async function directoryCommand(opts: { port: string }) {
  const port = opts.port;

  // Dynamically import the directory server and override the port
  process.env.PORT = port;

  console.log(chalk.bold("\n  Starting Squad Klaw Directory...\n"));

  try {
    await import("@squadklaw/directory");
    console.log(`\n  ${chalk.green("✓")} Directory running on http://localhost:${port}`);
    console.log(chalk.dim("  Press Ctrl+C to stop\n"));
  } catch (err: any) {
    console.log(`  ${chalk.red("✗")} Failed to start directory: ${err.message}\n`);
  }
}
