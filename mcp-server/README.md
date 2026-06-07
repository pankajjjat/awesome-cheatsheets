# Awesome Cheatsheets MCP Server

A Python MCP (Model Context Protocol) server that exposes all cheatsheets from the [awesome-cheatsheets](https://github.com/LeCoupa/awesome-cheatsheets) repository as tools for Hermes Agent.

## What it does

The server scans the awesome-cheatsheets directory structure, builds an in-memory search index, and provides four tools:

| Tool | Description |
|------|-------------|
| `list_cheatsheets(category)` | List all available cheatsheets, optionally filtered by category |
| `get_cheatsheet(name)` | Return the full content of a cheatsheet by name (fuzzy-match) |
| `search_cheatsheets(query, category)` | Full-text search across all cheatsheets |
| `suggest_cheatsheet(context)` | Given a context, suggest relevant cheatsheets with match scores |

### Categories

- `languages` — Programming languages (Python, JavaScript, Go, Rust, etc.)
- `backend` — Backend frameworks (Node.js, Django, Laravel, Express, etc.)
- `frontend` — Frontend frameworks (React, Vue, Angular, etc.)
- `databases` — Database tools (MySQL, MongoDB, Redis)
- `tools` — Development tools (Docker, Git, Kubernetes, AWS, etc.)

## How to register it with Hermes

From the `mcp-server/` directory, run:

```bash
hermes mcp add cheatsheets --command "python server.py"
```

Or with a full path:

```bash
hermes mcp add cheatsheets --command "python C:\Users\panka\awesome-cheatsheets\mcp-server\server.py"
```

Hermes will start the server via stdio transport and the tools will be available for use.

## Requirements

- Python 3.10+
- `mcp` Python package (installed automatically when registering with Hermes)

Install locally:
```bash
pip install mcp
# or
uv add mcp
```

## Example tool usage

Once registered, you can use the tools in conversation with Hermes:

### List all cheatsheets
```
List all available cheatsheets
```

### List cheatsheets in a category
```
Show me the cheatsheets for databases
```

### Get a specific cheatsheet
```
Show me the Docker cheatsheet
Get the Python cheatsheet
```

### Search across cheatsheets
```
Search for "virtual environment" in cheatsheets
```

### Get suggestions
```
I need to deploy a container with orchestration
```

## Running standalone

You can also run the server directly (it will print discovery info to stderr):

```bash
python server.py
```

It will start and listen on stdio for MCP protocol messages.
