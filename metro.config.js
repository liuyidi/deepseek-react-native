/**
 * Metro 打包配置
 *
 * 说明：Expo 项目根目录存在 metro.config.js 时会被自动加载。
 * 当前配置与 Expo 默认行为一致；若希望完全使用内置默认配置，
 * 可将本文件重命名为 metro.config.example.js。
 */
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
