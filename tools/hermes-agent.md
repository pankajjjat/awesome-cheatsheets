# Hermes Agent — Cheatsheet

*Hermes Agent is an intelligent AI agent created by **Nous Research**.
It runs on a local runtime, uses LLMs via providers, and has a skill/tool/plugin system.*

---

## Installation

```bash
# pip (PyPI)
pip install hermes-agent

# uv (faster)
uv pip install hermes-agent

# From source
git clone https://github.com/nousresearch/hermes-agent
cd hermes-agent
uv sync
hermes --help
```

## CLI Commands

```bash
hermes --help                          # Show help
hermes <prompt>                        # Run a prompt (single-turn)
hermes chat                            # Start interactive chat session
hermes chat --model gpt-4o            # Chat with specific model
hermes run <task>                      # Execute a task with tools
hermes run --profile work              # Use specific profile

# Session management
hermes session list                    # List active sessions
hermes session attach <id>             # Attach to running session
hermes session kill <id>               # Terminate session

# Configuration
hermes config show                     # Show current config
hermes config set <key> <value>        # Set config value
hermes config get <key>                # Get config value
hermes config path                     # Show config file location

# Profile management
hermes profile list                    # List profiles
hermes profile create <name>           # Create new profile
hermes profile switch <name>           # Switch active profile
hermes profile delete <name>           # Delete profile

# Skills
hermes skill list                      # List loaded skills
hermes skill view <name>               # View skill details
hermes skill install <path|url>        # Install a skill
hermes skill create <name>             # Create new skill scaffold

# Tools
hermes tool list                       # List available tools
hermes tool call <name> <args>         # Call tool directly
hermes tool enable <name>              # Enable a tool
hermes tool disable <name>             # Disable a tool

# Plugins
hermes plugin list                     # List installed plugins
hermes plugin install <pkg>            # Install plugin
hermes plugin remove <name>            # Remove plugin

# Servers (MCP)
hermes serve rest                      # Start REST API server
hermes serve stdio                     # Start stdio-based server
hermes serve sse                       # Start SSE endpoint

# System
hermes doctor                          # Check system health
hermes update                          # Update Hermes Agent
hermes version                         # Show version info
hermes env                             # Show environment info
```

## Profiles

Profiles isolate config, skills, plugins, cron, and memory. Each profile lives under:

```
~/.hermes/profiles/<name>/
├── config.yaml        # Profile configuration
├── skills/            # Skill definitions
│   └── <name>/
│       ├── skill.yaml
│       ├── instructions.md
│       └── ...
├── plugins/           # Plugin storage
├── cron/              # Cron jobs
└── memories/          # Persistent memory
```

Default profile path: `~/.hermes/profiles/default/`

```bash
# Create a profile for different contexts
hermes profile create work
hermes profile create coding

# Set env-var-based switching
export HERMES_PROFILE=work

# Profile-aware commands
hermes --profile coding run "Refactor this module"
```

## Skills

Skills give Hermes specialized knowledge and workflows. They are loaded from profile's `skills/` dir.

### Skill Structure

Each skill is a folder with:
```
skills/<name>/
├── skill.yaml          # Metadata (name, description, version, tools)
├── instructions.md     # System prompt/instructions for the skill
├── actions/            # Custom action implementations
└── assets/             # Reference files, templates, examples
```

### skill.yaml Example

```yaml
name: hermes-agent
description: Knowledge about Hermes Agent itself
version: 1.0.0
tools:
  - read_file
  - search_files
  - write_file
  - terminal
actions: []
```

### Loading Skills

```bash
# Skills in active profile's skills/ dir load automatically
# Manually load:
hermes skill load <name>
hermes skill reload <name>   # Reload after editing
hermes skill unload <name>
```

### System Skills (Built-in)

| Skill | Purpose |
|-------|---------|
| `hermes-agent` | Knowledge about Hermes itself |
| `web-browsing` | Web scraping and navigation |
| `code` | Programming assistance |
| `terminal` | Shell command execution |
| `file-operations` | Read/write/search files |
| `research` | Deep research workflows |
| `planning` | Task planning and decomposition |

## Toolsets

Toolsets group related tools. Enable/disable per session.

### Built-in Tools

| Tool | Description |
|------|-------------|
| `read_file` | Read files with line numbers |
| `write_file` | Write/create files |
| `patch` | Find-and-replace edits |
| `search_files` | Grep/find files |
| `terminal` | Execute shell commands |
| `process` | Manage background processes |
| `vision_analyze` | Analyze images |
| `skill_view` | Load skill content |

### Custom Tools

Create tools in a profile's config or via plugins.

## Providers (LLM Backends)

Hermes supports multiple LLM providers:

| Provider | Config Key | Example |
|----------|-----------|---------|
| OpenAI | `provider: openai` | gpt-4o, gpt-4o-mini |
| Anthropic | `provider: anthropic` | claude-3-opus, claude-3-sonnet |
| Google | `provider: google` | gemini-1.5-pro, gemini-2.0-flash |
| Ollama | `provider: ollama` | llama3, mistral (local) |
| vLLM | `provider: vllm` | Self-hosted OSS models |
| OpenRouter | `provider: openrouter` | Multi-model gateway |
| Custom | `provider: custom` | Any OpenAI-compatible API |

### Provider Configuration

```yaml
# In ~/.hermes/profiles/default/config.yaml

provider: openai
model: gpt-4o
api_key: ${OPENAI_API_KEY}        # Env vars supported
temperature: 0.7
max_tokens: 4096

# ollama (local)
# provider: ollama
# model: llama3.2
# ollama_host: http://localhost:11434

# Multi-model support
models:
  fast: gpt-4o-mini
  capable: gpt-4o
  cheap: claude-3-haiku
```

## Slash Commands

In chat mode, these slash commands are available:

```
/help           Show help
/clear          Clear conversation
/model <name>   Switch model mid-session
/temperature N  Set temperature
/tokens N       Set max tokens
/save <name>    Save conversation
/load <name>    Load saved conversation
/export         Export as markdown/json
/context        Show current context
/tools          List available tools
/enable <tool>  Enable a tool
/disable <tool> Disable a tool
/profile <name> Switch profile
/cron list      List cron jobs
/exit           Exit session
```

## Configuration (config.yaml)

Full config structure:

```yaml
# Provider
provider: openai
model: gpt-4o
api_key: ${OPENAI_API_KEY}

# Behavior
temperature: 0.7
max_tokens: 4096
system_prompt: "You are a helpful assistant."

# Skills
skills:
  enabled:
    - hermes-agent
    - code
  disabled: []

# Tools
tools:
  enabled:
    - read_file
    - write_file
    - search_files
    - terminal
    - process
  disabled:
    - vision_analyze

# Memory
memory:
  enabled: true
  backend: sqlite            # sqlite, postgres, etc
  path: ~/.hermes/memory.db

# Cron
cron:
  enabled: true

# Server (when running in serve mode)
server:
  host: 0.0.0.0
  port: 8080
  cors: true
  auth_token: ${HERMES_AUTH_TOKEN}
```

## Spawning Patterns

### Single Turn

```bash
hermes "Explain the CAP theorem in one sentence"
hermes --model gpt-4o-mini "Summarize this file"
```

### Interactive Chat

```bash
hermes chat
hermes chat --profile coding
hermes chat --tools terminal,read_file
```

### Server Mode

```bash
# REST API server
hermes serve rest --port 8080

# SSE streaming endpoint
hermes serve sse --port 8080

# Stdio (for embedding in other processes)
hermes serve stdio

# Health check
curl http://localhost:8080/health
```

### Pipeline / Sub-agent

```bash
# Run as sub-process
hermes run "Analyze this repository" --output json
hermes run "Draft a README" | head -50
```

### Cron Jobs

Schedule periodic tasks in `~/.hermes/profiles/<name>/cron/`:

```yaml
# cron/report.yaml
name: daily-report
schedule: "0 9 * * *"     # Every day at 9 AM
task: "Generate daily status report from ~/logs"
```

## Environment Variables

```bash
HERMES_PROFILE=work        # Active profile
HERMES_CONFIG=~/custom.yaml  # Custom config path
HERMES_HOME=~/.hermes      # Data directory
HERMES_AUTH_TOKEN=<token>  # Server auth token
HERMES_LOG_LEVEL=debug     # Log verbosity
```

## Troubleshooting

```bash
hermes doctor                        # System check
tail -f ~/.hermes/logs/hermes.log    # View logs
hermes config show                   # Verify config
hermes session list                  # Check for stuck sessions
hermes session kill <id>             # Kill stuck session

# Common issues:
# - "No provider configured": set provider + api_key in config
# - "Skill not found": check profile's skills/ directory
# - "Tool not available": enable it in config or cli
