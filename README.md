# hr-kit

Open source starter kit for recruiting and HR data. Schema, example data, and platform adapters for applicant tracking systems.

This is the HR industry counterpart to [cmdb-kit](https://github.com/ovoco-co/cmdb-kit). Same three-layer pattern: schema defines shape, data files contain records, adapters push both to a target platform.

## Status

Early scaffold. Schema and first adapter are being specified through the speckit workflow. See `specs/` for in-progress features.

## Planned Scope

Core schema for candidates, job requisitions, applications, placements, clients, and application stages. Domains will be opt-in packages for specialized concerns (background checks, onboarding, commission tracking).

First adapter target: Hireology.

## Related

- [cmdb-kit](https://github.com/ovoco-co/cmdb-kit) for the pattern this kit follows
- [migration-kit](https://github.com/ovoco-co/migration-kit) for migration tooling

## License

MIT
