# Questions for Geoff

Things we need Geoff's input on before the Core HR schema spec can move from draft to implementation. Answers can be dropped into a GitHub issue, a message to Janel, or a note in this file.

None of these are blocking the high-level direction. They all refine scope within the direction we've already agreed to.

## Your practice

What industry or vertical do you recruit in most? Technology, healthcare, construction, finance, mixed? The answer shapes what Keystone Recruiting's example data looks like. If you recruit software engineers, example job requisitions reference stack and seniority. If you recruit nurses, they reference licensure and shift preferences. The schema stays the same; the stories the example data tells change.

To make this easier to answer, we drafted a one-paragraph sketch for each industry option in `keystone-industry-sampler.md` (in this folder). Read whichever sketches feel close to your real practice and tell us which one is closest, or name an industry not on the list and we will write a sketch for it.

Do you work contingent, retained, executive search, or a mix? Each model stresses different parts of the schema. Contingent placements care about speed and commission structure. Retained search cares about research, longlists, and client milestones. Executive search cares about candidate confidentiality and client relationships.

How many clients do you typically run at once? How many open requisitions? The answer tells us whether Core needs to scale to a large Keystone example or stay small and illustrative.

## Your Hireology setup

Do you have admin access to your Hireology account, or are you a user in someone else's? The adapter needs admin or close-to-admin permissions to read and write most entities.

Does your Hireology instance have custom fields, custom stages, or custom application forms? These are common and the adapter needs to handle them. We will need to see the shape of your customizations before we can decide whether Core covers them or whether they belong in a domain or in an adapter-specific extension.

What Hireology integrations are active? Background check vendors, assessments, messaging, calendar, email? If any of these matter to your daily work, they inform which domain gets built first after Core.

## Data

Do you have existing candidates, requisitions, and placements in Hireology that you want to be able to export, edit, and re-import through hr-kit? Or is hr-kit a clean-slate starter for future work?

If you have existing data, roughly how much, and how sensitive is it? Real candidate data should never end up in the open-source repo. The example data under Keystone Recruiting is entirely fictional for that reason. Your real data stays in your Hireology account or in a private fork.

## Compliance

Which compliance requirements matter to your practice? EEO reporting, OFCCP, I-9 tracking, state-specific disclosures, background check chain of custody, something else? The compliance domain cannot be specified without knowing which regimes need to be covered.

## Priorities

After Core HR schema and the Hireology adapter are done, which domain do you want first?

- Background checks (vendor integration, chain of custody, pass/fail tracking)
- Onboarding (offer letters, document collection, start-date workflows)
- Commission tracking (placement fees, invoicing, payment status)
- Compliance (the items from the previous question, once we know them)

## Involvement

How do you want to be involved? Consumer of the repo, occasional reviewer, committer and co-maintainer? Any of those is fine. The answer affects how we set up GitHub permissions and how we route code review.

## Provisional choices made during spec drafting

As the Core HR schema spec goes through `/speckit-clarify`, questions come up that need an answer to keep drafting. When we do not yet have your input, Janel picks a provisional answer. These choices are not locked. If any of them miss how your practice actually works, we change them before the schema is implemented. Raise any you would do differently.

### Candidate identity and deduplication (provisional answer: D)

A Candidate record has to support multiple Applications across multiple Job Requisitions without duplication. A re-application after rejection cannot create a second Candidate. The question is which attribute or combination of attributes the schema treats as a candidate's canonical natural key, so the adapter knows when "is this person already in our ATS?" should return yes.

Options considered:

- Option A: Email address alone is the unique natural key, compared case-insensitively.
- Option B: Full name plus primary phone number is the unique natural key.
- Option C: A kit-assigned `candidateId` is the only identity. No natural-key rule in Core. Each adapter decides.
- Option D: Email is the primary natural key. When email is missing, full name plus phone acts as fallback.

Janel picked Option D. The reasoning: email is the industry-standard candidate identity and matches the "minimal up-front data" edge case, because a recruiter often has only name and email at first contact. But recruiters also meet candidates who do not give an email (walk-ins, referrals from a contact who shared a phone number). A documented fallback prevents the Hireology adapter from having to invent its own rule and keeps behavior consistent across future adapters.

What to tell us: in your practice, how often do you work with a candidate where no email is on file at first contact? If it is routine, Option D reflects reality. If you never record a candidate without an email, Option A is simpler. If your sourcing is heavily LinkedIn-driven where the same person can appear under several email addresses over the years, the natural key should probably include a persistent external identifier too; tell us which identifier you rely on. If you want to sidestep the whole question and trust adapter-specific rules, Option C is the escape hatch.

### Stage history representation (provisional answer: A)

The schema needs to represent application stage transitions as history, not just as a current-state field, so the candidate's journey is reconstructable. The question is the structural shape of that history.

Options considered:

- Option A: Application carries both `currentStage` (a reference) and an inline `stageHistory` array where each entry has `stage` and `enteredAt`.
- Option B: A separate top-level StageTransition type referencing Application, from-stage, to-stage, and transition time. Application carries only `currentStage`.
- Option C: Application carries only `currentStage`. Transition history is out of Core and belongs to a future domain such as audit or compliance.
- Option D: Like A, but each entry also carries `exitedAt` and `actor` (who moved the candidate).

Janel picked Option A. The reasoning: it matches the candidate-journey-centric principle (history belongs to the journey, not a free-floating event log), keeps Core small for a starter kit, reads cleanly on a single Application record, and maps well to how most ATS APIs expose stage history as a nested collection under the application.

What to tell us: do you normally need to see when a candidate EXITED a stage, or who moved them? If yes, Option D is better. Do you report on stage transitions across applications (for example, "average time from Applied to Interview across all candidates this quarter")? If yes, a separate StageTransition type (Option B) makes those queries faster, at the cost of a busier schema. If stage history is something your practice barely uses, Option C is fine and keeps Core smallest.

### Stage, Outcome, and Placement relationship (provisional answer: C)

The schema has to answer two different questions about an Application: "where is the candidate in the pipeline?" and "what was the final outcome?" These are related but not the same. A candidate at the Interview stage is in-pipeline and has no terminal outcome yet. A placed candidate has a terminal outcome (Placed) and also implicitly left the pipeline. Some ATS platforms collapse both into a single stage list (Sourced, Screened, Interviewing, Placed, Rejected). Some separate them.

Options considered:

- Option A: Stage includes terminal states (Placed, Rejected, Withdrawn). No separate outcome field. A Placement record exists if and only if `currentStage = Placed`.
- Option B: Stage includes terminal states AND Application has a redundant `outcome` field for explicitness.
- Option C: Stage is pipeline position only (Sourced, Screened, Interviewing, Offer). Application has a separate `outcome` lookup (Active, Placed, Rejected, Withdrawn, Expired). A Placement record exists if and only if `outcome = Placed`.
- Option D: Stage is pipeline position only. Outcome is inferred from whether a Placement record references the Application. No outcome field on Application itself.

Janel picked Option C. The reasoning: clean separation honors Platform-Agnostic Design by not baking any single ATS's combined stage-and-status vocabulary into Core. It makes "where is the candidate in the pipeline?" and "did they get hired?" separate, legible questions. And it keeps the Stage lookup stable as recruiting firms adjust their pipelines.

What to tell us: does your pipeline in Hireology mix terminal outcomes with pipeline stages (for example, is "Rejected" or "Placed" one of the stages you move candidates to, not a separate field)? If yes, Option A matches how you actually think about it day to day. If your practice rarely reports on rejected or withdrawn candidates and the only outcomes that matter are "did the placement happen or not," Option D is simpler because it avoids carrying an outcome field that's almost always empty or "Active." If you want explicit status tracking with a clear separation between pipeline and outcome, C is right.

### Keystone Recruiting example-data scope (provisional answer: B)

The schema ships with example data under the fictional firm Keystone Recruiting. The constitution says that data must tell a coherent end-to-end candidate journey and must not use placeholders. The question is how much data. A starter kit that ships with only one client and five candidates teaches almost nothing about how the schema handles variety. One that ships with fifty clients and a thousand candidates becomes its own maintenance problem.

Options considered:

- Option A: Minimal. One client, one requisition, about five candidates, just enough to show one Placed and one non-Placed outcome.
- Option B: Small realistic. Three to five clients, five to six requisitions, fifteen to twenty candidates. Every Stage lookup value exercised at least once. Every Application outcome value exercised at least once.
- Option C: Mid-size realistic. Five or more clients, ten requisitions, thirty to fifty candidates. Includes re-applications and terminated placements.
- Option D: No fixed size. Dataset must only satisfy the constitution's "tells a coherent story" rule and exercise every lookup. Exact shape decided later during planning.

Janel picked Option B. The reasoning: small realistic is the sweet spot for a starter kit. Big enough to show variety across clients, outcomes, and stage paths, and to exercise every lookup value so nothing in the schema is unused. Small enough that a new reader can read the whole dataset cover to cover in one sitting and understand the schema by example. Option A is too thin to teach the schema's value, Option C turns the example data into its own workload, and Option D leaves the Hireology adapter spec shopping for fixtures when it arrives.

What to tell us: if you think twenty candidates is still too few to represent what a real week of recruiting looks like, Option C is the step up. If you want the starter kit to feel as lightweight as possible and you trust the next reader to extend the data themselves, Option A is fine. If you have specific scenarios (an internal transfer, a re-application six months later, a placement that got terminated in its first week) you want the example data to cover, name them and we will fold them into whichever size we land on.
