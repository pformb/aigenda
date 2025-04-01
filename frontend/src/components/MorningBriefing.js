// src/components/MorningBriefing.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Clock, Sun, Cloud, CloudRain, Wind, CheckSquare, AlertCircle, ChevronDown, ChevronUp } from 'react-native-vector-icons/Feather';
import AIService from '../services/AIService';

const MorningBriefing = ({ userProfile, aiService, onActionSelected }) => {
  const [briefing, setBriefing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('schedule');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [weatherIcon, setWeatherIcon] = useState(<Sun size={24} color="#f9a825" />);
  
  useEffect(() => {
    // Set time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
    
    // Load briefing data
    loadBriefingData();
  }, []);
  
  const loadBriefingData = async () => {
    setIsLoading(true);
    
    try {
      // Mock data for weather - in a real app, this would come from a weather API
      const mockWeather = {
        condition: getRandomWeatherCondition(),
        temperature: Math.round(15 + Math.random() * 20), // Random between 15-35
        temperatureUnit: '°C',
        precipitation: Math.round(Math.random() * 50),
        wind: Math.round(5 + Math.random() * 20)
      };
      
      // Set weather icon based on condition
      setWeatherIcon(getWeatherIcon(mockWeather.condition));
      
      // Fetch user's schedule, tasks, and other data
      const mockSchedule = await fetchUserSchedule();
      const mockTasks = await fetchUserTasks();
      
      if (aiService) {
        // Use AI to generate personalized briefing
        const briefingData = await aiService.getMorningBriefing({
          schedule: mockSchedule,
          tasks: mockTasks,
          weather: mockWeather,
          date: new Date().toISOString()
        });
        
        setBriefing(briefingData);
      } else {
        // Fallback to template-based briefing
        setBriefing({
          greeting: `Good ${timeOfDay}, ${userProfile?.firstName || 'there'}!`,
          summary: `You have ${mockSchedule.length} events scheduled today and ${mockTasks.filter(t => !t.completed).length} pending tasks.`,
          weatherNote: `It's ${mockWeather.condition.toLowerCase()} with ${mockWeather.temperature}${mockWeather.temperatureUnit}.`,
          scheduleSummary: generateScheduleSummary(mockSchedule),
          tasksSummary: generateTasksSummary(mockTasks),
          topPriority: identifyTopPriority(mockSchedule, mockTasks),
          focusTime: calculateFocusTime(mockSchedule),
          suggestions: generateSuggestions(mockSchedule, mockTasks)
        });
      }
    } catch (error) {
      console.error('Error loading briefing data:', error);
      // Fallback minimal briefing
      setBriefing({
        greeting: `Good ${timeOfDay}!`,
        summary: 'Here is your day at a glance.',
        weatherNote: '',
        scheduleSummary: 'Your schedule could not be loaded.',
        tasksSummary: 'Your tasks could not be loaded.',
        topPriority: null,
        focusTime: null,
        suggestions: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRandomWeatherCondition = () => {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Windy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };
  
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun size={24} color="#f9a825" />;
      case 'cloudy':
        return <Cloud size={24} color="#78909c" />;
      case 'partly cloudy':
        return <Cloud size={24} color="#90a4ae" />;
      case 'rainy':
        return <CloudRain size={24} color="#42a5f5" />;
      case 'windy':
        return <Wind size={24} color="#78909c" />;
      default:
        return <Sun size={24} color="#f9a825" />;
    }
  };
  
  const fetchUserSchedule = async () => {
    // In a real app, this would fetch from your API
    // Mock schedule data
    return [
      {
        id: 1,
        title: 'Team Standup',
        startTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
        location: 'Zoom Meeting',
        type: 'meeting'
      },
      {
        id: 2,
        title: 'Client Call: Acme Corp',
        startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
        location: 'Phone',
        type: 'call'
      },
      {
        id: 3,
        title: 'Lunch with Marketing Team',
        startTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString(),
        location: 'Bistro on Main',
        type: 'personal'
      },
      {
        id: 4,
        title: 'Quarterly Planning Session',
        startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
        location: 'Conference Room A',
        type: 'meeting'
      }
    ];
  };
  
  const fetchUserTasks = async () => {
    // In a real app, this would fetch from your API
    // Mock tasks data
    return [
      {
        id: 1,
        title: 'Prepare client presentation',
        completed: false,
        dueDate: new Date().toISOString(),
        priority: 'high'
      },
      {
        id: 2,
        title: 'Review quarterly numbers',
        completed: false,
        dueDate: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Update CRM with new leads',
        completed: false,
        dueDate: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: 4,
        title: 'Schedule follow-up with XYZ Inc',
        completed: true,
        dueDate: new Date().toISOString(),
        priority: 'low'
      },
      {
        id: 5,
        title: 'Prepare for tomorrow\'s client meeting',
        completed: false,
        dueDate: new Date(new Date().getTime() + 86400000).toISOString(), // Tomorrow
        priority: 'high'
      }
    ];
  };
  
  const generateScheduleSummary = (schedule) => {
    if (!schedule || schedule.length === 0) {
      return 'You have no events scheduled for today.';
    }
    
    // Group events by type
    const events = {
      meeting: schedule.filter(event => event.type === 'meeting'),
      call: schedule.filter(event => event.type === 'call'),
      personal: schedule.filter(event => event.type === 'personal'),
      other: schedule.filter(event => !['meeting', 'call', 'personal'].includes(event.type))
    };
    
    const summary = [];
    
    if (events.meeting.length > 0) {
      summary.push(`${events.meeting.length} meeting${events.meeting.length === 1 ? '' : 's'}`);
    }
    
    if (events.call.length > 0) {
      summary.push(`${events.call.length} call${events.call.length === 1 ? '' : 's'}`);
    }
    
    if (events.personal.length > 0) {
      summary.push(`${events.personal.length} personal event${events.personal.length === 1 ? '' : 's'}`);
    }
    
    if (events.other.length > 0) {
      summary.push(`${events.other.length} other event${events.other.length === 1 ? '' : 's'}`);
    }
    
    if (summary.length === 0) {
      return 'You have events scheduled but they have no categorization.';
    }
    
    // Find the next upcoming event
    const now = new Date();
    const upcomingEvents = schedule
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    let nextEventInfo = '';
    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      const eventTime = new Date(nextEvent.startTime);
      const timeString = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      nextEventInfo = ` Next up is "${nextEvent.title}" at ${timeString}.`;
    }
    
    return `You have ${summary.join(', ')} scheduled today.${nextEventInfo}`;
  };
  
  const generateTasksSummary = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return 'You have no tasks for today.';
    }
    
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    if (pendingTasks.length === 0) {
      return 'All your tasks for today are completed. Great job!';
    }
    
    // Group by priority
    const highPriority = pendingTasks.filter(task => task.priority === 'high');
    const mediumPriority = pendingTasks.filter(task => task.priority === 'medium');
    const lowPriority = pendingTasks.filter(task => task.priority === 'low');
    
    let summary = `You have ${pendingTasks.length} pending task${pendingTasks.length === 1 ? '' : 's'}`;
    
    if (highPriority.length > 0) {
      summary += `, including ${highPriority.length} high priority`;
    }
    
    if (completedTasks.length > 0) {
      summary += ` and you've completed ${completedTasks.length} task${completedTasks.length === 1 ? '' : 's'} so far`;
    }
    
    return `${summary}.`;
  };
  
  const identifyTopPriority = (schedule, tasks) => {
    // Logic to identify the top priority for the day
    // Check for high priority tasks first
    const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'high');
    if (highPriorityTasks.length > 0) {
      return {
        type: 'task',
        item: highPriorityTasks[0],
        reason: 'This is your highest priority task for today.'
      };
    }
    
    // Check for imminent meetings
    const now = new Date();
    const upcomingEvents = schedule
      .filter(event => {
        const eventTime = new Date(event.startTime);
        const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);
        return hoursUntilEvent > 0 && hoursUntilEvent < 2; // Events in the next 2 hours
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    if (upcomingEvents.length > 0) {
      return {
        type: 'event',
        item: upcomingEvents[0],
        reason: 'This event is coming up soon and might require preparation.'
      };
    }
    
    // Fallback to medium priority tasks
    const mediumPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'medium');
    if (mediumPriorityTasks.length > 0) {
      return {
        type: 'task',
        item: mediumPriorityTasks[0],
        reason: 'This is your highest remaining priority task.'
      };
    }
    
    return null;
  };
  
  const calculateFocusTime = (schedule) => {
    // Calculate potential focus time blocks (2+ hours without meetings)
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(18, 0, 0, 0); // Assume workday ends at 6 PM
    
    // Sort events chronologically
    const sortedEvents = [...schedule].sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );
    
    // Find gaps between events
    let focusBlocks = [];
    let lastEndTime = new Date(now);
    
    // If it's before 9 AM, start from 9 AM
    if (lastEndTime.getHours() < 9) {
      lastEndTime.setHours(9, 0, 0, 0);
    }
    
    for (const event of sortedEvents) {
      const eventStart = new Date(event.startTime);
      
      // Skip events that have already started
      if (eventStart < now) {
        const eventEnd = new Date(event.endTime);
        if (eventEnd > lastEndTime) {
          lastEndTime = eventEnd;
        }
        continue;
      }
      
      // Calculate gap between last event and this one
      const gapMinutes = (eventStart - lastEndTime) / (1000 * 60);
      
      // If gap is 30+ minutes, consider it a focus block
      if (gapMinutes >= 30) {
        focusBlocks.push({
          start: new Date(lastEndTime),
          end: new Date(eventStart),
          duration: gapMinutes
        });
      }
      
      lastEndTime = new Date(event.endTime);
    }
    
    // Add final block from last event to end of day
    if (lastEndTime < endOfDay) {
      const gapMinutes = (endOfDay - lastEndTime) / (1000 * 60);
      if (gapMinutes >= 30) {
        focusBlocks.push({
          start: new Date(lastEndTime),
          end: new Date(endOfDay),
          duration: gapMinutes
        });
      }
    }
    
    // Find the longest block
    let longestBlock = null;
    let longestDuration = 0;
    
    for (const block of focusBlocks) {
      if (block.duration > longestDuration) {
        longestDuration = block.duration;
        longestBlock = block;
      }
    }
    
    if (longestBlock) {
      const startTime = longestBlock.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = longestBlock.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const hours = Math.floor(longestBlock.duration / 60);
      const minutes = Math.round(longestBlock.duration % 60);
      
      let durationText = '';
      if (hours > 0) {
        durationText += `${hours} hour${hours === 1 ? '' : 's'}`;
      }
      if (minutes > 0) {
        durationText += `${hours > 0 ? ' and ' : ''}${minutes} minute${minutes === 1 ? '' : 's'}`;
      }
      
      return {
        start: startTime,
        end: endTime,
        duration: durationText,
        durationMinutes: longestBlock.duration
      };
    }
    
    return null;
  };
  
  const generateSuggestions = (schedule, tasks) => {
    const suggestions = [];
    
    // Check for client meetings that might need preparation
    const clientMeetings = schedule.filter(event => 
      (event.type === 'meeting' || event.type === 'call') &&
      (event.title.toLowerCase().includes('client') || 
       event.title.toLowerCase().includes('customer') ||
       event.title.toLowerCase().includes('prospect'))
    );
    
    if (clientMeetings.length > 0) {
      suggestions.push({
        type: 'preparation',
        text: 'Prepare notes for your client meetings today',
        actionText: 'View clients',
        priority: 'high'
      });
    }
    
    // Check for high priority tasks
    const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'high');
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        type: 'task_focus',
        text: `Focus on your ${highPriorityTasks.length} high priority task${highPriorityTasks.length === 1 ? '' : 's'}`,
        actionText: 'View tasks',
        priority: 'high'
      });
    }
    
    // Suggest focus time usage
    const focusTime = calculateFocusTime(schedule);
    if (focusTime && focusTime.durationMinutes >= 60) {
      suggestions.push({
        type: 'focus_time',
        text: `You have ${focusTime.duration} of potential focus time from ${focusTime.start} to ${focusTime.end}`,
        actionText: 'Schedule focus',
        priority: 'medium'
      });
    }
    
    // Always suggest completing a daily log if the user is in sales
    if (userProfile?.profession === 'sales') {
      suggestions.push({
        type: 'daily_log',
        text: 'Don\'t forget to complete your daily sales log',
        actionText: 'Start log',
        priority: 'medium'
      });
    }
    
    return suggestions;
  };
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleActionPress = (action) => {
    if (onActionSelected) {
      onActionSelected(action);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Preparing your day...</Text>
      </View>
    );
  }
  
  if (!briefing) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#e57373" />
        <Text style={styles.errorText}>Could not load your briefing</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadBriefingData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{briefing.greeting}</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>
      
      {/* Weather Section */}
      <View style={styles.weatherSection}>
        {weatherIcon}
        <Text style={styles.weatherText}>{briefing.weatherNote}</Text>
      </View>
      
      {/* Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>{briefing.summary}</Text>
      </View>
      
      {/* Schedule Section */}
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('schedule')}
      >
        <View style={styles.sectionTitleContainer}>
          <Calendar size={20} color="#6200ee" />
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
        </View>
        {expandedSection === 'schedule' ? (
          <ChevronUp size={20} color="#6200ee" />
        ) : (
          <ChevronDown size={20} color="#6200ee" />
        )}
      </TouchableOpacity>
      
      {expandedSection === 'schedule' && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionSummary}>{briefing.scheduleSummary}</Text>
          
          {/* Today's events list */}
          <View style={styles.eventsList}>
            {(async () => {
              const events = await fetchUserSchedule();
              return events.map(event => (
                <View key={`event-${event.id}`} style={styles.eventItem}>
                  <View style={styles.eventTime}>
                    <Text style={styles.eventTimeText}>{formatTime(event.startTime)}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                </View>
              ));
            })()}
          </View>
        </View>
      )}
      
      {/* Tasks Section */}
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('tasks')}
      >
        <View style={styles.sectionTitleContainer}>
          <CheckSquare size={20} color="#6200ee" />
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
        </View>
        {expandedSection === 'tasks' ? (
          <ChevronUp size={20} color="#6200ee" />
        ) : (
          <ChevronDown size={20} color="#6200ee" />
        )}
      </TouchableOpacity>
      
      {expandedSection === 'tasks' && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionSummary}>{briefing.tasksSummary}</Text>
          
          {/* Tasks list */}
          <View style={styles.tasksList}>
            {(async () => {
              const tasks = await fetchUserTasks();
              // Only show incomplete tasks
              return tasks
                .filter(task => !task.completed)
                .map(task => (
                  <View key={`task-${task.id}`} style={styles.taskItem}>
                    <View style={[
                      styles.taskPriority,
                      task.priority === 'high' ? styles.highPriority :
                      task.priority === 'medium' ? styles.mediumPriority :
                      styles.lowPriority
                    ]} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                  </View>
                ));
            })()}
          </View>
        </View>
      )}
      
      {/* Focus Time Section */}
      {briefing.focusTime && (
        <View style={styles.focusTimeSection}>
          <View style={styles.focusTimeHeader}>
            <Clock size={20} color="#6200ee" />
            <Text style={styles.focusTimeTitle}>Focus Time</Text>
          </View>
          <Text style={styles.focusTimeText}>
            {`You have ${briefing.focusTime.duration} available between ${briefing.focusTime.start} and ${briefing.focusTime.end}`}
          </Text>
        </View>
      )}
      
      {/* Top Priority Section */}
      {briefing.topPriority && (
        <View style={styles.topPrioritySection}>
          <Text style={styles.topPriorityLabel}>Top Priority</Text>
          <Text style={styles.topPriorityTitle}>
            {briefing.topPriority.type === 'task' ? briefing.topPriority.item.title : briefing.topPriority.item.title}
          </Text>
          <Text style={styles.topPriorityReason}>{briefing.topPriority.reason}</Text>
        </View>
      )}
      
      {/* Suggestions Section */}
      {briefing.suggestions && briefing.suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          
          {briefing.suggestions.map((suggestion, index) => (
            <View key={`suggestion-${index}`} style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              <TouchableOpacity 
                style={[
                  styles.suggestionAction,
                  suggestion.priority === 'high' ? styles.highPriorityAction :
                  suggestion.priority === 'medium' ? styles.mediumPriorityAction :
                  styles.lowPriorityAction
                ]}
                onPress={() => handleActionPress(suggestion)}
              >
                <Text style={styles.suggestionActionText}>{suggestion.actionText}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#e57373',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  weatherText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#424242',
  },
  summarySection: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  sectionContent: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 15,
    marginTop: -15,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionSummary: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  eventsList: {
    marginTop: 10,
  },
  eventItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  eventTime: {
    width: 70,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#616161',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  eventLocation: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  tasksList: {
    marginTop: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskPriority: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  highPriority: {
    backgroundColor: '#e53935',
  },
  mediumPriority: {
    backgroundColor: '#fb8c00',
  },
  lowPriority: {
    backgroundColor: '#43a047',
  },
  taskTitle: {
    fontSize: 16,
    color: '#212121',
  },
  focusTimeSection: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  focusTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusTimeTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  focusTimeText: {
    fontSize: 16,
    color: '#424242',
  },
  topPrioritySection: {
    padding: 15,
    backgroundColor: '#ede7f6',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  topPriorityLabel: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  topPriorityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  topPriorityReason: {
    fontSize: 14,
    color: '#616161',
  },
  suggestionsSection: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  suggestionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 10,
  },
  suggestionAction: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  highPriorityAction: {
    backgroundColor: '#e53935',
  },
  mediumPriorityAction: {
    backgroundColor: '#fb8c00',
  },
  lowPriorityAction: {
    backgroundColor: '#43a047',
  },
  suggestionActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomPadding: {
    height: 30,
  }
});

export default MorningBriefing;// src/components/MorningBriefing.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Clock, Sun, Cloud, CloudRain, Wind, CheckSquare, AlertCircle, ChevronDown, ChevronUp } from 'react-native-vector-icons/Feather';
import AIService from '../services/AIService';

const MorningBriefing = ({ userProfile, aiService, onActionSelected }) => {
  const [briefing, setBriefing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('schedule');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [weatherIcon, setWeatherIcon] = useState(<Sun size={24} color="#f9a825" />);
  
  useEffect(() => {
    // Set time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
    
    // Load briefing data
    loadBriefingData();
  }, []);
  
  const loadBriefingData = async () => {
    setIsLoading(true);
    
    try {
      // Mock data for weather - in a real app, this would come from a weather API
      const mockWeather = {
        condition: getRandomWeatherCondition(),
        temperature: Math.round(15 + Math.random() * 20), // Random between 15-35
        temperatureUnit: '°C',
        precipitation: Math.round(Math.random() * 50),
        wind: Math.round(5 + Math.random() * 20)
      };
      
      // Set weather icon based on condition
      setWeatherIcon(getWeatherIcon(mockWeather.condition));
      
      // Fetch user's schedule, tasks, and other data
      const mockSchedule = await fetchUserSchedule();
      const mockTasks = await fetchUserTasks();
      
      if (aiService) {
        // Use AI to generate personalized briefing
        const briefingData = await aiService.getMorningBriefing({
          schedule: mockSchedule,
          tasks: mockTasks,
          weather: mockWeather,
          date: new Date().toISOString()
        });
        
        setBriefing(briefingData);
      } else {
        // Fallback to template-based briefing
        setBriefing({
          greeting: `Good ${timeOfDay}, ${userProfile?.firstName || 'there'}!`,
          summary: `You have ${mockSchedule.length} events scheduled today and ${mockTasks.filter(t => !t.completed).length} pending tasks.`,
          weatherNote: `It's ${mockWeather.condition.toLowerCase()} with ${mockWeather.temperature}${mockWeather.temperatureUnit}.`,
          scheduleSummary: generateScheduleSummary(mockSchedule),
          tasksSummary: generateTasksSummary(mockTasks),
          topPriority: identifyTopPriority(mockSchedule, mockTasks),
          focusTime: calculateFocusTime(mockSchedule),
          suggestions: generateSuggestions(mockSchedule, mockTasks)
        });
      }
    } catch (error) {
      console.error('Error loading briefing data:', error);
      // Fallback minimal briefing
      setBriefing({
        greeting: `Good ${timeOfDay}!`,
        summary: 'Here is your day at a glance.',
        weatherNote: '',
        scheduleSummary: 'Your schedule could not be loaded.',
        tasksSummary: 'Your tasks could not be loaded.',
        topPriority: null,
        focusTime: null,
        suggestions: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRandomWeatherCondition = () => {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Windy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };
  
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun size={24} color="#f9a825" />;
      case 'cloudy':
        return <Cloud size={24} color="#78909c" />;
      case 'partly cloudy':
        return <Cloud size={24} color="#90a4ae" />;
      case 'rainy':
        return <CloudRain size={24} color="#42a5f5" />;
      case 'windy':
        return <Wind size={24} color="#78909c" />;
      default:
        return <Sun size={24} color="#f9a825" />;
    }
  };
  
  const fetchUserSchedule = async () => {
    // In a real app, this would fetch from your API
    // Mock schedule data
    return [
      {
        id: 1,
        title: 'Team Standup',
        startTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(9, 45, 0, 0)).toISO