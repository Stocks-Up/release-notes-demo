# Release Notes Demo

A demo repository for testing the `release-notes` skill. This repo simulates a typical project with feature commits, bug fixes, and release tags.

## Usage

This repo is used to test the release notes workflow:
1. Run the `release-notes` skill
2. It reads `.release-notes.yml` for branding and distribution config
3. Creates bilingual (EN/FR) release notes based on commits since the last tag
4. Distributes via GitHub release, Slack, PDF, index page, and email
