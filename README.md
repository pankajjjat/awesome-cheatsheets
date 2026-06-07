<div align="center">

[![AWESOME CHEATSHEETS LOGO](_design/cover_github@2x.png)](https://lecoupa.github.io/awesome-cheatsheets/)

<a href="https://trendshift.io/repositories/5584" target="_blank">
  <img src="https://trendshift.io/api/badge/repositories/5584" alt="LeCoupa%2Fawesome-cheatsheets | Trendshift" width="250" height="55"/>
</a>

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/LeCoupa/awesome-cheatsheets/blob/master/LICENSE)

**WEBSITE DIRECTORY**: [Available here](https://lecoupa.github.io/awesome-cheatsheets/)

> 📚 Awesome cheatsheets for popular programming languages, frameworks and development tools. They include everything you should know in one single file.

</div>

---

## 🤔 Why Awesome-Cheatsheets?

I usually make a cheat sheet when I want to improve my skills in a programming language, a framework or a development tool. [I started doing these kinds of things a long time ago on Gist](https://gist.github.com/LeCoupa). To better keep track of the history and to let people contribute, I re-organized all of them into this single repository. Most of the content is coming from official documentation and some books I have read.

Feel free to take a look. You might learn new things. They have been designed to provide a quick way to assess your knowledge and to save you time.

---

## 📚 Table of Contents

### 📃 Languages

<details>
<summary>View cheatsheets</summary>

#### Command line interface
- [Bash](languages/bash.sh)

#### Imperative
- [C](languages/C.txt)
- [C#](languages/C%23.txt)
- [Go](languages/golang.md)
- [Java](languages/java.md)
- [PHP](languages/php.php)
- [Python](languages/python.md)
- [XML](languages/XML.md)
- [Rust](languages/rust.md)

#### Functional
- [JavaScript](languages/javascript.js)
- [Typescript](languages/typescript.md)

</details>

---

### 📦 Backend

<details>
<summary>View cheatsheets</summary>

#### PHP
- [Laravel](backend/laravel.php)

#### Python
- [Django](backend/django.py)

#### JavaScript
- [Adonis.js](backend/adonis.js)
- [Express.js](backend/express.js)
- [Feathers.js](backend/feathers.js)
- [Moleculer](backend/moleculer.js)
- [Node.js](backend/node.js)
- [Sails.js](backend/sails.js)

</details>

---


### 🌐 Frontend

<details>
<summary>View cheatsheets</summary>

#### Basics
- [HTML5](frontend/html5.html)
- [CSS3](frontend/css3.css)
- [Typescript](frontend/typescript.ts)

#### Frameworks
- [React.js](frontend/react.js)
- [Vue.js](frontend/vue.js)
- [Tailwind.css](frontend/tailwind.css)
- [Ember.js](frontend/ember.js)
- [Angular (2+)](frontend/angular.js)
- [AngularJS](frontend/angularjs.js)
</details>

---

### 🗃️ Databases

<details>
<summary>View cheatsheets</summary>

#### SQL
- [MySQL](databases/mysql.sh)

#### NoSQL
- [MongoDB](databases/mongodb.sh)
- [Redis](databases/redis.sh)

</details>

---

### 🔧 Tools

<details>
<summary>View cheatsheets</summary>

#### Development
- [cURL](tools/curl.sh)
- [Drush](tools/drush.sh)
- [Elasticsearch](tools/elasticsearch.js)
- [Emmet](tools/emmet.md)
- [Git](tools/git.sh)
- [GitHub Actions](tools/github-actions.md)
- [Hermes Agent](tools/hermes-agent.md)
- [Next.js](tools/nextjs.md)
- [Puppeteer](tools/puppeteer.js)
- [Sublime Text](tools/sublime_text.md)
- [Terraform / OpenTofu](tools/terraform.md)
- [VIM](tools/vim.txt)
- [Visual Studio Code](tools/vscode.md)
- [Xcode](tools/xcode.txt)

#### Infrastructure
- [AWS CLI](tools/aws.sh)
- [Docker](tools/docker.sh)
- [GCP CLI](tools/gcp.md)
- [Heroku CLI](tools/heroku.sh)
- [Kubernetes](tools/kubernetes.md)
- [macOS](tools/macos.sh)
- [Nanobox Boxfile](tools/nanobox_boxfile.yml)
- [Nanobox CLI](tools/nanobox_cli.sh)
- [Nginx](tools/nginx.sh)
- [PM2](tools/pm2.sh)
- [Ubuntu](tools/ubuntu.sh)
- [Firebase CLI](tools/firebase_cli.md)

</details>

---

## 🤖 Hermes Agent Integration

This fork includes two powerful additions for [Hermes Agent](https://hermes-agent.nousresearch.com/) users:

### MCP Server

A Python MCP server that exposes all 35+ cheatsheets as tools to Hermes:

```bash
cd awesome-cheatsheets
pip install mcp
hermes mcp add cheatsheets --command "python mcp-server/server.py"
```

**Tools available:**
- `list_cheatsheets(category)` — browse by category (languages/backend/frontend/databases/tools)
- `get_cheatsheet(name)` — full content, fuzzy-matched (e.g., `"python"` → `languages/python.md`)
- `search_cheatsheets(query, category)` — full-text search across all sheets
- `suggest_cheatsheet(context)` — finds relevant sheets from a description

Full docs: [mcp-server/README.md](mcp-server/README.md)

### Hermes Skill

Loadable via `/skill awesome-cheatsheets` or `hermes -s awesome-cheatsheets`. Teaches the agent to automatically reference cheatsheets when working with specific technologies. See [SKILL.md](SKILL.md).

---

## 🚀 Fork Additions

Compared to the upstream repo, this fork adds:

| Addition | Files |
|----------|-------|
| **New cheatsheets** | Rust, Hermes Agent, Terraform/OpenTofu, GitHub Actions, Next.js |
| **Modernized cheatsheets** | Python, Node.js, Docker, Git, React (all rewritten with modern syntax and patterns) |
| **MCP server** | `mcp-server/server.py` — 4 tools for Hermes Agent integration |
| **Hermes skill** | `SKILL.md` — agent instructions for cheatsheet-aware sessions |

---

## 🙌🏼 How to Contribute?

You are more than welcome to contribute and build your own cheat sheet for your favorite programming language, framework or development tool. Just submit changes via pull request and I will review them before merging.

---

## 👩‍💻👨‍💻 Our valuable Contributors

<div align="center">

<a href="https://github.com/LeCoupa/awesome-cheatsheets/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=LeCoupa/awesome-cheatsheets" />
</a>

</div>
