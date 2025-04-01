// src/services/AIService.js
import axios from 'axios';

/**
 * Service for handling AI-related functionality in AIGENDA
 */
class AIService {
  constructor(apiUrl, authToken) {
    this.apiUrl = apiUrl || process.env.REACT_APP_API_URL;
    this.authToken = authToken;
    this.history = [];
    this.contextWindow = 10; // Number of conversation turns to remember
    this.userProfile = null;
    this.userPreferences = null;
  }

  /**
   * Set authentication token for API calls
   * @param {string} token - JWT auth token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Update user profile and preferences for better AI personalization
   * @param {object} profile - User profile data
   * @param {object} preferences - User preferences
   */
  updateUserContext(profile, preferences) {
    this.userProfile = profile;
    this.userPreferences = preferences;
  }

  /**
   * Process natural language input from user
   * @param {string} input - User's text or voice input
   * @param {object} context - Current app context (schedule, location, etc.)
   * @returns {Promise<object>} - Structured response with action and data
   */
  async processInput(input, context = {}) {
    try {
      // Add to conversation history
      this.history.push({
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      });

      // Trim history to contextWindow size
      if (this.history.length > this.contextWindow * 2) {
        this.history = this.history.slice(-this.contextWindow * 2);
      }

      // Call AI processing endpoint
      const response = await axios.post(
        `${this.apiUrl}/api/ai/process`,
        {
          input,
          context: {
            ...context,
            profile: this.userProfile,
            preferences: this.userPreferences,
            history: this.history
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add AI response to history
      this.history.push({
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Error processing AI input:', error);
      return {
        understood: false,
        action: null,
        data: null,
        message: "I'm having trouble understanding that. Could you rephrase it?"
      };
    }
  }

  /**
   * Generate proactive AI suggestions based on current context
   * @param {object} userData - User data and preferences
   * @param {array} schedule - User's schedule
   * @param {array} activities - Recent activities
   * @param {array} tasks - Pending tasks
   * @returns {Promise<object>} - AI suggestion
   */
  async generateSuggestion(userData, schedule, activities, tasks) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/ai/suggest`,
        {
          userData,
          schedule,
          activities,
          tasks,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      return null;
    }
  }

  /**
   * Analyze activities for patterns and insights
   * @param {array} activities - User activities
   * @returns {Promise<object>} - Analysis results
   */
  async analyzeActivities(activities) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/ai/analyze`,
        {
          activities,
          userProfile: this.userProfile
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error analyzing activities:', error);
      return {
        patterns: [],
        insights: [],
        recommendations: []
      };
    }
  }

  /**
   * Generate a summary report for a specific time period
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {array} activities - Activities in the date range
   * @param {string} reportType - Type of report to generate
   * @returns {Promise<object>} - Structured report data
   */
  async generateReport(startDate, endDate, activities, reportType = 'daily') {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/ai/report`,
        {
          startDate,
          endDate,
          activities,
          reportType,
          userProfile: this.userProfile
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }

  /**
   * Process and categorize an activity using AI
   * @param {object} activity - Raw activity data
   * @returns {Promise<object>} - Processed and categorized activity
   */
  async processActivity(activity) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/ai/process-activity`,
        {
          activity,
          userProfile: this.userProfile
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error processing activity:', error);
      return activity; // Return original if processing fails
    }
  }

  /**
   * Get personalized morning briefing
   * @param {object} today - Today's schedule and tasks
   * @returns {Promise<object>} - Personalized briefing
   */
  async getMorningBriefing(today) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/ai/morning-briefing`,
        {
          schedule: today.schedule,
          tasks: today.tasks,
          weather: today.weather,
          userProfile: this.userProfile,
          date: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting morning briefing:', error);
      return {
        greeting: `Good ${getTimeOfDay()}!`,
        summary: 'Here is your day at a glance.',
        weatherNote: today.weather ? `It's ${today.weather.condition} today.` : '',
        scheduleSummary: `You have ${today.schedule.length} events scheduled.`,
        tasksSummary: `You have ${today.tasks.filter(t => !t.completed).length} tasks pending.`,
        topPriority: null
      };
    }
  }
}

// Helper function to determine time of day
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default AIService;