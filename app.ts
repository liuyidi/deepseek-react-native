/**
 * 备用根组件（当前未启用）
 *
 * 与 Expo Router 的 app/ 目录配合，等价于 expo-router/entry 的自定义入口写法。
 * 当前仍由 package.json 的 "expo-router/entry" 直接启动，无需改动本文件。
 *
 * 启用步骤见 index.ts
 */
import { createElement } from "react";
import { ExpoRoot } from "expo-router";

declare const require: NodeRequire & {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): __WebpackModuleApi.RequireContext;
};

export default function App() {
  return createElement(ExpoRoot, {
    context: require.context("./app"),
  });
}
