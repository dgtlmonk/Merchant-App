import { getSettings } from "./activation";

export function getMembershipJoinFormSchema(): Record<string, any> | null {
  const ls = getSettings();

  if (!ls) return null;

  return ls?.settings?.forms?.["membership-join"];
}

export function getOrderFormSchema(): Record<string, any> | null {
  const ls = getSettings();

  if (!ls) return {};

  return ls?.settings?.forms?.["order-create"];
}
