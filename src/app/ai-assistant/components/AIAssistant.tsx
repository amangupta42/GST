'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  Fade,
  Collapse
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Language as LanguageIcon,
  VolumeUp as SpeakIcon,
  VolumeOff as MuteIcon,
  History as HistoryIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Lightbulb as InsightIcon,
  Receipt as InvoiceIcon,
  Assignment as FilingIcon,
  AccountBalance as ITCIcon,
  Assessment as ComplianceIcon,
  Calculate as CalculatorIcon,
  Search as SearchIcon,
  AutoAwesome as MagicIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';

// --- START: BUG FIXES ---

// Fix for Speech Recognition API types (Errors #4, #5, #6)
// Minimal SpeechRecognition type declaration to fix "Cannot find name 'SpeechRecognition'"
type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop?: () => void;
};

// Extend the global Window interface to include non-standard speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

// Define a type for the speech recognition event to avoid implicit 'any'
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// Define a more specific type for message categories (Fix for Error #2)
type MessageCategory = 'gst_rate' | 'compliance' | 'filing' | 'invoice' | 'general';

// Define language codes as a specific type (Fix for Errors #1, #3)
type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'kn';

// --- END: BUG FIXES ---


interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  language: string;
  isBookmarked?: boolean;
  metadata?: {
    category?: 'gst_rate' | 'compliance' | 'filing' | 'invoice' | 'general';
    confidence?: number;
    sources?: string[];
    actions?: Array<{
      type: 'navigate' | 'calculate' | 'generate';
      label: string;
      value: string;
    }>;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  language: string;
  category: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  prompt: string;
  languages: string[];
}

interface AIAssistantProps {
  onNavigate?: (path: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

export const AIAssistant = ({ onNavigate }: AIAssistantProps) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'settings' | 'history' | 'help'>('settings');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'gst-rate',
      label: 'Find GST Rate',
      icon: <CalculatorIcon />,
      category: 'gst_rate',
      prompt: 'What is the GST rate for',
      languages: ['en', 'hi', 'ta', 'gu']
    },
    {
      id: 'filing-help',
      label: 'Filing Assistance',
      icon: <FilingIcon />,
      category: 'filing',
      prompt: 'Help me with GST filing for',
      languages: ['en', 'hi', 'bn', 'mr']
    },
    {
      id: 'itc-calc',
      label: 'ITC Calculator',
      icon: <ITCIcon />,
      category: 'compliance',
      prompt: 'Calculate input tax credit for',
      languages: ['en', 'hi', 'gu', 'ta']
    },
    {
      id: 'invoice-help',
      label: 'Invoice Query',
      icon: <InvoiceIcon />,
      category: 'invoice',
      prompt: 'I have a question about invoice',
      languages: ['en', 'hi', 'te', 'kn']
    },
    {
      id: 'compliance',
      label: 'Compliance Check',
      icon: <ComplianceIcon />,
      category: 'compliance',
      prompt: 'Check my compliance status for',
      languages: ['en', 'hi', 'ta', 'bn']
    }
  ], []);

  // Mock AI responses for different languages
  const mockResponses = useMemo(() => ({
    en: {
      greeting: "Hello! I'm your GST AI assistant. I can help you with GST rates, filing procedures, compliance queries, and invoice management. How can I assist you today?",
      gst_rate: "Based on the HSN code and product description, here's the applicable GST rate and detailed breakdown...",
      filing: "I'll help you with the filing process. Let me guide you through the step-by-step procedure...",
      compliance: "Your current compliance status looks good. Here are some recommendations to maintain it...",
      fallback: "I understand your query. Let me provide you with accurate information based on the latest GST regulations..."
    },
    hi: {
      greeting: "नमस्ते! मैं आपका GST AI सहायक हूं। मैं GST दरों, फाइलिंग प्रक्रिया, अनुपालन प्रश्न और चालान प्रबंधन में आपकी मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      gst_rate: "HSN कोड और उत्पाद विवरण के आधार पर, यहां लागू GST दर और विस्तृत विवरण है...",
      filing: "मैं आपको फाइलिंग प्रक्रिया में मदद करूंगा। मुझे आपको चरणबद्ध प्रक्रिया के माध्यम से मार्गदर्शन करने दें...",
      compliance: "आपकी वर्तमान अनुपालन स्थिति अच्छी लग रही है। इसे बनाए रखने के लिए यहां कुछ सुझाव हैं...",
      fallback: "मैं आपकी क्वेरी को समझता हूं। मुझे नवीनतम GST नियमों के आधार पर आपको सटीक जानकारी प्रदान करने दें..."
    },
    ta: {
      greeting: "வணக்கம்! நான் உங்கள் GST AI உதவியாளர். GST விகிதங்கள், தாக்கல் நடைமுறைகள், இணக்க கேள்விகள் மற்றும் விலைப்பட்டியல் நிர்வாகத்தில் உங்களுக்கு உதவ முடியும். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      gst_rate: "HSN குறியீடு மற்றும் தயாரிப்பு விளக்கத்தின் அடிப்படையில், இங்கே பொருந்தக்கூடிய GST விகிதம் மற்றும் விரிவான பிரிவு உள்ளது...",
      filing: "தாக்கல் செயல்முறையில் நான் உங்களுக்கு உதவுவேன். படி-படியான நடைமுறையின் மூலம் உங்களை வழிநடத்த அனுமதிக்கவும்...",
      compliance: "உங்கள் தற்போதைய இணக்க நிலை நன்றாக உள்ளது. அதை பராமரிக்க சில பரிந்துரைகள் இங்கே உள்ளன...",
      fallback: "உங்கள் கேள்வியை நான் புரிந்துகொள்கிறேன். சமீபத்திய GST விதிமுறைகளின் அடிப்படையில் உங்களுக்கு துல்லியமான தகவலை வழங்க அனுமதிக்கவும்..."
    }
  }), []);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      messages: [{
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: mockResponses[selectedLanguage as keyof typeof mockResponses]?.greeting || mockResponses.en.greeting,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        metadata: { category: 'general', confidence: 1.0 }
      }],
      createdAt: new Date().toISOString(),
      language: selectedLanguage,
      category: 'general'
    };

    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  }, [selectedLanguage, mockResponses]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !currentSession) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
      language: selectedLanguage
    };

    // Add user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    };
    setCurrentSession(updatedSession);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const category = detectCategory(content);
      const response = generateResponse(content, category);

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: response.content,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        metadata: {
          category,
          confidence: response.confidence,
          sources: response.sources,
          actions: response.actions
        }
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        title: generateSessionTitle(content)
      };

      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
      setIsTyping(false);

      // Speak response if voice is enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        speakText(response.content);
      }
    }, 1000 + Math.random() * 2000); // Realistic response delay

    setInputMessage('');
  }, [currentSession, selectedLanguage, voiceEnabled]);

  const detectCategory = (content: string): MessageCategory => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('rate') || lowerContent.includes('hsn') || lowerContent.includes('tax')) return 'gst_rate';
    if (lowerContent.includes('file') || lowerContent.includes('return') || lowerContent.includes('gstr')) return 'filing';
    if (lowerContent.includes('itc') || lowerContent.includes('credit')) return 'compliance';
    if (lowerContent.includes('invoice') || lowerContent.includes('bill')) return 'invoice';
    return 'general';
  };

  const generateResponse = (query: string, category: MessageCategory) => {
    const responses = mockResponses[selectedLanguage as keyof typeof mockResponses] || mockResponses.en;
    let confidence = 0.9;
    let sources = ['GST Portal', 'CBIC Guidelines', 'Tax Regulations 2024'];
    let actions: any[] = [];

    let content: string;
    if (category === 'gst_rate' || category === 'filing' || category === 'compliance') {
      content = responses[category];
    } else if (category === 'invoice') {
      // 'invoice' is not in the response object, fallback
      content = responses.fallback;
    } else {
      content = responses.fallback;
    }

    // Add specific actions based on category
    if (category === 'gst_rate') {
      actions.push({ type: 'calculate', label: 'Calculate Tax', value: 'gst-calculator' });
      content += '\n\n📊 Would you like me to calculate the exact tax amount for your transaction?';
    } else if (category === 'filing') {
      actions.push({ type: 'navigate', label: 'Start Filing', value: '/filing' });
      content += '\n\n📋 I can guide you to the filing section to begin the process.';
    } else if (category === 'invoice') {
      actions.push({ type: 'generate', label: 'Generate Invoice', value: 'invoice-generator' });
      content += '\n\n🧾 Would you like help generating a compliant invoice?';
    }

    return { content, confidence, sources, actions };
  };

  const generateSessionTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (words.length === 5 ? '...' : '');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  }, [selectedLanguage]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    if (!currentSession) {
      createNewSession();
      // Wait for session to be created
      setTimeout(() => {
        setInputMessage(action.prompt + ' ');
        inputRef.current?.focus();
      }, 100);
    } else {
      setInputMessage(action.prompt + ' ');
      inputRef.current?.focus();
    }
  }, [currentSession, createNewSession]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const toggleBookmark = useCallback((messageId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: currentSession.messages.map(msg =>
        msg.id === messageId ? { ...msg, isBookmarked: !msg.isBookmarked } : msg
      )
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  const renderMessage = (message: Message) => (
    <Box
      key={message.id}
      sx={{
        display: 'flex',
        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Box sx={{ maxWidth: '80%', display: 'flex', gap: 1 }}>
        {message.type === 'ai' && (
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <AIIcon fontSize="small" />
          </Avatar>
        )}

        <Paper
          sx={{
            p: 2,
            bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
            color: message.type === 'user' ? 'white' : 'text.primary',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {message.content}
          </Typography>

          {message.metadata?.actions && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {message.metadata.actions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (action.type === 'navigate' && onNavigate) {
                      onNavigate(action.value);
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>

            {message.type === 'ai' && (
              <>
                <IconButton
                  size="small"
                  onClick={() => toggleBookmark(message.id)}
                >
                  {message.isBookmarked ? (
                    <BookmarkedIcon fontSize="small" />
                  ) : (
                    <BookmarkIcon fontSize="small" />
                  )}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => speakText(message.content)}
                  disabled={isSpeaking}
                >
                  <SpeakIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Paper>

        {message.type === 'user' && (
          <Avatar sx={{ bgcolor: 'grey.500', width: 32, height: 32 }}>
            U
          </Avatar>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Intelligent GST compliance guidance with multi-language support and voice commands
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.filter(action => action.languages.includes(selectedLanguage)).map((action) => (
                  <Grid item xs={6} sm={4} md={2.4} key={action.id}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={action.icon}
                      onClick={() => handleQuickAction(action)}
                      sx={{ height: 60, flexDirection: 'column', gap: 0.5 }}
                    >
                      <Typography variant="caption" textAlign="center">
                        {action.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              <Box sx={{ p: 2 }}>
                {currentSession?.messages.map(renderMessage)}

                {isTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <AIIcon fontSize="small" />
                      </Avatar>
                      <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <CircularProgress size={8} />
                          <CircularProgress size={8} sx={{ animationDelay: '0.2s' }} />
                          <CircularProgress size={8} sx={{ animationDelay: '0.4s' }} />
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>
            </CardContent>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={3}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask me anything about GST... (${LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName})`}
                  disabled={isTyping}
                />

                <IconButton
                  color="primary"
                  onClick={startVoiceInput}
                  disabled={isListening || isTyping}
                >
                  <Badge color="error" variant="dot" invisible={!isListening}>
                    {isListening ? <MicIcon /> : <MicOffIcon />}
                  </Badge>
                </IconButton>

                <IconButton
                  color="primary"
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Language Selector */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LanguageIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Language</Typography>
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>Select Language</InputLabel>
                    <Select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      label="Select Language"
                    >
                      {LANGUAGES.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.name})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={voiceEnabled}
                          onChange={(e) => setVoiceEnabled(e.target.checked)}
                        />
                      }
                      label="Voice Responses"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Session History */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Chats</Typography>
                    <IconButton size="small" onClick={() => createNewSession()}>
                      <MagicIcon />
                    </IconButton>
                  </Box>

                  <List dense>
                    {sessions.slice(0, 5).map((session) => (
                      <ListItem
                        key={session.id}
                        button
                        selected={currentSession?.id === session.id}
                        onClick={() => setCurrentSession(session)}
                      >
                        <ListItemText
                          primary={session.title}
                          secondary={new Date(session.createdAt).toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => {
                      setDialogType('history');
                      setDialogOpen(true);
                    }}
                  >
                    View All History
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Insights */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsightIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">AI Insights</Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      GST Rate Update
                    </Typography>
                    <Typography variant="caption">
                      New rates effective from Oct 1, 2024
                    </Typography>
                  </Alert>

                  <Alert severity="success" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Filing Reminder
                    </Typography>
                    <Typography variant="caption">
                      GSTR-1 due in 3 days
                    </Typography>
                  </Alert>

                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="medium">
                      Compliance Alert
                    </Typography>
                    <Typography variant="caption">
                      ITC mismatch detected - Review needed
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'settings' && 'AI Assistant Settings'}
          {dialogType === 'history' && 'Chat History'}
          {dialogType === 'help' && 'Help & Support'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'settings' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Voice Settings
              </Typography>
              <FormControlLabel
                control={<Switch checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} />}
                label="Enable voice responses"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Auto-translate responses"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Smart suggestions"
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Privacy Settings
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Save conversation history"
              />
              <FormControlLabel
                control={<Switch />}
                label="Share usage analytics"
              />
            </Box>
          )}

          {dialogType === 'history' && (
            <Box sx={{ mt: 2 }}>
              {sessions.map((session) => (
                <Paper key={session.id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {session.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {session.messages.length} messages • {new Date(session.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">Continue</Button>
                    <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                    <Button size="small" variant="outlined" startIcon={<ShareIcon />}>Share</Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {dialogType === 'help' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                How to Use AI Assistant
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Voice Commands"
                    secondary="Click the microphone to speak your questions in your preferred language"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Quick Actions"
                    secondary="Use predefined buttons for common queries like GST rates and filing help"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Multi-language Support"
                    secondary="Switch between 8 Indian languages for questions and responses"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Smart Suggestions"
                    secondary="AI provides actionable buttons and recommendations with each response"
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {dialogType === 'settings' && (
            <Button variant="contained">Save Settings</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};