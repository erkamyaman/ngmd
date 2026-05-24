---
title: Agent Skills
description: Two skills ship with NgMd so coding agents know how to scaffold and author docs sites without re-deriving the conventions every time.
---

<ngmd-hero title="Agent Skills" gradient>
  Two skills ship with NgMd so coding agents already know how to scaffold and author. Mirrors the format <code>angular/skills</code> uses.
</ngmd-hero>

# Agent Skills

NgMd ships two **agent skills** in the [`skills/`](https://github.com/erkamyaman/ngmd/tree/main/skills) directory. A skill is a self-contained instruction file (`SKILL.md` with YAML frontmatter) that teaches a coding agent how to perform a specific task inside an NgMd project. Agents that support skills (Claude Code, Gemini CLI, Antigravity, and others) load the relevant skill on demand instead of re-deriving conventions from the codebase every time.

The format mirrors *[angular/skills](https://github.com/angular/skills)* exactly so any tool that handles one handles the other.

## Available skills

| Skill | Description |
|---|---|
| <img src="https://cdn.simpleicons.org/rocket/F56565" alt="" width="16" height="16" style="display:inline-block;vertical-align:-2px;margin-right:6px;object-fit:contain" /> [`ngmd-new-site`](https://github.com/erkamyaman/ngmd/blob/main/skills/ngmd-new-site/SKILL.md) | Scaffolds a new NgMd site with `create-ngmd`. Covers Node prerequisites, package-manager fallback, the post-scaffold layout, and the first edits a new project needs (site config, sidebar nav, first markdown page). |
| <img src="https://cdn.simpleicons.org/markdown/FAFAFA" alt="" width="16" height="16" style="display:inline-block;vertical-align:-2px;margin-right:6px;object-fit:contain" /> [`ngmd-authoring`](https://github.com/erkamyaman/ngmd/blob/main/skills/ngmd-authoring/SKILL.md) | Writes and edits pages in an NgMd project. Covers the prose-vs-component page model, all seventeen authoring components, the markdown affordances (`*Keyword` autolinks, ` file="..." ` code imports, `group="..."` tabs, `{1,3-5}` line highlighting), the build-time link guards, and the prose voice the project favours. |

## Using these skills

Both skills are designed for agentic coding tools like *[Claude Code](https://docs.claude.com/en/docs/claude-code/overview)*, *[Gemini CLI](https://geminicli.com/docs/cli/skills/)*, *[Antigravity](https://antigravity.google/docs/skills)*, and others. Activating a skill loads the specific instructions and resources needed for that task.

<ngmd-callout type="tip" title="Easiest install">
  If your agent supports the <a href="https://skills.sh/" target="_blank" rel="noopener noreferrer">skills.sh</a> community installer, one command and you're done. Otherwise it's a directory copy into wherever your tool looks for skills.
</ngmd-callout>

```bash
npx skills add https://github.com/erkamyaman/ngmd
```

### Manual install paths

| Tool | Skills directory |
|---|---|
| [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) | `~/.claude/skills/` (user-wide) or `.claude/skills/` (per-project) |
| [Gemini CLI](https://geminicli.com/docs/cli/skills/) | `.agent/skills/` in the project root |
| [Antigravity](https://antigravity.google/docs/skills) | Configured via the editor's skills panel |
| Any other agent | Wherever the tool looks for `SKILL.md` files |

Drop the two folders (`ngmd-new-site/`, `ngmd-authoring/`) from this repo's `skills/` directory into the location above, and your agent will pick them up on next load.

## Versioning

The skills live next to the framework. When the conventions in NgMd change (a new component, a new affordance, a renamed config key), the matching skill files get updated in the same PR. There's no separate release cadence to track.

| Skill | Last touched in |
|---|---|
| `ngmd-new-site` | Same release as the scaffolder it documents |
| `ngmd-authoring` | Same release as the NgmdUi vocabulary it documents |

## Feedback <ngmd-badge variant="beta">Beta</ngmd-badge>

If a skill gives a wrong answer or misses a convention:

- File an issue at <a href="https://github.com/erkamyaman/ngmd/issues" target="_blank" rel="noopener noreferrer">github.com/erkamyaman/ngmd/issues</a>
- Or open a [Discussion](https://github.com/erkamyaman/ngmd/discussions) if you want to talk through whether the skill *should* cover the case before you file

The source of truth lives next to the framework, so fixes ship with the next release.
