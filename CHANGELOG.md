# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

moldy cheese as a resource and some fundamental upgrades for it
the cheeseyard mechanic
drag functionality + arrow keys to move around
return to home functionality
relevant info for modes in cheese factory protocol & monster brain wave controller is now displayed
prestige mechanic (milk) (PENDING)

### Changed

refactored funcionality for purchasing upgrades; one function for all upgrades instead of a separate function for each upgrade
moved some game logic for components into separate file(s) (path ./gamelogic)
moved most state for components into stores folder (path ./stores/derived)
the progress bar for cheese now uses requestAnimationFrame() instead of a looping CSS animation
removed progress bar for moldy cheese (cheese sacrifice mechanic), now just a timer
the upgrade for moldy cheese byproduct yield now depends on relative duration of the cheese cycle instead of absolute time

## [0.1.0] - 2022-10-01

### Added

Everything

[unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.0...HEAD
[0.1.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.8...v0.1.0
