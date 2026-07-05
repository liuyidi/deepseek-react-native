import axios from "axios";

import { getDeepSeekApiKey } from "@/lib/deepseekConfig";

export const DEEPSEEK_BALANCE_URL = "https://api.deepseek.com/user/balance";

export type BalanceInfo = {
  currency: string;
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
};

export type UserBalance = {
  isAvailable: boolean;
  balances: BalanceInfo[];
};

type BalanceApiResponse = {
  is_available: boolean;
  balance_infos: BalanceInfo[];
};

export async function fetchDeepSeekBalance(): Promise<UserBalance> {
  const apiKey = await getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const response = await axios.get<BalanceApiResponse>(DEEPSEEK_BALANCE_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  return {
    isAvailable: response.data.is_available,
    balances: response.data.balance_infos ?? [],
  };
}

export function formatBalanceAmount(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) {
    return amount;
  }
  const symbol = currency === "USD" ? "$" : currency === "CNY" ? "¥" : "";
  return `${symbol}${value.toFixed(2)}`;
}

export function pickPrimaryBalance(balances: BalanceInfo[]): BalanceInfo | null {
  if (balances.length === 0) {
    return null;
  }
  return balances.find((item) => item.currency === "CNY") ?? balances[0];
}
