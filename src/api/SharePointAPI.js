import { AED_INVENTORY } from '../data/AED_Inventory';
import { AED_SUBMISSION_LOG } from '../data/AED_Submission_Log';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockInventory = [...AED_INVENTORY];
let mockLog = [...AED_SUBMISSION_LOG];

export const SharePointAPI = {
  // Get all AEDs
  async getAllAeds() {
    await delay(500);
    return mockInventory;
  },

  // Get AED by title
  async getAedByTitle(title) {
    await delay(300);
    return mockInventory.find(aed => aed.Title === title);
  },

  // Get AEDs that need service
  async getServiceDueAeds() {
    await delay(400);
    const now = new Date();
    
    return mockInventory.filter(aed => {
      const batteryExpiry = new Date(aed.CalculatedBatteryExpiryDate);
      const padsExpiry = new Date(aed.CalculatedPadsExpiryDate);
      
      return batteryExpiry < now || padsExpiry < now || aed.OverallStatus.includes('Needs');
    });
  },

  // Add new AED
  async addAed(aedData) {
    await delay(600);
    const newId = Math.max(...mockInventory.map(aed => aed.id)) + 1;
    const newAed = {
      ...aedData,
      id: newId,
      Created: new Date().toISOString(),
      Modified: new Date().toISOString()
    };
    mockInventory.push(newAed);
    return newAed;
  },

  // Update existing AED
  async updateAed(aedData) {
    await delay(600);
    const index = mockInventory.findIndex(aed => aed.Title === aedData.Title);
    if (index !== -1) {
      mockInventory[index] = {
        ...mockInventory[index],
        ...aedData,
        Modified: new Date().toISOString()
      };
      return mockInventory[index];
    }
    throw new Error('AED not found');
  },

  // Create log entry
  async createLogEntry(logData) {
    await delay(400);
    const newLogId = Math.max(...mockLog.map(log => log.logId)) + 1;
    const newLogEntry = {
      ...logData,
      logId: newLogId,
      Created: new Date().toISOString(),
      Modified: new Date().toISOString(),
      AppVersion: "1.0"
    };
    mockLog.push(newLogEntry);
    return newLogEntry;
  },

  // Get log entries for specific AED
  async getLogEntriesForAed(aedTitle) {
    await delay(300);
    return mockLog.filter(log => log.AedLinkTitle === aedTitle);
  },

  // Get all log entries
  async getAllLogEntries() {
    await delay(400);
    return mockLog;
  }
}; 