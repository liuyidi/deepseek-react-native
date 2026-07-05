# App 国内发布部署

> 规划说明，不含实现代码。  
> 更新时间：2026-07-05

---

## 现状

| 模块 | 当前状态 |
|------|----------|
| 技术栈 | Expo SDK 54，Managed Workflow |
| 包名 | `com.liuyidi.deepseekchat`（iOS / Android） |
| 构建 | 未配置 EAS |

---

## 总体路径

本项目为 **Expo Managed Workflow**，推荐路线：

```
本地开发 → EAS Build 云构建 → 商店提交 / 侧载分发
```

需注册 [Expo EAS](https://expo.dev) 并安装 `eas-cli`。

---

## 构建配置（待做）

1. 初始化 `eas.json`（development / preview / production profiles）
2. iOS：`eas build --platform ios --profile production`
3. Android：`eas build --platform android --profile production`（产出 AAB）

**`app.json` 待补充项：**

- 隐私政策 URL、用户协议 URL（国内商店硬性要求）
- Android `permissions` 最小化声明
- iOS 隐私清单（Privacy Manifest / `NSPrivacyAccessedAPITypes`，2024 起审核要求）
- 应用简介、截图、分级信息

---

## iOS — 国内分发

> ⚠️ **重要**：Apple 在中国大陆仅有一个官方渠道 — **App Store（中国区）**。  
> 不存在类似 Android 的多渠道 APK 分包；所有 iOS 应用必须过 App Store Connect 审核。

| 步骤 | 说明 |
|------|------|
| Apple Developer 账号 | 个人 ¥688/年 或 企业账号（企业内部分发另议） |
| App Store Connect | 创建 App、填写元数据、上传截图 |
| 备案 | 2024 起 App Store 中国区要求 ICP 备案号（需有大陆服务器或接入商代办） |
| 加密声明 | 已在 `infoPlist.ITSAppUsesNonExemptEncryption: false`，提交时选「否」即可 |
| 构建上传 | EAS Submit → App Store Connect，或 Transporter 上传 IPA |
| 审核 | 7–14 天常见；需说明 App 用途、是否调用 AI 接口、数据如何处理 |

**TestFlight**：审核前可用 TestFlight 内测（需 Apple Developer）。

---

## Android — 国内主流渠道

Google Play 在国内不可用，需分别上架国内商店（各商店独立开发者账号 + 独立审核）：

| 渠道 | 开发者平台 | 备注 |
|------|-----------|------|
| 华为应用市场 | developer.huawei.com | 鸿蒙/华为设备占比高，优先 |
| 小米应用商店 | dev.mi.com | 需企业或个人实名 |
| OPPO 软件商店 | open.oppomobile.com | |
| vivo 应用商店 | dev.vivo.com.cn | |
| 应用宝（腾讯） | open.tencent.com | 覆盖面广 |
| 魅族 / 360 等 | 按需 | 长尾渠道可后期补 |

**共同材料：**

- 软件著作权（部分商店强烈建议或强制）
- ICP 备案号（涉及联网、账号系统时基本必须）
- 隐私政策、权限说明、应用介绍、截图（各尺寸）
- 企业营业执照（个人开发者部分商店受限）

**包体策略：**

- 官方渠道：各商店上传**同一 AAB**，由商店自动拆 APK
- 或各渠道打不同 `channel` 包（统计用，EAS 可用 env + build profile）

---

## 合规清单（国内联网 App）

- [ ] **ICP 备案**（域名 + App 主体一致；若仅客户端直连 DeepSeek API，仍建议有备案 landing 页）
- [ ] **隐私政策** + **用户协议**（首次启动弹窗同意，设置页可查看）
- [ ] **个人信息保护法**：最小采集、可删除账号、可导出数据
- [ ] **算法/生成式 AI 备案**（若对外提供 AI 对话服务，2024 起监管趋严；自用工具类影响较小，需法务评估）
- [ ] **未成年人模式**（部分商店开始抽查）
- [ ] **API Key 安全**：用户密钥存 SecureStore ✅；若改走后端代理，密钥不得落日志

---

## 推荐发布节奏

```
Phase 1  内测     TestFlight + 华为/小米内测渠道 / APK 直装
Phase 2  小范围   1–2 个 Android 商店 + App Store 中国区
Phase 3  全渠道   补齐 OPPO/vivo/应用宝 + 版本迭代自动化（EAS Update 热更新 JS 层）
```

---

## 持续交付（可选）

| 能力 | 工具 |
|------|------|
| 原生包构建 | EAS Build |
| OTA 热更新（JS/资源） | EAS Update（不改原生时无需重新过审） |
| CI | GitHub Actions 触发 `eas build` |
| 崩溃监控 | Sentry（`@sentry/react-native`） |

---

## 参考链接

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Apple App Store 中国区](https://developer.apple.com/cn/support/app-store/)
- [华为开发者联盟](https://developer.huawei.com/)

---

## 相关文档

- [总览与依赖关系](./TODO.md)
- [后端接入（账号与合规）](./backend-fastapi-railway.md)
