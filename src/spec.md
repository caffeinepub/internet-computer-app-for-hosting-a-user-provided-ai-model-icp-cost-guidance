# Specification

## Summary
**Goal:** Build a minimal end-to-end Internet Computer app where authenticated users can register a small AI model artifact in a canister, run basic inference against it, and estimate ICP/cycles costs with usage metrics and platform limitations clearly explained.

**Planned changes:**
- Add Internet Identity sign-in and gate all model/inference actions behind authentication.
- Implement model registration UI (name, version, description, payload upload/paste) and per-user model management.
- Create a single Motoko canister that stores model metadata + payload (within documented/enforced size/compute limits) and associates each model with its owner principal.
- Expose a canister method to run inference on the stored model (limited to a realistic demo/small model class for WASM/Motoko) and return results/errors.
- Add backend usage instrumentation: track per-model stored size, inference call count, last-call timestamp, and approximate per-call compute timing where feasible; provide query + reset methods scoped to the signed-in user.
- Build a cost guidance page with an interactive estimator (model size, requests/day or month, compute per request via ms/presets) that outputs estimated cycles and rough ICP equivalent with an editable/sourced conversion factor and a clear disclaimer.
- Add an in-app limitations/about page describing IC constraints (no GPU, memory/compute limits) and what model types are feasible.
- Apply a consistent developer-focused dashboard theme across all pages using a non-blue/non-purple primary palette with accessible contrast.

**User-visible outcome:** Users can sign in with Internet Identity, upload/register a small model artifact tied to their principal, run inference requests and see responses/errors, view/reset basic usage metrics, and use an in-app estimator to approximate cycles/ICP needs with clear limitations guidance.
