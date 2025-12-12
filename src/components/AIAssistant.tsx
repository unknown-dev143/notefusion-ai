import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  List,
  Select,
  Avatar,
  Badge,
  Empty,
  Slider,
  Rate,
  Upload,
  Switch,
  message,
  Tabs,
  Row,
  Col,
  Tag,
  Modal,
  Radio,
  Statistic,
  Divider,
} from 'antd';

import {
  SendOutlined,
  PlusOutlined,
  HistoryOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  RobotOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ClearOutlined,
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
  StopOutlined,
  AudioOutlined,
  ThunderboltOutlined,
  MoreOutlined,
  FileOutlined,
  TagsOutlined,
  BulbOutlined,
  FireOutlined,
  MessageOutlined,
} from '@ant-design/icons';

import { aiTutorAPI, TutoringSession, TutorMessage, TutorPersona } from '../services/aiTutorAPI';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Enhanced Interfaces
interface AISuggestion {
  id: string;
  type: 'summary' | 'tags' | 'improvement' | 'outline' | 'rewrite' | 'expand' | 'translate' | 'analyze' | 'research' | 'creative';
  title: string;
  content: string;
  icon: React.ReactNode;
  confidence: number;
  timestamp: string;
  isApplied: boolean;
  feedback?: 'positive' | 'negative' | 'neutral';
  metadata?: {
    wordCount?: number;
    readingTime?: number;
    complexity?: 'low' | 'medium' | 'high';
    sentiment?: 'positive' | 'negative' | 'neutral';
    keywords?: string[];
    sources?: string[];
    language?: string;
  };
}

interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  tags: string[];
  settings: ConversationSettings;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
  temperature?: number;
  isBookmarked?: boolean;
  feedback?: MessageFeedback;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
}

interface MessageFeedback {
  rating: number;
  comment?: string;
  helpful: boolean;
  timestamp: string;
}

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'link' | 'code' | 'data';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
}

interface MessageMetadata {
  processingTime: number;
  cost?: number;
  modelVersion: string;
  contextUsed: string[];
  relatedDocuments: string[];
  confidence: number;
}

interface ConversationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableMemory: boolean;
  enableWebSearch: boolean;
  enableCodeExecution: boolean;
  enableImageGeneration: boolean;
  language: string;
  responseStyle: 'formal' | 'casual' | 'technical' | 'creative';
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
  version: string;
  specialty: string[];
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: ValidationRule[];
}

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

interface AIUsage {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  averageResponseTime: number;
  successRate: number;
  modelUsage: { [modelId: string]: number };
  dailyUsage: { date: string; tokens: number; cost: number }[];
  monthlyUsage: { month: string; tokens: number; cost: number }[];
}

interface AIAPIConfig {
  provider: string;
  apiKey: string;
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;
  enableStreaming: boolean;
  enableMemory: boolean;
  enableWebSearch: boolean;
  customHeaders?: Record<string, string>;
}

interface AISettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableAutoSave: boolean;
  enableSpellCheck: boolean;
  enableGrammarCheck: boolean;
  enablePlagiarismCheck: boolean;
  enableFactCheck: boolean;
  enableCitationGeneration: boolean;
  enableAutoComplete: boolean;
  enableSmartSuggestions: boolean;
  enableContextAwareness: boolean;
  enableMultiLanguage: boolean;
  enableVoiceInput: boolean;
  enableVoiceOutput: boolean;
  customPrompts: AITemplate[];
  apiConfigs: AIAPIConfig[];
  privacy: PrivacySettings;
}

interface PrivacySettings {
  shareUsageData: boolean;
  shareConversations: boolean;
  enableEncryption: boolean;
  dataRetention: number;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
}

interface AIKnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: KnowledgeDocument[];
  categories: string[];
  isPublic: boolean;
  lastUpdated: string;
  size: number;
  documentCount: number;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  url?: string;
  metadata: DocumentMetadata;
  embeddings?: number[];
  indexedAt: string;
}

interface DocumentMetadata {
  author?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  language: string;
  wordCount: number;
  readingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  summary?: string;
  keywords?: string[];
}

interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  enabled: boolean;
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  settings: WorkflowSettings;
}

interface WorkflowStep {
  id: string;
  type: 'input' | 'process' | 'decision' | 'output' | 'integration';
  name: string;
  description: string;
  config: StepConfig;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'event' | 'webhook';
  config: TriggerConfig;
  isActive: boolean;
}

interface StepConfig {
  [key: string]: any;
}

interface TriggerConfig {
  [key: string]: any;
}

interface WorkflowSettings {
  timeout: number;
  retries: number;
  enableLogging: boolean;
  enableNotifications: boolean;
  errorHandling: 'stop' | 'continue' | 'retry';
}

const AIAssistant: React.FC = () => {
  // Enhanced State Management
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel] = useState<string>('gpt-4');
  const [temperature] = useState<number>(0.7);
  const [maxTokens] = useState<number>(2000);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [templatesModalVisible, setTemplatesModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [knowledgeBaseModalVisible, setKnowledgeBaseModalVisible] = useState(false);
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory] = useState<string>('all');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
 const [selectedLanguage] = useState<string>('en');
  const [responseStyle, setResponseStyle] = useState<'formal' | 'casual' | 'technical' | 'creative'>('casual');
  const [enableMemory] = useState(true);
  const [enableWebSearch] = useState(false);
  const [enableCodeExecution] = useState(false);
  const [enableImageGeneration] = useState(false);
  const [autoSave] = useState(true);
  const [showSuggestions] = useState(true);
  const [enableSpellCheck] = useState(true);
  const [enableGrammarCheck] = useState(true);
  const [enableFactCheck] = useState(false);
  const [enableCitationGeneration] = useState(false);
  const [enableAutoComplete] = useState(true);
  const [enableContextAwareness] = useState(true);
  const [enableMultiLanguage] = useState(true);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>([]);
  const [currentTutoringSession, setCurrentTutoringSession] = useState<TutoringSession | null>(null);
  const [tutoringMessages, setTutoringMessages] = useState<TutorMessage[]>([]);
  const [tutorPersonas, setTutorPersonas] = useState<Record<string, TutorPersona>>({});
  const [selectedPersona, setSelectedPersona] = useState<string>('general');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [usage, setUsage] = useState<AIUsage>({
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    averageResponseTime: 0,
    successRate: 100,
    modelUsage: {},
    dailyUsage: [],
    monthlyUsage: []
  });
  const [models, setModels] = useState<AIModel[]>([
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex tasks',
      capabilities: ['text', 'code', 'reasoning', 'analysis'],
      maxTokens: 8192,
      costPerToken: 0.00003,
      isAvailable: true,
      version: '4.0',
      specialty: ['reasoning', 'analysis', 'coding']
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient for most tasks',
      capabilities: ['text', 'code', 'conversation'],
      maxTokens: 4096,
      costPerToken: 0.000002,
      isAvailable: true,
      version: '3.5',
      specialty: ['conversation', 'quick-response']
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      provider: 'Anthropic',
      description: 'Constitutional AI with strong safety',
      capabilities: ['text', 'analysis', 'reasoning'],
      maxTokens: 100000,
      costPerToken: 0.000015,
      isAvailable: true,
      version: '3.0',
      specialty: ['analysis', 'safety', 'long-context']
    }
  ]);
  const [templates, setTemplates] = useState<AITemplate[]>([
    {
      id: '1',
      name: 'Email Writer',
      description: 'Generate professional emails',
      category: 'writing',
      prompt: 'Write a professional email about {topic} to {recipient}',
      variables: [
        { name: 'topic', type: 'text', description: 'Email topic', required: true },
        { name: 'recipient', type: 'text', description: 'Email recipient', required: true }
      ],
      isPublic: true,
      usageCount: 156,
      rating: 4.5,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Code Review',
      description: 'Review and improve code',
      category: 'coding',
      prompt: 'Review this code and suggest improvements: {code}',
      variables: [
        { name: 'code', type: 'text', description: 'Code to review', required: true }
      ],
      isPublic: true,
      usageCount: 89,
      rating: 4.8,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Study Plan',
      description: 'Create personalized study plans',
      category: 'education',
      prompt: 'Create a study plan for {subject} focusing on {topics}',
      variables: [
        { name: 'subject', type: 'text', description: 'Subject name', required: true },
        { name: 'topics', type: 'multiselect', description: 'Topics to focus on', required: true, options: ['basics', 'advanced', 'practice', 'theory'] }
      ],
      isPublic: true,
      usageCount: 234,
      rating: 4.7,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    }
  ]);
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeBase[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [settings, setSettings] = useState<AISettings>({
    defaultModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    enableAutoSave: true,
    enableSpellCheck: true,
    enableGrammarCheck: true,
    enablePlagiarismCheck: false,
    enableFactCheck: false,
    enableCitationGeneration: false,
    enableAutoComplete: true,
    enableSmartSuggestions: true,
    enableContextAwareness: true,
    enableMultiLanguage: true,
    enableVoiceInput: false,
    enableVoiceOutput: false,
    customPrompts: [],
    apiConfigs: [],
    privacy: {
      shareUsageData: false,
      shareConversations: false,
      enableEncryption: true,
      dataRetention: 30,
      allowAnalytics: false,
      allowPersonalization: true
    }
  });

  // Enhanced AI Functions
  const generateSuggestions = useCallback(async () => {
    if (!inputText.trim()) {
      message.warning('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate AI API call
      const response = await simulateAICall(inputText, {
        model: selectedModel,
        temperature,
        maxTokens,
        enableMemory,
        enableWebSearch,
        enableContextAwareness,
        language: selectedLanguage,
        responseStyle
      });

      const newSuggestions: AISuggestion[] = [
        {
          id: '1',
          type: 'summary',
          title: 'Summary',
          content: response.summary,
          icon: <FileTextOutlined />,
          confidence: response.confidence.summary,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            wordCount: response.summary.split(' ').length,
            readingTime: Math.ceil(response.summary.split(' ').length / 200),
            complexity: response.complexity,
            sentiment: response.sentiment as 'positive' | 'negative' | 'neutral',
            keywords: response.keywords,
            language: selectedLanguage
          }
        },
        {
          id: '2',
          type: 'tags',
          title: 'Suggested Tags',
          content: response.tags.join(', '),
          icon: <TagsOutlined />,
          confidence: response.confidence.tags,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            keywords: response.tags,
            language: selectedLanguage
          }
        },
        {
          id: '3',
          type: 'improvement',
          title: 'Writing Improvements',
          content: response.improvements.join('\n'),
          icon: <ThunderboltOutlined />,
          confidence: response.confidence.improvements,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            wordCount: response.improvements.join(' ').split(' ').length,
            complexity: 'medium' as const,
            sentiment: 'neutral',
            language: selectedLanguage
          }
        },
        {
          id: '4',
          type: 'outline',
          title: 'Key Points',
          content: response.outline.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n'),
          icon: <BulbOutlined />,
          confidence: response.confidence.outline,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            wordCount: response.outline.join(' ').split(' ').length,
            readingTime: Math.ceil(response.outline.length / 10),
            complexity: response.complexity,
            sentiment: response.sentiment as 'positive' | 'negative' | 'neutral',
            keywords: response.keywords,
            language: selectedLanguage
          }
        },
        {
          id: '5',
          type: 'rewrite',
          title: 'Rewritten Version',
          content: response.rewrite,
          icon: <EditOutlined />,
          confidence: response.confidence.rewrite,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            wordCount: response.rewrite.split(' ').length,
            readingTime: Math.ceil(response.rewrite.split(' ').length / 200),
            complexity: response.complexity,
            sentiment: response.sentiment as 'positive' | 'negative' | 'neutral',
            language: selectedLanguage
          }
        },
        {
          id: '6',
          type: 'expand',
          title: 'Expanded Content',
          content: response.expansion,
          icon: <PlusOutlined />,
          confidence: response.confidence.expansion,
          timestamp: new Date().toISOString(),
          isApplied: false,
          metadata: {
            wordCount: response.expansion.split(' ').length,
            readingTime: Math.ceil(response.expansion.split(' ').length / 200),
            complexity: response.complexity,
            sentiment: response.sentiment as 'positive' | 'negative' | 'neutral',
            keywords: response.keywords,
            language: selectedLanguage
          }
        }
      ];
      
      setSuggestions(newSuggestions);
      updateUsage({
        tokens: response.tokens,
        cost: response.cost,
        responseTime: response.responseTime,
        success: true,
        model: selectedModel
      });
      message.success('AI suggestions generated!');
    } catch (error) {
      message.error('Failed to generate suggestions');
      updateUsage({
        tokens: 0,
        cost: 0,
        responseTime: 0,
        success: false,
        model: selectedModel
      });
    } finally {
      setLoading(false);
    }
  }, [inputText, selectedModel, temperature, maxTokens, enableMemory, enableWebSearch, enableContextAwareness, selectedLanguage, responseStyle]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) {
      message.warning('Please enter a message or upload a file');
      return;
    }

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
      attachments: uploadedFiles,
      metadata: {
        processingTime: 0,
        modelVersion: selectedModel,
        contextUsed: [],
        relatedDocuments: [],
        confidence: 1.0
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setUploadedFiles([]);

    try {
      if (isStreaming) {
        await startStreamingResponse(userMessage);
      } else {
        const assistantMessage = await generateResponse(userMessage);
        setMessages(prev => [...prev, assistantMessage]);
      }

      if (autoSave && currentConversation) {
        saveConversation();
      }
    } catch (error) {
      message.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  }, [inputText, uploadedFiles, selectedModel, isStreaming, autoSave, currentConversation]);

  const generateResponse = useCallback(async (userMessage: AIMessage): Promise<AIMessage> => {
    setLoading(true);
    
    try {
      const response = await simulateAICall(userMessage.content, {
        model: selectedModel,
        temperature,
        maxTokens,
        enableMemory,
        enableWebSearch,
        enableContextAwareness,
        language: selectedLanguage,
        responseStyle,
        conversationHistory: messages.slice(-10)
      });

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        tokens: response.tokens,
        model: selectedModel,
        temperature,
        metadata: {
          processingTime: response.responseTime,
          cost: response.cost,
          modelVersion: selectedModel,
          contextUsed: response.contextUsed || [],
          relatedDocuments: response.relatedDocuments || [],
          confidence: response.confidence.overall
        }
      };

      updateUsage({
        tokens: response.tokens,
        cost: response.cost,
        responseTime: response.responseTime,
        success: true,
        model: selectedModel
      });

      return assistantMessage;
    } catch (error) {
      updateUsage({
        tokens: 0,
        cost: 0,
        responseTime: 0,
        success: false,
        model: selectedModel
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedModel, temperature, maxTokens, enableMemory, enableWebSearch, enableContextAwareness, selectedLanguage, responseStyle, messages]);

  const startStreamingResponse = useCallback(async (userMessage: AIMessage) => {
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const stream = await simulateStreamingResponse(userMessage.content, {
        model: selectedModel,
        temperature,
        maxTokens,
        enableMemory,
        enableWebSearch,
        enableContextAwareness,
        language: selectedLanguage,
        responseStyle,
        conversationHistory: messages.slice(-10)
      });

      for await (const chunk of stream) {
        setStreamingContent(prev => prev + chunk);
      }

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamingContent,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        temperature,
        metadata: {
          processingTime: 0,
          modelVersion: selectedModel,
          contextUsed: [],
          relatedDocuments: [],
          confidence: 0.9
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('Streaming failed');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [selectedModel, temperature, maxTokens, enableMemory, enableWebSearch, enableContextAwareness, selectedLanguage, responseStyle, messages, streamingContent]);

  const applySuggestion = useCallback((suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      setInputText(suggestion.content);
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, isApplied: true, feedback: 'positive' } : s
      ));
      message.success('Suggestion applied!');
    }
  }, [suggestions]);

  const createNewConversation = useCallback(() => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      tags: [],
      settings: {
        model: selectedModel,
        temperature,
        maxTokens,
        systemPrompt: '',
        enableMemory,
        enableWebSearch,
        enableCodeExecution,
        enableImageGeneration,
        language: selectedLanguage,
        responseStyle
      }
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    setMessages([]);
    message.success('New conversation created');
  }, [selectedModel, temperature, maxTokens, enableMemory, enableWebSearch, enableCodeExecution, enableImageGeneration, selectedLanguage, responseStyle]);

  const saveConversation = useCallback(() => {
    if (!currentConversation) return;

    const updatedConversation: AIConversation = {
      ...currentConversation,
      messages,
      updatedAt: new Date().toISOString(),
      settings: {
        model: selectedModel,
        temperature,
        maxTokens,
        systemPrompt: '',
        enableMemory,
        enableWebSearch,
        enableCodeExecution,
        enableImageGeneration,
        language: selectedLanguage,
        responseStyle
      }
    };

    setConversations(prev => prev.map(c => 
      c.id === currentConversation.id ? updatedConversation : c
    ));
    setCurrentConversation(updatedConversation);
  }, [currentConversation, messages, selectedModel, temperature, maxTokens, enableMemory, enableWebSearch, enableCodeExecution, enableImageGeneration, selectedLanguage, responseStyle]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
    message.success('Conversation deleted');
  }, [currentConversation]);

  const updateUsage = useCallback((usageData: {
    tokens: number;
    cost: number;
    responseTime: number;
    success: boolean;
    model: string;
  }) => {
    setUsage(prev => {
      const newTotalTokens = prev.totalTokens + usageData.tokens;
      const newTotalCost = prev.totalCost + usageData.cost;
      const newRequestCount = prev.requestCount + 1;
      const newAverageResponseTime = (prev.averageResponseTime * prev.requestCount + usageData.responseTime) / newRequestCount;
      const newSuccessRate = prev.successRate * (prev.requestCount / newRequestCount) + (usageData.success ? 100 / newRequestCount : 0);

      const today = new Date().toISOString().split('T')[0];
      const todayUsage = prev.dailyUsage.find(d => d.date === today);
      const newDailyUsage = todayUsage 
        ? prev.dailyUsage.map(d => d.date === today ? { ...d, tokens: d.tokens + usageData.tokens, cost: d.cost + usageData.cost } : d)
        : [...prev.dailyUsage, { date: today, tokens: usageData.tokens, cost: usageData.cost }];

      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthUsage = prev.monthlyUsage.find(m => m.month === currentMonth);
      const newMonthlyUsage = currentMonthUsage
        ? prev.monthlyUsage.map(m => m.month === currentMonth ? { ...m, tokens: m.tokens + usageData.tokens, cost: m.cost + usageData.cost } : m)
        : [...prev.monthlyUsage, { month: currentMonth, tokens: usageData.tokens, cost: usageData.cost }];

      return {
        ...prev,
        totalTokens: newTotalTokens,
        totalCost: newTotalCost,
        requestCount: newRequestCount,
        averageResponseTime: newAverageResponseTime,
        successRate: newSuccessRate,
        modelUsage: {
          ...prev.modelUsage,
          [usageData.model]: (prev.modelUsage[usageData.model] || 0) + usageData.tokens
        },
        dailyUsage: newDailyUsage,
        monthlyUsage: newMonthlyUsage
      };
    });
  }, []);

  const startVoiceRecording = useCallback(() => {
    setVoiceRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setVoiceRecording(false);
      setVoiceTranscript('This is a simulated voice transcript. In a real implementation, this would be the actual speech-to-text result.');
      setInputText('This is a simulated voice transcript. In a real implementation, this would be the actual speech-to-text result.');
      message.success('Voice recording completed');
    }, 3000);
  }, []);

  const stopVoiceRecording = useCallback(() => {
    setVoiceRecording(false);
    message.info('Voice recording stopped');
  }, []);

  const applyTemplate = useCallback((template: AITemplate) => {
    setSelectedTemplate(template);
    // In a real implementation, this would open a modal to fill in template variables
    message.info(`Template "${template.name}" selected. Please fill in the variables.`);
  }, []);

  const exportConversation = useCallback(() => {
    if (!currentConversation) {
      message.warning('No conversation to export');
      return;
    }

    const exportData = {
      conversation: currentConversation,
      messages,
      exportedAt: new Date().toISOString(),
      format: 'json'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${currentConversation.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Conversation exported successfully');
  }, [currentConversation, messages]);

  const importConversation = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.conversation && data.messages) {
          setConversations(prev => [data.conversation, ...prev]);
          setCurrentConversation(data.conversation);
          setMessages(data.messages);
          message.success('Conversation imported successfully');
        } else {
          message.error('Invalid conversation file format');
        }
      } catch (error) {
        message.error('Failed to import conversation');
      }
    };
    reader.readAsText(file);
  }, []);

  // Simulated AI API functions
  const simulateAICall = async (text: string, options: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return {
      content: `This is a simulated AI response to: "${text}". In a real implementation, this would be an actual AI model response.`,
      summary: `This is a summary of the provided text: ${text.substring(0, 100)}...`,
      tags: ['ai', 'assistant', 'simulation', 'demo'],
      improvements: ['Consider adding more detail', 'Check grammar and spelling', 'Add examples for clarity'],
      outline: ['Main point 1', 'Supporting detail A', 'Supporting detail B', 'Main point 2', 'Conclusion'],
      rewrite: `This is a rewritten version of the text with improved flow and clarity: ${text}`,
      expansion: `This is an expanded version of the original text with additional context and detail: ${text}`,
      confidence: {
        overall: 0.85,
        summary: 0.9,
        tags: 0.8,
        improvements: 0.75,
        outline: 0.88,
        rewrite: 0.82,
        expansion: 0.79
      },
      complexity: 'medium' as const,
      sentiment: 'neutral',
      keywords: ['ai', 'text', 'analysis', 'simulation'],
      tokens: Math.floor(text.length / 4) + 150,
      cost: (Math.floor(text.length / 4) + 150) * 0.00003,
      responseTime: 1000 + Math.random() * 2000,
      contextUsed: [],
      relatedDocuments: []
    };
  };

  const simulateStreamingResponse = async function* (text: string, options: any) {
    const response = await simulateAICall(text, options);
    const words = response.content.split(' ');
    
    for (let i = 0; i < words.length; i += 3) {
      yield words.slice(i, i + 3).join(' ') + ' ';
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Helper functions from original component
  const generateSummary = (text: string) => {
    const words = text.split(' ');
    return words.slice(0, 20).join(' ') + '...';
  };

  const generateTags = () => {
    return 'AI, Assistant, Notes, Study, Learning';
  };

  const generateImprovements = () => {
    return '1. Add more specific examples\n2. Include supporting evidence\n3. Consider alternative perspectives\n4. Add citations for claims';
  };

  const generateOutline = (text: string) => {
    return '1. Main Topic\n2. Key Points\n3. Supporting Details\n4. Conclusion';
  };

  // AI Tutor API Functions
  const loadTutorPersonas = useCallback(async () => {
    try {
      const personas = await aiTutorAPI.getPersonas();
      setTutorPersonas(personas);
    } catch (error) {
      console.error('Failed to load tutor personas:', error);
      message.error('Failed to load tutor personas');
    }
  }, []);

  const createTutoringSession = useCallback(async () => {
    if (!subject || !topic) {
      message.warning('Please enter both subject and topic');
      return;
    }

    try {
      const session = await aiTutorAPI.createSession({
        persona: selectedPersona,
        subject,
        topic,
        difficulty,
        learning_style: learningStyle
      });

      setCurrentTutoringSession(session);
      setTutoringSessions(prev => [...prev, session]);
      setTutoringMessages([]);
      message.success('Tutoring session created successfully');
    } catch (error) {
      console.error('Failed to create tutoring session:', error);
      message.error('Failed to create tutoring session');
    }
  }, [selectedPersona, subject, topic, difficulty, learningStyle]);

  const sendTutoringMessage = useCallback(async (content: string) => {
    if (!currentTutoringSession) {
      message.warning('Please create a tutoring session first');
      return;
    }

    try {
      const response = await aiTutorAPI.sendMessage(
        currentTutoringSession.id,
        content
      );

      // Add user message
      const userMessage: TutorMessage = {
        id: `user_${Date.now()}`,
        session_id: currentTutoringSession.id,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };

      // Add AI response
      const aiMessage: TutorMessage = {
        id: `ai_${Date.now() + 1}`,
        session_id: currentTutoringSession.id,
        role: 'tutor',
        content: response.ai_response,
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };

      setTutoringMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      console.error('Failed to send tutoring message:', error);
      message.error('Failed to send message');
    }
  }, [currentTutoringSession]);

  const loadTutoringSessions = useCallback(async () => {
    try {
      const sessions = await aiTutorAPI.getSessions();
      setTutoringSessions(sessions);
    } catch (error) {
      console.error('Failed to load tutoring sessions:', error);
      message.error('Failed to load tutoring sessions');
    }
  }, []);

  const loadTutoringMessages = useCallback(async (sessionId: string) => {
    try {
      const messages = await aiTutorAPI.getSessionMessages(sessionId);
      setTutoringMessages(messages);
    } catch (error) {
      console.error('Failed to load tutoring messages:', error);
      message.error('Failed to load tutoring messages');
    }
  }, []);

  const deleteTutoringSession = useCallback(async (sessionId: string) => {
    try {
      await aiTutorAPI.deleteSession(sessionId);
      setTutoringSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentTutoringSession?.id === sessionId) {
        setCurrentTutoringSession(null);
        setTutoringMessages([]);
      }
      message.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete tutoring session:', error);
      message.error('Failed to delete session');
    }
  }, [currentTutoringSession]);

  // Load initial data
  useEffect(() => {
    loadTutorPersonas();
    loadTutoringSessions();
  }, [loadTutorPersonas, loadTutoringSessions]);

  useEffect(() => {
    if (autoSave && messages.length > 0 && currentConversation) {
      const timeout = setTimeout(() => {
        saveConversation();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [messages, autoSave, currentConversation, saveConversation]);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <Title level={3} style={{ margin: 0 }}>AI Assistant</Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={createNewConversation}
                  >
                    New Chat
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryModalVisible(true)}
                  >
                    History
                  </Button>
                  <Button
                    icon={<BarChartOutlined />}
                    onClick={() => setUsageModalVisible(true)}
                  >
                    Usage
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsModalVisible(true)}
                  >
                    Settings
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Chat" key="chat">
              <Card>
                <div style={{ height: 500, overflowY: 'auto', marginBottom: 16 }}>
                  {messages.length === 0 ? (
                    <Empty description="Start a conversation with AI Assistant" />
                  ) : (
                    <List
                      dataSource={messages}
                      renderItem={(message) => (
                        <List.Item style={{ border: 'none', padding: '8px 0' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            width: '100%'
                          }}>
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: 12,
                              backgroundColor: message.role === 'user' ? '#1890ff' : '#f5f5f5',
                              color: message.role === 'user' ? 'white' : 'black'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <Avatar 
                                  icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                  size="small"
                                  style={{ marginRight: 8 }}
                                />
                                <Text strong>{message.role === 'user' ? 'You' : 'AI Assistant'}</Text>
                                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </Text>
                              </div>
                              <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography.Paragraph>
                              {message.attachments && message.attachments.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  {message.attachments.map(attachment => (
                                    <Tag key={attachment.id} icon={<FileOutlined />}>
                                      {attachment.name}
                                    </Tag>
                                  ))}
                                </div>
                              )}
                              {message.metadata && (
                                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                                  Tokens: {message.tokens} | Model: {message.model}
                                </div>
                              )}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    onPressEnter={sendMessage}
                    suffix={
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={sendMessage}
                        loading={isTyping}
                      >
                        Send
                      </Button>
                    }
                  />
                </div>
              </Card>
            </TabPane>

            <TabPane tab="AI Tutor" key="tutor">
              <Card>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card title="Session Setup" size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Persona:</Text>
                          <Select
                            value={selectedPersona}
                            onChange={setSelectedPersona}
                            style={{ width: '100%', marginTop: 4 }}
                          >
                            {Object.entries(tutorPersonas).map(([key, persona]) => (
                              <Option key={key} value={key}>
                                <div>
                                  <div>{persona.name}</div>
                                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                                    {persona.description}
                                  </div>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </div>
                        
                        <div>
                          <Text strong>Subject:</Text>
                          <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Mathematics, Physics"
                            style={{ marginTop: 4 }}
                          />
                        </div>
                        
                        <div>
                          <Text strong>Topic:</Text>
                          <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Calculus, Quantum Mechanics"
                            style={{ marginTop: 4 }}
                          />
                        </div>
                        
                        <div>
                          <Text strong>Difficulty:</Text>
                          <Select
                            value={difficulty}
                            onChange={setDifficulty}
                            style={{ width: '100%', marginTop: 4 }}
                          >
                            <Option value="beginner">Beginner</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="advanced">Advanced</Option>
                          </Select>
                        </div>
                        
                        <div>
                          <Text strong>Learning Style:</Text>
                          <Select
                            value={learningStyle}
                            onChange={setLearningStyle}
                            style={{ width: '100%', marginTop: 4 }}
                          >
                            <Option value="visual">Visual</Option>
                            <Option value="auditory">Auditory</Option>
                            <Option value="kinesthetic">Kinesthetic</Option>
                            <Option value="reading">Reading</Option>
                          </Select>
                        </div>
                        
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={createTutoringSession}
                          loading={loading}
                          style={{ width: '100%' }}
                        >
                          Create Session
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                  
                  <Col span={16}>
                    <Card 
                      title={
                        <Space>
                          <Text>AI Tutor Session</Text>
                          {currentTutoringSession && (
                            <Tag color="green">
                              {tutorPersonas[currentTutoringSession.persona]?.name || currentTutoringSession.persona}
                            </Tag>
                          )}
                        </Space>
                      }
                      size="small"
                    >
                      {currentTutoringSession ? (
                        <>
                          <div style={{ height: 400, overflowY: 'auto', marginBottom: 16 }}>
                            {tutoringMessages.length === 0 ? (
                              <Empty 
                                description={
                                  <div>
                                    <p>Session created successfully!</p>
                                    <p>Start by asking a question about {currentTutoringSession.topic}</p>
                                  </div>
                                }
                              />
                            ) : (
                              <List
                                dataSource={tutoringMessages}
                                renderItem={(message) => (
                                  <List.Item style={{ border: 'none', padding: '8px 0' }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                      width: '100%'
                                    }}>
                                      <div style={{
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        backgroundColor: message.role === 'user' ? '#1890ff' : '#f0f8ff',
                                        color: message.role === 'user' ? 'white' : 'black'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                          <Avatar 
                                            icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                            size="small"
                                            style={{ marginRight: 8 }}
                                          />
                                          <Text strong>
                                            {message.role === 'user' ? 'You' : tutorPersonas[currentTutoringSession.persona]?.name || 'AI Tutor'}
                                          </Text>
                                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                          </Text>
                                        </div>
                                        <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                          {message.content}
                                        </Typography.Paragraph>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Input
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder={`Ask your ${tutorPersonas[currentTutoringSession.persona]?.name || 'AI Tutor'} about ${currentTutoringSession.topic}...`}
                              onPressEnter={() => {
                                if (inputText.trim()) {
                                  sendTutoringMessage(inputText);
                                  setInputText('');
                                }
                              }}
                              suffix={
                                <Button
                                  type="primary"
                                  icon={<SendOutlined />}
                                  onClick={() => {
                                    if (inputText.trim()) {
                                      sendTutoringMessage(inputText);
                                      setInputText('');
                                    }
                                  }}
                                  loading={isTyping}
                                >
                                  Send
                                </Button>
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <Empty description="Create a tutoring session to get started" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane tab="Suggestions" key="suggestions">
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to get AI suggestions..."
                    autoSize={{ minRows: 4, maxRows: 8 }}
                  />
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={generateSuggestions}
                      loading={loading}
                    >
                      Generate Suggestions
                    </Button>
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <Row gutter={[16, 16]}>
                    {suggestions.map(suggestion => (
                      <Col span={12} key={suggestion.id}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              {suggestion.icon}
                              <Text strong>{suggestion.title}</Text>
                              <Badge count={`${Math.round(suggestion.confidence * 100)}%`} />
                            </Space>
                          }
                          extra={
                            <Space>
                              <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  navigator.clipboard.writeText(suggestion.content);
                                  message.success('Copied to clipboard');
                                }}
                              />
                              <Button
                                size="small"
                                type="primary"
                                disabled={suggestion.isApplied}
                                onClick={() => applySuggestion(suggestion.id)}
                              >
                                {suggestion.isApplied ? 'Applied' : 'Apply'}
                              </Button>
                            </Space>
                          }
                        >
                          <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {suggestion.content}
                          </Typography.Paragraph>
                          {suggestion.metadata && (
                            <div style={{ marginTop: 8, fontSize: 12 }}>
                              <Space wrap>
                                <Tag color="blue">Words: {suggestion.metadata.wordCount}</Tag>
                                <Tag color="green">Reading time: {suggestion.metadata.readingTime}min</Tag>
                                <Tag color="orange">Complexity: {suggestion.metadata.complexity}</Tag>
                                <Tag color="purple">Sentiment: {suggestion.metadata.sentiment}</Tag>
                              </Space>
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </TabPane>

            <TabPane tab="Templates" key="templates">
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Input.Search
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setTemplatesModalVisible(true)}
                  >
                    Create Template
                  </Button>
                </div>

                <Row gutter={[16, 16]}>
                  {templates
                    .filter(template => 
                      searchTerm === '' || 
                      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      template.description.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(template => (
                      <Col span={8} key={template.id}>
                        <Card
                          size="small"
                          title={template.name}
                          extra={
                            <Space>
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => {/* Edit template */}}
                              />
                              <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => {/* Delete template */}}
                              />
                            </Space>
                          }
                        >
                          <Typography.Paragraph style={{ margin: 0, fontSize: 12 }}>
                            {template.description}
                          </Typography.Paragraph>
                          <div style={{ marginTop: 8 }}>
                            <Tag color="blue">{template.category}</Tag>
                          </div>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Card>
            </TabPane>

            <TabPane tab="Knowledge Base" key="knowledge">
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Input.Search
                    placeholder="Search knowledge base..."
                    style={{ width: 300 }}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setKnowledgeBaseModalVisible(true)}
                  >
                    Add Document
                  </Button>
                </div>

                <List
                  dataSource={knowledgeBase.flatMap(kb => kb.documents) || []}
                  renderItem={(doc: any) => (
                    <List.Item
                      actions={[
                        <Button size="small" icon={<EyeOutlined />} />,
                        <Button size="small" icon={<EditOutlined />} />,
                        <Button size="small" icon={<DeleteOutlined />} danger />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={doc.title}
                        description={doc.summary}
                      />
                      <div>
                        <Tag color="blue">{doc.category}</Tag>
                        <Tag color="green">{doc.wordCount} words</Tag>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>

            <TabPane tab="Workflows" key="workflows">
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setWorkflowModalVisible(true)}
                  >
                    Create Workflow
                  </Button>
                </div>

                <Row gutter={[16, 16]}>
                  {workflows.map(workflow => (
                    <Col span={8} key={workflow.id}>
                      <Card
                        size="small"
                        title={workflow.name}
                        extra={
                          <Switch
                            checked={workflow.enabled}
                            onChange={(checked) => {
                              // Toggle workflow
                            }}
                          />
                        }
                      >
                        <Typography.Paragraph style={{ margin: 0, fontSize: 12 }}>
                          {workflow.description}
                        </Typography.Paragraph>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue">{workflow.triggers[0]?.type}</Tag>
                          <Tag color="green">{workflow.steps.length} steps</Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Settings Modal */}
      <Modal
        title="AI Assistant Settings"
        visible={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => setSettingsModalVisible(false)}>
            Save
          </Button>
        ]}
        width={800}
      >
        <Tabs defaultActiveKey="general">
          <TabPane tab="General" key="general">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Default Model</Text>
                <Select
                  value={settings.defaultModel}
                  onChange={(value) => setSettings(prev => ({ ...prev, defaultModel: value }))}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {models.map(model => (
                    <Option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Default Temperature</Text>
                <Slider
                  value={settings.temperature}
                  onChange={(value) => setSettings(prev => ({ ...prev, temperature: value }))}
                  min={0}
                  max={2}
                  step={0.1}
                  marks={{
                    0: 'Focused',
                    1: 'Balanced',
                    2: 'Creative'
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong>Max Tokens</Text>
                <Slider
                  value={settings.maxTokens}
                  onChange={(value) => setSettings(prev => ({ ...prev, maxTokens: value }))}
                  min={100}
                  max={4000}
                  step={100}
                  marks={{
                    100: '100',
                    1000: '1K',
                    2000: '2K',
                    4000: '4K'
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong>Response Style</Text>
                <Radio.Group
                  value={responseStyle}
                  onChange={(e: any) => setResponseStyle(e.target.value)}
                  style={{ marginTop: 8 }}
                >
                  <Radio value="formal">Formal</Radio>
                  <Radio value="casual">Casual</Radio>
                  <Radio value="technical">Technical</Radio>
                  <Radio value="creative">Creative</Radio>
                </Radio.Group>
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Features" key="features">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Space>
                  <Switch
                    checked={settings.enableAutoSave}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableAutoSave: checked }))}
                  />
                  <Text>Auto-save conversations</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableSpellCheck}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableSpellCheck: checked }))}
                  />
                  <Text>Enable spell check</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableGrammarCheck}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableGrammarCheck: checked }))}
                  />
                  <Text>Enable grammar check</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableSmartSuggestions}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableSmartSuggestions: checked }))}
                  />
                  <Text>Enable smart suggestions</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableContextAwareness}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableContextAwareness: checked }))}
                  />
                  <Text>Enable context awareness</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableMultiLanguage}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableMultiLanguage: checked }))}
                  />
                  <Text>Enable multi-language support</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableVoiceInput}
                    onChange={(checked) => {
                      setSettings(prev => ({ ...prev, enableVoiceInput: checked }));
                      setIsVoiceEnabled(checked);
                    }}
                  />
                  <Text>Enable voice input</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.enableVoiceOutput}
                    onChange={(checked) => setSettings(prev => ({ ...prev, enableVoiceOutput: checked }))}
                  />
                  <Text>Enable voice output</Text>
                </Space>
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Privacy" key="privacy">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Space>
                  <Switch
                    checked={settings.privacy.shareUsageData}
                    onChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, shareUsageData: checked }
                    }))}
                  />
                  <Text>Share usage data to improve service</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.privacy.shareConversations}
                    onChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, shareConversations: checked }
                    }))}
                  />
                  <Text>Share conversations for training</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={settings.privacy.enableEncryption}
                    onChange={(checked) => setSettings(prev => ({ 
                      ...prev, 
                      privacy: { ...prev.privacy, enableEncryption: checked }
                    }))}
                  />
                  <Text>Enable end-to-end encryption</Text>
                </Space>
              </div>

              <div>
                <Text strong>Data Retention (days)</Text>
                <Slider
                  value={settings.privacy.dataRetention}
                  onChange={(value) => setSettings(prev => ({ 
                    ...prev, 
                    privacy: { ...prev.privacy, dataRetention: value }
                  }))}
                  min={7}
                  max={365}
                  marks={{
                    7: '7 days',
                    30: '30 days',
                    90: '90 days',
                    365: '1 year'
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Usage Statistics Modal */}
      <Modal
        title="Usage Statistics"
        visible={usageModalVisible}
        onCancel={() => setUsageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUsageModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tokens"
                value={usage.totalTokens}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Cost"
                value={usage.totalCost}
                prefix="$"
                precision={4}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Requests"
                value={usage.requestCount}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={usage.successRate}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Model Usage">
              {Object.entries(usage.modelUsage).map(([model, tokens]) => (
                <div key={model} style={{ marginBottom: 8 }}>
                  <Text>{model}: </Text>
                  <Text strong>{tokens} tokens</Text>
                </div>
              ))}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Response Time">
              <Statistic
                title="Average"
                value={usage.averageResponseTime}
                suffix="ms"
                precision={0}
              />
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Conversation History Modal */}
      <Modal
        title="Conversation History"
        visible={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              actions={[
                <Button
                  key="load"
                  type="primary"
                  onClick={() => {
                    setCurrentConversation(conversation);
                    setMessages(conversation.messages);
                    setHistoryModalVisible(false);
                  }}
                >
                  Load
                </Button>,
                <Button
                  key="delete"
                  danger
                  onClick={() => deleteConversation(conversation.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                title={conversation.title}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">
                      {new Date(conversation.createdAt).toLocaleDateString()} - {conversation.messages.length} messages
                    </Text>
                    <Space>
                      {conversation.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default AIAssistant;
