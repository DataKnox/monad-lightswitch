# Light Switch Webapp - Monad Testnet

A simple web application that allows users to toggle a light switch on the blockchain. Each toggle requires a payment of 0.5 MON on Monad Testnet.

## Features

- 🔌 Interactive light switch UI
- 💰 Payment requirement: 0.5 MON per toggle
- 🔗 Phantom wallet integration
- 🌐 Monad Testnet support
- 📊 Real-time blockchain state updates

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- [Phantom Wallet](https://phantom.app/) browser extension
- Testnet MON tokens (for paying transaction fees)

## Smart Contract

The `LightSwitch.sol` contract stores the switch state on-chain and requires exactly 0.5 MON to toggle the state.

### Contract Functions

- `toggle()` - Toggle the switch state (requires 0.5 MON payment)
- `getState()` - Get the current switch state
- `isOn` - Public variable storing the current state

## Setup & Deployment

### 1. Build the Contract

```shell
forge build
```

### 2. Deploy to Monad Testnet

Replace `<your_private_key>` with your private key (without 0x prefix):

```shell
forge script script/LightSwitch.s.sol:LightSwitchScript --rpc-url monad_testnet --broadcast --private-key <your_private_key>
```

After deployment, copy the contract address from the output.

### 3. Update Frontend Configuration

Open `app.js` and replace `YOUR_CONTRACT_ADDRESS` with the deployed contract address:

```javascript
const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
```

### 4. Serve the Frontend

You can use any local web server. For example, using Python:

```shell
python3 -m http.server 8000
```

Or using Node.js:

```shell
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Usage

1. **Install Phantom Wallet**: Make sure you have the Phantom browser extension installed
2. **Connect Wallet**: Click "Connect Phantom Wallet" button
3. **Switch Network**: If prompted, approve adding Monad Testnet to your wallet
4. **View State**: The switch displays the current on-chain state (OFF by default)
5. **Toggle Switch**: Click "Toggle Switch (0.5 MON)" and approve the transaction
6. **Confirm Payment**: Confirm the payment of 0.5 MON in your wallet
7. **Wait for Confirmation**: The UI will update once the transaction is confirmed

## Project Structure

```
├── src/
│   └── LightSwitch.sol          # Smart contract
├── script/
│   └── LightSwitch.s.sol        # Deployment script
├── index.html                   # Frontend HTML
├── app.js                       # Frontend JavaScript
├── styles.css                   # Frontend styling
└── foundry.toml                 # Foundry configuration
```

## Testing

Run the test suite:

```shell
forge test
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
