const CONTRACT_ADDRESS = '0x01Fe1E8fe29A901009eC3844B2079F5B116D7A9c'; // Replace with deployed contract address
const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "isOn",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "toggle",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getState",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "bool", "name": "newState", "type": "bool" },
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" }
        ],
        "name": "SwitchToggled",
        "type": "event"
    }
];

const MONAD_TESTNET = {
    chainId: '0x279F', // 10143 in hex - Monad testnet chain ID
    chainName: 'Monad Testnet',
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
    },
    blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
};

let provider;
let signer;
let contract;
let currentAccount = null;

// Debug function to check what's available
function debugWalletDetection() {
    console.log('=== Wallet Detection Debug ===');
    console.log('window.phantom:', typeof window.phantom !== 'undefined' ? window.phantom : 'undefined');
    console.log('window.phantom.ethereum:', typeof window.phantom !== 'undefined' && window.phantom.ethereum ? window.phantom.ethereum : 'undefined');
    console.log('window.ethereum:', typeof window.ethereum !== 'undefined' ? window.ethereum : 'undefined');
    if (window.ethereum) {
        console.log('window.ethereum.isPhantom:', window.ethereum.isPhantom);
        console.log('window.ethereum.chainId:', window.ethereum.chainId);
    }
    console.log('=============================');
}

// Get the Ethereum provider (Phantom or standard)
function getEthereumProvider() {
    // Check for Phantom wallet specifically
    if (typeof window.phantom !== 'undefined') {
        console.log('Phantom wallet detected');
        // Phantom injects Ethereum provider at window.phantom.ethereum
        if (window.phantom.ethereum) {
            console.log('Using window.phantom.ethereum');
            return window.phantom.ethereum;
        }
    }
    // Fallback to standard window.ethereum (Phantom also injects here)
    if (typeof window.ethereum !== 'undefined') {
        console.log('Using window.ethereum');
        // Check if it's Phantom by looking for isPhantom property
        if (window.ethereum.isPhantom) {
            console.log('Detected Phantom via window.ethereum');
        }
        return window.ethereum;
    }
    console.error('No Ethereum provider found');
    return null;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Ensure ethers is loaded before proceeding
    if (typeof ethers === 'undefined') {
        console.error('ethers.js is not loaded!');
        const walletStatus = document.getElementById('wallet-status');
        if (walletStatus) {
            walletStatus.textContent = 'Error: ethers.js library failed to load. Please refresh the page.';
            walletStatus.style.color = '#f5576c';
        }
        return;
    }

    console.log('ethers.js version:', ethers.version);

    // Debug wallet detection
    debugWalletDetection();

    setupEventListeners();

    // Check if Phantom/Ethereum provider is installed
    const ethereum = getEthereumProvider();
    if (ethereum) {
        try {
            // Check if already connected
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                console.log('Found existing connection:', accounts[0]);
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking accounts:', error);
        }
    } else {
        console.warn('Phantom wallet not detected');
        // Show message in wallet status
        const walletStatus = document.getElementById('wallet-status');
        if (walletStatus) {
            walletStatus.textContent = 'Phantom wallet not detected. Please install Phantom wallet.';
            walletStatus.style.color = '#f5576c';
        }
    }
});

function setupEventListeners() {
    const connectBtn = document.getElementById('connect-btn');
    const toggleBtn = document.getElementById('toggle-btn');

    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
        console.log('Connect button event listener attached');
    } else {
        console.error('Connect button not found!');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSwitch);
    } else {
        console.error('Toggle button not found!');
    }
}

// Debug function to check what's available
function debugWalletDetection() {
    console.log('=== Wallet Detection Debug ===');
    console.log('window.phantom:', typeof window.phantom !== 'undefined' ? window.phantom : 'undefined');
    console.log('window.phantom.ethereum:', typeof window.phantom !== 'undefined' && window.phantom.ethereum ? window.phantom.ethereum : 'undefined');
    console.log('window.ethereum:', typeof window.ethereum !== 'undefined' ? window.ethereum : 'undefined');
    if (window.ethereum) {
        console.log('window.ethereum.isPhantom:', window.ethereum.isPhantom);
        console.log('window.ethereum.chainId:', window.ethereum.chainId);
    }
    console.log('=============================');
}

async function connectWallet() {
    try {
        console.log('Connect wallet button clicked');

        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js library is not loaded. Please refresh the page.');
        }

        debugWalletDetection(); // Debug on click too

        const ethereum = getEthereumProvider();
        if (!ethereum) {
            const errorMsg = 'Phantom wallet not detected. Please install Phantom wallet extension.';
            console.error(errorMsg);
            alert(errorMsg);
            const walletStatus = document.getElementById('wallet-status');
            if (walletStatus) {
                walletStatus.textContent = errorMsg;
                walletStatus.style.color = '#f5576c';
            }
            return;
        }

        console.log('Requesting account access...');

        // Set up connect listener BEFORE requesting accounts (as per Phantom docs)
        // Note: This only fires on NEW connections, not existing ones
        const targetChainId = MONAD_TESTNET.chainId;
        let currentChainId;
        let connectHandlerAttached = false;

        const connectHandler = (connectionInfo) => {
            currentChainId = connectionInfo.chainId;
            console.log(`Connected to chain: ${connectionInfo.chainId}`);
        };

        ethereum.on('connect', connectHandler);
        connectHandlerAttached = true;

        // Request account access
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
            if (connectHandlerAttached) {
                ethereum.removeListener('connect', connectHandler);
            }
            throw new Error('No accounts returned from wallet');
        }

        console.log('Accounts received:', accounts);
        currentAccount = accounts[0];

        // Set up provider and signer (Phantom's EVM provider works for all EVM chains)
        console.log('Setting up ethers provider...');
        provider = new ethers.providers.Web3Provider(ethereum);
        signer = provider.getSigner();
        console.log('Ethers provider and signer created successfully');

        // Get chain ID - use connect event if available, otherwise query directly
        // (connect event only fires on NEW connections, not existing ones)
        if (!currentChainId) {
            try {
                currentChainId = await ethereum.request({ method: 'eth_chainId' });
                console.log('Got chain ID:', currentChainId);
            } catch (error) {
                console.error('Error getting chain ID:', error);
            }
        }

        // Clean up connect handler
        if (connectHandlerAttached) {
            ethereum.removeListener('connect', connectHandler);
        }

        // Check if we're on the right network
        if (!currentChainId || currentChainId.toLowerCase() !== targetChainId.toLowerCase()) {
            const errorMsg = `Please switch to Monad Testnet in Phantom. Current network: ${currentChainId || 'unknown'}, Required: ${targetChainId}. Click the network dropdown in Phantom and select Monad Testnet, then refresh this page.`;
            console.error(errorMsg);

            alert(errorMsg);
            const walletStatus = document.getElementById('wallet-status');
            if (walletStatus) {
                walletStatus.textContent = errorMsg;
                walletStatus.style.color = '#f5576c';
            }

            // Set up listener for chain changes
            const chainChangeHandler = async (newChainId) => {
                console.log('Chain changed to:', newChainId);
                if (newChainId.toLowerCase() === targetChainId.toLowerCase()) {
                    console.log('Switched to Monad Testnet! Reloading...');
                    ethereum.removeListener('chainChanged', chainChangeHandler);
                    window.location.reload();
                }
            };

            ethereum.on('chainChanged', chainChangeHandler);
            return; // Exit early - user needs to switch networks
        }

        console.log('On Monad Testnet - proceeding with connection');

        // Initialize contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        document.getElementById('wallet-status').textContent =
            `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        document.getElementById('wallet-section').classList.add('connected');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('contract-address').textContent =
            `Contract: ${CONTRACT_ADDRESS}`;

        // Load contract state
        await loadContractState();

        // Listen for account changes and chain changes
        if (ethereum) {
            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('chainChanged', handleChainChanged);
            console.log('Event listeners attached for account and chain changes');
        }

    } catch (error) {
        console.error('Error connecting wallet:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        console.error('Full error:', error);

        // Show error to user
        let userFriendlyMsg = 'Failed to connect wallet. ';
        if (error.code === 4001) {
            userFriendlyMsg += 'Please approve the connection request in your wallet.';
        } else if (error.code === -32002) {
            userFriendlyMsg += 'Connection request already pending. Please check your wallet.';
        } else {
            userFriendlyMsg += errorMsg;
        }

        alert(userFriendlyMsg);
        const walletStatus = document.getElementById('wallet-status');
        if (walletStatus) {
            walletStatus.textContent = 'Connection failed: ' + userFriendlyMsg;
            walletStatus.style.color = '#f5576c';
        }
    }
}

async function switchToMonadTestnet() {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
        throw new Error('No Ethereum provider found');
    }

    const targetChainId = MONAD_TESTNET.chainId;
    console.log('Target chain ID:', targetChainId);

    // Always try to add the network first (even if it exists)
    // This ensures Phantom knows about the network
    console.log('Adding Monad Testnet to Phantom...');
    try {
        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET]
        });
        console.log('Successfully added Monad Testnet');
    } catch (addError) {
        // If network already exists (code 4902), that's fine
        if (addError.code === 4902) {
            console.log('Monad Testnet already added');
        } else if (addError.code === 4001) {
            throw new Error('You rejected adding Monad Testnet. Please approve the network addition in your wallet.');
        } else {
            // Log but continue - network might already be added
            const addErrorMsg = addError.message || '';
            console.warn('Warning adding network (may already exist):', addErrorMsg);

            // If error says "not connected", this might mean Phantom can't reach the RPC
            if (addErrorMsg.includes('not connected')) {
                throw new Error('Phantom cannot connect to Monad Testnet RPC. Please ensure: 1) Monad Testnet is enabled in Phantom Settings → Active Networks, 2) Your internet connection is working, 3) Try manually switching to Monad Testnet in Phantom first.');
            }
        }
    }

    // Wait a moment for the network to be registered
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Now try to switch to the network
    try {
        console.log('Switching to Monad Testnet...');
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }]
        });
        console.log('Successfully switched to Monad Testnet');

        // Wait a moment for the switch to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify we're on the correct chain
        const verifyChainId = await ethereum.request({ method: 'eth_chainId' });
        if (verifyChainId.toLowerCase() === targetChainId.toLowerCase()) {
            console.log('Verified on Monad Testnet');
            return;
        } else {
            throw new Error(`Chain switch verification failed. Expected ${targetChainId}, got ${verifyChainId}`);
        }
    } catch (switchError) {
        console.error('Error switching network:', switchError);
        const errorMsg = switchError.message || 'Unknown error';

        if (switchError.code === 4001) {
            throw new Error('You rejected the network switch. Please approve the network switch in your wallet.');
        } else if (switchError.code === 4902) {
            // This shouldn't happen after adding, but handle it
            throw new Error('Monad Testnet not found. Please ensure Monad Testnet is enabled in Phantom Settings → Active Networks.');
        } else {
            // Check if user manually switched while we were waiting
            console.log('Checking if manually switched to Monad Testnet...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                const checkChainId = await ethereum.request({ method: 'eth_chainId' });
                if (checkChainId.toLowerCase() === targetChainId.toLowerCase()) {
                    console.log('Successfully on Monad Testnet (manual switch detected)');
                    return;
                }
            } catch (checkError) {
                console.error('Check failed:', checkError);
            }

            // Provide helpful error message
            if (errorMsg.includes('not connected')) {
                throw new Error('Phantom cannot connect to Monad Testnet. Please: 1) Ensure Monad Testnet is enabled in Phantom Settings → Active Networks, 2) Manually switch to Monad Testnet in Phantom (click the network dropdown), 3) Refresh this page and try connecting again.');
            }

            throw new Error('Failed to switch to Monad Testnet: ' + errorMsg + '. Please manually switch to Monad Testnet in Phantom (click the network dropdown) and try again.');
        }
    }
}

async function loadContractState() {
    try {
        if (!contract) return;

        const isOn = await contract.getState();
        updateSwitchUI(isOn);
        document.getElementById('toggle-btn').disabled = false;
        document.getElementById('contract-status').textContent =
            `Switch is currently: ${isOn ? 'ON' : 'OFF'}`;
    } catch (error) {
        console.error('Error loading contract state:', error);
        showError('Failed to load contract state. Make sure the contract address is correct.');
    }
}

function updateSwitchUI(isOn) {
    const switchElement = document.getElementById('switch');
    const switchLabel = switchElement.querySelector('.switch-label');

    if (isOn) {
        switchElement.classList.add('on');
        switchLabel.textContent = 'ON';
    } else {
        switchElement.classList.remove('on');
        switchLabel.textContent = 'OFF';
    }
}

async function toggleSwitch() {
    try {
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js library is not loaded. Please refresh the page.');
        }

        if (!contract) {
            showError('Contract not initialized. Please connect your wallet.');
            return;
        }

        const toggleBtn = document.getElementById('toggle-btn');
        toggleBtn.disabled = true;
        toggleBtn.textContent = 'Processing...';

        const txStatus = document.getElementById('tx-status');
        txStatus.textContent = 'Sending transaction...';
        txStatus.className = 'tx-status pending';

        // Convert 0.5 MON to Wei
        const togglePrice = ethers.utils.parseEther('0.5');

        // Send transaction
        const tx = await contract.toggle({
            value: togglePrice
        });

        txStatus.textContent = `Transaction sent: ${tx.hash}. Waiting for confirmation...`;

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        txStatus.textContent = `Transaction confirmed! Block: ${receipt.blockNumber}`;
        txStatus.className = 'tx-status success';

        // Reload contract state
        await loadContractState();

        toggleBtn.disabled = false;
        toggleBtn.textContent = 'Toggle Switch (0.5 MON)';

        // Clear status after 5 seconds
        setTimeout(() => {
            txStatus.textContent = '';
            txStatus.className = 'tx-status';
        }, 5000);

    } catch (error) {
        console.error('Error toggling switch:', error);
        const errorMsg = error.message || 'Failed to toggle switch';
        showError(errorMsg);

        document.getElementById('toggle-btn').disabled = false;
        document.getElementById('toggle-btn').textContent = 'Toggle Switch (0.5 MON)';
        document.getElementById('tx-status').textContent = '';
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected
        location.reload();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        connectWallet();
    }
}

function handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    // Reload page when chain changes to ensure everything is in sync
    window.location.reload();
}

function showError(message) {
    const txStatus = document.getElementById('tx-status');
    txStatus.textContent = `Error: ${message}`;
    txStatus.className = 'tx-status error';

    setTimeout(() => {
        txStatus.textContent = '';
        txStatus.className = 'tx-status';
    }, 5000);
}
