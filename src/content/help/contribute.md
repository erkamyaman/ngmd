---
title: Contribute
---

<ngmd-hero title="Contribute" gradient>
  Bug fix, doc tweak, new component, marked extension. Here's the path to a merged PR.
</ngmd-hero>

# Contribute

Bug fixes, new authoring components, marked extensions, build-pipeline improvements, and doc edits are all welcome. Every PR gets read.

## Start here

<ngmd-card-grid columns="3">
  <ngmd-card icon="book" title="Read the guide" link="https://github.com/erkamyaman/ngmd/blob/main/CONTRIBUTING.md">
    Repo layout, dev setup, branch + commit conventions, PR checklist. The contract for what gets merged.
  </ngmd-card>
  <ngmd-card icon="compass" title="Discuss design first" link="https://github.com/erkamyaman/ngmd/discussions">
    For anything bigger than a one-file change, open a Discussion before writing code. Saves you from building something the maintainer was going to reject for design reasons.
  </ngmd-card>
  <ngmd-card icon="code" title="Open a PR" link="https://github.com/erkamyaman/ngmd/pulls">
    Fork, branch, commit (follow the existing log style), run <code>pnpm run build</code>, push, open the PR.
  </ngmd-card>
</ngmd-card-grid>

## What we welcome

<ngmd-card-grid columns="2">
  <ngmd-card icon="shield" title="Bug fixes">
    Anything with a reproduction or clear description of the broken behaviour. Smaller diffs land faster.
  </ngmd-card>
  <ngmd-card icon="box" title="New authoring components">
    A clear use case is enough. Open a Discussion first if the addition is large or changes the existing component API.
  </ngmd-card>
  <ngmd-card icon="code" title="Marked extensions">
    For missing markdown affordances. Runtime extensions live under <code>src/marked-extensions/</code>.
  </ngmd-card>
  <ngmd-card icon="wrench" title="Build-pipeline improvements">
    Smarter link guards, sitemap entries, page-meta hooks. The four Vite plugins are committed at the repo root.
  </ngmd-card>
  <ngmd-card icon="file" title="Doc edits">
    Match the prose voice (no marketing fluff, terse, direct). Read the surrounding paragraphs first.
  </ngmd-card>
  <ngmd-card icon="sparkles" title="Agent skill updates">
    When the conventions in the codebase change, the skills under <code>skills/</code> should follow.
  </ngmd-card>
</ngmd-card-grid>

## What we don't merge

<ngmd-callout type="warning" title="Save yourself the round-trip">
  Pure formatting / whitespace changes. Marketing-fluff edits (<code>first-class</code>, <code>powerful</code>, <code>seamless</code>, <code>blazingly fast</code>). New deps for things we can hand-roll in under 100 LOC. Renames or refactors without behavioural justification.
</ngmd-callout>

## Before pushing

1. **`pnpm run build` passes locally.** Link guards, page-meta, and sitemap all run at build time.
2. **Manual smoke test** in the dev server: load the affected route, navigate, toggle dark mode.
3. **No `console.log`** left in committed code.
4. **Commit message** follows the existing log style: `<type>: short imperative summary` (`feat`, `fix`, `docs`, `refactor`, `build`, `chore`).

## Where to next

<ngmd-pill-row>
  <ngmd-pill href="/help" title="Get help"></ngmd-pill>
  <ngmd-pill href="/help/sponsor" title="Support us"></ngmd-pill>
  <ngmd-pill href="https://github.com/erkamyaman/ngmd" title="View on GitHub"></ngmd-pill>
</ngmd-pill-row>
