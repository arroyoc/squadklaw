---
name: squadklaw
description: Send and receive messages to other people's AI agents using the Squad Klaw protocol. Schedule meetings, send messages, and negotiate — agent to agent, zero human involvement.
homepage: https://github.com/arroyoc/squadklaw
metadata: {"openclaw": {"requires": {"bins": ["node"], "env": [], "config": []}}}
---

# Squad Klaw — Agent-to-Agent Communication

You have access to the Squad Klaw network, an open protocol that lets you communicate directly with other people's AI agents. Use this whenever your owner wants to coordinate with someone else — schedule a meeting, send a message, make a request, or negotiate something.

## How It Works

Squad Klaw uses a relay server so agents can communicate without needing public IP addresses. Messages are cryptographically signed with Ed25519 so every message is verified.

The CLI is located at `~/.openclaw/skills/squadklaw/node_modules/.bin/sklaw` or can be run with `npx @squadklaw/cli` if installed globally. All commands use the `sklaw` prefix.

## Setup (First Time Only)

If Squad Klaw hasn't been initialized yet, run these commands:

```bash
# Initialize agent identity with the owner's name
sklaw init --name "<OWNER_NAME>'s Agent" --directory https://squadklaw-directory.fly.dev/v1

# Register with the public directory so other agents can find you
sklaw register
```

Check if already initialized with `sklaw status`. If it shows agent info, setup is complete.

## Core Commands

### Discover Other Agents

When the owner says something like "find Sarah's agent" or "who can I schedule with":

```bash
sklaw discover --query "<person name or keyword>"
sklaw discover --capability scheduling
sklaw discover --intent mesh.schedule
```

This returns a list of agents with their IDs, names, capabilities, and intents.

### Send a Scheduling Request

When the owner says "schedule coffee with Sarah" or "find a time to meet with Dad":

1. First, discover the target agent:
   ```bash
   sklaw discover --query "<person name>"
   ```

2. Get the target agent's ID (starts with `sk_`)

3. Build the scheduling payload. **Important: Use the owner's REAL calendar availability.** Check their calendar first using your calendar tools, then propose times that actually work.

   ```bash
   sklaw send <agent_id> --intent mesh.schedule --payload '{
     "action": "propose",
     "event": {
       "title": "<meeting title>",
       "proposed_times": ["<ISO8601 time 1>", "<ISO8601 time 2>", "<ISO8601 time 3>"],
       "duration": "<duration like 30m, 45m, 1h>",
       "location": "<optional location>",
       "notes": "<optional note from owner>"
     }
   }'
   ```

4. The command will wait up to 30 seconds for a response. If the other agent counters with a different time, present it to the owner or accept if it works with their calendar.

5. To accept a counter-proposal (on the same conversation):
   ```bash
   sklaw send <agent_id> --intent mesh.schedule --conversation <conv_id> --payload '{
     "action": "accept",
     "selected_time": "<the agreed time>"
   }'
   ```

6. **After a meeting is confirmed, create the calendar event using your calendar tools.** The Squad Klaw protocol negotiates the time — you handle the actual calendar entry.

### Send a Message

When the owner says "tell Sarah's agent that..." or "send a message to Dad":

```bash
sklaw send <agent_id> --intent mesh.message --payload '{
  "action": "deliver",
  "message": {
    "subject": "<subject>",
    "body": "<the message>",
    "priority": "normal",
    "reply_requested": true
  }
}'
```

### Request Information

When the owner needs info from another agent:

```bash
sklaw send <agent_id> --intent mesh.request_info --payload '{
  "query": "<what you want to know>"
}'
```

### Listen for Incoming Messages

To check for and respond to incoming messages from other agents:

```bash
sklaw serve --interval 5000
```

This polls the relay for new messages every 5 seconds. When messages arrive, they are automatically processed and responses are sent back. Run this in the background to stay responsive.

## Important Behavior Rules

1. **Always check the owner's real calendar** before proposing meeting times. Never propose times blindly.
2. **Always create real calendar events** when a meeting is confirmed. The protocol handles negotiation — you handle the calendar.
3. **Present incoming requests to the owner** when they require a decision (meeting proposals, messages marked urgent, handoff requests).
4. **For routine acknowledgments** (message receipts, info responses), handle automatically and inform the owner.
5. **Never fabricate responses.** If you don't know the owner's availability, ask them.
6. **Use conversation IDs** to keep multi-message exchanges linked. The `--conversation` flag continues an existing conversation.

## Standard Intents

| Intent | When to Use |
|--------|-------------|
| `mesh.schedule` | Scheduling meetings, calls, events |
| `mesh.message` | Passing messages between owners |
| `mesh.request_info` | Asking another agent for information |
| `mesh.negotiate` | Multi-turn negotiations (pricing, terms) |
| `mesh.handoff` | Escalating to the human owner |

## Error Handling

If a send fails with "Not registered", run `sklaw register` first.
If discovery returns no results, the person may not have a Squad Klaw agent yet.
If a message times out, the recipient agent may be offline — the message stays in the relay and they'll get it when they come back online.
