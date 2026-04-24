# Questions for Geoff

Things we need Geoff's input on before the Core HR schema spec can move from draft to implementation. Answers can be dropped into a GitHub issue, a message to Janel, or a note in this file.

None of these are blocking the high-level direction. They all refine scope within the direction we've already agreed to.

## Your practice

What industry or vertical do you recruit in most? Technology, healthcare, construction, finance, mixed? The answer shapes what Keystone Recruiting's example data looks like. If you recruit software engineers, example job requisitions reference stack and seniority. If you recruit nurses, they reference licensure and shift preferences. The schema stays the same; the stories the example data tells change.

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
