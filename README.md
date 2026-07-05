# DeepSeek Chat

基于 **Expo + React Native** 的 DeepSeek 对话应用，支持在 iOS、Android 和 Web 上与 DeepSeek API 进行实时聊天。

## 功能特性

- **AI 对话**：接入 DeepSeek Chat 模型，支持多轮问答
- **安全存储 API Key**：密钥保存在本机 Secure Store，无需写进代码
- **三页导航**：首页引导、Chat 聊天、Settings 设置
- **跨平台**：iOS / Android / Web（Expo Go 或开发构建均可）
- **聊天 UI**：基于 `react-native-gifted-chat`，支持消息气泡、系统提示等

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Expo SDK 54、React Native 0.81 |
| 路由 | Expo Router 6 |
| 聊天 UI | react-native-gifted-chat |
| 网络 | axios |
| 密钥存储 | expo-secure-store |
| 语言 | TypeScript |

## 环境要求

- **Node.js**：建议 `>= 20.19.4`（项目含 `.nvmrc`，可使用 `nvm use`）
- **包管理器**：npm
- **移动端调试**： [Expo Go](https://expo.dev/go)（需与 SDK 54 匹配）

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone git@github.com:liuyidi/deepseek-react-native.git
cd deepseek-react-native
npm install
```

### 2. 启动开发服务器

```bash
npx expo start
```

启动后可选择：

- 按 `i` 打开 iOS 模拟器
- 按 `a` 打开 Android 模拟器
- 按 `w` 打开 Web 浏览器
- 扫码用 Expo Go 在真机调试

也可使用快捷命令：

```bash
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

### 3. 配置 DeepSeek API Key

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 进入 **API Keys**，创建并复制密钥（通常以 `sk-` 开头）
3. 在 App 内打开底部 **Settings** 标签页
4. 粘贴 API Key 并点击 **保存密钥**

> 密钥仅存储在本机，不会上传到服务器，也不会写入 Git 仓库。

### 4. 开始聊天

切换到 **Chat** 标签页即可发送消息。若未配置 API Key，会提示前往设置页。

## 项目结构

```
app/
├── _layout.tsx           # 根布局
└── (tabs)/
    ├── index.tsx         # 首页（功能介绍与快速上手）
    ├── explore.tsx       # Chat 聊天页
    ├── settings.tsx      # API Key 设置页
    └── _layout.tsx       # 底部 Tab 导航

hooks/
└── useDeepSeekApiKey.ts  # 读取本地 API Key

lib/
└── deepseekConfig.ts     # Key 存取与 API 地址常量

assets/images/            # 图标、背景等资源
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run ios` | 在 iOS 模拟器运行 |
| `npm run android` | 在 Android 模拟器运行 |
| `npm run web` | 在浏览器运行 |
| `npm run lint` | 代码检查 |
| `npm test` | 运行测试 |
| `npm run reset-project` | 重置为 Expo 模板初始结构（可选） |

## 注意事项

### Expo Go 版本

本项目使用 **Expo SDK 54**，请确保手机上的 Expo Go 也为 SDK 54，否则会出现版本不兼容提示。

### iOS 聊天输入

在 React Native 0.81 上，`react-native-gifted-chat` 需要设置 `maxInputLength`，否则 iOS 可能出现键盘弹出但无法输入的问题。项目已在 Chat 页处理。

### API 调用失败

若返回 `402` 等错误，通常是 API Key 无效或账户余额不足，请在 DeepSeek 平台检查密钥与余额。

## 相关链接

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [DeepSeek 开放平台](https://platform.deepseek.com/)
- [react-native-gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat)

## 致谢

本项目基于 [hellochirag/deepseek-react-native](https://github.com/hellochirag/deepseek-react-native) 二次开发，感谢原作者的开源贡献。

## License

MIT
