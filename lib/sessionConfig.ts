import { setAppearanceMode } from "@/lib/appearanceConfig";
import { clearAccountInfo } from "@/lib/accountConfig";
import { clearDeepSeekApiKey } from "@/lib/deepseekConfig";
import { clearUserProfile } from "@/lib/userProfileConfig";

/** 清除本机用户相关数据（模拟退出登录） */
export async function logoutUser(): Promise<void> {
  await Promise.all([
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
