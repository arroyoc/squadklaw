import chalk from "chalk";
import { createServer } from "node:http";
import { loadCard, loadKeys, isInitialized } from "../config.js";
import { MessageSchema, verifyMessage } from "@squadklaw/core";

export async function serveCommand(opts: { port: string }) {
  if (!isInitialized()) {
    console.log(chalk.red("\n  Not initialized. Run `sklaw init` first.\n"));
    return;
  }

  const card = loadCard()!;
  const keys = loadKeys()!;
  const port = parseInt(opts.port, 10);

  console.log(chalk.bold("\n  Squad Klaw Agent Server\n"));
  console.log(`  Agent:    ${card.name} (${chalk.cyan(card.agent_id)})`);
  console.log(`  Listening on port ${port}`);
  console.log(chalk.dim("  Press Ctrl+C to stop\n"));

  const server = createServer(async (req, res) => {
    // Health check
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ agent: card.name, agent_id: card.agent_id, status: "online" }));
      return;
    }

    // Agent endpoint
    if (req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;

      try {
        const message = JSON.parse(body);
        const parsed = MessageSchema.safeParse(message);

        if (!parsed.success) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            error: { code: "INVALID_MESSAGE", message: "Invalid message format", retry: false },
          }));
          return;
        }

        const ts = new Date().toLocaleTimeString();
        console.log(`  ${chalk.dim(ts)} ${chalk.cyan("←")} Incoming from ${chalk.yellow(parsed.data.from)}`);
        console.log(`    Intent:  ${parsed.data.intent}`);
        console.log(`    Conv:    ${chalk.dim(parsed.data.conversation_id)}`);
        console.log(`    Payload: ${chalk.dim(JSON.stringify(parsed.data.payload))}`);
        console.log();

        // Auto-acknowledge
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          squadklaw: "0.1.0",
          message_id: `msg_ack_${Date.now()}`,
          conversation_id: parsed.data.conversation_id,
          from: card.agent_id,
          to: parsed.data.from,
          timestamp: new Date().toISOString(),
          intent: parsed.data.intent,
          payload: { action: "acknowledged", message: "Message received by agent" },
          signature: "pending",
        }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: { code: "INVALID_MESSAGE", message: "Invalid JSON", retry: false },
        }));
      }
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(port, () => {
    console.log(chalk.green(`  ✓ Agent server running on http://localhost:${port}\n`));
    console.log(chalk.dim("  Waiting for messages...\n"));
  });
}
