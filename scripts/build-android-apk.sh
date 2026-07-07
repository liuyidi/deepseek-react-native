#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

is_valid_java_home() {
  local home="$1"
  [[ -n "$home" && -x "$home/bin/java" ]]
}

java_major_version() {
  "$1/bin/java" -version 2>&1 | awk -F '[ ".]+' '/version/ { print $4; exit }'
}

resolve_java_home() {
  local candidate major

  if is_valid_java_home "${JAVA_HOME:-}"; then
    major="$(java_major_version "$JAVA_HOME")"
    if [[ "$major" -ge 17 ]]; then
      echo "$JAVA_HOME"
      return 0
    fi
    echo "Ignoring JAVA_HOME (Java $major): $JAVA_HOME" >&2
  elif [[ -n "${JAVA_HOME:-}" ]]; then
    echo "Ignoring invalid JAVA_HOME: $JAVA_HOME" >&2
  fi

  for candidate in \
    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" \
    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"; do
    if is_valid_java_home "$candidate"; then
      echo "$candidate"
      return 0
    fi
  done

  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    candidate="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
    if is_valid_java_home "$candidate"; then
      echo "$candidate"
      return 0
    fi
  fi

  return 1
}

export JAVA_HOME="$(resolve_java_home || true)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}${ANDROID_HOME}/platform-tools:${PATH}"

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JDK 17 not found. Install it, e.g.: brew install openjdk@17" >&2
  exit 1
fi

if ! is_valid_java_home "$JAVA_HOME"; then
  echo "Resolved JAVA_HOME is invalid: $JAVA_HOME" >&2
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
echo "Using Java $("$JAVA_HOME/bin/java" -version 2>&1 | head -n 1)"
echo "Using ANDROID_HOME=$ANDROID_HOME"
echo "Bumping version..."
node "$ROOT_DIR/scripts/bump-version.js"
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
