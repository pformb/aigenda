// server/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// API Routes
// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In production, you'd validate credentials against the database
    // For demo purposes, we'll create a token with mock user data
    const user = {
      id: 1,
      email,
      name: 'Alex Johnson',
      role: 'sales_rep'
    };
    
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // In production, fetch from database using req.user.id
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      preferences: {
        theme: 'light',
        notifications: true,
        workHours: {
          start: '09:00',
          end: '17:00'
        }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Schedule
app.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    // In production, fetch from database
    // Mock data for demonstration
    const schedule = [
      { 
        id: 1, 
        title: 'Client Call: Acme Corp', 
        time: '09:30', 
        duration: 30, 
        type: 'call',
        contact: 'John Smith',
        notes: 'Discuss new product features'
      },
      { 
        id: 2, 
        title: 'Team Standup', 
        time: '11:00', 
        duration: 15, 
        type: 'meeting',
        location: 'Zoom'
      },
      { 
        id: 3, 
        title: 'Lunch with Marketing', 
        time: '12:30', 
        duration: 60, 
        type: 'personal',
        location: 'Bistro on Main'
      },
      { 
        id: 4, 
        title: 'Prepare Sales Report', 
        time: '14:00', 
        duration: 90, 
        type: 'work',
        deadline: 'Today, 5PM'
      },
    ];
    
    res.json(schedule);
  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({ error: 'Server error fetching schedule' });
  }
});

// Tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // In production, fetch from database
    const tasks = [
      { id: 1, title: 'Follow up with Acme Corp', priority: 'high', completed: false },
      { id: 2, title: 'Send proposal to new client', priority: 'medium', completed: false },
      { id: 3, title: 'Update CRM with new leads', priority: 'low', completed: true },
      { id: 4, title: 'Book flight for conference', priority: 'medium', completed: false },
    ];
    
    res.json(tasks);
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
});

// Activity Log
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    // In production, fetch from database
    const activities = [
      { id: 1, title: 'Phone call with Client X', time: '08:45', duration: '15 min' },
      { id: 2, title: 'Sent email to Marketing team', time: '09:15', duration: '5 min' },
      { id: 3, title: 'Updated contact information', time: '10:30', duration: '10 min' },
    ];
    
    res.json(activities);
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Server error fetching activities' });
  }
});

// Create Activity Log
app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { title, description, duration, category } = req.body;
    
    // In production, store in database
    // For demo, just return the created activity
    const newActivity = {
      id: Math.floor(Math.random() * 1000),
      title,
      description,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${duration} min`,
      category,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Activity creation error:', error);
    res.status(500).json({ error: 'Server error creating activity' });
  }
});

// AI Endpoint for processing natural language inputs
app.post('/api/ai/process', authenticateToken, async (req, res) => {
  try {
    const { input, context } = req.body;
    
    // In production, this would call your AI service
    // For demo purposes, we'll use simple pattern matching
    
    let response = {
      understood: false,
      action: null,
      data: null,
      message: "I'm not sure how to process that request."
    };
    
    // Simple pattern matching for demonstration
    if (input.toLowerCase().includes('log') || input.toLowerCase().includes('record')) {
      // Activity logging
      if (input.toLowerCase().includes('call') || input.toLowerCase().includes('meeting')) {
        response = {
          understood: true,
          action: 'log_activity',
          data: {
            type: input.toLowerCase().includes('call') ? 'call' : 'meeting',
            title: extractTitle(input),
            duration: extractDuration(input) || 30
          },
          message: "I've logged your activity."
        };
      }
    } else if (input.toLowerCase().includes('remind') || input.toLowerCase().includes('reminder')) {
      // Reminder creation
      response = {
        understood: true,
        action: 'create_reminder',
        data: {
          title: extractTitle(input),
          time: extractTime(input) || 'later today'
        },
        message: "I've set a reminder for you."
      };
    } else if (input.toLowerCase().includes('schedule') || input.toLowerCase().includes('appointment')) {
      // Scheduling
      response = {
        understood: true,
        action: 'create_schedule_item',
        data: {
          title: extractTitle(input),
          time: extractTime(input) || 'tomorrow',
          duration: extractDuration(input) || 60
        },
        message: "I've added this to your schedule."
      };
    }
    
    res.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'Server error processing AI request' });
  }
});

// Generate report
app.post('/api/reports/generate', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.body;
    
    // In production, fetch activities from DB and format report
    // For demo, return mock report data
    
    const reportData = {
      id: Math.floor(Math.random() * 1000),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      period: `${startDate} to ${endDate}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalActivities: 24,
        productiveHours: 32,
        meetingsAttended: 8,
        callsMade: 15,
        taskCompleted: 18
      },
      categories: [
        { name: 'Calls', count: 15, timeSpent: 450 },
        { name: 'Meetings', count: 8, timeSpent: 360 },
        { name: 'Admin', count: 10, timeSpent: 240 },
        { name: 'Research', count: 5, timeSpent: 180 }
      ],
      topContacts: [
        { name: 'Acme Corp', interactions: 5 },
        { name: 'XYZ Inc', interactions: 3 },
        { name: 'ABC Ltd', interactions: 2 }
      ]
    };
    
    res.json(reportData);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Server error generating report' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`AIGENDA API server running on port ${PORT}`);
});

// Utility functions for natural language processing
function extractTitle(text) {
  // This is a simplified example - in production use NLP
  const common = ['log', 'record', 'schedule', 'meeting', 'call', 'with', 'about', 'for', 'a', 'an', 'the', 'remind', 'me', 'to'];
  const words = text.split(' ');
  
  // Remove common words and join the rest
  return words
    .filter(word => !common.includes(word.toLowerCase()))
    .join(' ')
    .trim() || 'Untitled';
}

function extractTime(text) {
  // Simple regex patterns for time extraction - use NLP in production
  const timeRegex = /(\d{1,2})(:\d{2})?\s*(am|pm)/i;
  const match = text.match(timeRegex);
  
  if (match) {
    return match[0];
  }
  
  // Check for relative time
  if (text.includes('tomorrow')) return 'tomorrow';
  if (text.includes('next week')) return 'next week';
  if (text.includes('tonight')) return 'tonight';
  
  return null;
}

function extractDuration(text) {
  // Simple regex for duration - use NLP in production
  const durationRegex = /(\d+)\s*(min|hour|minute)/i;
  const match = text.match(durationRegex);
  
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit === 'hour') {
      return value * 60;
    }
    return value;
  }
  
  return null;
}