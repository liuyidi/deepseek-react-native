#!/usr/bin/env node
/**
 * Bump patch version by 0.0.1 before each release build.
 * Syncs package.json, app.json, and native project files when present.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.join(__dirname, "..");
const PKG_PATH = path.join(ROOT_DIR, "package.json");
const APP_JSON_PATH = path.join(ROOT_DIR, "app.json");
const ANDROID_GRADLE_PATH = path.join(ROOT_DIR, "android/app/build.gradle");
const IOS_PLIST_PATH = path.join(ROOT_DIR, "ios/DeepSeekChat/Info.plist");

function bumpPatch(version) {
  const parts = version.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid semver (expected x.y.z): ${version}`);
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10));
  if (numbers.some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid semver: ${version}`);
  }

  numbers[2] += 1;
  return numbers.join(".");
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function syncAndroidGradle(versionName, versionCode) {
  if (!fs.existsSync(ANDROID_GRADLE_PATH)) {
    return;
  }

  let content = fs.readFileSync(ANDROID_GRADLE_PATH, "utf8");
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  fs.writeFileSync(ANDROID_GRADLE_PATH, content);
}

function syncIosPlist(versionName, buildNumber) {
  if (!fs.existsSync(IOS_PLIST_PATH)) {
    return;
  }

  let content = fs.readFileSync(IOS_PLIST_PATH, "utf8");
  content = content.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${versionName}$2`
  );
  content = content.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/,
    `$1${buildNumber}$2`
  );
  fs.writeFileSync(IOS_PLIST_PATH, content);
}

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, "utf8"));
const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, "utf8"));

const oldVersion = pkg.version;
const newVersion = bumpPatch(oldVersion);

const oldVersionCode = appJson.expo.android?.versionCode ?? 1;
const newVersionCode = oldVersionCode + 1;

const oldBuildNumber = Number.parseInt(appJson.expo.ios?.buildNumber ?? "1", 10);
const newBuildNumber = Number.isNaN(oldBuildNumber) ? 1 : oldBuildNumber + 1;

pkg.version = newVersion;
appJson.expo.version = newVersion;
appJson.expo.android.versionCode = newVersionCode;
appJson.expo.ios.buildNumber = String(newBuildNumber);

writeJson(PKG_PATH, pkg);
writeJson(APP_JSON_PATH, appJson);
syncAndroidGradle(newVersion, newVersionCode);
syncIosPlist(newVersion, String(newBuildNumber));

console.log(`Version bumped: ${oldVersion} -> ${newVersion}`);
console.log(`Android versionCode: ${oldVersionCode} -> ${newVersionCode}`);
console.log(`iOS buildNumber: ${oldBuildNumber} -> ${newBuildNumber}`);
