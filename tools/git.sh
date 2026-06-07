##############################################################################
# GIT — MODERN CHEATSHEET (git 2.40+)
# Includes modern alternatives: git switch, git restore, git worktree
##############################################################################

##############################################################################
# SETUP & CONFIG
##############################################################################

git init                              # Initialize repo in current directory
git init --bare repo.git              # Initialize bare repository

git clone <url>                       # Clone remote repo
git clone <url> -b <branch> <dir>     # Clone specific branch into directory
git clone <url> --depth 1             # Shallow clone (no history)
git clone <url> --recurse-submodules  # Clone with submodules

git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main     # Default branch name
git config --global core.editor code --wait     # Set editor
git config --global pull.rebase true            # Rebase on pull by default
git config --global fetch.prune true            # Prune on fetch
git config --global rebase.autoStash true       # Auto stash on rebase
git config --global push.autoSetupRemote true   # Auto-setup remote branch
git config --global --list                      # List all config
git config --global --edit                      # Edit config in editor
git config --global alias.st status             # Create alias: git st

# .gitignore — patterns to ignore
#   node_modules/
#   .env
#   *.log
#   !important.log

##############################################################################
# WORKING WITH CHANGES
##############################################################################

git status                            # Show working tree status
git status -s                         # Short status
git status -b                         # Short with branch info

git add <file>                        # Stage file
git add .                             # Stage all changes (current dir)
git add -p                            # Interactive staging (hunk-by-hunk)
git add -A                            # Stage all (including deletions)

git restore <file>                    # Discard unstaged changes (modern)
git restore --staged <file>           # Unstage (modern)
git restore --source=HEAD~1 <file>   # Restore from a specific commit

# Legacy alternatives (still work):
# git checkout -- <file>              # Discard unstaged changes
# git reset HEAD <file>               # Unstage

git rm <file>                         # Remove from repo + working tree
git rm --cached <file>                # Remove from tracking only (keep file)
git mv <old> <new>                    # Move/rename file

git clean -n                          # Dry-run: what would be removed
git clean -f                          # Remove untracked files
git clean -fd                         # Remove untracked files + dirs
git clean -fX                         # Remove only ignored files
git clean -fx                         # Remove both ignored + non-ignored

##############################################################################
# COMMITTING
##############################################################################

git commit -m "feat: add user login"                # Commit with message
git commit -m "Title" -m "Body"                     # Multi-line message
git commit -a -m "msg"                              # Stage all tracked files + commit
git commit --amend                                  # Edit last commit (message + content)
git commit --amend --no-edit                        # Amend without changing message
git commit --amend --author="Name <email>"          # Change author
git commit --allow-empty -m "empty commit"          # Force empty commit

# Commit message conventions (Conventional Commits):
#   feat:     New feature
#   fix:      Bug fix
#   docs:     Documentation
#   style:    Formatting
#   refactor: Code restructure
#   perf:     Performance
#   test:     Tests
#   chore:    Maintenance
#   ci:       CI/CD changes
#   BREAKING CHANGE: breaks API compatibility

##############################################################################
# BRANCHING (Modern: switch)
##############################################################################

git branch                            # List local branches (* = current)
git branch -a                         # List all branches (local + remote)
git branch -r                         # List remote branches
git branch -vv                        # List with upstream + last commit

git branch <name>                     # Create branch
git branch -d <name>                  # Delete local branch (merged)
git branch -D <name>                  # Delete local branch (force)
git branch -m <old> <new>             # Rename branch
git branch -m <new>                   # Rename current branch

# git switch — modern alternative to git checkout for branches
git switch <branch>                   # Switch to branch
git switch -c <branch>                # Create and switch to branch
git switch -                          # Switch to previous branch

# git restore — modern alternative for files (see above)

# Legacy checkout (still works)
# git checkout <branch>
# git checkout -b <branch>

git merge <branch>                    # Merge branch into current
git merge --no-ff <branch>            # Merge with no fast-forward
git merge --abort                     # Abort merge on conflict
git merge --continue                  # Continue merge after resolving

git rebase <branch>                   # Rebase current onto <branch>
git rebase -i HEAD~3                  # Interactive rebase (last 3 commits)
git rebase --abort                    # Abort rebase
git rebase --continue                 # Continue after fixing conflicts

git cherry-pick <commit>              # Apply a specific commit to current branch
git cherry-pick A^..B                 # Apply range of commits (A older than B)

##############################################################################
# STASHING
##############################################################################

git stash push -m "WIP: feature"      # Stash with message (modern)
git stash push -u -m "with untracked" # Include untracked files
git stash                            # Quick stash (same as push without message)
git stash -u                         # Stash including untracked

git stash list                       # List all stashes
git stash show -p stash@{0}          # Show diff of stash
git stash pop                        # Apply and drop top stash
git stash pop stash@{2}              # Apply and drop specific stash
git stash apply                      # Apply top stash (keep stash)
git stash apply stash@{1}            # Apply specific stash
git stash drop stash@{1}             # Delete specific stash
git stash clear                      # Delete all stashes
git stash branch <name> stash@{1}    # Create branch from stash

##############################################################################
# REMOTES
##############################################################################

git remote -v                         # Show remote URLs
git remote add origin <url>           # Add remote
git remote rename origin upstream     # Rename remote
git remote remove origin              # Remove remote
git remote set-url origin <url>       # Change remote URL
git remote show origin                # Show remote info

git fetch origin                      # Fetch remote branches (no merge)
git fetch --prune origin              # Fetch + prune deleted remotes
git fetch --tags                      # Fetch all tags
git pull                              # Fetch + merge (or rebase with pull.rebase)
git pull --rebase                     # Fetch + rebase
git push origin main                  # Push to remote
git push -u origin main               # Push + set upstream
git push --tags                       # Push tags
git push --all                        # Push all branches
git push origin --delete <branch>     # Delete remote branch
git push --force-with-lease           # Force push safely (prefer over --force)
git push --force                      # Force push (use sparingly)

##############################################################################
# UNDOING / REWRITING HISTORY
##############################################################################

# ╔══════════════════════════════════════════════════════════════════╗
# ║  SCOPE        │  COMMAND                                        ║
# ╠══════════════════════════════════════════════════════════════════╣
# ║  Working tree │  git restore <file>                             ║
# ║  Staging      │  git restore --staged <file>                    ║
# ║  Local commit │  git commit --amend                             ║
# ║  Local commits│  git reset --soft HEAD~1  (keep changes)        ║
# ║               │  git reset --mixed HEAD~1  (unstage)            ║
# ║               │  git reset --hard HEAD~1  (discard ALL)         ║
# ║  Shared remt  │  git revert <commit>  (safe — creates new cmt)  ║
# ╚══════════════════════════════════════════════════════════════════╝

# git reset modes:
#   --soft  = move HEAD only (keep working + staging)
#   --mixed = move HEAD + reset staging (default)
#   --hard  = move HEAD + reset staging + reset working (DANGEROUS)

git revert <commit>                   # Undo commit via new commit (safe for shared branches)
git revert --no-commit <commit>..HEAD # Revert range without auto-committing

git reflog                            # Show reference log (recover lost commits)
git reflog expire --expire=now --all  # Clean reflog

# Recover lost commit:
# git reflog
# git cherry-pick <hash_from_reflog>

##############################################################################
# LOGGING & HISTORY
##############################################################################

git log                               # Full commit log
git log --oneline                     # One line per commit
git log --oneline --graph --decorate  # Graphical history tree
git log --oneline --graph --all       # All branches graph
git log -n 5                          # Last 5 commits
git log --since="2 weeks ago"         # Commits since date
git log --until="yesterday"           # Commits until date
git log --author="name"               # Filter by author
git log --grep="fix"                  # Search commit messages
git log -p <file>                     # Show file change history
git log --follow <file>               # Show history including renames
git log --diff-filter=M -- <file>     # Only modified files
git log --oneline --graph --all --decorate  # Full DAG

git shortlog -sn                      # Contributor commit count
git blame <file>                      # Show who last modified each line
git blame -L 10,20 <file>             # Line range blame

git show <commit>                     # Show commit details + diff
git show HEAD                         # Show latest commit
git show HEAD:path/to/file            # Show file content at that commit

git diff                              # Unstaged changes
git diff --staged                     # Staged changes (ready to commit)
git diff HEAD                         # All changes (working + staged)
git diff <branch1> <branch2>          # Diff between branches
git diff --stat                       # Summary of changes
git diff --word-diff                  # Word-level diff

##############################################################################
# GIT SWITCH / RESTORE (Modern alternatives)
##############################################################################

# git switch — for branches (replaces `git checkout` for branch ops)
git switch main                       # Switch to branch
git switch -c feature/login           # Create + switch
git switch -                           # Switch to previous branch
git switch --detach HEAD~3            # Detached HEAD

# git restore — for files (replaces `git checkout` for file ops)
git restore file.txt                  # Discard working tree changes
git restore --staged file.txt         # Unstage file
git restore --source=main file.txt    # Restore file from another branch
git restore -p file.txt               # Interactive hunk restore

##############################################################################
# GIT WORKTREE (Work on multiple branches simultaneously)
##############################################################################

git worktree list                     # List all worktrees
git worktree add ../project-feature feature/login  # New worktree for branch
git worktree add -b hotfix ../hotfix main          # Create branch + worktree
git worktree remove ../project-feature             # Remove worktree
git worktree prune                    # Clean up stale worktree references

# Use case: work on a hotfix without stashing current work
#   git worktree add ../hotfix -b hotfix/urgent main
#   cd ../hotfix
#   # fix, commit, push
#   cd ../main-project
#   git worktree remove ../hotfix

##############################################################################
# GIT SPARSE CHECKOUT (Partial checkout of large repos)
##############################################################################

git sparse-checkout init --cone       # Initialize sparse checkout (cone mode)
git sparse-checkout set src/ docs/    # Check out only src/ and docs/
git sparse-checkout add tests/       # Add more directories
git sparse-checkout list              # List sparse patterns
git sparse-checkout disable           # Disable sparse checkout

# Good for monorepos — only checkout the directories you need

##############################################################################
# GIT BISECT (Binary search for bug-introducing commit)
##############################################################################

git bisect start                      # Start bisect session
git bisect bad                        # Current commit is bad
git bisect good v1.0                  # Mark known-good tag/commit
# Git will checkout a midpoint commit
# Test the commit, then:
git bisect good                       # If this commit is good
# OR
git bisect bad                        # If this commit is bad
# Repeat until commit is found
git bisect reset                      # End bisect (return to original HEAD)

# Automated bisect:
# git bisect start HEAD v1.0
# git bisect run npm test             # Auto-run test script
# git bisect reset

##############################################################################
# TAGS
##############################################################################

git tag                               # List all tags
git tag -a v1.0.0 -m "Release v1.0"  # Annotated tag (recommended)
git tag v1.0.0-lw                     # Lightweight tag
git tag -d v1.0.0                     # Delete local tag
git push origin v1.0.0                # Push specific tag
git push --tags                       # Push all tags
git push origin --delete v1.0.0       # Delete remote tag
git fetch --tags                      # Fetch all tags from remote
git checkout v1.0.0                   # Checkout tag (detached HEAD)
git describe --tags                   # Show nearest tag

# Semantic versioning tags:
# vMAJOR.MINOR.PATCH
# v1.0.0, v1.0.1, v1.1.0, v2.0.0

##############################################################################
# SIGNED COMMITS (GPG/SSH)
##############################################################################

# GPG signing
git config --global user.signingkey <key-id>     # Set signing key
git config --global commit.gpgsign true          # Sign all commits
git commit -S -m "signed commit"                 # Sign single commit
git log --show-signature                          # Verify signatures

# SSH signing (git 2.34+)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git log --show-signature

# Tag signing
git tag -s v1.0.0 -m "Signed release v1.0"      # Sign tag
git tag -v v1.0.0                                 # Verify tag signature

##############################################################################
# GITHUB CLI (gh) — Modern GitHub workflows
##############################################################################

# Install: https://cli.github.com/
# Authenticate: gh auth login

gh repo create <name> --public|--private  # Create repo on GitHub
gh repo fork <repo>                       # Fork repo
gh repo clone <owner>/<repo>              # Clone + set remotes

gh pr create --title "Feature" --body "Description"  # Create PR
gh pr create --fill                        # Create PR from commit messages
gh pr list                                 # List PRs
gh pr list --state merged                  # List merged PRs
gh pr view <number>                        # View PR details
gh pr checkout <number>                    # Checkout PR locally
gh pr merge <number>                       # Merge PR
gh pr review --approve <number>            # Approve PR

gh issue list                              # List issues
gh issue create --title "Bug" --body "..." # Create issue
gh issue view <number>                     # View issue

gh run list                                # List workflow runs
gh run watch <run-id>                      # Watch workflow run
gh run view <run-id>                       # View run details

gh alias set prc 'pr create --fill'        # Create alias
gh browse                                  # Open repo in browser
gh repo view --web                         # Open repo in browser

##############################################################################
# SUBMODULES
##############################################################################

git submodule add <url> <path>            # Add submodule
git submodule update --init --recursive   # Clone all submodules
git submodule update --remote             # Update to latest commit
git submodule foreach git pull origin main # Run command in each submodule
git clone --recurse-submodules <url>      # Clone repo + submodules

##############################################################################
# ADVANCED
##############################################################################

git archive --format=zip HEAD > archive.zip       # Create archive
git archive --format=tar.gz --output=test.tar.gz --prefix=myapp/ HEAD

git grep "pattern"                      # Search working tree
git grep --cached "pattern"             # Search staged files
git grep "function" $(git rev-list --all)  # Search entire history

git fsck                                # Check repository integrity
git gc                                  # Garbage collect
git gc --aggressive                     # Aggressive optimization
git count-objects -vH                  # Repository size stats

git clean -fd --dry-run                 # Preview what git clean removes

# Fix divergent branches
git fetch origin
git reset --hard origin/main            # Overwrite local with remote (DANGEROUS)

##############################################################################
# GIT WORKFLOW REFERENCE
##############################################################################

# Trunk-based (modern, preferred):
#   main ← feature branches (short-lived)
#   git switch -c feat/login
#   # work, commit
#   git switch main
#   git pull --rebase
#   git merge feat/login
#   git push

# GitHub Flow:
#   main ← feature branches → PR → merge
#   git switch -c feat/add-login
#   # work, commit
#   git push -u origin feat/add-login
#   # Open PR on GitHub
#   gh pr create --fill

# Git Flow (legacy, complex):
#   main ← develop ← feature/hotfix/release
#   Not recommended for modern CI/CD
