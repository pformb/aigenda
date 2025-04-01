// server/ai-service.js
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Processes natural language input and returns structured data
 * @param {string} input - User's natural language input
 * @param {object} context - Contextual information (user data, preferences, etc.)
 * @param {object} history - Conversation history
 * @returns {object} Structured response with action and data
 */
async function processNaturalLanguage(input, context, history = []) {
  try {
    // Prepare prompt with context and history
    const prompt = `
      You are AIGENDA, an AI assistant for productivity and activity tracking.
      
      User information:
      - Name: ${context.name || 'User'}
      - Role: ${context.role || 'professional'}
      - Current time: ${new Date().toLocaleString()}
      
      Recent conversation:
      ${history.map(item => `${item.role}: ${item.content}`).join('\n')}
      
      User says: "${input}"
      
      Analyze the user's request and respond with a JSON object in this format:
      {
        "understood": true/false,
        "action": "log_activity|create_reminder|create_schedule_item|answer_question|none",
        "data": {
          // Action-specific structured data
        },
        "message": "Natural language response to the user"
      }
    `;
    
    // Call OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Parse response
    const result = JSON.parse(response.data.choices[0].text.trim());
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      understood: false,
      action: null,
      data: null,
      message: "I'm having trouble understanding that request. Could you please rephrase it?"
    };
  }
}

/**
 * Generates personalized AI suggestions based on user context
 * @param {object} userData - User profile and preferences
 * @param {array} activities - Recent user activities
 * @param {array} schedule - Upcoming schedule items
 * @returns {object} AI suggestion
 */
async function generateSuggestion(userData, activities, schedule) {
  try {
    // Analyze recent activities and upcoming schedule
    // In production, this would use more sophisticated ML models
    
    const now = new Date();
    const upcomingEvents = schedule.filter(item => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const eventTime = new Date();
      eventTime.setHours(hours, minutes, 0, 0);
      
      const timeDiff = (eventTime - now) / (1000 * 60); // difference in minutes
      return timeDiff > 0 && timeDiff < 60; // events in the next hour
    });
    
    // Generate suggestion based on upcoming events
    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      
      if (nextEvent.type === 'call' || nextEvent.type === 'meeting') {
        return {
          type: 'preparation',
          text: `You have a ${nextEvent.type} with ${nextEvent.contact || nextEvent.title} in ${Math.round((new Date(nextEvent.time) - now) / (1000 * 60))} minutes. Would you like me to prepare a summary of relevant information?`,
          actions: ["Yes, please", "No thanks"],
          relatedTo: nextEvent.id
        };
      }
    }
    
    // Check for follow-up opportunities
    const recentCalls = activities.filter(activity => 
      activity.title.toLowerCase().includes('call') && 
      !activities.some(a => a.title.toLowerCase().includes('follow') && a.title.includes(activity.title))
    );
    
    if (recentCalls.length > 0) {
      return {
        type: 'follow_up',
        text: `I noticed you had a call about "${recentCalls[0].title}". Do you want to schedule a follow-up?`,
        actions: ["Schedule follow-up", "No need"],
        relatedTo: recentCalls[0].id
      };
    }
    
    // Default suggestion
    return {
      type: 'productivity',
      text: "Based on your work patterns, this is usually your most productive time. Would you like to focus on high-priority tasks now?",
      actions: ["Show me tasks", "Not now"],
      relatedTo: null
    };
  } catch (error) {
    console.error('Suggestion generation error:', error);
    return null;
  }
}

/**
 * Generates a report based on user activities
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @param {array} activities - User activities
 * @param {string} reportType - Type of report
 * @returns {object} Generated report
 */
async function generateReport(startDate, endDate, activities, reportType) {
  try {
    // For simplicity, we'll just generate a template-based report
    // In production, you would use LLM to create more dynamic reports
    
    const reportContent = `
# ${reportType.toUpperCase()} REPORT
**Period**: ${startDate} to ${endDate}

## Summary
You logged ${activities.length} activities during this period.

## Activity Breakdown
${categorizeActivities(activities)}

## Top Items
${identifyTopItems(activities)}

## Insights
${generateInsights(activities)}

## Next Steps
${suggestNextSteps(activities)}
    `;
    
    return {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      content: reportContent,
      sections: {
        summary: `You logged ${activities.length} activities during this period.`,
        breakdown: categorizeActivities(activities),
        topItems: identifyTopItems(activities),
        insights: generateInsights(activities),
        nextSteps: suggestNextSteps(activities)
      },
      metrics: calculateMetrics(activities),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Report generation error:', error);
    return null;
  }
}

// Helper functions for report generation
function categorizeActivities(activities) {
  const categories = {};
  
  activities.forEach(activity => {
    const type = activity.type || 'uncategorized';
    categories[type] = (categories[type] || 0) + 1;
  });
  
  return Object.entries(categories)
    .map(([category, count]) => `- ${category}: ${count} activities`)
    .join('\n');
}

function identifyTopItems(activities) {
  // Just return the first few activities for demo purposes
  return activities.slice(0, 3)
    .map(activity => `- ${activity.title}`)
    .join('\n');
}

function generateInsights(activities) {
  // Simplified insights for demo
  return `- Most active day: ${getMostActiveDay(activities)}
- Most common activity type: ${getMostCommonType(activities)}`;
}

function suggestNextSteps(activities) {
  // Simplified suggestions
  return `- Review activities and plan for next week
- Follow up on any incomplete tasks
- Schedule important meetings in advance`;
}

function calculateMetrics(activities) {
  // Calculate basic metrics for the report
  return {
    total: activities.length,
    byType: countByType(activities),
    byTime: countByTimeOfDay(activities)
  };
}

function getMostActiveDay(activities) {
  // Simplified - just return today
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function getMostCommonType(activities) {
  const types = {};
  
  activities.forEach(activity => {
    const type = activity.type || 'uncategorized';
    types[type] = (types[type] || 0) + 1;
  });
  
  let maxType = 'uncategorized';
  let maxCount = 0;
  
  for (const [type, count] of Object.entries(types)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = type;
    }
  }
  
  return maxType;
}

function countByType(activities) {
  const result = {};
  
  activities.forEach(activity => {
    const type = activity.type || 'uncategorized';
    result[type] = (result[type] || 0) + 1;
  });
  
  return result;
}

function countByTimeOfDay(activities) {
  return {
    morning: 0,
    afternoon: 0,
    evening: 0
  };
}

module.exports = {
  processNaturalLanguage,
  generateSuggestion,
  generateReport
};