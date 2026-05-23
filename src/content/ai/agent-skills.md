---
title: Agent Skills
description: Two skills ship with NgMd so coding agents know how to scaffold and author docs sites without re-deriving the conventions every time.
---

# Agent Skills

NgMd ships two **agent skills** in the [`skills/`](https://github.com/erkamyaman/ngmd/tree/main/skills) directory. A skill is a self-contained instruction file (`SKILL.md` with YAML frontmatter) that teaches a coding agent how to perform a specific task inside an NgMd project. Agents that support skills (Claude Code, Gemini CLI, Antigravity, and others) load the relevant skill on demand instead of re-deriving conventions from the codebase every time.

The format mirrors *[angular/skills](https://github.com/angular/skills)* exactly so any tool that handles one handles the other.

## Available skills

### `ngmd-new-site`

Scaffolds a new NgMd site with `create-ngmd`. Covers Node prerequisites, package-manager fallback, the post-scaffold layout, and the first edits a new project needs (site config, sidebar nav, first markdown page).

### `ngmd-authoring`

Writes and edits pages in an NgMd project. Covers the prose-vs-component page model, all eleven authoring components (`ngmd-callout`, `ngmd-alert`, `ngmd-card`, `ngmd-tabs`, `ngmd-workflow`, `ngmd-pill-row`, `ngmd-hero`, `ngmd-code-block`, `ngmd-video`, `ngmd-image`), the markdown affordances (`*Keyword` autolinks, ` file="..." ` code imports, `group="..."` tabs, `{1,3-5}` line highlighting), the build-time link guards, and the prose voice the project favours.

## Using these skills

Both skills are designed for agentic coding tools like *[Claude Code](https://docs.claude.com/en/docs/claude-code/overview)*, *[Gemini CLI](https://geminicli.com/docs/cli/skills/)*, *[Antigravity](https://antigravity.google/docs/skills)*, and others. Activating a skill loads the specific instructions and resources needed for that task.

If your agent tool supports the [`skills.sh`](https://skills.sh/) community installer:

```bash
npx skills add https://github.com/erkamyaman/ngmd
```

Otherwise, copy the `skills/` directory into the location your agent expects (`.agent/skills/`, `~/.claude/skills/`, or similar) and the tool will pick them up.

## Feedback

If a skill gives a wrong answer or misses a convention, file an issue at <a href="https://github.com/erkamyaman/ngmd/issues" target="_blank" rel="noopener noreferrer">github.com/erkamyaman/ngmd/issues</a>. The source of truth lives next to the framework, so fixes ship with the next release.
