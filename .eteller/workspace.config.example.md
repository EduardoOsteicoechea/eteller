# Workspace config (copy to workspace.config.md and fill in)
# workspace.config.md is gitignored — keep product binding local.

REPO_URL: https://github.com/ORG/REPO.git
INTEGRATION_BRANCH: <integration-branch>

## Branch naming criteria

PATTERN: <fill>
RULES:
- Agents must not invent branch names when this section is empty.
- Use the exact names and progression the user dictates when steering.
- Clone directory name is always derived from REPO_URL (repo basename); do not set a separate name.
