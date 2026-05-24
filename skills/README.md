# NgMd Skills

Agent skills for working with NgMd, the Angular docs starter. These instruct coding agents on how to scaffold a new site and how to author pages with NgMd's conventions, components, and markdown affordances.

## Available Skills

- **`ngmd-new-site`**: Scaffolds a new NgMd site with `create-ngmd`. Covers Node and package-manager prerequisites, the post-scaffold layout, and the first edits a new project needs (site config, sidebar, first page).
- **`ngmd-authoring`**: Writes and edits NgMd content. Covers the prose-vs-component page model, the fourteen authoring components (`<ngmd-callout>`, `<ngmd-alert>`, `<ngmd-card>`, `<ngmd-card-grid>`, `<ngmd-tabs>`, `<ngmd-workflow>`, `<ngmd-pill-row>`, `<ngmd-hero>`, `<ngmd-code-block>`, `<ngmd-accordion>`, `<ngmd-badge>`, `<ngmd-video>`, `<ngmd-image>`), the markdown affordances (`*Keyword` autolinks, ` file="..." ` code imports, group tabs, line highlighting), and the build-time link guards.

## Using these skills

Each skill is a self-contained directory with a `SKILL.md` at its root. Point your agent tool at this folder, or copy the skills into the location your tool expects (`.agent/skills/`, `~/.claude/skills/`, etc.).

Both skills are scoped to working *inside* an NgMd site. For working on the NgMd source itself, read the project's own `README.md` and `BACKLOG.md`.

## Feedback

File issues at https://github.com/erkamyaman/ngmd/issues.
