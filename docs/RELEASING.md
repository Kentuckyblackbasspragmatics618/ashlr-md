# Releasing Ashlr MD

Complete runbook for cutting a release, managing artifacts, and updating
downstream distribution channels (Homebrew, winget, AUR).

---

## 1. Pre-release Checklist

Before tagging, complete every item:

- [ ] All CI checks passing on `main`.
- [ ] Update `version` in **`src-tauri/tauri.conf.json`** (e.g. `"0.2.0"`).
- [ ] Update `version` in **`src-tauri/Cargo.toml`** `[package]` section to match.
- [ ] Update `version` in **`package.json`** to match.
- [ ] Update **`CHANGELOG.md`** — add a `## [X.Y.Z] — YYYY-MM-DD` section.
- [ ] Run `./scripts/generate-icons.sh` if `src-tauri/icons/icon.svg` changed.
- [ ] Commit all changes:
  ```bash
  git add src-tauri/tauri.conf.json src-tauri/Cargo.toml package.json CHANGELOG.md
  git commit -m "chore: release vX.Y.Z"
  ```

---

## 2. Cutting the Tag

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

This triggers `.github/workflows/release.yml`, which fans out across the full
build matrix and creates a **draft** GitHub Release.

> **Pre-release tags** — any tag containing a hyphen (`v0.2.0-beta.1`) sets
> `prerelease: true` automatically. Use this for testing the pipeline without
> shipping to stable update channels.

---

## 3. What the Workflow Produces

| Platform | Runner | Artifacts |
|---|---|---|
| macOS arm64 | `macos-14` | `Ashlr.MD_X.Y.Z_aarch64.dmg` + updater `.sig` |
| macOS x86_64 | `macos-13` | `Ashlr.MD_X.Y.Z_x64.dmg` + updater `.sig` |
| Linux x86_64 | `ubuntu-22.04` | `ashlr-md_X.Y.Z_amd64.deb`, `Ashlr.MD_X.Y.Z_amd64.AppImage` + `.sig` files |
| Windows x86_64 | `windows-latest` | `Ashlr.MD_X.Y.Z_x64-setup.exe` (NSIS), `Ashlr.MD_X.Y.Z_x64_en-US.msi` + `.sig` files |

Each leg uploads a platform-specific entry to the Tauri updater manifest.
After all four legs complete, `latest.json` in the release contains aggregated
entries for every platform — this is what `tauri-plugin-updater` polls.

### Sidecar binaries per platform

| Binary | macOS | Linux | Windows |
|---|---|---|---|
| `mdopen` | yes | yes | yes (`.exe`) |
| `mdopener-mcp` | yes | yes | yes (`.exe`) |
| `mdopener-afm` (Swift) | yes | — | — |
| `mdopener-setdefault` (Swift) | yes | — | — |

> **macOS AFM sidecar risk:** `mdopener-afm` requires Xcode 26 / Swift 6.2+
> (macOS 26 SDK). The workflow selects the latest available Xcode via
> `maxim-lobanov/setup-xcode@v1`. Until GitHub-hosted runners carry Xcode 26,
> this sidecar may build against an older SDK or fail. See the comment block
> in `.github/workflows/release.yml` (the "Select latest Xcode" step) for
> mitigation steps. All other bundle artifacts are unaffected.

---

## 4. Publishing the GitHub Release

1. Go to **github.com/ashlrai/ashlr-md/releases** and open the draft.
2. Verify all expected artifacts are attached (see table above).
3. Review the release notes; paste the relevant `CHANGELOG.md` section.
4. Click **Publish release**.

Publishing makes `latest.json` live — existing installs will prompt to update
on next launch.

---

## 5. Post-release: Update the Homebrew Cask

The canonical cask template lives at `packaging/homebrew/ashlr-md.rb`.
The tap repo is **github.com/ashlrai/homebrew-ashlr-md** — create it if it
doesn't exist yet; place the cask at `Casks/ashlr-md.rb` in that repo.

```bash
# 1. Download the new DMG and compute its SHA-256
curl -L \
  "https://github.com/ashlrai/ashlr-md/releases/download/vX.Y.Z/Ashlr.MD_X.Y.Z_aarch64.dmg" \
  -o Ashlr.MD_X.Y.Z_aarch64.dmg
shasum -a 256 Ashlr.MD_X.Y.Z_aarch64.dmg

# 2. Clone the tap repo and update the cask
git clone https://github.com/ashlrai/homebrew-ashlr-md.git
cd homebrew-ashlr-md

# Edit Casks/ashlr-md.rb:
#   version "X.Y.Z"
#   sha256  "<output of shasum above>"

# 3. Commit and push
git add Casks/ashlr-md.rb
git commit -m "Cask update: ashlr-md X.Y.Z"
git push
```

Users install / upgrade with:
```bash
brew tap ashlrai/ashlr-md
brew install --cask ashlr-md
# upgrade:
brew upgrade --cask ashlr-md
```

---

## 6. Post-release: Update the winget Manifest

The manifest templates live at `packaging/winget/`.

```bash
# 1. Download the NSIS installer and compute its SHA-256
curl -L \
  "https://github.com/ashlrai/ashlr-md/releases/download/vX.Y.Z/Ashlr.MD_X.Y.Z_x64-setup.exe" \
  -o Ashlr.MD_X.Y.Z_x64-setup.exe

# macOS/Linux:
shasum -a 256 Ashlr.MD_X.Y.Z_x64-setup.exe
# Windows PowerShell:
# Get-FileHash "Ashlr.MD_X.Y.Z_x64-setup.exe" -Algorithm SHA256

# 2. Copy the three manifests to a versioned folder
mkdir -p manifests/a/ashlrai/AshlrMD/X.Y.Z
cp packaging/winget/ashlrai.AshlrMD.*.yaml \
   manifests/a/ashlrai/AshlrMD/X.Y.Z/

# 3. Replace <VERSION> and <SHA256_NSIS_EXE> in all three files

# 4. Validate locally (requires winget CLI or winget-create)
winget validate --manifest manifests/a/ashlrai/AshlrMD/X.Y.Z/

# 5. Fork https://github.com/microsoft/winget-pkgs and submit a PR
#    adding the three manifests under manifests/a/ashlrai/AshlrMD/X.Y.Z/
```

---

## 7. Post-release: Update the AUR Package

The PKGBUILD template lives at `packaging/linux/aur/PKGBUILD`.

```bash
# 1. Compute SHA-256 of the .deb
shasum -a 256 ashlr-md_X.Y.Z_amd64.deb

# 2. Update packaging/linux/aur/PKGBUILD:
#    pkgver=X.Y.Z
#    sha256sums=('<output of shasum above>')

# 3. Clone your AUR repo (first time: create the package at aur.archlinux.org)
git clone ssh://aur@aur.archlinux.org/ashlr-md.git aur-ashlr-md
cp packaging/linux/aur/PKGBUILD aur-ashlr-md/

# 4. Regenerate .SRCINFO (required by AUR)
cd aur-ashlr-md
makepkg --printsrcinfo > .SRCINFO

# 5. Test the build locally
makepkg -si

# 6. Push to AUR
git add PKGBUILD .SRCINFO
git commit -m "Update to X.Y.Z"
git push
```

---

## 8. GitHub Secrets Reference

| Secret | Used by | Required? |
|---|---|---|
| `GITHUB_TOKEN` | Release creation | Auto-provided |
| `TAURI_SIGNING_PRIVATE_KEY` | Updater `.sig` files | Yes (all legs) |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Updater `.sig` files | Yes (all legs) |
| `APPLE_CERTIFICATE` | macOS code signing | Optional (unsigned DMG works) |
| `APPLE_CERTIFICATE_PASSWORD` | macOS code signing | Optional |
| `APPLE_SIGNING_IDENTITY` | macOS code signing | Optional |
| `APPLE_ID` | macOS notarization | Optional |
| `APPLE_PASSWORD` | macOS notarization | Optional |
| `APPLE_TEAM_ID` | macOS notarization | Optional |

### Generate the Tauri updater keypair (one-time)

```bash
bun run tauri signer generate -w ~/.tauri/ashlr-md.key
# → prints public key (add to tauri.conf.json `plugins.updater.pubkey`)
# → writes private key to ~/.tauri/ashlr-md.key
#   base64-encode and add as TAURI_SIGNING_PRIVATE_KEY secret
```

The updater pubkey is already set in `tauri.conf.json`; the private key must
be in `TAURI_SIGNING_PRIVATE_KEY` before the first real release.

---

## 9. Icon Generation

The canonical icon source is `src-tauri/icons/icon.svg`.

```bash
bun install            # if not already installed
./scripts/generate-icons.sh
git add src-tauri/icons/
git commit -m "chore: regenerate app icons"
```

---

## 10. Release Checklist Summary

- [ ] `src-tauri/tauri.conf.json` version bumped
- [ ] `src-tauri/Cargo.toml` version bumped
- [ ] `package.json` version bumped
- [ ] `CHANGELOG.md` updated
- [ ] Icons regenerated (if SVG changed)
- [ ] Version bump commit on `main`
- [ ] Tag `vX.Y.Z` pushed — workflow fires
- [ ] All four workflow legs green
- [ ] GitHub Release draft reviewed and published
- [ ] Homebrew tap cask updated (version + sha256)
- [ ] winget manifest PR submitted to `microsoft/winget-pkgs`
- [ ] AUR PKGBUILD updated and pushed
