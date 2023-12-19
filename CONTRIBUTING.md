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

## 3. Test your changes

- Make sure to test your changes before sending them for review. To do so, you can utilize the [Sample app](./SampleApp/). Once your changes are ready, you can copy the library code into the app using the ["Copy to Sample app" script](./scripts/copyToSampleApp.sh).

### Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

Please peruse the
[Typescript style guide](https://google.github.io/styleguide/tsguide.html), [Java style guide](https://google.github.io/styleguide/javaguide.html), and [Objective-C style guide](https://google.github.io/styleguide/objcguide.html) before
working on anything non-trivial. These guidelines are intended to
keep the code consistent and avoid common pitfalls.

#### Create branch

1. `git fetch upstream`
2. `git checkout upstream/master -b <name_of_your_branch>`
3. Start coding!

#### Commit changes

1. `git commit -a -m "<your informative commit message>"`

  Please make sure all your check-ins have detailed commit messages explaining the patch.
  When naming the title of your pull request, please follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) guide. For example, for a fix to the Driver library: 
  
  `fix(navigation_view): fixed a bug!`

2. `git push origin <name_of_your_branch>`

#### Create pull request

1. `git pull-request` (if you are using [Hub](http://github.com/github/hub/)) or
  go to `https://github.com/googlemaps/react-native-navigation-sdk` and click the
  "Compare & pull request" button
