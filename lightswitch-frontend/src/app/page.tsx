'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { ConnectButton } from '@/components/ConnectButton'
import LightSwitch from '@/components/LightSwitch'

const CONTRACT_ADDRESS = '0x01Fe1E8fe29A901009eC3844B2079F5B116D7A9c' as const

const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'isOn',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'toggle',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getState',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bool', name: 'newState', type: 'bool' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'SwitchToggled',
    type: 'event'
  }
] as const

export default function Home() {
  const { address, isConnected } = useAccount()
  const [txStatus, setTxStatus] = useState<{ type: 'pending' | 'success' | 'error'; message: string } | null>(null)

  // Read contract state
  const { data: isOn, refetch: refetchState } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getState',
    query: {
      enabled: isConnected
    }
  })

  // Write contract
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  useEffect(() => {
    if (isConfirming) {
      setTxStatus({ type: 'pending', message: 'Transaction sent! Waiting for confirmation...' })
    }
    if (isSuccess) {
      setTxStatus({ type: 'success', message: 'Transaction confirmed!' })
      refetchState()
      setTimeout(() => setTxStatus(null), 5000)
    }
    if (error) {
      setTxStatus({ type: 'error', message: `Error: ${error.message}` })
      setTimeout(() => setTxStatus(null), 5000)
    }
  }, [isConfirming, isSuccess, error, refetchState])

  const handleToggle = async () => {
    try {
      const togglePrice = parseEther('0.5')
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'toggle',
        value: togglePrice
      })
    } catch (err) {
      console.error('Error toggling switch:', err)
    }
  }

  return (
    <div className="container">
      <h1>🔦 Light Switch</h1>
      <p className="subtitle">Monad Testnet - Toggle requires 0.5 MON</p>

      {!isConnected ? (
        <div className="wallet-section">
          <ConnectButton />
          <p className="wallet-status">Not connected</p>
          <p className="wallet-hint">
            💡 Connect your wallet using Reown AppKit
          </p>
        </div>
      ) : (
        <div className="app-section">
          <div className="wallet-section connected">
            <p className="wallet-status">
              Connected: {address?.substring(0, 6)}...{address?.substring(38)}
            </p>
          </div>

          <LightSwitch isOn={isOn ?? false} />

          <div className="info-section">
            <p className="status-text">
              Switch is currently: {isOn ? 'ON' : 'OFF'}
            </p>
            <p className="address-text">Contract: {CONTRACT_ADDRESS}</p>
          </div>

          <button
            className="btn btn-toggle"
            onClick={handleToggle}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? 'Processing...' : 'Toggle Switch (0.5 MON)'}
          </button>

          {txStatus && (
            <div className={`tx-status ${txStatus.type}`}>
              {txStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}