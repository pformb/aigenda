// src/services/DataSyncService.js

import axios from 'axios';
import _ from 'lodash';

/**
 * Service for handling data synchronization between local storage and backend
 */
class DataSyncService {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl || process.env.REACT_APP_API_URL;
    this.authToken = authToken;
    this.syncInterval = null;
    this.pendingChanges = {};
    this.lastSyncTimestamp = null;
    this.isOnline = navigator.onLine;
    
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
  }
  
  /**
   * Initialize the sync service
   * @param {string} authToken - Authentication token
   * @param {number} syncIntervalMs - Sync interval in milliseconds
   */
  initialize(authToken, syncIntervalMs = 60000) {
    this.authToken = authToken;
    this.startSyncInterval(syncIntervalMs);
    this.loadPendingChangesFromStorage();
    
    // Initial sync if online
    if (this.isOnline) {
      this.syncData();
    }
  }
  
  /**
   * Handle online/offline status changes
   */
  handleOnlineStatusChange() {
    this.isOnline = navigator.onLine;
    
    if (this.isOnline) {
      console.log('App is online. Attempting to sync pending changes...');
      this.syncData();
    } else {
      console.log('App is offline. Changes will be stored locally.');
    }
  }
  
  /**
   * Start periodic sync interval
   * @param {number} intervalMs - Sync interval in milliseconds
   */
  startSyncInterval(intervalMs) {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Set new interval
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, intervalMs);
  }
  
  /**
   * Stop periodic sync
   */
  stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Load pending changes from local storage
   */
  loadPendingChangesFromStorage() {
    try {
      const storedChanges = localStorage.getItem('aigenda_pending_changes');
      if (storedChanges) {
        this.pendingChanges = JSON.parse(storedChanges);
      }
      
      const lastSync = localStorage.getItem('aigenda_last_sync');
      if (lastSync) {
        this.lastSyncTimestamp = parseInt(lastSync, 10);
      }
    } catch (error) {
      console.error('Error loading pending changes from storage:', error);
    }
  }
  
  /**
   * Save pending changes to local storage
   */
  savePendingChangesToStorage() {
    try {
      localStorage.setItem('aigenda_pending_changes', JSON.stringify(this.pendingChanges));
    } catch (error) {
      console.error('Error saving pending changes to storage:', error);
    }
  }
  
  /**
   * Update last sync timestamp
   */
  updateLastSyncTimestamp() {
    const now = Date.now();
    this.lastSyncTimestamp = now;
    localStorage.setItem('aigenda_last_sync', now.toString());
  }
  
  /**
   * Queue a change to be synced with the server
   * @param {string} entityType - Type of entity (e.g., 'activity', 'task')
   * @param {string} action - Action type (e.g., 'create', 'update', 'delete')
   * @param {object} data - Entity data
   */
  queueChange(entityType, action, data) {
    // Generate a unique local ID if not provided
    if (action === 'create' && !data.id) {
      data.id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add to pending changes
    if (!this.pendingChanges[entityType]) {
      this.pendingChanges[entityType] = [];
    }
    
    this.pendingChanges[entityType].push({
      action,
      data,
      timestamp: Date.now(),
      synced: false
    });
    
    // Save to local storage
    this.savePendingChangesToStorage();
    
    // Attempt immediate sync if online
    if (this.isOnline) {
      this.syncData();
    }
    
    return data.id; // Return the ID (useful for local references)
  }
  
  /**
   * Synchronize data with the server
   * @returns {Promise<boolean>} Success status
   */
  async syncData() {
    if (!this.authToken) {
      console.error('Cannot sync: No auth token provided');
      return false;
    }
    
    if (!this.isOnline) {
      console.log('Cannot sync: Device is offline');
      return false;
    }
    
    try {
      // First, fetch updates from server
      await this.pullChangesFromServer();
      
      // Then push local changes to server
      await this.pushChangesToServer();
      
      // Update last sync timestamp
      this.updateLastSyncTimestamp();
      
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }
  
  /**
   * Pull changes from server
   */
  async pullChangesFromServer() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/sync`,
        {
          params: {
            since: this.lastSyncTimestamp || 0
          },
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        }
      );
      
      const serverChanges = response.data;
      
      // Process server changes (apply to local data)
      if (serverChanges && Object.keys(serverChanges).length > 0) {
        this.applyServerChanges(serverChanges);
      }
    } catch (error) {
      console.error('Error pulling changes from server:', error);
      throw error;
    }
  }
  
  /**
   * Apply changes from server to local data
   * @param {object} serverChanges - Changes from server
   */
  applyServerChanges(serverChanges) {
    // This would update local app state and storage
    // Implementation depends on your state management approach
    
    // For example, to update Redux store:
    if (serverChanges.activities) {
      // dispatch({ type: 'UPDATE_ACTIVITIES', payload: serverChanges.activities });
      console.log('Applying server changes for activities:', serverChanges.activities.length);
    }
    
    if (serverChanges.tasks) {
      // dispatch({ type: 'UPDATE_TASKS', payload: serverChanges.tasks });
      console.log('Applying server changes for tasks:', serverChanges.tasks.length);
    }
    
    // Other entity types...
    
    // Emit events for component updates if needed
    this.emitChangeEvents(serverChanges);
  }
  
  /**
   * Push local changes to server
   */
  async pushChangesToServer() {
    const changesToSync = this.getUnsynced();
    
    if (Object.keys(changesToSync).length === 0) {
      console.log('No changes to push to server');
      return;
    }
    
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/sync`,
        changesToSync,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Process server response (including conflict resolution)
      this.handleSyncResponse(response.data);
      
      // Mark changes as synced
      this.markChangesSynced(response.data.syncedIds || {});
      
      // Save updated pending changes
      this.savePendingChangesToStorage();
    } catch (error) {
      console.error('Error pushing changes to server:', error);
      throw error;
    }
  }
  
  /**
   * Get all unsynced changes
   * @returns {object} Unsynced changes by entity type
   */
  getUnsynced() {
    const unsynced = {};
    
    for (const [entityType, changes] of Object.entries(this.pendingChanges)) {
      const unsyncedChanges = changes.filter(change => !change.synced);
      
      if (unsyncedChanges.length > 0) {
        unsynced[entityType] = unsyncedChanges;
      }
    }
    
    return unsynced;
  }
  
  /**
   * Handle response from sync endpoint
   * @param {object} response - Sync response from server
   */
  handleSyncResponse(response) {
    // Handle conflicts if any
    if (response.conflicts && Object.keys(response.conflicts).length > 0) {
      this.resolveConflicts(response.conflicts);
    }
    
    // Handle server errors for specific changes
    if (response.errors && Object.keys(response.errors).length > 0) {
      this.handleSyncErrors(response.errors);
    }
  }
  
  /**
   * Mark changes as synced based on server response
   * @param {object} syncedIds - Map of synced IDs by entity type
   */
  markChangesSynced(syncedIds) {
    for (const [entityType, ids] of Object.entries(syncedIds)) {
      if (this.pendingChanges[entityType]) {
        this.pendingChanges[entityType] = this.pendingChanges[entityType].map(change => {
          // Check if this change was synced
          if (ids.includes(change.data.id)) {
            return { ...change, synced: true };
          }
          return change;
        });
        
        // Clean up changes that have been synced for more than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.pendingChanges[entityType] = this.pendingChanges[entityType].filter(change => {
          return !change.synced || change.timestamp > oneHourAgo;
        });
      }
    }
  }
  
  /**
   * Resolve conflicts between local and server changes
   * @param {object} conflicts - Conflicts by entity type
   */
  resolveConflicts(conflicts) {
    // For each conflict, we need to decide whether to keep server or local version
    // This is a simple strategy - server always wins
    for (const [entityType, conflictList] of Object.entries(conflicts)) {
      for (const conflict of conflictList) {
        const { id, serverVersion } = conflict;
        
        // Find and update the local pending change
        if (this.pendingChanges[entityType]) {
          const index = this.pendingChanges[entityType].findIndex(
            change => change.data.id === id && !change.synced
          );
          
          if (index !== -1) {
            // For this simple implementation, we'll accept server version
            // But you could implement more sophisticated merge strategies
            this.pendingChanges[entityType][index].data = serverVersion;
            this.pendingChanges[entityType][index].synced = true;
            
            // Update local app state with server version
            // dispatch({ type: `UPDATE_${entityType.toUpperCase()}`, payload: [serverVersion] });
            console.log(`Resolved conflict for ${entityType} ${id} - server version accepted`);
          }
        }
      }
    }
  }
  
  /**
   * Handle errors from sync endpoint
   * @param {object} errors - Errors by entity type
   */
  handleSyncErrors(errors) {
    for (const [entityType, errorList] of Object.entries(errors)) {
      for (const error of errorList) {
        const { id, code, message } = error;
        console.error(`Sync error for ${entityType} ${id}: [${code}] ${message}`);
        
        // If the error is fatal for this change, mark it as such
        if (code === 'INVALID_DATA' || code === 'PERMISSION_DENIED') {
          if (this.pendingChanges[entityType]) {
            const index = this.pendingChanges[entityType].findIndex(
              change => change.data.id === id && !change.synced
            );
            
            if (index !== -1) {
              this.pendingChanges[entityType][index].error = { code, message };
            }
          }
        }
      }
    }
  }
  
  /**
   * Emit change events for components to update
   * @param {object} changes - Changes by entity type
   */
  emitChangeEvents(changes) {
    // Implementation depends on your event system
    // Example with custom events:
    for (const entityType of Object.keys(changes)) {
      const event = new CustomEvent(`aigenda:${entityType}:updated`, {
        detail: changes[entityType]
      });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Clear all sync data (for logout)
   */
  clearAll() {
    this.pendingChanges = {};
    this.lastSyncTimestamp = null;
    localStorage.removeItem('aigenda_pending_changes');
    localStorage.removeItem('aigenda_last_sync');
    this.stopSyncInterval();
  }
}

export default DataSyncService;