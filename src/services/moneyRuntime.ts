import { loadMoneySnapshot, saveMoneySnapshot } from "./durableLayer4";
import { DeterministicMoneyAuthority } from "./moneySafety";

let authority = new DeterministicMoneyAuthority();
let loaded = false;

export function getMoneyAuthority(): DeterministicMoneyAuthority {
  return authority;
}

export async function loadMoneyAuthority(initialBalanceCents = 0): Promise<void> {
  const snapshot = await loadMoneySnapshot();
  authority = snapshot
    ? DeterministicMoneyAuthority.restore(snapshot)
    : new DeterministicMoneyAuthority({ balanceCents: initialBalanceCents });
  loaded = true;
  if (!snapshot) await saveMoneySnapshot(authority.snapshot());
}

export async function persistMoneyAuthority(): Promise<void> {
  if (!loaded) return;
  await saveMoneySnapshot(authority.snapshot());
}

export function _resetMoneyAuthorityForTests(): void {
  authority = new DeterministicMoneyAuthority();
  loaded = false;
}
