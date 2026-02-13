# IC Mainnet Deployment Runbook

This guide walks you through deploying your AI on ICP application to the Internet Computer mainnet.

## Prerequisites

Before deploying to mainnet, ensure you have:

1. **dfx CLI installed** (version 0.15.0 or later)
   ```bash
   dfx --version
   ```
   If not installed, follow: https://internetcomputer.org/docs/current/developer-docs/setup/install

2. **Cycles wallet or ICP tokens**
   - You need cycles to deploy canisters on mainnet
   - Get cycles via: https://internetcomputer.org/docs/current/developer-docs/setup/cycles/cycles-faucet
   - Or convert ICP to cycles: https://internetcomputer.org/docs/current/developer-docs/setup/cycles

3. **Internet Identity** (for authentication)
   - Create one at: https://identity.internetcomputer.org
   - You'll use this to sign in to your deployed app

## Step 1: Prepare Your Environment

1. **Ensure you're in the project root directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Check your dfx.json configuration:**
   - Verify both `backend` and `frontend` canisters are defined
   - The frontend should be type `"assets"`

3. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

## Step 2: Deploy to IC Mainnet

1. **Start dfx (if not already running):**
   ```bash
   dfx start --background --clean
   ```

2. **Create canisters on mainnet:**
   ```bash
   dfx canister create --all --network ic
   ```
   
   This will:
   - Create canister IDs on mainnet
   - Deduct cycles from your wallet
   - Output the canister IDs (save these!)

3. **Build your canisters:**
   ```bash
   dfx build --network ic
   ```

4. **Deploy to mainnet:**
   ```bash
   dfx deploy --network ic
   ```
   
   This command will:
   - Deploy the backend Motoko canister
   - Deploy the frontend assets canister
   - Output the live URLs

## Step 3: Locate Your Deployed Application

After successful deployment, dfx will output URLs like:

