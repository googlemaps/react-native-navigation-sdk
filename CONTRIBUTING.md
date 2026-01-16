# How to contribute

## Before you begin

### Sign our Contributor License Agreement

Contributions to this project must be accompanied by a
[Contributor License Agreement](https://cla.developers.google.com/about) (CLA).
You (or your employer) retain the copyright to your contribution; this simply
gives us permission to use and redistribute your contributions as part of the
project.

If you or your current employer have already signed the Google CLA (even if it
was for a different project), you probably don't need to do it again.

Visit <https://cla.developers.google.com/> to see your current agreements or to
sign a new one.

### Review our community guidelines

This project follows
[Google's Open Source Community Guidelines](https://opensource.google/conduct/).

## Contribution process

## 1. Things you will need

- Linux, Mac OS X, or Windows.
- [git](https://git-scm.com) (used for source version control).
- An IDE such as [Android Studio](https://developer.android.com/studio) or [Visual Studio Code](https://code.visualstudio.com/).
- [addlicense](https://github.com/google/addlicense)
- [google-java-format Version 1.23.0](https://github.com/google/google-java-format) (used to format Java code).
- [clang-format](https://clang.llvm.org/docs/ClangFormat.html) (used to format Objective-C code).

## 2. Forking & cloning the repository

- Ensure all the dependencies described in the [README](./README.md) are installed.
- Fork `https://github.com/googlemaps/react-native-navigation-sdk` into your own GitHub account. If
  you already have a fork, and are now installing a development environment on
  a new machine, make sure you've updated your fork.
- If you haven't configured your machine with an SSH key that's known to github, then
  follow [GitHub's directions](https://help.github.com/articles/generating-ssh-keys/)
  to generate an SSH key.
- `git clone git@github.com:<your_name_here>/googlemaps/react-native-navigation-sdk.git`
- `git remote add upstream git@github.com:googlemaps/react-native-sdk.git` (So that you
  fetch from the master repository, not your clone, when running `git fetch`
  et al.)

#### Create branch

1. `git fetch upstream`
2. `git checkout upstream/master -b <name_of_your_branch>`
3. Start coding!

#### Commit changes

1. This project uses `lefthook` to ensure tests pass before committing. Please configure your environment paths to include the Go binary path for `addlicense` and the Node binary path for `npx` in the `~/.lefthookrc` file. For more information, refer to the [lefthook documentation](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md#rc).

2. `git commit -a -m "<your informative commit message>"`

    Please make sure all your check-ins have detailed commit messages explaining the patch.
    When naming the title of your pull request, please follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) guide. For example, for a fix to the Driver library: 

    `fix(navigation_view): fixed a bug!`

3. `git push origin <name_of_your_branch>`

#### Create pull request

1. `git pull-request` (if you are using [Hub](http://github.com/github/hub/)) or
  go to `https://github.com/googlemaps/react-native-navigation-sdk` and click the
  "Compare & pull request" button

## 3. Test your changes

Make sure to test your changes before sending them for review. To do so, update and run the [Sample app](./example/) at `./example`.

## 4. Code Formatting

### Objective-C and Java Code Formatting

This project enforces code formatting for Objective-C and Java files to follow Google's style guidelines. The formatting is automatically checked before commits and during continuous integration (CI) using Lefthook and GitHub Actions.

#### Running Formatters Locally

Before committing your changes, you should run the formatters manually to ensure your code adheres to the required style:

**Objective-C:**
```bash
./scripts/format-objc.sh
```
This script will format all Objective-C files under the /ios and /example/ios directories according to Google's Objective-C style guide.

**Java:**
```bash
./scripts/format-java.sh
```
This script will format all Java files under the /android and /example/android directories according to Google's Java style guide.


## 5. Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

Please peruse the
[Typescript style guide](https://google.github.io/styleguide/tsguide.html), [Java style guide](https://google.github.io/styleguide/javaguide.html), and [Objective-C style guide](https://google.github.io/styleguide/objcguide.html) before
working on anything non-trivial. These guidelines are intended to
keep the code consistent and avoid common pitfalls.

## 6. Running tests

Google Maps React Native Navigation package has integration tests.

### Integration tests

Integration tests are responsible for ensuring that the plugin works against the native Navigation SDK for both Android and iOS platforms. Detox along with example application is used for the integration tests. "Integration tests must accompany the implementation of all new features.
To run the test you must first install and setup detox. Please follow the guide here:
https://wix.github.io/Detox/docs/introduction/environment-setup

> [!NOTE]
> The current (pinned) version of Detox does not work with the latest React Native version used in the example app. To run Android Detox tests, the example app must first be downgraded to React Native 0.79.5 until support for newer versions is available.

Build the tests using detox-cli in the example folder:

iOS:
```bash
yarn run example detox:build:ios-release
```

Android:
```bash
yarn run example detox:build:android-release
```

Google Maps React Native Navigation SDK integration tests can be run with the following command:

iOS
```bash
yarn run example detox:test:ios-release
```

Android:

> [!NOTE]
> Create emulator named "Android_Emulator" first if you don't have one already:
```bash
yarn run example detox:test:android-release
```

When adding new tests, you need to first add the detox part in the [e2e folder](./example/e2e) and then the actual logical part of the test in the [integration tests page](./example/src/screens/IntegrationTestsScreen.tsx) of the example app.
