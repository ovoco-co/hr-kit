# Early Decisions

A plain-English record of the questions we worked through in the first planning session and the answers we landed on. Written on 2026-04-24, before any feature specs were written. Read this alongside the constitution.

## What is hr-kit?

An open-source starter kit for recruiting and HR data. It gives a working team a clean JSON schema for the core entities in a hiring process (candidates, job requisitions, applications, placements, clients, stages), example data that tells a realistic story, and adapters that push both into real ATS platforms.

The pattern is deliberately copied from [cmdb-kit](https://github.com/ovoco-co/cmdb-kit), which does the same thing for IT configuration management. cmdb-kit proved the pattern on two platforms (JSM Assets and ServiceNow). hr-kit is that pattern retargeted at the HR industry.

## Why build it?

Geoff is a recruiter who already uses Hireology day to day. He wants a reusable foundation he can bring to his own projects and work, rather than reimplementing the same schema every time. A starter kit that solves this for one platform (Hireology) and can be extended to others (other ATS, HRIS) gives him leverage.

Open-sourcing it also makes it useful to any recruiter or HR technologist who has the same problem, which is most of them.

## Why a new repository, not a cmdb-kit domain?

cmdb-kit's Core is product-centric: Product, Version, Component, Deployment Site, Baseline. Those concepts do not map cleanly to a candidate's journey through a hiring process. Forcing HR entities into cmdb-kit's shape would distort both kits. A separate repository keeps each kit's Core coherent and lets hr-kit grow its own domains (background checks, onboarding, commission tracking) without muddying cmdb-kit.

## What's the shape of the kit?

Three layers, same as cmdb-kit:

- Schema is JSON. It declares the types and attributes. It says nothing about any specific ATS.
- Data is JSON. One file per type, with example records that illustrate the schema.
- Adapters are scripts. They read schema and data, push them into a target platform using an overlay file that maps platform-neutral concepts to platform-specific tables and fields.

You can swap adapters without touching schema. You can replace data without touching schema or adapters. You can restructure the schema without touching data files, as long as attribute names stay the same.

## What is the first platform target?

Hireology. Geoff uses it already, so we get a real-world user from day one. The adapter will run in a Docker container so contributors don't need Node installed locally, mirroring cmdb-kit's JSM Docker usage.

## Will there be a way to develop without touching a real Hireology account?

Yes, but not immediately. A mock Hireology API server is queued as a later feature, once the adapter is working against a live account. The mock will be a separate Docker container with fixture data shaped like Hireology's real API. It gives contributors a safe playground for iterating on the adapter, and it gives the adapter a deterministic target for automated tests.

The order is deliberate. Building the adapter against the real API first surfaces the quirks and edge cases we need to replicate in the mock. Building the mock first would just produce a fiction we'd have to correct later.

## What's the first feature to spec?

The Core HR schema. Nothing else (not the adapter, not the mock, not the domains) can be specified without knowing what entities exist and how they relate. The Core schema is to hr-kit what cmdb-kit's Core was to cmdb-kit: the foundation everything else references.

Core covers Candidate, Job Requisition, Application, Placement, Client, and Stage, plus the lookup types those entities reference (application source, candidate status, requisition status, placement type, and similar). Domains (background checks, onboarding, commission tracking, compliance) come later as opt-in packages.

## What is the fictional firm in the example data?

Keystone Recruiting. Every example record ties back to this firm, the same way cmdb-kit's example data ties back to a fictional SaaS product called OvocoCRM. A single named firm keeps the example data internally consistent and gives the reader a coherent story to follow from first candidate contact through final placement.

The name is deliberately generic and industry-neutral. Keystone Recruiting could place software engineers, nurses, warehouse workers, or executives. The constitution tells future contributors not to swap the name out for their own firm's name in public data files.

## What workflow produces the specs?

Speckit, the same spec-driven workflow used across the other Ovoco projects. For each feature, the sequence is:

- `/speckit-specify` produces a spec document capturing user stories, acceptance scenarios, and functional requirements.
- `/speckit-clarify` asks structured questions to surface ambiguities.
- `/speckit-plan` produces an implementation plan and does a Constitution Check against our principles.
- `/speckit-tasks` breaks the plan into executable tasks.
- `/speckit-implement` executes the tasks.

The constitution is the authoritative input to the Constitution Check gate. If a plan proposes something that violates a principle, it fails the gate and gets reworked.

## What's the repository status?

Public at https://github.com/ovoco-co/hr-kit. MIT licensed. The initial scaffold is committed. The constitution is ratified at v1.0.0. The first feature spec (Core HR schema) is in progress.

## What is unresolved?

The constitution carries one open TODO: formally resolving the fictional firm name placeholder token during the first `/speckit-specify` run. We have already chosen Keystone Recruiting as the answer; the TODO closes when the spec references the name and the constitution is updated to reflect that.

A larger open question is whether the first version of Core gets it right. The only way to find out is to take Core through a full round trip: import into Hireology, export from Hireology, validate that nothing was lost. If a field the schema omits turns out to matter in Hireology, Core changes. The constitution's Layered Architecture principle guarantees that changing Core does not force us to rewrite adapters or data files, only to update them.
