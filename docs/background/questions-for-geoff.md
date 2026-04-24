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
