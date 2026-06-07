---
name: awesome-cheatsheets
description: "Access 30+ curated cheatsheets for languages, frameworks, databases, and development tools — served via MCP tools and local repo files."
version: 1.0.0
author: Saumya (MITTI Founder)
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [cheatsheet, reference, productivity, development]
    homepage: https://github.com/pankajjjat/awesome-cheatsheets
---

# Awesome Cheatsheets Skill

## 1. Overview

**awesome-cheatsheets** is a curated collection of 46k+ GitHub stars, 30+ cheatsheets for popular programming languages, frameworks, databases, and development tools — everything you should know in a single file. It is maintained by [LeCoupa](https://github.com/LeCoupa/awesome-cheatsheets).

This skill teaches the agent how to leverage the cheatsheets repository effectively via:

- **MCP tools** — `list_cheatsheets`, `get_cheatsheet`, `search_cheatsheets`, `suggest_cheatsheet` (requires MCP server running)
- **Local file access** — direct `read_file` of cheatsheet files in the repo

The MCP server auto-discovers cheatsheets by scanning the repo directory structure and builds an in-memory search index. It provides fuzzy name matching, full-text search, and context-based suggestions.

---

## 2. Setup

### Prerequisites

- Python 3.10+
- `mcp` Python package

### Install and Register the MCP Server

```bash
cd ~/awesome-cheatsheets
pip install mcp
hermes mcp add cheatsheets --command "python mcp-server/server.py"
```

After registration, the four tools (`list_cheatsheets`, `get_cheatsheet`, `search_cheatsheets`, `suggest_cheatsheet`) become available in Hermes conversation.

### Verify Setup

```bash
hermes tools | grep cheatsheets
# Expected output:
#   list_cheatsheets     — List all available cheatsheets
#   get_cheatsheet       — Return the full content of a cheatsheet
#   search_cheatsheets   — Full-text search across all cheatsheets
#   suggest_cheatsheet   — Suggest relevant cheatsheets for a context
```

---

## 3. File Structure

The repo is organized into five categories. Each file is a self-contained cheatsheet.

### 📃 Languages (`languages/`)

| Cheatsheet   | File                  |
|--------------|-----------------------|
| Bash         | `languages/bash.sh`   |
| C            | `languages/C.txt`     |
| C#           | `languages/C#.txt`    |
| Go           | `languages/golang.md` |
| Java         | `languages/java.md`   |
| JavaScript   | `languages/javascript.js` |
| PHP          | `languages/php.php`   |
| Python       | `languages/python.md` |
| Rust         | `languages/rust.md`   |
| TypeScript   | `languages/typescript.md` |
| XML          | `languages/XML.md`    |

### 📦 Backend (`backend/`)

| Cheatsheet | File                     |
|------------|--------------------------|
| Adonis.js  | `backend/adonis.js`      |
| Django     | `backend/django.py`      |
| Express.js | `backend/express.js`     |
| Feathers.js| `backend/feathers.js`    |
| Laravel    | `backend/laravel.php`    |
| Moleculer  | `backend/moleculer.js`   |
| Node.js    | `backend/node.js`        |
| Sails.js   | `backend/sails.js`       |

### 🌐 Frontend (`frontend/`)

| Cheatsheet      | File                     |
|-----------------|--------------------------|
| HTML5           | `frontend/html5.html`    |
| CSS3            | `frontend/css3.css`      |
| TypeScript      | `frontend/typescript.ts` |
| React.js        | `frontend/react.js`      |
| Vue.js          | `frontend/vue.js`        |
| Tailwind.css    | `frontend/tailwind.css`  |
| Ember.js        | `frontend/ember.js`      |
| Angular (2+)    | `frontend/angular.js`    |
| AngularJS       | `frontend/angularjs.js`  |

### 🗃️ Databases (`databases/`)

| Cheatsheet | File                    |
|------------|-------------------------|
| MySQL      | `databases/mysql.sh`    |
| MongoDB    | `databases/mongodb.sh`  |
| Redis      | `databases/redis.sh`    |

### 🔧 Tools (`tools/`)

| Cheatsheet       | File                         |
|------------------|------------------------------|
| AWS CLI          | `tools/aws.sh`               |
| cURL             | `tools/curl.sh`              |
| Docker           | `tools/docker.sh`            |
| Drush            | `tools/drush.sh`             |
| Elasticsearch    | `tools/elasticsearch.js`     |
| Emmet            | `tools/emmet.md`             |
| Firebase CLI     | `tools/firebase_cli.md`      |
| GCP CLI          | `tools/gcp.md`               |
| Git              | `tools/git.sh`               |
| GitHub Actions   | `tools/github-actions.md`    |
| Heroku CLI       | `tools/heroku.sh`            |
| Hermes Agent     | `tools/hermes-agent.md`      |
| Kubernetes       | `tools/kubernetes.md`        |
| macOS            | `tools/macos.sh`             |
| Nanobox Boxfile  | `tools/nanobox_boxfile.yml`  |
| Nanobox CLI      | `tools/nanobox_cli.sh`       |
| Next.js          | `tools/nextjs.md`            |
| Nginx            | `tools/nginx.sh`             |
| PM2              | `tools/pm2.sh`               |
| Puppeteer        | `tools/puppeteer.js`         |
| Sublime Text     | `tools/sublime_text.md`      |
| Terraform        | `tools/terraform.md`         |
| Ubuntu           | `tools/ubuntu.sh`            |
| VIM              | `tools/vim.txt`              |
| Visual Studio Code | `tools/vscode.md`          |
| Xcode            | `tools/xcode.txt`            |

---

## 4. Usage Patterns

### Pattern A: Load a cheatsheet as reference context

**When the user asks me to write Python/Docker/React code, I load the relevant cheatsheet as reference context.**

> User: "Write a Django REST API with authentication"
>
> Agent action:
> 1. `get_cheatsheet(name="django")` — loads the Django cheatsheet
> 2. `get_cheatsheet(name="python")` — loads the Python cheatsheet for reference
> 3. Uses the combined context to write production-quality code

### Pattern B: Answer "how do I do X in Y tech"

**When the user asks 'how do I do X in Y tech', I search the cheatsheets for the answer.**

> User: "How do I create a virtual environment in Python?"
>
> Agent action:
> 1. `search_cheatsheets(query="virtual environment")` — finds snippets across all sheets
> 2. `get_cheatsheet(name="python")` — loads the full Python cheatsheet for deep context
> 3. Presents the relevant commands/syntax from the cheatsheet

### Pattern C: Prime context before starting a project

**When starting work on a new project, I scan relevant cheatsheets to prime my context.**

> User: "Let's build a full-stack app with React + Express + MongoDB"
>
> Agent action:
> 1. `get_cheatsheet(name="react")` — React patterns and hooks
> 2. `get_cheatsheet(name="express")` — Express routing and middleware
> 3. `get_cheatsheet(name="mongodb")` — MongoDB queries
> 4. `get_cheatsheet(name="node")` — Node.js fundamentals
> 5. Writes the fullstack app using the primed context

### Pattern D: Discover relevant sheets for an unfamiliar domain

**When the user describes a task I'm not sure which cheatsheet covers, I use the suggest tool.**

> User: "I need to set up CI/CD for my Dockerized app"
>
> Agent action:
> 1. `suggest_cheatsheet(context="CI/CD Docker deployment")` — returns ranked suggestions
> 2. Reviews top suggestions (likely: Docker, GitHub Actions, Git, Kubernetes)
> 3. Loads the most relevant ones

---

## 5. MCP Tool Usage Examples

All four tools are registered when the MCP server is running.

### `list_cheatsheets()`

List everything available:

```
list_cheatsheets()
```

```
list_cheatsheets(category="databases")
```

### `get_cheatsheet(name)`

Get the full content of a cheatsheet. Supports fuzzy matching.

```
get_cheatsheet(name="docker")
get_cheatsheet(name="python")
get_cheatsheet(name="react")
get_cheatsheet(name="kubernetes")
```

The fuzzy matcher handles partial names: `"py"` matches `"python"`, `"kuber"` matches `"kubernetes"`.

### `search_cheatsheets(query, category)`

Full-text search with optional category filter.

```
search_cheatsheets(query="async await")
search_cheatsheets(query="middleware", category="backend")
search_cheatsheets(query="JOIN", category="databases")
```

Returns snippets with filenames and line numbers.

### `suggest_cheatsheet(context)`

Given a free-form context, returns ranked cheatsheet suggestions with visual score bars.

```
suggest_cheatsheet(context="I need to deploy a web app with a database")
suggest_cheatsheet(context="Building a REST API with authentication")
suggest_cheatsheet(context="Container orchestration and cloud deployment")
```

---

## 6. Contributing

### Adding a new cheatsheet

1. **Create the file** in the right category directory:
   - `languages/` for programming languages
   - `backend/` for backend frameworks
   - `frontend/` for frontend frameworks
   - `databases/` for database tools
   - `tools/` for development tools

2. **Follow the format** of existing cheatsheets — each file should be a dense, comprehensive reference covering syntax, common patterns, and gotchas.

3. **Update the README** to add the new cheatsheet to the Table of Contents under the appropriate category.

4. **Submit a pull request** to the upstream repo.

The MCP server auto-discovers new files on restart — no configuration changes needed.

---

## 7. Pitfalls

### Legacy/Older Technology

Some cheatsheets exist for technologies that are deprecated or less commonly used today. Verify currency before using:

| Cheatsheet   | Status  | Notes                                |
|--------------|---------|--------------------------------------|
| AngularJS    | Legacy  | v1.x, superseded by Angular (2+)     |
| Nanobox CLI  | Legacy  | Platform retired in 2024             |
| Nanobox Boxfile | Legacy | Same, format no longer maintained  |
| Drush        | Legacy  | Drupal 7/8 era, newer Drupal uses Drush 12+ |
| Ember.js     | Niche   | Declining adoption, ensure relevance |
| Feathers.js  | Niche   | Smaller community, verify APIs       |
| Moleculer    | Niche   | Microservices framework, verify docs |
| Sails.js     | Niche   | Declining, verify against current docs|

### Cheatsheets Are Condensed Reference, Not Tutorials

Cheatsheets are dense, one-file references — they pack the most important syntax, commands, and patterns. They are not step-by-step tutorials. Use them:

- ✅ To look up syntax quickly
- ✅ To refresh on patterns you already know
- ✅ To discover features you may have missed
- ❌ NOT as a replacement for official docs or learning resources

### MCP Server Requires Local Clone

The MCP server reads files from the local filesystem. It needs the repository cloned and the server running. If the tools are unavailable:

- Fall back to `read_file` with the direct paths listed in the file structure above
- Or run the MCP server manually: `python ~/awesome-cheatsheets/mcp-server/server.py`

### File Extension Diversity

Cheatsheets use different file extensions (`.sh`, `.py`, `.js`, `.md`, `.txt`, `.css`, `.html`, `.yml`). The MCP server handles all of them, but direct `read_file` calls should use the correct path. Use `list_cheatsheets()` to see the exact file paths.

---

## 8. Quick Reference

| Action                                  | Tool / Command                                  |
|-----------------------------------------|-------------------------------------------------|
| List all cheatsheets                    | `list_cheatsheets()`                            |
| List by category                        | `list_cheatsheets(category="tools")`            |
| Get full cheatsheet content             | `get_cheatsheet(name="docker")`                 |
| Search across all sheets                | `search_cheatsheets(query="middleware")`        |
| Search in a category                    | `search_cheatsheets(query="JOIN", category="databases")` |
| Get suggestions for a context           | `suggest_cheatsheet(context="deploy containers")` |
| Read file directly (no MCP)             | `read_file(path="$HOME/awesome-cheatsheets/tools/docker.sh")` |
