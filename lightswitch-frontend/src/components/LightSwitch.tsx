'use client'

interface LightSwitchProps {
  isOn: boolean
}

export default function LightSwitch({ isOn }: LightSwitchProps) {
  return (
    <div className="switch-container">
      <div className={`switch ${isOn ? 'on' : ''}`}>
        <div className="switch-label">{isOn ? 'ON' : 'OFF'}</div>
        <div className="switch-slider"></div>
      </div>
    </div>
  )
}
