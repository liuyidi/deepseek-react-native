import { setAppearanceMode } from "@/lib/appearanceConfig";
import { clearAccountInfo } from "@/lib/accountConfig";
import { logoutUserApi } from "@/lib/authApi";
import { clearAuthSession, getStoredAuthSession } from "@/lib/authConfig";
import { clearDeepSeekApiKey } from "@/lib/deepseekConfig";
import { clearUserProfile } from "@/lib/userProfileConfig";

/** 清除本机用户相关数据（含 auth token） */
export async function logoutUser(): Promise<void> {
  const session = await getStoredAuthSession();
  if (session?.refreshToken) {
    await logoutUserApi(session.refreshToken);
  }

  await Promise.all([
    clearAuthSession(),
    clearUserProfile(),
    clearAccountInfo(),
    clearDeepSeekApiKey(),
    setAppearanceMode("system"),
  ]);
}

/** 注销账号：清除全部本地账号数据 */
export async function deleteAccount(): Promise<void> {
  await logoutUser();
}
