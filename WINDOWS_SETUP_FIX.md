# Windows Development Environment Fix

This guide will permanently fix Node.js/npm PATH issues on Windows so you never have to deal with "npm not recognized" errors again.

## The Problem

Node.js was installed but not added to your system PATH, causing:
- `npm` command not recognized
- `npx` command not recognized  
- `node` command not recognized
- React Native development issues

## PERMANENT SOLUTION

### Method 1: Fix via Windows Settings (Recommended)

**Step 1: Open Environment Variables**
1. Press `Windows Key + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Environment Variables..." button at the bottom

**Step 2: Edit System PATH**
1. In the "System Variables" section (bottom panel)
2. Find and select "Path" 
3. Click "Edit..."
4. Click "New"
5. Add: `C:\Program Files\nodejs`
6. Click "OK" on all dialogs

**Step 3: Restart and Test**
1. **Restart your computer** (required for PATH changes)
2. Open a new PowerShell
3. Test: `node --version` and `npm --version`

### Method 2: PowerShell Admin Fix (Alternative)

**If you have admin privileges:**

1. Right-click PowerShell and "Run as Administrator"
2. Run this command:
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs", [EnvironmentVariableTarget]::Machine)
```
3. Restart your computer

### Method 3: Quick Session Fix (Temporary)

**For immediate use in current session only:**
```powershell
$env:PATH = $env:PATH + ";C:\Program Files\nodejs"
```

## VERIFICATION

After applying the permanent fix:

```powershell
# These should all work:
node --version     # Should show: v22.16.0 (or your version)
npm --version      # Should show: 10.9.2 (or your version)  
npx --version      # Should work without errors

# Test React Native CLI:
npx react-native --version
```

## React Native Development Commands

Once PATH is fixed, these will work in any PowerShell session:

```powershell
# Navigate to your project
cd C:\CUEMS\App

# Install dependencies
npm install

# Clean React Native cache
npx react-native start --reset-cache

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
npx react-native run-ios

# Clean builds
cd android
./gradlew clean
cd ..
```

## Fixing the Geolocation Error

With npm working, fix the specific geolocation issue:

```powershell
# Reinstall the problematic package
npm uninstall @react-native-community/geolocation
npm install @react-native-community/geolocation

# Clear Metro cache
npx react-native start --reset-cache

# Clean Android build
cd android
./gradlew clean
cd ..

# Run the app
npx react-native run-android
```

## Common Windows PATH Issues

**Multiple Node.js Installations:**
- Check: `where node` to see all installations
- Remove old versions from Control Panel
- Keep only the latest version

**PowerShell Execution Policy:**
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Chocolatey/Homebrew Conflicts:**
If you installed Node.js via package managers:
- Uninstall via the package manager first
- Install the official Node.js from nodejs.org
- Follow the PATH fix above

## Alternative: Use Node Version Manager

**For advanced users who need multiple Node.js versions:**

1. Install nvm-windows: https://github.com/coreybutler/nvm-windows
2. Use it to manage Node.js versions:
```cmd
nvm install latest
nvm use latest
```

## Troubleshooting

**PATH not updating:**
- Make sure you restarted your computer
- Check if multiple PATH entries exist
- Remove duplicates

**npm still not working:**
- Verify Node.js installation: `C:\Program Files\nodejs\node.exe`
- Reinstall Node.js from https://nodejs.org/
- Choose "Add to PATH" during installation

**React Native issues persist:**
- Clear all caches: `npx react-native start --reset-cache`
- Delete node_modules: `rmdir /s node_modules`
- Reinstall: `npm install`

## Prevention

**To avoid future issues:**
1. Always use the official Node.js installer from nodejs.org
2. Check "Add to PATH" during installation
3. Don't install multiple Node.js versions manually
4. Use nvm-windows if you need version management

## Verification Checklist

✅ Node.js responds: `node --version`  
✅ npm responds: `npm --version`  
✅ npx responds: `npx --version`  
✅ React Native CLI works: `npx react-native --version`  
✅ Can install packages: `npm install -g @react-native-community/cli`  
✅ PowerShell recognizes commands in NEW sessions  

**Remember: You MUST restart your computer for permanent PATH changes to take effect!** 