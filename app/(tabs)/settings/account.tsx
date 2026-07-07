import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditFieldModal } from "@/components/settings/EditFieldModal";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { useAppearance } from "@/context/AppearanceContext";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  DEFAULT_ACCOUNT,
  getAccountInfo,
  maskEmail,
  maskPhone,
  setAccountInfo,
  type AccountInfo,
} from "@/lib/accountConfig";
import { deleteAccount } from "@/lib/sessionConfig";

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { setMode } = useAppearance();
  const { logout } = useAuth();
  const [account, setAccount] = useState<AccountInfo>(DEFAULT_ACCOUNT);
  const [editingField, setEditingField] = useState<"phone" | "email" | null>(null);

  const loadData = useCallback(async () => {
    setAccount(await getAccountInfo());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const updateAccount = async (next: AccountInfo) => {
    setAccount(next);
    await setAccountInfo(next);
  };

  const handleFieldSave = (field: "phone" | "email", value: string) => {
    if (field === "phone" && value && !/^1\d{10}$/.test(value)) {
      Alert.alert("格式有误", "请输入 11 位中国大陆手机号。");
      return;
    }
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      Alert.alert("格式有误", "请输入有效的邮箱地址。");
      return;
    }
    void updateAccount({
      ...account,
      [field]: value,
    });
    setEditingField(null);
  };

  const handleWechatBind = () => {
    if (account.wechatBound) {
      Alert.alert("解绑微信", "确定解除当前微信绑定？", [
        { text: "取消", style: "cancel" },
        {
          text: "解绑",
          style: "destructive",
          onPress: () => {
            void updateAccount({
              ...account,
              wechatBound: false,
              wechatNickname: "",
            });
          },
        },
      ]);
      return;
    }

    Alert.alert("绑定微信", "将跳转微信授权（演示：直接模拟绑定成功）", [
      { text: "取消", style: "cancel" },
      {
        text: "绑定",
        onPress: () => {
          void updateAccount({
            ...account,
            wechatBound: true,
            wechatNickname: "微信用户",
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "注销账号",
      "注销后将清除本机全部账号与聊天配置数据，此操作不可恢复。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认注销",
          style: "destructive",
          onPress: () => {
            void deleteAccount().then(async () => {
              await logout();
              await setMode("system");
              router.replace("/(auth)/login");
            });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SettingsGroup>
          <SettingsNavRow
            title="手机号"
            value={account.phone ? maskPhone(account.phone) : "未绑定"}
            icon="call-outline"
            onPress={() => setEditingField("phone")}
          />
          <SettingsNavRow
            title="微信"
            value={
              account.wechatBound
                ? account.wechatNickname || "已绑定"
                : "未绑定"
            }
            icon="logo-wechat"
            onPress={handleWechatBind}
          />
          <SettingsNavRow
            title="电子邮箱"
            value={account.email ? maskEmail(account.email) : "未设置"}
            icon="mail-outline"
            showDivider={false}
            onPress={() => setEditingField("email")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsNavRow
            title="注销账号"
            icon="trash-outline"
            destructive
            showDivider={false}
            onPress={handleDeleteAccount}
          />
        </SettingsGroup>

        <EditFieldModal
          visible={editingField === "phone"}
          title="更改手机号"
          value={account.phone}
          placeholder="请输入 11 位手机号"
          keyboardType="phone-pad"
          onClose={() => setEditingField(null)}
          onSave={(value) => handleFieldSave("phone", value)}
        />
        <EditFieldModal
          visible={editingField === "email"}
          title="更改邮箱"
          value={account.email}
          placeholder="name@example.com"
          keyboardType="email-address"
          onClose={() => setEditingField(null)}
          onSave={(value) => handleFieldSave("email", value)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
