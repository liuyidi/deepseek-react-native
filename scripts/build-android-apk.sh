#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -z "${JAVA_HOME:-}" ]]; then
  for candidate in \
    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" \
    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"; do
    if [[ -d "$candidate" ]]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done

  if [[ -z "${JAVA_HOME:-}" ]] && command -v /usr/libexec/java_home >/dev/null 2>&1; then
    export JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home)"
  fi
fi

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}${ANDROID_HOME}/platform-tools:${PATH}"

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JAVA_HOME is not set. Install JDK 17, e.g.: brew install openjdk@17" >&2
  exit 1
fi

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "ANDROID_HOME not found: $ANDROID_HOME" >&2
  exit 1
fi

if [[ ! -x "$ROOT_DIR/android/gradlew" ]]; then
  echo "android/gradlew not found. Run: npm run build:android:prebuild" >&2
  exit 1
fi

echo "Using JAVA_HOME=$JAVA_HOME"
echo "Using ANDROID_HOME=$ANDROID_HOME"
echo "Building release APK..."

cd "$ROOT_DIR/android"
./gradlew assembleRelease --no-daemon

VERSION="$(node -p "require('../package.json').version")"
APK_SRC="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
APK_DST="$ROOT_DIR/dist/deepseek-chat-${VERSION}-release.apk"

if [[ ! -f "$APK_SRC" ]]; then
  echo "APK not found: $APK_SRC" >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/dist"
cp "$APK_SRC" "$APK_DST"

echo ""
echo "Build complete."
echo "APK: $APK_DST"
ls -lh "$APK_DST"
