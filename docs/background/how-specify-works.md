# How Specify Works

hr-kit uses a spec-driven workflow called speckit for every feature. This document explains what that means in practice, aimed at someone who has not worked this way before.

## The core idea

Writing code is the easy part. The hard part is deciding what to build, why it is worth building, who it is for, and what "done" looks like. Speckit pushes all of that to the front of the work and captures it in documents that live next to the code. Each document is a gate. You cannot skip ahead. The constitution gates plans. Plans gate tasks. Tasks gate implementation. By the time code is written, most of the arguments about what the code should do have already been settled in writing.

This trades speed early for speed later. Drafting a spec takes time you could spend coding. Skipping that step feels faster until you are six files deep, realize you misunderstood the scope, and rewrite everything.

## The constitution

The constitution is the project's non-negotiable rulebook. It captures the principles that every feature must respect. In hr-kit, the constitution says things like "schema must validate clean before merge," "no adapter-specific concepts leak into the schema layer," and "example data must tell a coherent story."

The constitution is written once, ratified, and versioned. It changes rarely, and only through a deliberate amendment process. Every later document in the workflow is checked against it. If a plan would violate a principle, the plan loses, not the principle.

The hr-kit constitution is in this folder as `constitution.md` and is at `.specify/memory/constitution.md` in the running repository.

## The workflow per feature

Each feature moves through a sequence of commands, each producing a new document in the feature's folder under `specs/`. A feature folder for the first Core HR schema feature, for example, is `specs/001-core-hr-schema/`.

### /speckit-specify

Produces `spec.md`. This is the feature specification. It captures user stories ordered by priority, acceptance scenarios for each story, functional requirements, edge cases, and any explicit out-of-scope items. It deliberately stays at the level of "what and why," not "how."

A good spec is something a non-coder can read and understand. The hr-kit Core HR schema spec will describe what Keystone Recruiting does with candidates, not how the JSON files are structured.

### /speckit-clarify

Produces structured clarification questions that surface ambiguities in the spec. The author answers them, and the spec gets tightened. This is the stage where small scope decisions get captured in writing rather than discovered during implementation.

### /speckit-plan

Produces `plan.md`. This translates the spec into an implementation plan. It names the files that will be created or changed, the approach, the tradeoffs, and the dependencies. It runs a Constitution Check before and after detailing the plan. If the plan conflicts with a principle, the plan is revised, not the principle.

### /speckit-tasks

Produces `tasks.md`. This breaks the plan into a list of executable tasks in dependency order. Each task is small, testable, and assignable. A task might read "add Candidate type to schema-structure.json" or "write example data file placements.json with six records."

### /speckit-analyze

Cross-checks the spec, plan, and tasks for internal consistency. Are all requirements covered by tasks? Are there tasks with no spec basis? Are there plan items that nothing in the spec justifies? It is a quality gate.

### /speckit-implement

Executes the tasks in order. This is where code gets written. Because the earlier documents are thorough, the work during this phase is mostly mechanical.

## Where things live

Inside the hr-kit repository:

- `.specify/memory/constitution.md` is the live constitution. The copy in this folder is a snapshot.
- `.specify/templates/` holds the templates speckit uses to generate each document.
- `.specify/scripts/` holds helper shell scripts speckit runs during feature creation.
- `.specify/integrations/` holds the Claude Code integration metadata.
- `specs/<feature>/` holds the documents for a feature. Each new feature creates a new folder.
- `.claude/skills/speckit-*/` holds the skills that implement each slash command.

## Branching

Each feature gets its own git branch, named after the feature folder. The first spec creates a branch called `001-core-hr-schema`. Implementation commits land on that branch and merge into `main` once the feature is complete and reviewed.

## Why this is useful for an open-source kit

hr-kit is public. People other than Janel and Geoff will read it. The specs are how future contributors learn what the project is trying to do, what decisions have been made, and where the boundaries are. They are also how AI agents (like this one) stay aligned with the project's direction across sessions. A prompt plus a constitution and a live spec is dramatically more reliable than a prompt alone.

If this workflow feels heavy, that is the point. It is heavy in the way a contract is heavy: it captures what was decided so nobody has to re-litigate it later.
