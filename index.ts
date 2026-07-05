/**
 * 备用 JS 入口（当前未启用）
 *
 * 当前项目入口：package.json -> "main": "expo-router/entry"
 *
 * 启用本文件：
 * 1. 将 package.json 的 "main" 改为 "./index.ts"
 * 2. 确保 app.ts 中的 App 组件可用
 */
import { registerRootComponent } from "expo";

import App from "./app";

registerRootComponent(App);
