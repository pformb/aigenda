// src/services/VoiceService.js
import { useEffect, useState } from 'react';

/**
 * Custom hook for voice recognition and speech synthesis in AIGENDA
 */
export function useVoiceService() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  
  // Browser compatibility check
  const recognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  
  const synthesis = typeof window !== 'undefined' && window.speechSynthesis;
  
  const isVoiceSupported = !!recognition;
  const isSpeechSupported = !!synthesis;
  
  let recognitionInstance = null;
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isVoiceSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    recognitionInstance.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionInstance.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      
      if (result.isFinal) {
        const finalTranscript = result[0].transcript;
        setTranscript(finalTranscript);
      }
    };
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isVoiceSupported]);
  
  /**
   * Start listening for voice input
   */
  const startListening = () => {
    setTranscript('');
    
    if (!recognitionInstance) {
      setError('Speech recognition not initialized');
      return;
    }
    
    try {
      recognitionInstance.start();
    } catch (err) {
      // If already started, stop and restart
      if (err.name === 'InvalidStateError') {
        recognitionInstance.stop();
        setTimeout(() => {
          recognitionInstance.start();
        }, 100);
      } else {
        setError(`Error starting recognition: ${err.message}`);
      }
    }
  };
  
  /**
   * Stop listening for voice input
   */
  const stopListening = () => {
    if (!recognitionInstance) return;
    
    recognitionInstance.stop();
  };
  
  /**
   * Speak text using speech synthesis
   * @param {string} text - Text to speak
   * @param {object} options - Speech options (voice, rate, pitch)
   */
  const speak = (text, options = {}) => {
    if (!isSpeechSupported) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }
    
    // Cancel any ongoing speech
    if (synthesis.speaking) {
      synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Select voice if specified
    if (options.voice) {
      const voices = synthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name === options.voice || 
        voice.voiceURI === options.voice
      );
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };
    
    synthesis.speak(utterance);
  };
  
  /**
   * Stop speech synthesis
   */
  const stopSpeaking = () => {
    if (!isSpeechSupported) return;
    
    synthesis.cancel();
    setIsSpeaking(false);
  };
  
  /**
   * Get available voices for speech synthesis
   * @returns {Array} Array of available voices
   */
  const getVoices = () => {
    if (!isSpeechSupported) return [];
    
    return synthesis.getVoices();
  };
  
  // Return hook interface
  return {
    isVoiceSupported,
    isSpeechSupported,
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getVoices
  };
}

/**
 * Voice command processor for AIGENDA
 */
export class VoiceCommandProcessor {
  constructor(aiService) {
    this.aiService = aiService;
    this.commands = {
      log: this.handleLogCommand,
      remind: this.handleRemindCommand,
      schedule: this.handleScheduleCommand,
      summarize: this.handleSummarizeCommand,
      find: this.handleFindCommand,
      help: this.handleHelpCommand
    };
    
    // Command patterns for quick matching
    this.commandPatterns = {
      log: /^(log|record|note|create)\s+/i,
      remind: /^remind\s+(me\s+)?(to|about)\s+/i,
      schedule: /^(schedule|set(\s+up)?|create|add)\s+(a|an)?\s+(meeting|call|appointment)/i,
      summarize: /^(summarize|summary|recap)\s+/i,
      find: /^(find|search|look(\s+up)?|show)\s+/i,
      help: /^(help|assist|how\s+do\s+I)\s+/i
    };
  }
  
  /**
   * Process voice command
   * @param {string} command - Voice command text
   * @param {object} context - Current app context
   * @returns {Promise<object>} Processing result
   */
  async processCommand(command, context = {}) {
    // Determine command type
    const commandType = this.identifyCommandType(command);
    
    if (commandType && this.commands[commandType]) {
      // Execute specific command handler
      return await this.commands[commandType].call(this, command, context);
    } else {
      // Use general AI processing for unknown commands
      return await this.aiService.processInput(command, context);
    }
  }
  
  /**
   * Identify command type from text
   * @param {string} command - Command text
   * @returns {string|null} Command type or null if not recognized
   */
  identifyCommandType(command) {
    for (const [type, pattern] of Object.entries(this.commandPatterns)) {
      if (pattern.test(command)) {
        return type;
      }
    }
    return null;
  }
  
  /**
   * Handle activity logging commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleLogCommand(command, context) {
    // Extract activity details
    const activityText = command.replace(this.commandPatterns.log, '').trim();
    
    // Use AI to parse the activity details
    const result = await this.aiService.processInput(`Log activity: ${activityText}`, context);
    
    return {
      ...result,
      voiceResponse: `I've logged your activity: ${activityText}`
    };
  }
  
  /**
   * Handle reminder commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleRemindCommand(command, context) {
    // Extract reminder details
    const reminderText = command.replace(this.commandPatterns.remind, '').trim();
    
    // Use AI to parse the reminder details
    const result = await this.aiService.processInput(`Remind me to: ${reminderText}`, context);
    
    return {
      ...result,
      voiceResponse: `I'll remind you to ${reminderText}`
    };
  }
  
  /**
   * Handle scheduling commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleScheduleCommand(command, context) {
    // Extract schedule details
    const scheduleText = command.replace(this.commandPatterns.schedule, '').trim();
    
    // Use AI to parse the schedule details
    const result = await this.aiService.processInput(`Schedule: ${scheduleText}`, context);
    
    return {
      ...result,
      voiceResponse: `I've scheduled ${scheduleText}`
    };
  }
  
  /**
   * Handle summarize commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleSummarizeCommand(command, context) {
    // Extract what to summarize
    const summarizeText = command.replace(this.commandPatterns.summarize, '').trim();
    
    // Use AI to generate summary
    const result = await this.aiService.processInput(`Summarize ${summarizeText}`, context);
    
    return {
      ...result,
      voiceResponse: result.message
    };
  }
  
  /**
   * Handle find/search commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleFindCommand(command, context) {
    // Extract search query
    const searchText = command.replace(this.commandPatterns.find, '').trim();
    
    // Use AI to process search
    const result = await this.aiService.processInput(`Find ${searchText}`, context);
    
    return {
      ...result,
      voiceResponse: result.message
    };
  }
  
  /**
   * Handle help commands
   * @param {string} command - Command text
   * @param {object} context - Current context
   * @returns {Promise<object>} Processing result
   */
  async handleHelpCommand(command, context) {
    // Extract help topic
    const helpText = command.replace(this.commandPatterns.help, '').trim();
    
    // Use AI to provide help
    const result = await this.aiService.processInput(`Help with ${helpText}`, context);
    
    return {
      ...result,
      voiceResponse: result.message
    };
  }
}

export default { useVoiceService, VoiceCommandProcessor };