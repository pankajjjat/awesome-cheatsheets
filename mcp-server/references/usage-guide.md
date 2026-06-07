# Advanced MCP Usage Patterns for Awesome Cheatsheets

This guide covers advanced patterns for using the awesome-cheatsheets MCP tools effectively. It assumes the MCP server is registered and running.

---

## 1. Tool Chaining Patterns

### Pattern: Research → Code Generation

Chain search and get for maximum context:

```
Step 1: search_cheatsheets(query="mongoose schema", category="backend")
    → identifies line 42 in node.js with mongoose.Schema definition

Step 2: get_cheatsheet(name="node")
    → loads the full node.js cheatsheet with Express + Mongoose patterns

Step 3: get_cheatsheet(name="mongodb")
    → loads MongoDB query patterns for the data layer
```

### Pattern: Suggest → Verify → Use

Discover the right sheet, verify it, then load it:

```
Step 1: suggest_cheatsheet(context="Containerize a microservice with orchestration")
    → returns: Docker ██████████, Kubernetes ████████, Nginx ████

Step 2: get_cheatsheet(name="docker")
    → review Dockerfile patterns

Step 3: get_cheatsheet(name="kubernetes")
    → review deployment/service/ingress patterns
```

### Pattern: Category-Focused Deep Dive

Explore everything in a category before building:

```
Step 1: list_cheatsheets(category="frontend")
    → shows all frontend sheets

Step 2: get_cheatsheet(name="react")
    → load primary framework

Step 3: get_cheatsheet(name="tailwind")
    → load styling framework

Step 4: search_cheatsheets(query="state management", category="frontend")
    → find state management patterns across all frontend sheets
```

---

## 2. Fuzzy Matching Details

The `get_cheatsheet` tool uses a multi-strategy fuzzy matcher in this order:

1. **Exact match** — `"python"` matches `python.md`
2. **Case-insensitive exact** — `"Python"` matches `python.md`
3. **difflib close match** (cutoff 0.4) — `"py"` matches `python.md`, `"dock"` matches `docker.sh`
4. **Substring match** — `"type"` matches `typescript.md` and `typescript.ts` (frontend)

Known fuzzy matching behaviors:

| Query        | Matches                        | Notes                             |
|--------------|--------------------------------|-----------------------------------|
| `py`         | `python`                       | Partial, works via difflib        |
| `dock`       | `docker`                       | Partial prefix match              |
| `react`      | `react`                        | Exact                             |
| `ang`        | `angular` (first match)        | May match angular before angularjs |
| `kuber`      | `kubernetes`                   | Substring match                   |
| `c#`         | `C#`                           | Exact (file is `C#.txt`)          |
| `golang`     | `golang`                       | Stem name match                   |

If fuzzy matching fails, you can always use `read_file` with the direct path.

---

## 3. Search Syntax

The `search_cheatsheets` tool tokenizes queries into alphanumeric tokens and finds all lines containing any of those tokens. There is no phrase matching or boolean operators.

### Effective Searching

| Goal                          | Query                   | Notes                                    |
|-------------------------------|-------------------------|------------------------------------------|
| Find syntax patterns          | `async await`           | Finds lines with either term             |
| Find specific functions       | `Array.prototype.map`   | Dots and hyphens preserved in tokens     |
| Find configuration keywords   | `middleware route`      | Broad search, deduplicates by line       |
| Narrow to a category          | (with `category="backend"`) | Filter after search                  |
| Find CLI commands             | `docker compose`        | Matches files mentioning either term     |

### Search Limitations

- No phrase matching — `"virtual environment"` returns lines with "virtual" OR "environment"
- No boolean operators (AND/OR/NOT)
- Results are deduplicated by (filename, line number)
- Maximum 50 results returned (with overflow count)
- Minimum token length of 2 characters

For precise lookups, prefer `get_cheatsheet` with a known name.

---

## 4. Suggest Tool Scoring

The `suggest_cheatsheet` tool scores cheatsheets by counting how many tokens from your context appear in each sheet's indexed content. The score is normalized to a 10-segment bar:

```
Suggestions for: "deploy container with database"
──────────────────────────────────────────────────────────────────────
SCORE     NAME                     CATEGORY         DESCRIPTION
██████████ docker                  tools            Docker cheatsheet
███████░░░ kubernetes              tools            Kubernetes cheatsheet
█████░░░░░ mysql                   databases        MySQL cheatsheet
████░░░░░░ mongodb                 databases        MongoDB cheatsheet
███░░░░░░░ nginx                   tools            Nginx cheatsheet
```

The scoring is purely keyword-overlap based — no semantic understanding. For better suggestions, provide concrete keywords in your context rather than vague descriptions.

---

## 5. Direct File Access (Without MCP)

If the MCP server is not running, you can access cheatsheets directly via `read_file`:

```python
# Read a cheatsheet directly
read_file(path="~/awesome-cheatsheets/tools/docker.sh")

# Read by category
read_file(path="~/awesome-cheatsheets/languages/python.md")
read_file(path="~/awesome-cheatsheets/frontend/react.js")
read_file(path="~/awesome-cheatsheets/databases/mysql.sh")
read_file(path="~/awesome-cheatsheets/backend/django.py")
```

The repo root is at `~/awesome-cheatsheets` (default) or wherever the user cloned it.

---

## 6. Handling Edge Cases

### Tool Returns "Not Found"

```
get_cheatsheet(name="angularjs")
```

If fuzzy matching returns the wrong sheet (e.g., `angular` instead of `angularjs`), use the exact stem name from `list_cheatsheets()`.

### Category Returns Empty

```
list_cheatsheets(category="languages")
```

Always check the category name — valid values are: `languages`, `backend`, `frontend`, `databases`, `tools`.

### Server Not Running

If tools are unavailable, the MCP server may need to be started. The user can run:

```bash
cd ~/awesome-cheatsheets
hermes mcp add cheatsheets --command "python mcp-server/server.py"
```

Or start directly:

```bash
cd ~/awesome-cheatsheets/mcp-server
python server.py
```

### File Encoding Issues

Some cheatsheets may have encoding quirks (e.g., UTF-8 BOM, mixed line endings). The MCP server handles these with `errors="replace"`. If direct `read_file` fails, try passing through the MCP tool which handles errors gracefully.

---

## 7. Performance Notes

- The search index is built at startup and lives in memory — all searches are O(1) token lookups
- `get_cheatsheet` reads the file from disk on each call (files are small, typically 50-500 lines)
- `suggest_cheatsheet` iterates all indexed tokens — scales with vocabulary size, not file count
- Maximum practical sheets: ~100 (current repo has ~30)

---

## 8. Extending the MCP Server

The MCP server at `mcp-server/server.py` is designed to be extended. The key extension points:

### Adding a new tool

```python
@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    return [
        # ... existing tools ...
        Tool(
            name="cheatsheet_stats",
            description="Get statistics about the cheatsheet collection",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]

# Add handler
@server.call_tool()
async def handle_call_tool(name, arguments):
    if name == "cheatsheet_stats":
        return _call_cheatsheet_stats(arguments)
    # ... existing handlers ...

def _call_cheatsheet_stats(args):
    total = len(_ALL_SHEETS)
    cats = Counter(s["category"] for s in _ALL_SHEETS)
    text = f"Total cheatsheets: {total}\n"
    for cat, count in sorted(cats.items()):
        text += f"  {cat}: {count}\n"
    return CallToolResult(content=[TextContent(type="text", text=text)])
```

### Adding new categories

Create a directory in the repo root (e.g., `cloud/` or `devops/`) and add it to `CATEGORY_DIRS` in `server.py`. Restart the server.

---

## 9. Troubleshooting

| Symptom                              | Likely Cause                          | Fix                                      |
|--------------------------------------|---------------------------------------|------------------------------------------|
| `ModuleNotFoundError: No module named 'mcp'` | MCP SDK not installed          | `pip install mcp`                        |
| Tools not showing in Hermes          | Server not registered                 | `hermes mcp add cheatsheets --command ...`|
| Empty results from `list_cheatsheets`| Wrong working directory               | Run server from repo root                |
| `search_cheatsheets` returns nothing | No matching tokens                    | Try broader query terms                  |
| `suggest_cheatsheet` returns nothing | Context too vague                     | Add more specific keywords               |
| `get_cheatsheet` returns wrong file  | Fuzzy match ambiguity                 | Use exact filename from `list_cheatsheets`|

---

*Happy cheatsheeting!*
