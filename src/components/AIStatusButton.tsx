'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bot, CheckCircle, AlertTriangle, XCircle, Send, Clock, Zap, Brain, Play, Loader2, Circle, CheckCircle2, Wrench, RefreshCw, Activity, MessageCircle, Mic, MicOff, Calendar, Volume2 } from 'lucide-react';

interface Suggestion {
  id: number;
  text: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduledFor?: string;
  location?: string;
  componentName?: string;
}

interface HealthResult {
  endpoint: string;
  name?: string;
  status: string;
  statusCode?: number;
  duration?: number;
  error?: string;
}

interface Issue {
  id: number;
  type: string;
  description: string;
  status: 'detected' | 'fixing' | 'fixed' | 'failed';
  detectedAt: string;
  fixedAt?: string;
}

interface AIActivity {
  id: number;
  timestamp: string;
  action: string;
  status: 'running' | 'success' | 'error';
  details?: string;
}

interface LeaguePhase {
  league: string;
  phaseId: string;
  phaseName: string;
  seasonYear: string;
  percentComplete: number;
  daysRemaining: number;
  isActive: boolean;
}

interface AIBrainState {
  isRunning: boolean;
  lastCheck: string | null;
  currentDate: string;
  timezone: string;
  leaguePhases: Record<string, LeaguePhase>;
  issues: any[];
  criticalIssues: any[];
  unreadNotifications: number;
  patternsLearned: number;
}

interface AIStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  statusEmoji: string;
  statusColor: string;
  lastCheckFormatted: string;
  timeAgo: string;
  nextCheckFormatted: string;
  message: string;
  currentAction?: string;
  healthResults?: HealthResult[];
  issues?: Issue[];
  activities?: AIActivity[];
  suggestions: Suggestion[];
  aiExpertise: string[];
  yourTeams: string[];
}

export function AIStatusButton() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      // Try HS Football specific endpoint first, fallback to main dashboard
      const endpoints = [
        '/api/ai-status',
        'https://www.wright-sports.com/api/ai-status'
      ];
      
      let data = null;
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      if (data) {
        setStatus(data);
      } else {
        throw new Error('All endpoints failed');
      }
    } catch (err) {
      setStatus({
        status: 'error',
        statusEmoji: '❌',
        statusColor: 'red',
        lastCheckFormatted: 'Unknown',
        timeAgo: '?',
        nextCheckFormatted: 'Unknown',
        message: 'Failed to fetch status',
        suggestions: [],
        aiExpertise: [],
        yourTeams: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'border-gray-500 text-gray-400 hover:bg-gray-500/20';
    switch (status.status) {
      case 'healthy': return 'border-green-500 text-green-400 hover:bg-green-500/20';
      case 'warning': return 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/20';
      case 'error': return 'border-red-500 text-red-400 hover:bg-red-500/20';
      default: return 'border-gray-500 text-gray-400 hover:bg-gray-500/20';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 ${getStatusColor()}`}
        title="AI Brain - Full Intelligence System"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        <span>AI</span>
        {status?.status === 'healthy' && (
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </button>

      {isModalOpen && status && (
        <AIStatusModal 
          status={status} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchStatus}
        />
      )}
    </>
  );
}

function AIStatusModal({ 
  status, 
  onClose, 
  onRefresh 
}: { 
  status: AIStatus; 
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'status' | 'chat' | 'brain'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, intent?: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [brainState, setBrainState] = useState<AIBrainState | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  useEffect(() => {
    fetchBrainState();
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
    }
    
    // Add welcome message
    setChatMessages([{
      role: 'assistant',
      content: '👋 Hey! I\'m your AI brain for Texas HS Football tracking. Ask me anything about James Martin HS Warriors, district standings, playoff scenarios, or any team in Texas!'
    }]);
  }, []);
  
  const fetchBrainState = async () => {
    try {
      const endpoints = [
        '/api/brain-ai',
        'https://www.wright-sports.com/api/ai-brain'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setBrainState(data.state);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to fetch brain state:', error);
    }
  };

  const handleChatSubmit = async (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || chatLoading) return;
    
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatLoading(true);
    
    try {
      // Use local Brain AI endpoint (which proxies to main dashboard)
      const res = await fetch('/api/brain-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'chat',
          message: text,
          context: 'tx-hs-football'
        })
      });
      const data = await res.json();
      
      const response = data.response || data.answer || 'I processed your request but have no response.';
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        intent: data.intent 
      }]);
      
      fetchBrainState();
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startVoiceInput = useCallback(() => {
    if (!voiceSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      
      if (event.results[0].isFinal) {
        setIsListening(false);
        handleChatSubmit(transcript);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceSupported]);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const getLeagueEmoji = (league: string) => {
    switch (league) {
      case 'NFL': return '🏈';
      case 'NBA': return '🏀';
      case 'NHL': return '🏒';
      case 'MLB': return '⚾';
      case 'NCAAF': return '🎓';
      case 'HS-Football': return '🏫';
      default: return '🏆';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Brain Command Center</h2>
              <p className="text-sm text-gray-400">Full Claude Intelligence • TX HS Football</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('brain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'brain'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            Brain Status
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            System Health
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-100 p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask me anything about Texas HS football..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  disabled={chatLoading}
                />
                {voiceSupported && (
                  <button
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    className={`p-2 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <button
                  onClick={() => handleChatSubmit()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'brain' && brainState && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Brain Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Status</div>
                    <div className="text-white font-medium">
                      {brainState.isRunning ? '🟢 Running' : '🔴 Offline'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Last Check</div>
                    <div className="text-white font-medium">
                      {brainState.lastCheck ? new Date(brainState.lastCheck).toLocaleTimeString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Timezone</div>
                    <div className="text-white font-medium">{brainState.timezone}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Patterns Learned</div>
                    <div className="text-white font-medium">{brainState.patternsLearned}</div>
                  </div>
                </div>
              </div>

              {/* League Phases */}
              {Object.keys(brainState.leaguePhases).length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Season Tracking
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(brainState.leaguePhases).map(([league, phase]) => (
                      <div key={league} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getLeagueEmoji(league)}</span>
                          <span className="text-white font-medium">{league}</span>
                          <span className="text-gray-400 text-sm">• {phase.phaseName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${phase.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-sm">{phase.percentComplete}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">System Health</h3>
                  <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl`}>{status.statusEmoji}</div>
                  <div>
                    <div className="text-xl font-bold text-white">{status.message}</div>
                    <div className="text-sm text-gray-400">Last checked: {status.timeAgo}</div>
                  </div>
                </div>
              </div>

              {/* Health Results */}
              {status.healthResults && status.healthResults.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">API Endpoints</h4>
                  <div className="space-y-2">
                    {status.healthResults.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{result.name || result.endpoint}</span>
                        <span
                          className={`${
                            result.status === 'healthy'
                              ? 'text-green-400'
                              : result.status === 'slow'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {result.status === 'healthy' ? '✓' : result.status === 'slow' ? '⚠' : '✗'}{' '}
                          {result.duration ? `${result.duration}ms` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIStatusButton;
