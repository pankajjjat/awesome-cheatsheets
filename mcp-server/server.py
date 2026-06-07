#!/usr/bin/env python3
"""
MCP server that exposes awesome-cheatsheets as tools to Hermes Agent.

Auto-discovers cheatsheets by scanning the repo directory structure,
builds a search index in memory, and provides four tools:
  - list_cheatsheets
  - get_cheatsheet
  - search_cheatsheets
  - suggest_cheatsheet
"""

import os
import sys
import re
import json
import difflib
import textwrap
from pathlib import Path
from typing import Any

# Determine the repo root (directory containing mcp-server/)
REPO_ROOT = Path(__file__).resolve().parent.parent
# Fallback: look for known category dirs
CATEGORY_DIRS = ["languages", "backend", "frontend", "databases", "tools"]

# ── Cheatsheet discovery ──────────────────────────────────────────────────────

# Map file extensions to a human-readable "type" for descriptions
EXT_TYPE_MAP = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".php": "PHP",
    ".sh": "Shell",
    ".md": "Markdown",
    ".txt": "Text",
    ".css": "CSS",
    ".html": "HTML",
    ".yml": "YAML",
    ".yaml": "YAML",
}


def discover_cheatsheets() -> list[dict[str, Any]]:
    """Walk the repo directory and return a list of cheatsheet metadata dicts."""
    sheets: list[dict[str, Any]] = []
    for cat_dir in CATEGORY_DIRS:
        cat_path = REPO_ROOT / cat_dir
        if not cat_path.is_dir():
            continue
        for entry in sorted(cat_path.iterdir()):
            if not entry.is_file():
                continue
            # Skip hidden files
            if entry.name.startswith("."):
                continue
            name_stem = entry.stem  # filename without extension
            ext = entry.suffix.lower()
            file_type = EXT_TYPE_MAP.get(ext, ext.lstrip(".").upper())
            # Generate a brief description from the first content line
            description = _make_description(entry)
            sheets.append(
                {
                    "name": name_stem,
                    "category": cat_dir,
                    "filepath": str(entry.resolve()),
                    "extension": ext,
                    "type": file_type,
                    "description": description,
                }
            )
    return sheets


def _make_description(filepath: Path) -> str:
    """Extract the first meaningful line from a cheatsheet as a description."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                stripped = line.strip()
                # Skip blank lines, comments, decorators, fences
                if not stripped:
                    continue
                if stripped.startswith("#") or stripped.startswith("//") or stripped.startswith(";"):
                    continue
                if stripped.startswith("```") or stripped.startswith("<!--"):
                    continue
                # Return the first real line (truncated)
                return stripped[:120].rstrip()
    except Exception:
        pass
    return f"{filepath.stem} cheatsheet"


# ── Search index ──────────────────────────────────────────────────────────────

class SearchIndex:
    """Simple in-memory inverted index of cheatsheet content."""

    def __init__(self, sheets: list[dict[str, Any]]):
        # word -> list of (sheet_name, line_number, line_text)
        self._index: dict[str, list[tuple[str, int, str]]] = {}
        for sheet in sheets:
            self._index_sheet(sheet)

    def _index_sheet(self, sheet: dict[str, Any]) -> None:
        try:
            with open(sheet["filepath"], "r", encoding="utf-8", errors="replace") as fh:
                for line_no, raw_line in enumerate(fh, 1):
                    line = raw_line.strip()
                    if not line:
                        continue
                    # Tokenize: split on non-alphanumeric (keep unicode letters)
                    tokens = re.findall(r"[a-zA-Z0-9_\-\.]+", line.lower())
                    for token in tokens:
                        if len(token) < 2:
                            continue
                        self._index.setdefault(token, []).append(
                            (sheet["name"], line_no, line[:200])
                        )
        except Exception:
            pass

    def search(self, query: str, category: str = "") -> list[dict[str, Any]]:
        """Return snippets matching query, optionally filtered by category."""
        tokens = re.findall(r"[a-zA-Z0-9_\-\.]+", query.lower())
        if not tokens:
            return []
        # Collect all matches for any token
        results: dict[str, dict] = {}  # deduplicate by (name, line_no)
        for token in tokens:
            for name, line_no, snippet in self._index.get(token, []):
                key = (name, line_no)
                if key not in results:
                    results[key] = {
                        "name": name,
                        "line": line_no,
                        "snippet": snippet,
                    }
        # Optionally filter by category
        all_sheets = {s["name"]: s["category"] for s in _ALL_SHEETS}
        if category:
            filtered = []
            for r in results.values():
                if all_sheets.get(r["name"]) == category:
                    filtered.append(r)
            return filtered
        return list(results.values())

    def query_terms(self, query: str) -> list[str]:
        """Normalize and return query tokens."""
        return re.findall(r"[a-zA-Z0-9_\-\.]+", query.lower())


# Global state – populated at import time
_ALL_SHEETS: list[dict[str, Any]] = []
_SHEETS_BY_NAME: dict[str, dict[str, Any]] = {}
_SEARCH_INDEX: SearchIndex | None = None


def _init_globals():
    global _ALL_SHEETS, _SHEETS_BY_NAME, _SEARCH_INDEX
    _ALL_SHEETS = discover_cheatsheets()
    _SHEETS_BY_NAME = {s["name"].lower(): s for s in _ALL_SHEETS}
    _SEARCH_INDEX = SearchIndex(_ALL_SHEETS)


_init_globals()


# ── MCP Server ────────────────────────────────────────────────────────────────

try:
    from mcp.server import Server, NotificationOptions
    from mcp.server.models import InitializationOptions
    import mcp.server.stdio
    from mcp.types import (
        Tool,
        TextContent,
        CallToolResult,
    )
except ImportError:
    print(
        "ERROR: MCP Python SDK not installed. Run: uv add mcp  or  pip install mcp",
        file=sys.stderr,
    )
    sys.exit(1)

server = Server("awesome-cheatsheets")


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    return [
        Tool(
            name="list_cheatsheets",
            description=(
                "List all available cheatsheets, optionally filtered by category. "
                "Categories: languages, backend, frontend, databases, tools."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Filter by category (languages, backend, frontend, databases, tools). Empty string means all.",
                        "default": "",
                    }
                },
            },
        ),
        Tool(
            name="get_cheatsheet",
            description=(
                "Return the full content of a cheatsheet by name. "
                "Performs fuzzy matching — e.g., 'python' or 'py' matches the Python cheatsheet. "
                "Examples: 'python', 'docker', 'react', 'bash'."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the cheatsheet (fuzzy-matched against filenames)",
                    }
                },
                "required": ["name"],
            },
        ),
        Tool(
            name="search_cheatsheets",
            description=(
                "Full-text search across all cheatsheets. Returns relevant snippets "
                "with filenames and line numbers. Optionally limit to a category."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query (keywords to search for)",
                    },
                    "category": {
                        "type": "string",
                        "description": "Optional category filter (languages, backend, frontend, databases, tools)",
                        "default": "",
                    },
                },
                "required": ["query"],
            },
        ),
        Tool(
            name="suggest_cheatsheet",
            description=(
                "Given a context string (e.g. 'I need to deploy a container'), "
                "suggest relevant cheatsheets with match scores based on keyword overlap."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "context": {
                        "type": "string",
                        "description": "Free-form context describing what you want to do",
                    }
                },
                "required": ["context"],
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> CallToolResult:
    if arguments is None:
        arguments = {}

    if name == "list_cheatsheets":
        return _call_list_cheatsheets(arguments)
    elif name == "get_cheatsheet":
        return _call_get_cheatsheet(arguments)
    elif name == "search_cheatsheets":
        return _call_search_cheatsheets(arguments)
    elif name == "suggest_cheatsheet":
        return _call_suggest_cheatsheet(arguments)
    else:
        return CallToolResult(
            content=[TextContent(type="text", text=f"Unknown tool: {name}")],
            isError=True,
        )


def _call_list_cheatsheets(args: dict[str, Any]) -> CallToolResult:
    category = args.get("category", "").strip().lower()
    sheets = _ALL_SHEETS
    if category:
        sheets = [s for s in sheets if s["category"] == category]
        if not sheets:
            valid = ", ".join(CATEGORY_DIRS)
            return CallToolResult(
                content=[
                    TextContent(
                        type="text",
                        text=(
                            f"No cheatsheets found in category '{category}'. "
                            f"Valid categories: {valid}"
                        ),
                    )
                ],
                isError=True,
            )
    if not sheets:
        return CallToolResult(
            content=[TextContent(type="text", text="No cheatsheets found.")],
            isError=True,
        )
    lines = [f"{'NAME':<25} {'CATEGORY':<15} {'DESCRIPTION':<60}", "-" * 100]
    for s in sheets:
        desc = s["description"].replace("\n", " ").strip()
        lines.append(f"{s['name']:<25} {s['category']:<15} {desc:<60}")
    return CallToolResult(
        content=[TextContent(type="text", text="\n".join(lines))]
    )


def _fuzzy_find_sheet(name_query: str) -> dict[str, Any] | None:
    """Find a cheatsheet by fuzzy-matching against its name."""
    key = name_query.strip().lower()
    # 1. Exact match
    if key in _SHEETS_BY_NAME:
        return _SHEETS_BY_NAME[key]
    # 2. Case-insensitive exact
    for n, s in _SHEETS_BY_NAME.items():
        if n == key:
            return s
    # 3. Fuzzy: use difflib to find closest match (threshold 0.4)
    names = list(_SHEETS_BY_NAME.keys())
    matches = difflib.get_close_matches(key, names, n=1, cutoff=0.4)
    if matches:
        return _SHEETS_BY_NAME[matches[0]]
    # 4. Partial substring match
    for n, s in _SHEETS_BY_NAME.items():
        if key in n or n in key:
            return s
    return None


def _call_get_cheatsheet(args: dict[str, Any]) -> CallToolResult:
    name_query = args.get("name", "").strip()
    if not name_query:
        return CallToolResult(
            content=[TextContent(type="text", text="Error: 'name' argument is required.")],
            isError=True,
        )
    sheet = _fuzzy_find_sheet(name_query)
    if sheet is None:
        all_names = ", ".join(sorted(_SHEETS_BY_NAME.keys()))
        return CallToolResult(
            content=[
                TextContent(
                    type="text",
                    text=(
                        f"Cheatsheet '{name_query}' not found. "
                        f"Available: {all_names}"
                    ),
                )
            ],
            isError=True,
        )
    try:
        with open(sheet["filepath"], "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
    except Exception as e:
        return CallToolResult(
            content=[
                TextContent(
                    type="text", text=f"Error reading cheatsheet '{name_query}': {e}"
                )
            ],
            isError=True,
        )
    header = (
        f"# {sheet['name']} ({sheet['category']} / {sheet['type']})\n"
        f"# Source: {sheet['filepath']}\n"
        f"# Lines: {content.count(chr(10)) + 1}\n"
        f"{'#' * 60}\n\n"
    )
    return CallToolResult(
        content=[TextContent(type="text", text=header + content)]
    )


def _call_search_cheatsheets(args: dict[str, Any]) -> CallToolResult:
    query = args.get("query", "").strip()
    if not query:
        return CallToolResult(
            content=[TextContent(type="text", text="Error: 'query' argument is required.")],
            isError=True,
        )
    category = args.get("category", "").strip().lower()
    if _SEARCH_INDEX is None:
        return CallToolResult(
            content=[TextContent(type="text", text="Search index not available.")],
            isError=True,
        )
    results = _SEARCH_INDEX.search(query, category=category)
    if not results:
        msg = f"No results for '{query}'"
        if category:
            msg += f" in category '{category}'"
        return CallToolResult(
            content=[TextContent(type="text", text=msg)],
            isError=True,
        )
    # Deduplicate and limit output
    seen = set()
    lines = [f"Search results for '{query}'", "-" * 60]
    for r in results[:50]:
        key = (r["name"], r["line"])
        if key in seen:
            continue
        seen.add(key)
        lines.append(f"[{r['name']}:{r['line']}] {r['snippet']}")
    if len(results) > 50:
        lines.append(f"\n... and {len(results) - 50} more matches.")
    lines.append(f"\nTotal matches: {len(results)}")
    return CallToolResult(
        content=[TextContent(type="text", text="\n".join(lines))]
    )


def _call_suggest_cheatsheet(args: dict[str, Any]) -> CallToolResult:
    context = args.get("context", "").strip()
    if not context:
        return CallToolResult(
            content=[TextContent(type="text", text="Error: 'context' argument is required.")],
            isError=True,
        )
    if _SEARCH_INDEX is None:
        return CallToolResult(
            content=[TextContent(type="text", text="Search index not available.")],
            isError=True,
        )
    # Score each sheet by how many context tokens match its indexed terms
    tokens = _SEARCH_INDEX.query_terms(context)
    if not tokens:
        return CallToolResult(
            content=[TextContent(type="text", text="Could not extract meaningful terms from context.")],
            isError=True,
        )
    scores: dict[str, float] = {}
    for token in tokens:
        matches = _SEARCH_INDEX._index.get(token, [])
        for name, _, _ in matches:
            scores[name] = scores.get(name, 0.0) + 1.0
    if not scores:
        return CallToolResult(
            content=[TextContent(type="text", text="No relevant cheatsheets found for this context.")],
            isError=True,
        )
    # Normalise scores relative to max
    max_score = max(scores.values())
    ranked = sorted(scores.items(), key=lambda x: -x[1])
    # Build output
    lines = [
        f"Suggestions for: \"{context}\"",
        "-" * 70,
        f"{'SCORE':<8} {'NAME':<25} {'CATEGORY':<15} {'DESCRIPTION':<40}",
        "-" * 70,
    ]
    for name, score in ranked[:20]:
        pct = score / max_score if max_score > 0 else 0
        sheet = _SHEETS_BY_NAME.get(name.lower())
        cat = sheet["category"] if sheet else "?"
        desc = sheet["description"].replace("\n", " ").strip()[:45] if sheet else ""
        bar_len = int(pct * 10)
        bar = "█" * bar_len + "░" * (10 - bar_len)
        lines.append(f"{bar:<10} {name:<25} {cat:<15} {desc}")
    lines.append(f"\n{len(ranked)} cheatsheets scored. Showing top {min(20, len(ranked))}.")
    return CallToolResult(
        content=[TextContent(type="text", text="\n".join(lines))]
    )


# ── Main entry point ──────────────────────────────────────────────────────────

async def run_server():
    """Run the MCP server over stdio transport."""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="awesome-cheatsheets",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


def main():
    """Entry point: print status then start the server."""
    print(
        f"Awesome Cheatsheets MCP Server v1.0.0",
        file=sys.stderr,
    )
    print(
        f"Discovered {len(_ALL_SHEETS)} cheatsheets across {len(CATEGORY_DIRS)} categories.",
        file=sys.stderr,
    )
    if _ALL_SHEETS:
        cats = set(s["category"] for s in _ALL_SHEETS)
        for c in sorted(cats):
            count = sum(1 for s in _ALL_SHEETS if s["category"] == c)
            print(f"  {c}: {count} sheets", file=sys.stderr)
    import asyncio
    asyncio.run(run_server())


if __name__ == "__main__":
    main()
