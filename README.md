# Automated Release Notes

This repository uses [release-notes-skill](https://github.com/Stocks-Up/release-notes-skill) to automatically generate bilingual release notes (English + French) every time a labeled PR is merged to `main`.

Use this repo as a reference for implementing the same workflow in your own repositories.

---

## How It Works

```
1. Open a PR against main
2. Add a label: release:patch, release:minor, or release:major
3. Merge the PR
4. Done — release notes are written, tagged, and distributed automatically
```

On merge, the GitHub Actions workflow:

- Calculates the next version from the label and existing git tags
- Runs Claude to analyze commits and write bilingual EN/FR release notes
- Commits the markdown files to `releases/vX.Y.Z/`
- Creates an annotated git tag and pushes it
- Publishes a GitHub Release with combined EN/FR body
- Sends a Slack notification (if configured)
- Generates branded PDFs and uploads to S3 (if configured)
- Sends branded HTML emails with PDF attachments (if configured)

Each distribution channel is independently optional. A PR without a release label is ignored entirely.

---

## Setup Guide

Follow these steps to add automated release notes to a new repository.

### Prerequisites

- GitHub CLI (`gh`) installed locally
- The repository is in the `Stocks-Up` GitHub organization

### Step 1 — Install the Claude Code GitHub App

This only needs to be done **once per organization**.

Go to https://github.com/apps/claude and install it on the Stocks-Up organization. Grant access to all repositories (or select specific ones).

### Step 2 — Set the required secret

Generate a Claude Code OAuth token and add it as a **repository secret** (or org-wide secret):

```bash
# Generate a token locally
claude /login

# Set it on a single repo
gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo Stocks-Up/your-repo

# Or set it org-wide (recommended for 100+ repos)
gh secret set CLAUDE_CODE_OAUTH_TOKEN --org Stocks-Up --visibility all
```

### Step 3 — Create the PR labels

Run these three commands against your repository:

```bash
gh label create "release:major" --repo Stocks-Up/your-repo --color "D93F0B" --description "Bump major version (breaking changes)"
gh label create "release:minor" --repo Stocks-Up/your-repo --color "0E8A16" --description "Bump minor version (new features)"
gh label create "release:patch" --repo Stocks-Up/your-repo --color "1D76DB" --description "Bump patch version (bug fixes)"
```

### Step 4 — Add the workflow file

Copy the workflow into your repository:

```bash
mkdir -p .github/workflows
curl -o .github/workflows/release-notes.yml \
  https://raw.githubusercontent.com/Stocks-Up/release-notes-skill/main/.github/workflows/release-notes.yml
```

No changes needed — the workflow works as-is for any repo in the `Stocks-Up` org.

### Step 5 — Add the config file

Copy the template and customize it:

```bash
curl -o .release-notes.yml \
  https://raw.githubusercontent.com/Stocks-Up/release-notes-skill/main/templates/.release-notes.yml
```

Edit `.release-notes.yml` and set:

- `company.name` — your company/product name
- `company.website` — your website URL
- `branding.primary_color` — hex color for headers
- `branding.accent_color` — hex color for accents

Remove any `distribution` sections you don't need (Slack, email, PDF, index).

### Step 6 — Commit and push

```bash
git add .github/workflows/release-notes.yml .release-notes.yml
git commit -m "Add automated release notes workflow"
git push
```

### Step 7 — Test it

Create a PR, add the `release:patch` label, merge it, and check the **Actions** tab.

---

## Distribution Channels

All distribution channels are optional. Configure only what you need by adding the corresponding section to `.release-notes.yml` and setting the required secret.

### Slack

Sends an English Block Kit notification to a Slack channel.

**Config:**
```yaml
distribution:
  slack:
    webhook_file: "~/.slack_webhook"
    channel_name: "#releases"        # display only
```

**Secret:**
```bash
gh secret set SLACK_WEBHOOK_URL --repo Stocks-Up/your-repo
```

**Getting the webhook URL:**
1. Go to https://api.slack.com/apps and create a new app (or use an existing one)
2. Enable **Incoming Webhooks**
3. Click **Add New Webhook to Workspace**, select the channel
4. Copy the URL (starts with `https://hooks.slack.com/services/...`)

### Email (Gmail SMTP)

Sends branded HTML emails in English and French via Gmail SMTP with App Password.

**Config:**
```yaml
distribution:
  email:
    from: "releases@yourcompany.com"
    smtp_user: "releases@yourcompany.com"
    smtp_password_file: "~/.gmail_app_password"
    recipients:
      en: "team@yourcompany.com"
      fr: "equipe@yourcompany.com"
```

**Secret:**
```bash
gh secret set GMAIL_APP_PASSWORD --repo Stocks-Up/your-repo
```

**Getting the App Password:**
1. Enable 2-Step Verification on the Gmail account: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password for **Mail** > **Other** (name it "Release Notes")
4. Copy the 16-character password

> `smtp_user` must be the Gmail address that owns the App Password. The `from` field can be the same address or a configured alias.

### PDF (S3)

Generates branded A4 PDF release notes (EN + FR) using Puppeteer and uploads them to S3.

**Config:**
```yaml
distribution:
  pdf:
    s3_bucket: "your-docs-bucket"
    s3_prefix: "releases"
    aws_profile: "release-notes"      # any name — created automatically in CI
    aws_region: "us-east-1"
```

**Secrets:**
```bash
gh secret set AWS_ACCESS_KEY_ID --repo Stocks-Up/your-repo
gh secret set AWS_SECRET_ACCESS_KEY --repo Stocks-Up/your-repo
```

The IAM user needs `s3:PutObject`, `s3:GetObject`, and `s3:ListBucket` on the bucket.

### Index Page (S3)

Generates a searchable HTML page with a Chart.js releases-per-month chart, uploaded to S3.

**Config:**
```yaml
distribution:
  index:
    s3_bucket: "your-docs-bucket"
    s3_path: "releases/index.html"
```

Uses the same AWS secrets as the PDF section. Requires `distribution.pdf` to be configured (reads the bucket/profile from there).

---

## Secrets Reference

| Secret | Required | Where to set | Description |
|--------|----------|--------------|-------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Yes | Org or repo | Claude Code OAuth token from `claude /login` |
| `SLACK_WEBHOOK_URL` | If Slack configured | Org or repo | Slack incoming webhook URL |
| `GMAIL_APP_PASSWORD` | If email configured | Org or repo | Gmail App Password (16 chars) |
| `AWS_ACCESS_KEY_ID` | If PDF/index configured | Org or repo | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | If PDF/index configured | Org or repo | AWS IAM secret key |

**Recommended:** Set secrets at the org level to avoid repeating setup across repos:

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --org Stocks-Up --visibility all
gh secret set SLACK_WEBHOOK_URL --org Stocks-Up --visibility all
gh secret set GMAIL_APP_PASSWORD --org Stocks-Up --visibility all
```

---

## Version Bump Rules

| Label | When to use | Example |
|-------|-------------|---------|
| `release:patch` | Bug fixes, small improvements | v1.2.3 -> v1.2.4 |
| `release:minor` | New features, significant changes | v1.2.3 -> v1.3.0 |
| `release:major` | Breaking changes, major rewrites | v1.2.3 -> v2.0.0 |

If no tags exist yet, the first version will be `v0.0.1` (patch), `v0.1.0` (minor), or `v1.0.0` (major).

---

## What Gets Created

For each release, the workflow creates:

```
your-repo/
├── releases/
│   └── v1.2.3/
│       ├── RELEASE_NOTES_EN.md    # English release notes
│       └── RELEASE_NOTES_FR.md    # French release notes
```

Plus a git tag (`v1.2.3`) and a GitHub Release with the combined EN/FR content.

---

## Branch Protection

The workflow pushes commits and tags directly to `main`. If your repo has branch protection:

- Go to **Settings > Rules > Rulesets** (or Branch protection rules)
- Add a bypass for `github-actions[bot]`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow doesn't trigger | Verify the PR was **merged** (not just closed) and has a `release:*` label |
| "Claude Code is not installed" | Install the GitHub App at https://github.com/apps/claude |
| "Invalid OAuth token" | Re-run `claude /login` and update the `CLAUDE_CODE_OAUTH_TOKEN` secret |
| Claude runs but nothing is committed | Ensure `--dangerously-skip-permissions` is in `claude_args` |
| Tag already exists | Delete it: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z` |
| Email not sending | Check that `distribution.email` is in `.release-notes.yml` and `GMAIL_APP_PASSWORD` secret is set |
| Slack not sending | Verify the webhook is still active in your Slack app settings |
| PDF generation fails | Non-blocking — the release notes and GitHub release are still created |

---

## Cost

| Metric | Typical Value |
|--------|---------------|
| Claude API cost | $0.20 - $0.35 per release |
| Workflow duration | 1 - 3 minutes |
| GitHub Actions | ~2 minutes of ubuntu-latest |

---

## Files in This Repo

| File | Purpose |
|------|---------|
| `.release-notes.yml` | Branding and distribution config |
| `.github/workflows/release-notes.yml` | The CI workflow (copy to your repo) |
| `releases/vX.Y.Z/*.md` | Generated release notes (EN + FR) |

---

## Quick Copy-Paste Setup

For a new repo, run all of these:

```bash
REPO="Stocks-Up/your-repo-name"

# Labels
gh label create "release:major" --repo $REPO --color "D93F0B" --description "Bump major version"
gh label create "release:minor" --repo $REPO --color "0E8A16" --description "Bump minor version"
gh label create "release:patch" --repo $REPO --color "1D76DB" --description "Bump patch version"

# Workflow
mkdir -p .github/workflows
curl -o .github/workflows/release-notes.yml \
  https://raw.githubusercontent.com/Stocks-Up/release-notes-skill/main/.github/workflows/release-notes.yml

# Config (edit after downloading)
curl -o .release-notes.yml \
  https://raw.githubusercontent.com/Stocks-Up/release-notes-skill/main/templates/.release-notes.yml

# Commit
git add .github/workflows/release-notes.yml .release-notes.yml
git commit -m "Add automated release notes"
git push
```

If secrets aren't set at the org level, also run:

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo $REPO
gh secret set SLACK_WEBHOOK_URL --repo $REPO        # optional
gh secret set GMAIL_APP_PASSWORD --repo $REPO        # optional
```
