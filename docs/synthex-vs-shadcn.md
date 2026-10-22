# Synthex vs shadcn: current evidence and focused strategy

The current comparison is the [five-critic report and maintenance strategy](./research/2026-10-22-shadcn/report.md), dated 2026-10-22.

It compares merged Synthex source `7babe5ef` with pinned official shadcn source `25af02b` (CLI 4.22.1), with explicit weighted ratings out of ten, source references, limitations and a reproducible owned-update demonstration. [Methodology](./research/2026-10-22-shadcn/methodology.md) explains why the ratings are judgments and why unlike dimensions are not averaged into an overall score.

The recommended focus is baseline-aware maintenance of customized component source. Synthex's merged implementation has a narrow advantage here; publication, dependency-aware updates and easier recovery remain essential work. The public Synthex 1.1.0 artifacts do not contain the current CLI workflow. Native implementation breadth is a separate task-fit advantage with pending device evidence.

For implementation details, see [framework onboarding](./frameworks.md), [registry and source ownership](./registry.md), [updating components](./updating-components.md), [web contracts](./component-contracts.md), and [native capabilities](./native-capabilities.md).
