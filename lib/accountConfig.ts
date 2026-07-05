import AsyncStorage from "@react-native-async-storage/async-storage";

export type AccountInfo = {
  phone: string;
  email: string;
  wechatBound: boolean;
  wechatNickname: string;
};

const ACCOUNT_STORAGE_KEY = "account_info";

export const DEFAULT_ACCOUNT: AccountInfo = {
  phone: "",
  email: "",
  wechatBound: false,
  wechatNickname: "",
};

export async function getAccountInfo(): Promise<AccountInfo> {
  const raw = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ACCOUNT;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AccountInfo>;
    return {
      phone: parsed.phone?.trim() || "",
      email: parsed.email?.trim() || "",
      wechatBound: Boolean(parsed.wechatBound),
      wechatNickname: parsed.wechatNickname?.trim() || "",
    };
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

export async function setAccountInfo(account: AccountInfo): Promise<void> {
  await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

export async function clearAccountInfo(): Promise<void> {
  await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY);
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) {
    return phone || "未绑定";
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function maskEmail(email: string): string {
  if (!email.includes("@")) {
    return email || "未设置";
  }
  const [name, domain] = email.split("@");
  if (name.length <= 2) {
    return `${name[0] ?? ""}*@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
}
