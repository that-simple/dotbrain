---
status: accepted
decided: 2026-10-28
description: "The manifest of the brain has a spec field with the version of the specification, and the marker of the managed block the same version; no field means the beta version, from which the specification describes no migration."
---
# The specification version in the manifest, without migration from the beta version

## Decision

The manifest has a `spec` field with the version of the specification (e.g. `spec: 0.1`), and the marker of the managed block the same version (`<!-- BEGIN:dotbrain 0.1 -->`). No field means the beta version from before the specification. Tools and the agent choose the validation rules and the migration path by the version. Every version after 0.1 describes the migration from the previous one; the specification describes no migration from the beta version.
