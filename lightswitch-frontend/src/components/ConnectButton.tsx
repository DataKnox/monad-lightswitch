'use client'

import { modal } from '@/context'

export function ConnectButton() {
  return (
    <button className="btn btn-primary" onClick={() => modal.open()}>
      Connect Wallet
    </button>
  )
}