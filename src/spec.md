# Specification

## Summary
**Goal:** Prepare the dapp for a successful mainnet deployment to the Internet Computer (IC) and ensure the deployed frontend works with the deployed Motoko backend.

**Planned changes:**
- Add/update `dfx` deployment configuration to support `dfx deploy --network ic`, including canister definitions for the Motoko backend and a frontend assets canister serving the built React app.
- Add a production deployment runbook with prerequisites, build steps, deploy commands, and instructions to retrieve canister IDs and the live frontend URL (including Internet Identity mainnet sign-in notes).
- Remove hardcoded funding/deployment values in the backend so funding status (e.g., canister principal and cycles balance) is derived at runtime from the deployed canister rather than fixed constants.
- Update frontend configuration/build behavior so the hosted frontend uses `ic` network canister IDs and communicates with the deployed backend on mainnet (not local).

**User-visible outcome:** A developer can deploy the app to IC mainnet using documented commands, then open the live frontend URL and successfully use it (including authenticated flows) with the mainnet backend; the Funding page shows real deployed canister/cycles info instead of mocked values.
