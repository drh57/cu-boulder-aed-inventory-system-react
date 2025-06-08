import { AED_INVENTORY } from '../data/AED_Inventory';
import { AED_SUBMISSION_LOG } from '../data/AED_Submission_Log';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockInventory = [...AED_INVENTORY];
let mockLog = [...AED_SUBMISSION_LOG];

// Offline data management
const STORAGE_KEYS = {
  AED_INVENTORY: '@aed_inventory',
  AED_LOG: '@aed_log',
  PENDING_SYNC: '@pending_sync',
  LAST_SYNC: '@last_sync'
};

// Check if device is online (simplified)
const isOnline = () => {
  // In real implementation, use NetInfo from @react-native-community/netinfo
  return true; // For now, assume always online
};

// Store data locally for offline access
const storeOfflineData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing offline data:', error);
  }
};

// Retrieve offline data
const getOfflineData = async (key, defaultValue = []) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error retrieving offline data:', error);
    return defaultValue;
  }
};

// Add item to pending sync queue
const addToPendingSync = async (action) => {
  try {
    const pendingSync = await getOfflineData(STORAGE_KEYS.PENDING_SYNC, []);
    pendingSync.push({
      ...action,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36)
    });
    await storeOfflineData(STORAGE_KEYS.PENDING_SYNC, pendingSync);
  } catch (error) {
    console.error('Error adding to pending sync:', error);
  }
};

// Sync pending changes when online
const syncPendingChanges = async () => {
  if (!isOnline()) return false;

  try {
    const pendingSync = await getOfflineData(STORAGE_KEYS.PENDING_SYNC, []);
    
    for (const action of pendingSync) {
      try {
        // Process each pending action
        if (action.type === 'ADD_AED') {
          await SharePointAPI.addAed(action.data, false); // false = don't store offline again
        } else if (action.type === 'UPDATE_AED') {
          await SharePointAPI.updateAed(action.data, false);
        } else if (action.type === 'ADD_LOG') {
          await SharePointAPI.createLogEntry(action.data, false);
        }
      } catch (error) {
        console.error('Error syncing action:', action, error);
        // Could implement retry logic here
      }
    }

    // Clear pending sync queue after successful sync
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error syncing pending changes:', error);
    return false;
  }
};

// Utility function to calculate automatic status based on data
export const calculateAedStatus = (aed) => {
  const now = new Date();
  const batteryExpiry = new Date(aed.CalculatedBatteryExpiryDate);
  const padsExpiry = new Date(aed.CalculatedPadsExpiryDate);
  
  const batteryExpired = batteryExpiry < now;
  const padsExpired = padsExpiry < now;
  
  // Check for failed monthly checks
  const hasFailedCheck = aed.LastMonthlyCheckStatus && 
    aed.LastMonthlyCheckStatus.includes('Fail');
  
  // Calculate comprehensive status
  const issues = [];
  if (batteryExpired) issues.push('Battery Expired');
  if (padsExpired) issues.push('Pads Expired');
  if (hasFailedCheck) issues.push('Failed Check');
  
  if (issues.length === 0) {
    return 'Operational';
  } else if (issues.length === 1) {
    if (batteryExpired) return 'Needs: Battery Service';
    if (padsExpired) return 'Needs: Pads Replacement';
    if (hasFailedCheck) return 'Needs: Attention';
  } else {
    // Multiple issues
    if (batteryExpired && padsExpired) return 'Needs: Battery & Pads';
    return 'Needs: Multiple Issues';
  }
};

// Check if AED needs service
export const needsService = (aed) => {
  const status = calculateAedStatus(aed);
  return status !== 'Operational';
};

// Get enriched AED data with calculated status
const enrichAedData = (aed) => {
  return {
    ...aed,
    CalculatedStatus: calculateAedStatus(aed),
    NeedsService: needsService(aed)
  };
};

export const SharePointAPI = {
  // Initialize offline data on app start
  async initializeOfflineData() {
    try {
      if (isOnline()) {
        // Sync any pending changes first
        await syncPendingChanges();
        
        // Fetch latest data and store offline
        const [aeds, logs] = await Promise.all([
          this.getAllAeds(false), // false = don't use offline data
          this.getAllLogEntries(false)
        ]);
        
        await storeOfflineData(STORAGE_KEYS.AED_INVENTORY, aeds);
        await storeOfflineData(STORAGE_KEYS.AED_LOG, logs);
        
        return { success: true, message: 'Data synced successfully' };
      } else {
        return { success: false, message: 'Offline mode - using cached data' };
      }
    } catch (error) {
      console.error('Error initializing offline data:', error);
      return { success: false, message: 'Error initializing data' };
    }
  },

  // Get all AEDs with calculated status
  async getAllAeds(useOfflineIfNeeded = true) {
    await delay(500);
    
    try {
      if (isOnline()) {
        const data = mockInventory.map(enrichAedData);
        await storeOfflineData(STORAGE_KEYS.AED_INVENTORY, data);
        return data;
      } else if (useOfflineIfNeeded) {
        const offlineData = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
        return offlineData.map(enrichAedData);
      } else {
        throw new Error('No network connection and offline data not requested');
      }
    } catch (error) {
      if (useOfflineIfNeeded) {
        console.log('Using offline data due to error:', error);
        const offlineData = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
        return offlineData.map(enrichAedData);
      }
      throw error;
    }
  },

  // Get AED by title with calculated status
  async getAedByTitle(title, useOfflineIfNeeded = true) {
    await delay(300);
    
    try {
      if (isOnline()) {
        const aed = mockInventory.find(aed => aed.Title === title);
        return aed ? enrichAedData(aed) : null;
      } else if (useOfflineIfNeeded) {
        const offlineData = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
        const aed = offlineData.find(aed => aed.Title === title);
        return aed ? enrichAedData(aed) : null;
      }
    } catch (error) {
      if (useOfflineIfNeeded) {
        const offlineData = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
        const aed = offlineData.find(aed => aed.Title === title);
        return aed ? enrichAedData(aed) : null;
      }
      throw error;
    }
  },

  // Get AEDs that need service (calculated automatically)
  async getServiceDueAeds(useOfflineIfNeeded = true) {
    await delay(400);
    const allAeds = await this.getAllAeds(useOfflineIfNeeded);
    return allAeds.filter(aed => aed.NeedsService);
  },

  // Add new AED
  async addAed(aedData, storeOfflineIfNeeded = true) {
    await delay(600);
    
    const newId = Math.max(...mockInventory.map(aed => aed.id)) + 1;
    const newAed = {
      ...aedData,
      id: newId,
      Created: new Date().toISOString(),
      Modified: new Date().toISOString()
    };

    if (isOnline()) {
      mockInventory.push(newAed);
      return enrichAedData(newAed);
    } else if (storeOfflineIfNeeded) {
      // Store locally and add to sync queue
      await addToPendingSync({
        type: 'ADD_AED',
        data: aedData
      });
      
      const offlineInventory = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
      offlineInventory.push(newAed);
      await storeOfflineData(STORAGE_KEYS.AED_INVENTORY, offlineInventory);
      
      return enrichAedData(newAed);
    } else {
      throw new Error('No network connection');
    }
  },

  // Update existing AED
  async updateAed(aedData, storeOfflineIfNeeded = true) {
    await delay(600);

    if (isOnline()) {
      const index = mockInventory.findIndex(aed => aed.Title === aedData.Title);
      if (index !== -1) {
        mockInventory[index] = {
          ...mockInventory[index],
          ...aedData,
          Modified: new Date().toISOString()
        };
        return enrichAedData(mockInventory[index]);
      }
      throw new Error('AED not found');
    } else if (storeOfflineIfNeeded) {
      // Store locally and add to sync queue
      await addToPendingSync({
        type: 'UPDATE_AED',
        data: aedData
      });
      
      const offlineInventory = await getOfflineData(STORAGE_KEYS.AED_INVENTORY, []);
      const index = offlineInventory.findIndex(aed => aed.Title === aedData.Title);
      if (index !== -1) {
        offlineInventory[index] = {
          ...offlineInventory[index],
          ...aedData,
          Modified: new Date().toISOString()
        };
        await storeOfflineData(STORAGE_KEYS.AED_INVENTORY, offlineInventory);
        return enrichAedData(offlineInventory[index]);
      }
      throw new Error('AED not found in offline data');
    } else {
      throw new Error('No network connection');
    }
  },

  // Create log entry
  async createLogEntry(logData, storeOfflineIfNeeded = true) {
    await delay(400);
    
    const newLogId = Math.max(...mockLog.map(log => log.logId)) + 1;
    const newLogEntry = {
      ...logData,
      logId: newLogId,
      Created: new Date().toISOString(),
      Modified: new Date().toISOString(),
      AppVersion: "1.0"
    };

    if (isOnline()) {
      mockLog.push(newLogEntry);
      return newLogEntry;
    } else if (storeOfflineIfNeeded) {
      // Store locally and add to sync queue
      await addToPendingSync({
        type: 'ADD_LOG',
        data: logData
      });
      
      const offlineLog = await getOfflineData(STORAGE_KEYS.AED_LOG, []);
      offlineLog.push(newLogEntry);
      await storeOfflineData(STORAGE_KEYS.AED_LOG, offlineLog);
      
      return newLogEntry;
    } else {
      throw new Error('No network connection');
    }
  },

  // Get log entries for specific AED
  async getLogEntriesForAed(aedTitle, useOfflineIfNeeded = true) {
    await delay(300);
    
    try {
      if (isOnline()) {
        return mockLog.filter(log => log.AedLinkTitle === aedTitle);
      } else if (useOfflineIfNeeded) {
        const offlineLog = await getOfflineData(STORAGE_KEYS.AED_LOG, []);
        return offlineLog.filter(log => log.AedLinkTitle === aedTitle);
      }
    } catch (error) {
      if (useOfflineIfNeeded) {
        const offlineLog = await getOfflineData(STORAGE_KEYS.AED_LOG, []);
        return offlineLog.filter(log => log.AedLinkTitle === aedTitle);
      }
      throw error;
    }
  },

  // Get all log entries
  async getAllLogEntries(useOfflineIfNeeded = true) {
    await delay(400);
    
    try {
      if (isOnline()) {
        const data = mockLog;
        await storeOfflineData(STORAGE_KEYS.AED_LOG, data);
        return data;
      } else if (useOfflineIfNeeded) {
        return await getOfflineData(STORAGE_KEYS.AED_LOG, []);
      }
    } catch (error) {
      if (useOfflineIfNeeded) {
        return await getOfflineData(STORAGE_KEYS.AED_LOG, []);
      }
      throw error;
    }
  },

  // Manual sync trigger
  async forcSync() {
    return await syncPendingChanges();
  },

  // Get sync status
  async getSyncStatus() {
    const pendingSync = await getOfflineData(STORAGE_KEYS.PENDING_SYNC, []);
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    
    return {
      pendingChanges: pendingSync.length,
      lastSync: lastSync ? new Date(lastSync) : null,
      isOnline: isOnline()
    };
  }
}; 