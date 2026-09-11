<!--
Copyright 2026 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Agent Guide for Google Navigation for React Native

This file provides instructions for AI coding agents working in this repository.
Read `README.md` and `CONTRIBUTING.md` before making substantial changes, and
follow existing code and test patterns when they are more specific than this
guide. Read `example/README.md` for sample app setup and `MIGRATING.md` for
compatibility and migration work.

## Core rules

- Keep changes focused on the requested issue. Do not perform unrelated cleanup
  or broad refactoring without a clear need.
- Preserve existing public API behavior unless the task explicitly calls for a
  breaking change.
- Maintain Android and iOS parity for cross-platform features. Document intended
  platform-specific behavior rather than silently omitting an implementation.
- This package requires React Native's new architecture: Fabric and TurboModules.
  Do not introduce a legacy-architecture fallback as an incidental fix.
- Never hand-edit generated code. Change its source definitions and regenerate
  through the appropriate build tooling.
- Add or update tests for behavior changes and bug fixes.
- Update public documentation and the example app when user-facing behavior or
  API usage changes.
- Never commit API keys, credentials, signing material, or other secrets.
- Do not claim that checks passed unless they were actually run successfully.

## Repository layout

The repository contains one React Native library and its Yarn workspace example:

- `src/`: TypeScript source for the public library.
  - `src/index.ts`: Main public export file.
  - `src/maps/`: Map types, view component, and controller.
  - `src/navigation/`: Navigation types, provider, hooks, view, and controllers.
  - `src/auto/`: Android Auto and CarPlay hook, controller access, and types.
  - `src/shared/`: Shared types, event-listener hooks, and conversion utilities.
  - `src/native/`: React Native Codegen specifications for native modules and
    the Fabric view component.
- `android/`: Android library implementation in Java and Kotlin, plus Gradle
  configuration.
- `ios/react-native-navigation-sdk/`: iOS implementation in Objective-C and
  Objective-C++, including CarPlay support.
- `react-native-navigation-sdk.podspec`: iOS package integration and native SDK
  dependency configuration.
- `lib/`: Generated CommonJS, ES module, and TypeScript declaration outputs;
  ignored by Git.
- `example/`: Sample app, native app projects, and test infrastructure.
  - `example/e2e/`: Detox test drivers and shared helpers.
  - `example/src/screens/IntegrationTestsScreen.tsx`: In-app integration tests.
  - `example/src/screens/integration_tests/`: Integration-test support code.
- `scripts/`: Native formatting and license-header scripts.
- `.github/workflows/` and `.github/actions/setup/`: CI checks and tool setup.
- `ANDROIDAUTO.md`, `CARPLAY.md`, and `MIGRATING.md`: Specialized setup and
  migration documentation.

## Development setup

Use the Node version in `.nvmrc` and the Yarn version in the root `package.json`
`packageManager` field. CI uses `.github/actions/setup/action.yml` to install
workspace dependencies:

```sh
yarn install --immutable
```

Use Yarn for repository development. Do not create or update `package-lock.json`
with npm; it is ignored here. When intentionally changing dependencies, use Yarn
and include the corresponding `yarn.lock` changes.

Additional tools depend on the files being changed:

- Android work requires the JDK version configured in `.github/workflows/ci.yml`
  and a working Android SDK. Follow the Kotlin version, new-architecture,
  Jetifier, and desugaring requirements in `README.md` and `MIGRATING.md`.
- iOS work requires macOS, Xcode, and CocoaPods. Use CI's versions when
  reproducing a CI issue rather than duplicating version pins in this guide.
- iOS uses CocoaPods for React Native integration and the podspec's
  `spm_dependency` for GoogleNavigation. Preserve this combined setup and the
  example Podfile's new-architecture and dynamic-framework configuration.
- Native formatting requires `google-java-format`, `clang-format`, and the
  Gradle-based Kotlin formatter. Consult CI and the scripts for versions.
- License checks require Google's `addlicense` tool.
- Integration tests require Detox prerequisites and an available device or
  simulator matching `example/.detoxrc.js`.

Before building or running the iOS example, install pods:

```sh
(cd example/ios && pod install)
```

Open `example/ios/SampleApp.xcworkspace`, not the project file, in Xcode.
Configure API keys following `example/README.md`:

- Android: use the ignored `example/android/local.properties` file.
- iOS: copy `example/ios/SampleApp/Keys.plist.sample` to the ignored `Keys.plist`
  beside it, only if that file does not already exist, then configure it locally.

Do not overwrite existing developer configuration. Real keys are required for
SDK functionality and integration tests; CI's placeholder keys only support
build validation. Never print real keys in logs or include them in diffs.

## Common commands

Run commands from the repository root unless noted otherwise.

```sh
# Static checks.
yarn lint
yarn test:types

# Build CommonJS, ES modules, and TypeScript declarations with Bob.
yarn build

# Apply JavaScript/TypeScript lint and formatting fixes.
yarn lint-fix

# Format native Java, Kotlin, and Objective-C/Objective-C++ sources.
./scripts/format.sh

# Check native formatting without changing files.
./scripts/format.sh --check

# Build the example app, using its workspace scripts.
yarn example build:android
yarn example build:ios

# Run the example app.
yarn example android
yarn example ios

# Check license headers.
./scripts/addlicense.sh --check
```

The native formatters can also be run individually with
`./scripts/format-java.sh`, `./scripts/format-kotlin.sh`, and
`./scripts/format-objc.sh`; each accepts `--check`. The Kotlin script invokes
Gradle from the example Android project and requires its build environment.
Formatting and lint-fix commands can affect unrelated files; review the complete
diff and keep only changes relevant to the task.

CI builds the library with `yarn prepare` (also Bob) and orchestrates example
builds with `yarn turbo run build:android` and `yarn turbo run build:ios`.
The example's iOS build script uses Debug mode, not a release archive.

## Generated code

### React Native Codegen

`src/native/` and the root `package.json` `codegenConfig` are the source of truth
for the native bridge:

- `NativeNavModule.ts`: Navigation TurboModule.
- `NativeNavViewModule.ts`: View-controller TurboModule.
- `NativeNavAutoModule.ts`: Automotive TurboModule.
- `NativeNavViewComponent.ts`: Fabric view props and events.

After changing a specification, rebuild the Android example and rerun iOS pod
installation and the iOS build so React Native Codegen regenerates and compiles
the affected bindings on both platforms. There is no standalone Codegen script
in the root `package.json`; `yarn build` only builds the TypeScript package.
Do not edit generated native specs, Fabric headers, or build-directory outputs.
Do not commit ignored generated artifacts.

Preserve Codegen-compatible types and the existing explicit spec-object
conventions. Read the notes in the affected spec before changing numeric types
or consolidating duplicated types: some representations exist to work around
native unboxing and Codegen limitations.

### Package outputs

React Native Builder Bob generates `lib/` from `src/` using the configuration in
`package.json` and `tsconfig.build.json`. Change `src/`, then run `yarn build`;
never patch emitted JavaScript or declaration files directly.

## Implementing API and platform changes

A cross-platform API change commonly touches several layers. Check each layer:

1. Update public TypeScript types, components, hooks, controllers, and exports.
2. Update the affected `src/native/` specification when the bridge changes.
3. Update JavaScript-to-native conversions and event payload handling.
4. Implement equivalent behavior in the Android Java/Kotlin and iOS
   Objective-C/Objective-C++ modules, views, and translation utilities.
5. Regenerate and compile native bindings through both platform builds.
6. Add integration coverage and update the example app.
7. Update `README.md` and, when relevant, `MIGRATING.md`, `ANDROIDAUTO.md`, or
   `CARPLAY.md`.

For platform-specific limitations, preserve existing documented semantics and
explain the limitation in public API documentation. Do not introduce an
undocumented no-op or fabricated success.

Be especially careful with lifecycle-sensitive code:

- Keep navigation-session lifetime independent of view lifetime where the
  existing API permits navigation without a mounted view.
- Release subscriptions, listeners, delegates, and native view references during
  cleanup. Follow `src/shared/` event hooks and existing listener setters.
- Avoid stale React closures, duplicate subscriptions, and callbacks after
  unmount or native disposal.
- Preserve view IDs, event names, nullability, numeric units, enum mappings,
  color conversions, and Promise rejection semantics across all layers.
- Respect map readiness, location permissions, terms acceptance, and navigation
  initialization before issuing operations that require them.
- Check Android Auto and CarPlay behavior when changing shared navigation,
  map-controller, or event code; read their dedicated guides first.

## Testing expectations

Run the narrowest relevant checks while iterating, then verify every affected
layer before finishing:

- TypeScript changes: run `yarn lint`, `yarn test:types`, and `yarn build`.
- Android changes: also run native formatting checks and the Android example
  build.
- iOS changes: also run native formatting checks, install pods as needed, and
  build the iOS example.
- Bridge or public cross-platform changes: build both native examples and run
  relevant Detox integration tests on both platforms when supported.
- Documentation-only changes: validate referenced paths, commands, and diff
  whitespace; native builds are not necessary.

Do not treat a green CI test job as evidence of runtime coverage: the current
`.github/workflows/ci.yml` test job is a placeholder. There is no root `yarn test`
script. The example has a Jest script, but it is not a substitute for the Detox
build-and-test flow.

### Detox integration tests

Use the existing two-part integration-test pattern: add the device interactions
in `example/e2e/` and the SDK assertions in
`example/src/screens/IntegrationTestsScreen.tsx` or its integration-test support
code. Follow existing test names and stable test IDs.

Reuse `example/e2e/shared.js` helpers such as
`initializeIntegrationTestsPage`, `selectTestByName`, `waitForTestToFinish`,
`expectNoErrors`, and `expectSuccess`. Handle terms acceptance with
`agreeToTermsAndConditions` where required. The initialization helper grants
location permission and includes synchronization workarounds; do not bypass it
without a clear reason. Prefer observable conditions over adding arbitrary
sleeps.

From the repository root, after configuring the example and API keys:

```sh
yarn example detox:build:android-release
yarn example detox:test:android-release

yarn example detox:build:ios-release
yarn example detox:test:ios-release
```

Use the emulator name and iOS simulator/runtime in `example/.detoxrc.js`.
Check `CONTRIBUTING.md` for the documented Detox/React Native compatibility
limitation before running tests. Its Android downgrade workaround targets an
older React Native version than this package now requires; do not automatically
downgrade the workspace or change dependencies just to run tests. Report the
actual compatibility blocker and agree on any toolchain changes separately.

When tests or builds cannot run because of missing SDKs, credentials, devices,
or tool compatibility, state exactly what was not run and why.

## Code style and documentation

- Follow `.eslintrc.js`, `.prettierrc`, `.editorconfig`, and the TypeScript
  configurations. Do not disable checks to hide a regression.
- Keep React hooks compliant with hook rules and dependency tracking. Avoid
  `any`; use meaningful types and validate inputs crossing the native bridge.
- Follow neighboring Java, Kotlin, Objective-C, and Objective-C++ patterns and
  use the repository formatters rather than manually imitating their output.
- Document public APIs with JSDoc, including units, valid ranges, lifecycle
  requirements, asynchronous behavior, errors, and platform differences.
- Prefer comments that explain why unusual code exists, not comments that
  narrate obvious operations.
- Use `@googlemaps/react-native-navigation-sdk` imports in user-facing examples.
- Keep dependencies minimal and explain any required additions or upgrades.

## License headers

New source files must contain the repository's Apache 2.0 license header.
Install `addlicense` as described in `CONTRIBUTING.md`, then run:

```sh
./scripts/addlicense.sh
./scripts/addlicense.sh --check
```

The script uses `header_template.txt` and excludes dependencies and generated
outputs. Review the diff because header application operates across the repo.

## Releases, versions, and changelog

This repository uses Release Please. For ordinary feature and bug-fix pull
requests, do not manually update release-managed metadata solely to record the
change. In particular, avoid manual edits to:

- `CHANGELOG.md`
- `.release-please-manifest.json`
- The `version` field in the root `package.json`
- `android/src/main/java/com/google/android/react/navsdk/SdkVersion.java`
- `ios/react-native-navigation-sdk/SdkVersion.h`

The podspec reads the package version from `package.json`. Change release-managed
files only for release-configuration tasks or at a maintainer's explicit request.
Normal dependency changes can still require manifest and lockfile updates.

## Pull requests and commits

- Use Conventional Commit titles and messages, such as `feat:`, `fix:`, `docs:`,
  `test:`, `refactor:`, `build:`, or `chore:`. Commit messages are checked by
  commitlint through Lefthook.
- Follow `CONTRIBUTING.md` for CLA and review requirements.
- Do not bypass Lefthook checks to conceal failures. Its hooks check native
  formatting, licenses, lint, and types; they do not run full integration tests.
- Mark intentional breaking changes clearly and include migration instructions.
- Explain what changed and why, link the issue when applicable, and list checks
  that were actually run.
- Keep implementation, tests, and documentation for one concern together;
  avoid unrelated formatting or cleanup.

## Before finishing

Confirm that:

- Every affected platform is implemented and documented.
- Public exports and native specs agree, and generated outputs were not patched
  by hand or added accidentally.
- Formatting, lint, types, and the library build pass where relevant.
- Relevant native builds and integration tests pass, or blockers are reported
  accurately.
- Tests cover the behavior change or regression.
- Public documentation, migration guidance, and examples are updated as needed.
- New files have valid license headers.
- No secrets, local paths, build artifacts, or unrelated changes are included.
