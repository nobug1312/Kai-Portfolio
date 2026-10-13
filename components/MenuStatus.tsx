"use client";

import { BatteryChargingIcon } from "@phosphor-icons/react/dist/csr/BatteryCharging";
import { BatteryEmptyIcon } from "@phosphor-icons/react/dist/csr/BatteryEmpty";
import { BatteryFullIcon } from "@phosphor-icons/react/dist/csr/BatteryFull";
import { BatteryLowIcon } from "@phosphor-icons/react/dist/csr/BatteryLow";
import { BatteryMediumIcon } from "@phosphor-icons/react/dist/csr/BatteryMedium";
import { FadersHorizontalIcon } from "@phosphor-icons/react/dist/csr/FadersHorizontal";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { useEffect, useState } from "react";

// macOS-style WiFi glyph: three concentric arcs + a dot (dimmed with a slash when offline)
function WifiIcon({ size, off }: { size: number; off?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" style={off ? { opacity: 0.55 } : undefined}>
      <path d="M2.45 7.41A8 8 0 0 1 15.55 7.41" />
      <path d="M4.5 8.84A5.5 5.5 0 0 1 13.5 8.84" />
      <path d="M6.54 10.28A3 3 0 0 1 11.46 10.28" />
      <circle cx="9" cy="12" r="1.15" fill="currentColor" stroke="none" />
      {off && <line x1="3" y1="2.4" x2="15" y2="12.4" strokeWidth="1.5" />}
    </svg>
  );
}

type BatteryReading = { level: number; charging: boolean };
type BrowserBattery = EventTarget & BatteryReading;

export function MenuStatus() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [battery, setBattery] = useState<BatteryReading | null>(null);

  useEffect(() => {
    let active = true;
    let manager: BrowserBattery | undefined;
    const browser = navigator as Navigator & { getBattery?: () => Promise<BrowserBattery> };

    function updateNetwork() { setOnline(navigator.onLine); }
    function updateBattery() {
      if (manager) setBattery({ level: manager.level, charging: manager.charging });
    }

    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    browser.getBattery?.().then(current => {
      if (!active) return;
      manager = current;
      updateBattery();
      manager.addEventListener("levelchange", updateBattery);
      manager.addEventListener("chargingchange", updateBattery);
    }).catch(() => {});

    return () => {
      active = false;
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      manager?.removeEventListener("levelchange", updateBattery);
      manager?.removeEventListener("chargingchange", updateBattery);
    };
  }, []);

  const networkLabel = online === null ? "Network status unavailable" : online ? "Network connected" : "Offline";
  const batteryLabel = battery ? `Battery ${Math.round(battery.level * 100)}%${battery.charging ? ", charging" : ""}` : "Battery information unavailable";
  const BatteryIcon = !battery ? BatteryEmptyIcon : battery.charging ? BatteryChargingIcon : battery.level >= .7 ? BatteryFullIcon : battery.level >= .25 ? BatteryMediumIcon : BatteryLowIcon;

  return (
    <div className="mac-system-status">
      <span className="mac-status-icon mac-sound-icon" aria-hidden="true"><SpeakerHighIcon size={16} weight="fill" /></span>
      <span className="mac-status-icon mac-wifi-icon" role="img" aria-label={networkLabel} title={networkLabel}>
        <WifiIcon size={17} off={online === false} />
      </span>
      <span className="mac-status-icon mac-battery-icon" role="img" aria-label={batteryLabel} title={batteryLabel}><BatteryIcon size={22} weight="fill" aria-hidden="true" /></span>
      <details className="mac-control-center mac-menu-group" onKeyDown={event => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.currentTarget.open = false;
        event.currentTarget.querySelector("summary")?.focus();
      }}>
        <summary aria-label="Control Center" title="Control Center"><FadersHorizontalIcon size={17} weight="fill" aria-hidden="true" /></summary>
        <div className="mac-menu-popover mac-status-popover" role="group" aria-label="System status">
          <p>{<WifiIcon size={18} off={online === false} />}<span>Network<small>{networkLabel}</small></span></p>
          <p><BatteryIcon size={22} weight="fill" aria-hidden="true" /><span>Battery<small>{batteryLabel}</small></span></p>
        </div>
      </details>
    </div>
  );
}