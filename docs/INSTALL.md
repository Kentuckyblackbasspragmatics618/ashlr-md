# Installing Ashlr MD

Ashlr MD is available for macOS, Windows, and Linux.

---

## macOS

### Option A — DMG (recommended for one-off installs)

1. Go to [github.com/ashlrai/ashlr-md/releases/latest](https://github.com/ashlrai/ashlr-md/releases/latest).
2. Download the correct DMG for your Mac:
   - **Apple Silicon (M1/M2/M3/M4):** `Ashlr.MD_X.Y.Z_aarch64.dmg`
   - **Intel:** `Ashlr.MD_X.Y.Z_x64.dmg`
3. Open the DMG, drag **Ashlr MD.app** to `/Applications`.
4. On first launch, right-click the app and choose **Open** to bypass Gatekeeper
   (required for unsigned/unnotarized builds — see note below).

> **Note on Gatekeeper:** If the release is not notarized with an Apple Developer
> certificate, macOS will show a warning. Right-click → Open bypasses this
> one time. Once you have opened it this way, future launches work normally.

### Option B — Homebrew Cask (recommended for managed installs)

```bash
brew tap ashlrai/ashlr-md
brew install --cask ashlr-md
```

To upgrade later:
```bash
brew upgrade --cask ashlr-md
```

To uninstall (including preferences):
```bash
brew uninstall --zap --cask ashlr-md
```

> The Homebrew tap lives at **github.com/ashlrai/homebrew-ashlr-md**.
> It must be set up before this command works (see `docs/RELEASING.md §5`).

### Set Ashlr MD as the default Markdown app (macOS)

1. Right-click any `.md` file in Finder → **Get Info**.
2. Under **Open with**, select **Ashlr MD**.
3. Click **Change All…** to apply to all `.md` files.

---

## Windows

### Option A — NSIS Installer (recommended)

1. Go to [github.com/ashlrai/ashlr-md/releases/latest](https://github.com/ashlrai/ashlr-md/releases/latest).
2. Download `Ashlr.MD_X.Y.Z_x64-setup.exe`.
3. Run the installer. It installs to `%LOCALAPPDATA%\Programs\Ashlr MD\` by default.
4. If Windows Defender SmartScreen appears, click **More info → Run anyway**.
   (This warning appears for unsigned installers. It will disappear once the
   app is code-signed with an EV/OV certificate.)

> **Silent install** (for IT/automation):
> ```bat
> Ashlr.MD_X.Y.Z_x64-setup.exe /S
> ```

### Option B — MSI Package

Download `Ashlr.MD_X.Y.Z_x64_en-US.msi` from the same release page.
Double-click to install, or deploy silently via Group Policy / MDM.

### Option C — winget

```powershell
winget install ashlrai.AshlrMD
```

To upgrade:
```powershell
winget upgrade ashlrai.AshlrMD
```

> winget availability depends on the package being accepted into the
> `microsoft/winget-pkgs` community repository. See `docs/RELEASING.md §6`
> for submission status.

### Set Ashlr MD as the default Markdown app (Windows)

The NSIS installer registers `.md`, `.markdown`, `.mdown`, `.mkd`, and `.mdx`
file associations automatically. To change the default:

1. Right-click a `.md` file → **Open with → Choose another app**.
2. Select **Ashlr MD** → tick **Always use this app** → OK.

---

## Linux

### Option A — Debian / Ubuntu (.deb)

```bash
# Download the .deb from the latest release
curl -L \
  "https://github.com/ashlrai/ashlr-md/releases/latest/download/ashlr-md_X.Y.Z_amd64.deb" \
  -o ashlr-md.deb

# Install
sudo dpkg -i ashlr-md.deb

# Fix any missing dependencies
sudo apt-get install -f
```

The `.deb` installs:
- Binary at `/usr/bin/ashlr-md` (or `/usr/bin/Ashlr MD`)
- `.desktop` entry at `/usr/share/applications/app.mdopener.desktop.desktop`
- Icons under `/usr/share/icons/hicolor/`

After install, `.md` files will appear in **Open With → Ashlr MD** in Nautilus
and other XDG-compliant file managers.

### Option B — AppImage (portable, any distro)

```bash
# Download the AppImage
curl -L \
  "https://github.com/ashlrai/ashlr-md/releases/latest/download/Ashlr.MD_X.Y.Z_amd64.AppImage" \
  -o AshlrMD.AppImage

# Make executable and run
chmod +x AshlrMD.AppImage
./AshlrMD.AppImage
```

To integrate with your desktop environment (optional):
```bash
# Extract and install (creates .desktop entry + icons)
./AshlrMD.AppImage --appimage-extract-and-run
# or use appimaged: https://github.com/probonopd/go-appimage
```

> The AppImage bundles all dependencies and runs on any x86_64 Linux distro
> with glibc ≥ 2.35 (Ubuntu 22.04+, Fedora 36+, etc.).

### Option C — AUR (Arch Linux)

```bash
# Using an AUR helper (e.g. yay or paru):
yay -S ashlr-md

# Or manually:
git clone https://aur.archlinux.org/ashlr-md.git
cd ashlr-md
makepkg -si
```

> AUR availability depends on the package being published to
> aur.archlinux.org. See `docs/RELEASING.md §7` for submission status.

### Set Ashlr MD as the default Markdown app (Linux)

```bash
# Register the MIME type association
xdg-mime default app.mdopener.desktop.desktop text/markdown
xdg-mime default app.mdopener.desktop.desktop text/x-markdown

# Verify
xdg-mime query default text/markdown
# → app.mdopener.desktop.desktop
```

---

## Auto-Updates

Ashlr MD checks for updates automatically on launch (all platforms) using
the Tauri updater. When a new version is available, you'll see an in-app
prompt. Click **Update** to download and install; the app relaunches into
the new version.

To check for updates manually: **Help → Check for Updates** (menu varies
by platform).

---

## Uninstalling

| Platform | Method |
|---|---|
| macOS DMG | Drag `Ashlr MD.app` from `/Applications` to Trash |
| macOS Homebrew | `brew uninstall --zap --cask ashlr-md` |
| Windows | Settings → Apps → Ashlr MD → Uninstall |
| Linux .deb | `sudo apt remove ashlr-md` |
| Linux AppImage | Delete the `.AppImage` file |
| Linux AUR | `yay -R ashlr-md` or `sudo pacman -R ashlr-md` |

Preferences and app data are stored at:
- **macOS:** `~/Library/Application Support/app.mdopener.desktop`
- **Windows:** `%APPDATA%\app.mdopener.desktop`
- **Linux:** `~/.config/app.mdopener.desktop`

These are not removed by a standard uninstall; delete them manually if you
want a clean slate.
