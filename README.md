# CUEMS AED Inventory & Management

A React Native mobile application prototype for the University of Colorado Boulder Emergency Medical Services (CUEMS) to manage a campus-wide inventory of Automated External Defibrillators (AEDs).

## Project Overview

This application serves as a high-fidelity prototype to demonstrate the value and technical feasibility of replacing an outdated manual spreadsheet system for tracking AEDs across the CU Boulder campus. The primary goal is to secure Azure AD API permissions to connect to the university's Microsoft 365 backend.

### Key Features

- **Dashboard Overview**: Summary statistics and quick navigation
- **AED Inventory Management**: Complete CRUD operations for AED records
- **Service Tracking**: Automated detection of expired components and service requirements
- **QR Code Scanning**: Simulated camera scanning for quick AED identification
- **Monthly Check Logging**: Digital forms for routine AED inspections
- **Route Optimization**: Google Maps integration for efficient service routes
- **Responsive Design**: Works on phones and tablets

## Technical Stack

- **Frontend**: React Native 0.79.3
- **UI Library**: React Native Paper 5.14.5
- **Navigation**: React Navigation 7.x
- **Mock Backend**: Local JavaScript data files simulating SharePoint Lists
- **Maps Integration**: Google Maps via React Native Linking

## Project Structure

```
src/
├── api/
│   └── SharePointAPI.js         # Mock API service
├── data/
│   ├── AED_Inventory.js         # Sample AED inventory data
│   └── AED_Submission_Log.js    # Sample check log data
├── navigation/
│   └── AppNavigator.js          # Main navigation setup
└── screens/
    ├── HomeScreen.js            # Dashboard with stats and navigation
    ├── AllAEDsScreen.js         # Searchable list of all AEDs
    ├── AEDDetailScreen.js       # Detailed view of single AED
    ├── EditAEDScreen.js         # Add/edit AED form
    ├── ServiceListScreen.js     # List of AEDs requiring service
    ├── ScanScreen.js            # QR code scanning simulation
    └── LogCheckScreen.js        # Monthly check logging form
```

## Data Schema

### AED_Inventory
- Basic information (ID, building, location)
- GPS coordinates for mapping
- Device details (manufacturer, model, serial)
- Battery information (install date, lifespan, expiry)
- Pads information (install date, type, lifespan, expiry)
- Monthly check history

### AED_Submission_Log
- Check timestamps and personnel
- Action summaries and notes
- Links to specific AED records

## Setup Instructions

### Prerequisites

- Node.js >= 18
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CUEMSAEDInventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   bundle install
   bundle exec pod install
   ```

4. **Start Metro server**
   ```bash
   npm start
   ```

5. **Run the application**
   
   For Android:
   ```bash
   npm run android
   ```
   
   For iOS:
   ```bash
   npm run ios
   ```

## Key Functionality Demonstrations

### 1. Service Detection Logic
The app automatically identifies AEDs requiring service by checking:
- Battery expiry dates
- Pads expiry dates  
- Overall status flags

### 2. Route Optimization
The "Generate Optimized Service Route" feature:
- Collects GPS coordinates of all service-required AEDs
- Creates a Google Maps URL with waypoints
- Opens external maps app for navigation

### 3. QR Code Simulation
The scanning screen includes simulation buttons to demonstrate:
- Successful AED identification and navigation to details
- Invalid QR code error handling
- Integration with the inventory system

### 4. Data Validation
Forms include comprehensive validation for:
- Required fields
- GPS coordinate ranges
- Date formats
- Numeric constraints

## Future Integration Plans

When Azure AD permissions are approved, the mock API service will be replaced with:
- Microsoft Graph API calls
- SharePoint List integration
- Azure Active Directory authentication
- Real-time data synchronization

## Development Notes

- All components use React Native Paper for consistent Material Design
- Navigation is handled by React Navigation Stack Navigator
- State management uses React hooks and local state
- Forms include comprehensive validation and error handling
- The app is designed to be responsive across phone and tablet sizes

## Testing

The app includes realistic test data representing:
- 2 sample AEDs with different service statuses
- Historical check logs
- Various expiry scenarios for demonstration

## License

This project is intended for University of Colorado Boulder internal use as part of the CUEMS AED management system proposal.
