# Light Switch - Monad Testnet (React + Reown AppKit)

A React/Next.js web application that allows users to toggle a light switch on the blockchain. Each toggle requires a payment of 0.5 MON on Monad Testnet.

## Features

- 🔌 Interactive light switch UI
- 💰 Payment requirement: 0.5 MON per toggle
- 🔗 Wallet connection via Reown AppKit (supports Phantom, MetaMask, WalletConnect, and more)
- 🌐 Monad Testnet support
- 📊 Real-time blockchain state updates

## Prerequisites

- Node.js 18+ installed
- [Reown Project ID](https://dashboard.reown.com) (free)

## Setup

### 1. Install Dependencies

```bash
cd lightswitch-frontend
npm install
```

### 2. Get Your Reown Project ID

1. Go to [dashboard.reown.com](https://dashboard.reown.com) and sign in
2. Navigate to your team's Cloud Dashboard
3. Click "+ Project"
4. Choose a project name (e.g., "Monad Light Switch")
5. Copy the generated Project ID

### 3. Configure Environment Variables

Create a `.env.local` file in the `lightswitch-frontend` directory:

```bash
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
```

Replace `your_project_id_here` with your Project ID from step 2.

**Note:** The project comes with a default Project ID that works on localhost only. For production, you'll need your own Project ID.

### 4. Update Contract Address (if needed)

If you've deployed a new contract, update the `CONTRACT_ADDRESS` in `src/app/page.tsx`:

```typescript
const CONTRACT_ADDRESS = '0x...' // Your deployed contract address
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy

You can deploy to:
- **Vercel** (recommended for Next.js): `vercel deploy`
- **Netlify**: Connect your GitHub repo
- **Any Node.js hosting**: Upload the build output

Don't forget to set your `NEXT_PUBLIC_PROJECT_ID` environment variable in your hosting platform!

## Smart Contract

The `LightSwitch.sol` contract (in the parent directory) stores the switch state on-chain and requires exactly 0.5 MON to toggle the state.

### Contract Functions

- `toggle()` - Toggle the switch state (requires 0.5 MON payment)
- `getState()` - Get the current switch state
- `isOn` - Public variable storing the current state

## Project Structure

```
lightswitch-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main Light Switch component
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── globals.css        # Styles
│   ├── components/
│   │   ├── ConnectButton.tsx # Wallet connect button
│   │   └── LightSwitch.tsx   # Light switch UI component
│   ├── config/
│   │   └── index.ts          # Reown AppKit & Wagmi config
│   └── context/
│       └── index.tsx          # AppKit modal setup
├── package.json
└── next.config.ts
```

## Monad Testnet Details

- **Chain ID**: 10143 (0x279F)
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet-explorer.monad.xyz
- **Currency**: MON

## Notes

- Make sure you have enough MON tokens for gas fees plus the 0.5 MON toggle fee
- The contract state is stored on-chain and persists across sessions
- Each toggle requires exactly 0.5 MON - the transaction will fail if the amount is incorrect
- Reown AppKit supports multiple wallets: Phantom, MetaMask, WalletConnect, and more
- Network switching is handled automatically by Reown AppKit

## Troubleshooting

- **Wallet not connecting**: Make sure you have a valid Project ID in `.env.local`
- **Transaction fails**: Ensure you have enough MON tokens (gas + 0.5 MON fee)
- **Wrong network**: Reown AppKit should automatically prompt to switch to Monad Testnet