# iOS Setup Guide: Running CUEMS AED App on Your iPhone

This guide will walk you through downloading the CUEMS AED Inventory app from GitHub and running it on your personal iPhone. No prior programming experience required!

## Prerequisites

### 1. Mac Computer
- You **must** have a Mac computer to develop iOS apps
- Windows/Linux cannot run Xcode

### 2. Xcode (Free)
- Download from the Mac App Store
- Search for "Xcode" and install it (it's large, ~15GB)
- This is Apple's development environment

### 3. Apple Developer Account
- **Free option**: You can test on your own device for free
- **Paid option**: $99/year for App Store distribution (not needed for personal testing)

### 4. Your iPhone
- iPhone with iOS 12.0 or later
- Lightning/USB-C cable to connect to your Mac

## Step 1: Install Required Software

### Install Homebrew (Package Manager)
1. Open **Terminal** app on your Mac
2. Copy and paste this command, then press Enter:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
3. Follow the prompts (you may need to enter your Mac password)

### Install Node.js
1. In Terminal, run:
```bash
brew install node
```
2. Verify installation:
```bash
node --version
npm --version
```

### Install React Native CLI
```bash
npm install -g @react-native-community/cli
```

### Install CocoaPods (iOS dependency manager)
```bash
sudo gem install cocoapods
```

## Step 2: Download the Project from GitHub

### Option A: Using Git (Recommended)
1. In Terminal, navigate to where you want the project:
```bash
cd ~/Desktop
```
2. Clone the repository:
```bash
git clone https://github.com/drh57/cu-boulder-aed-inventory-system-react.git
```
3. Enter the project folder:
```bash
cd cu-boulder-aed-inventory-system-react
```

### Option B: Download ZIP File
1. Go to: https://github.com/drh57/cu-boulder-aed-inventory-system-react
2. Click the green "Code" button
3. Click "Download ZIP"
4. Unzip the file on your Desktop
5. In Terminal, navigate to the folder:
```bash
cd ~/Desktop/cu-boulder-aed-inventory-system-react-main
```

## Step 3: Install Project Dependencies

1. Make sure you're in the project folder in Terminal
2. Install JavaScript dependencies:
```bash
npm install
```
3. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

## Step 4: Configure Xcode for Your iPhone

### Open the Project in Xcode
1. In Terminal (from project root), run:
```bash
open ios/CUEMSAEDInventory.xcworkspace
```
**Important:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### Configure Signing & Capabilities
1. In Xcode, click on the project name in the left sidebar (top item)
2. Under "TARGETS," select "CUEMSAEDInventory"
3. Click the "Signing & Capabilities" tab
4. **Team**: Click the dropdown and sign in with your Apple ID if needed
5. **Bundle Identifier**: Change this to something unique like:
   ```
   com.yourname.cuemsaed
   ```
   (Replace "yourname" with your actual name, no spaces)

## Step 5: Connect and Trust Your iPhone

### Connect Your iPhone
1. Connect your iPhone to your Mac with a cable
2. Unlock your iPhone
3. If prompted, tap "Trust This Computer" on your iPhone

### Select Your Device in Xcode
1. In Xcode, look for the device selector at the top (next to the play/stop buttons)
2. Click it and select your iPhone from the list
3. If your iPhone doesn't appear, try unplugging and reconnecting

## Step 6: Run the App on Your iPhone

### Start the Metro Server
1. Open a new Terminal window/tab
2. Navigate to your project folder:
```bash
cd ~/Desktop/cu-boulder-aed-inventory-system-react
```
3. Start the React Native packager:
```bash
npm start
```
Keep this running - you'll see Metro bundler logs.

### Build and Install
1. In Xcode, click the **Play button** (▶️) or press `Cmd + R`
2. Xcode will build the app and install it on your iPhone
3. **First time only**: You may see an error about "Untrusted Developer"

### Trust the Developer Certificate (First Time Only)
If you see "Untrusted Developer" error:
1. On your iPhone, go to: **Settings > General > VPN & Device Management**
2. Find your Apple ID under "Developer App"
3. Tap it and tap "Trust [Your Apple ID]"
4. Confirm by tapping "Trust"
5. Try running the app again from Xcode

## Step 7: Using the App

Once installed successfully:
1. The app should launch automatically on your iPhone
2. You'll see the CUEMS AED Inventory dashboard
3. You can navigate through all the screens:
   - Dashboard with statistics
   - All AEDs list
   - AED details and editing
   - Service tracking
   - QR code scanning simulation

## Troubleshooting Common Issues

### "Build Failed" Errors
**Try these in order:**

1. **Clean Build Folder:**
   - In Xcode: Product → Clean Build Folder

2. **Reset Metro Cache:**
```bash
npm start -- --reset-cache
```

3. **Reinstall Dependencies:**
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

### "No Development Team" Error
- Make sure you're signed in with your Apple ID in Xcode
- Go to Xcode → Preferences → Accounts → Add your Apple ID

### iPhone Not Appearing in Device List
- Unplug and reconnect your iPhone
- Make sure iPhone is unlocked
- Trust the computer when prompted
- Try a different cable

### Metro Connection Issues
- Make sure your iPhone and Mac are on the same WiFi network
- If using cellular, shake your iPhone in the app and tap "Settings" → Change Bundle Location to your Mac's IP address

### App Crashes on Launch
- Check the Metro terminal for error messages
- Make sure all dependencies installed correctly
- Try cleaning and rebuilding

## Development Tips

### Making Changes
- Edit files in your favorite text editor (VS Code recommended)
- Save changes
- The app will automatically reload on your iPhone (Hot Reloading)
- If it doesn't reload, shake your iPhone and tap "Reload"

### Viewing Console Logs
- In Xcode, go to Window → Devices and Simulators
- Select your iPhone → View Device Logs
- Or check the Metro terminal for JavaScript logs

### Debugging
- Shake your iPhone while the app is running
- Tap "Debug" to open Chrome DevTools
- Use console.log() in your code to debug

## Next Steps

### For Further Development
1. **Learn React Native**: https://reactnative.dev/docs/getting-started
2. **Learn React**: https://reactjs.org/tutorial/tutorial.html
3. **VS Code Extensions**: Install React Native Tools extension

### For App Store Distribution
1. Sign up for Apple Developer Program ($99/year)
2. Create App Store listing
3. Configure proper signing certificates
4. Submit for review

## Getting Help

If you run into issues:
1. Check the error messages carefully
2. Search Google for the specific error
3. Check React Native documentation
4. Ask on Stack Overflow with the "react-native" tag

## File Structure Reference

```
cu-boulder-aed-inventory-system-react/
├── ios/                    # iOS-specific files
│   └── CUEMSAEDInventory.xcworkspace  # Open this in Xcode
├── android/                # Android files (ignore for iOS)
├── src/                    # Your app's source code
│   ├── screens/           # App screens
│   ├── data/              # Mock data
│   └── api/               # API services
├── package.json           # Dependencies list
└── App.tsx               # Main app component
```

**Remember**: Always open the `.xcworkspace` file in Xcode, never the `.xcodeproj` file when working with React Native projects that use CocoaPods!

Good luck with your first iOS app! 🚀📱 