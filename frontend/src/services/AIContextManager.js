// src/services/AIContextManager.js

/**
 * AIContextManager handles the creation, maintenance, and retrieval
 * of context for AI interactions in AIGENDA
 */
class AIContextManager {
  constructor() {
    this.shortTermContext = {}; // Current session context (temporary)
    this.mediumTermContext = {}; // Today's activities, tasks, etc.
    this.longTermContext = {}; // User preferences, patterns, etc.
    this.contextWindow = []; // Recent interactions for conversation context
    this.maxContextItems = 10; // Maximum items to keep in context window
  }

  /**
   * Update the short-term context with current user state
   * @param {object} context - Current context data
   */
  updateShortTermContext(context) {
    this.shortTermContext = {
      ...this.shortTermContext,
      ...context,
      timestamp: Date.now()
    };
  }

  /**
   * Update the medium-term context with today's data
   * @param {object} todaysData - Today's activities, tasks, etc.
   */
  updateMediumTermContext(todaysData) {
    this.mediumTermContext = {
      ...this.mediumTermContext,
      ...todaysData,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
  }

  /**
   * Update long-term context with user preferences and patterns
   * @param {object} userData - User preferences, profile, etc.
   * @param {object} patterns - Detected user patterns and preferences
   */
  updateLongTermContext(userData, patterns = null) {
    this.longTermContext = {
      ...this.longTermContext,
      ...userData,
      timestamp: Date.now()
    };

    if (patterns) {
      this.longTermContext.patterns = {
        ...this.longTermContext.patterns,
        ...patterns
      };
    }
  }

  /**
   * Add an interaction to the context window
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Content of the interaction
   */
  addToContextWindow(role, content) {
    this.contextWindow.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Trim context window if it exceeds the maximum size
    if (this.contextWindow.length > this.maxContextItems) {
      this.contextWindow = this.contextWindow.slice(-this.maxContextItems);
    }
  }

  /**
   * Get complete context for AI processing
   * @returns {object} Combined context data
   */
  getCompleteContext() {
    return {
      shortTerm: this.shortTermContext,
      mediumTerm: this.mediumTermContext,
      longTerm: this.longTermContext,
      conversationHistory: this.contextWindow
    };
  }

  /**
   * Get a specific subset of context for different AI tasks
   * @param {string} contextType - Type of context needed
   * @returns {object} Selected context data
   */
  getContextForTask(contextType) {
    switch (contextType) {
      case 'conversation':
        return {
          currentState: this.shortTermContext,
          conversationHistory: this.contextWindow
        };
      case 'personalization':
        return {
          userProfile: this.longTermContext,
          patterns: this.longTermContext.patterns || {}
        };
      case 'activitySuggestion':
        return {
          currentState: this.shortTermContext,
          todaysActivities: this.mediumTermContext.activities || [],
          patterns: this.longTermContext.patterns || {},
          userProfile: {
            profession: this.longTermContext.profession,
            preferences: this.longTermContext.preferences
          }
        };
      case 'reporting':
        return {
          activities: this.mediumTermContext.activities || [],
          tasks: this.mediumTermContext.tasks || [],
          userProfile: {
            profession: this.longTermContext.profession,
            reportPreferences: this.longTermContext.reportPreferences
          }
        };
      default:
        return this.getCompleteContext();
    }
  }

  /**
   * Clear temporary context data (for session end)
   */
  clearTemporaryContext() {
    this.shortTermContext = {};
    this.contextWindow = [];
  }

  /**
   * Save context to persistent storage
   */
  saveContext() {
    try {
      localStorage.setItem('aigenda_medium_term_context', JSON.stringify(this.mediumTermContext));
      localStorage.setItem('aigenda_long_term_context', JSON.stringify(this.longTermContext));
    } catch (error) {
      console.error('Error saving context to local storage:', error);
    }
  }

  /**
   * Load context from persistent storage
   */
  loadContext() {
    try {
      const mediumTerm = localStorage.getItem('aigenda_medium_term_context');
      const longTerm = localStorage.getItem('aigenda_long_term_context');

      if (mediumTerm) {
        this.mediumTermContext = JSON.parse(mediumTerm);
      }

      if (longTerm) {
        this.longTermContext = JSON.parse(longTerm);
      }
    } catch (error) {
      console.error('Error loading context from local storage:', error);
    }
  }
}

// Export the context manager
export default AIContextManager;