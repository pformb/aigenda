// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  FaMicrophone, FaBell, FaCalendarAlt, FaTasks, 
  FaChartBar, FaCog, FaPlus, FaEllipsisH 
} from 'react-icons/fa';

// Mock data
const mockSchedule = [
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

const mockTasks = [
  { id: 1, title: 'Follow up with Acme Corp', priority: 'high', completed: false },
  { id: 2, title: 'Send proposal to new client', priority: 'medium', completed: false },
  { id: 3, title: 'Update CRM with new leads', priority: 'low', completed: true },
  { id: 4, title: 'Book flight for conference', priority: 'medium', completed: false },
];

const mockActivities = [
  { id: 1, title: 'Phone call with Client X', time: '08:45', duration: '15 min' },
  { id: 2, title: 'Sent email to Marketing team', time: '09:15', duration: '5 min' },
  { id: 3, title: 'Updated contact information', time: '10:30', duration: '10 min' },
];

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate AI suggestion after 2 seconds
    const suggestionTimer = setTimeout(() => {
      setAiSuggestion({
        text: "I notice you have a client call with Acme Corp at 9:30. Would you like me to prepare a summary of your last interaction with them?",
        actions: ["Yes, please", "No thanks"]
      });
    }, 2000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(suggestionTimer);
    };
  }, []);

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      setTimeout(() => {
        setIsRecording(false);
        // Handle the recorded message
      }, 5000);
    }
  };

  const handleAiSuggestionAction = (action) => {
    if (action === "Yes, please") {
      // Logic to prepare client summary
      setTimeout(() => {
        setAiSuggestion({
          text: "I've prepared a summary of your last 3 interactions with Acme Corp. Their main interest was in the premium package, and they requested a demo for next week.",
          actions: ["Schedule demo", "Thanks"]
        });
      }, 1000);
    } else {
      setAiSuggestion(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">AIGENDA</h1>
          <div className="flex space-x-3">
            <button className="p-2 rounded-full hover:bg-indigo-500">
              <FaBell />
            </button>
            <button className="p-2 rounded-full hover:bg-indigo-500">
              <FaCog />
            </button>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-2xl font-bold">Good {getTimeOfDay()}, Alex!</h2>
          <p className="text-indigo-100">{format(currentTime, 'EEEE, MMMM d')}</p>
        </div>
      </header>

      {/* AI Assistant */}
      {aiSuggestion && (
        <div className="bg-white mx-4 mt-4 p-4 rounded-lg shadow">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              AI
            </div>
            <div className="ml-3 flex-1">
              <p className="text-gray-800">{aiSuggestion.text}</p>
              <div className="mt-2 flex space-x-2">
                {aiSuggestion.actions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => handleAiSuggestionAction(action)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      index === 0 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b bg-white mt-4">
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center px-4 py-3 ${
            activeTab === 'schedule' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500'
          }`}
        >
          <FaCalendarAlt className="mr-2" /> Schedule
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center px-4 py-3 ${
            activeTab === 'tasks' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500'
          }`}
        >
          <FaTasks className="mr-2" /> Tasks
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex items-center px-4 py-3 ${
            activeTab === 'activity' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500'
          }`}
        >
          <FaChartBar className="mr-2" /> Activity
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        {activeTab === 'schedule' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Today's Schedule</h3>
              <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
                <FaPlus />
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              {mockSchedule.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-4 ${
                    index < mockSchedule.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex">
                    <div className="w-14 text-center">
                      <div className="text-sm font-bold">{item.time}</div>
                      <div className="text-xs text-gray-500">{item.duration}m</div>
                    </div>
                    <div className="ml-3 flex-1 border-l pl-3">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        {item.contact && `Contact: ${item.contact}`}
                        {item.location && `Location: ${item.location}`}
                        {item.notes && item.notes}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Today's Tasks</h3>
              <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
                <FaPlus />
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              {mockTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`p-4 flex items-center ${
                    index < mockTasks.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                    checked={task.completed}
                  />
                  <div className="ml-3 flex-1">
                    <div className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEllipsisH />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Today's Activity Log</h3>
              <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm flex items-center">
                Generate Report
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              {mockActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`p-4 ${
                    index < mockActivities.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex">
                    <div className="w-14 text-center">
                      <div className="text-sm font-bold">{activity.time}</div>
                      <div className="text-xs text-gray-500">{activity.duration}</div>
                    </div>
                    <div className="ml-3 flex-1 border-l pl-3">
                      <div className="font-medium">{activity.title}</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center">
          <button 
            onClick={handleVoiceRecord}
            className={`p-3 rounded-full ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-indigo-600 text-white'
            }`}
          >
            <FaMicrophone />
          </button>
          <input 
            type="text" 
            className="ml-3 flex-1 border border-gray-300 rounded-full px-4 py-2"
            placeholder={isRecording ? 'Listening...' : 'Log activity or ask for help...'}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to determine time of day greeting
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default Dashboard;