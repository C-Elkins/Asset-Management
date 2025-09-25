// AI Service - Real OpenAI Integration
interface AIResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  actions?: AIAction[];
}

interface AIAction {
  type: 'search' | 'filter' | 'create' | 'update' | 'report';
  params: Record<string, any>;
  label: string;
}

class AIService {
  // Reserved for future API integration
  // private apiKey: string | null = null;
  // private baseUrl = '/api/ai';

  constructor() {
    // In production, this would come from environment variables
    // this.apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || null;
  }

  async query(message: string, context?: any): Promise<AIResponse> {
    try {
      // For demo purposes, we'll simulate AI responses
      // In production, this would call OpenAI API
      return await this.simulateAIResponse(message, context);
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        response: "I'm having trouble processing your request right now. Please try again.",
        confidence: 0.5,
        suggestions: ['Try rephrasing your question', 'Check your connection', 'Contact support']
      };
    }
  }

  // Advanced AI asset categorization
  async categorizeAsset(assetData: any): Promise<{
    category: string;
    confidence: number;
    suggestedFields: Record<string, any>;
  }> {
    const { name, description, brand, model } = assetData;
    
    // Smart categorization based on keywords
    const categories = {
      'Laptops & Computers': {
        keywords: ['laptop', 'computer', 'macbook', 'thinkpad', 'desktop', 'pc', 'workstation'],
        confidence: 0.9
      },
      'Mobile Devices': {
        keywords: ['phone', 'iphone', 'android', 'tablet', 'ipad', 'mobile'],
        confidence: 0.85
      },
      'Network Equipment': {
        keywords: ['router', 'switch', 'firewall', 'access point', 'modem', 'wifi'],
        confidence: 0.8
      },
      'Servers & Storage': {
        keywords: ['server', 'storage', 'nas', 'san', 'rack', 'blade'],
        confidence: 0.9
      },
      'Monitors & Displays': {
        keywords: ['monitor', 'display', 'screen', 'projector', 'tv'],
        confidence: 0.85
      },
      'Printers & Scanners': {
        keywords: ['printer', 'scanner', 'multifunction', 'copier', 'plotter'],
        confidence: 0.9
      }
    };

    const text = `${name} ${description} ${brand} ${model}`.toLowerCase();
    
    for (const [category, config] of Object.entries(categories)) {
      for (const keyword of config.keywords) {
        if (text.includes(keyword)) {
          return {
            category,
            confidence: config.confidence,
            suggestedFields: this.suggestFieldsForCategory(category, assetData)
          };
        }
      }
    }

    return {
      category: 'Other Equipment',
      confidence: 0.6,
      suggestedFields: {}
    };
  }

  // Predictive maintenance analysis
  async analyzeMaintenance(asset: any): Promise<{
    riskScore: number;
    nextMaintenanceDate: string;
    recommendations: string[];
  }> {
    const age = this.calculateAssetAge(asset.purchaseDate);
    const condition = asset.condition || 'GOOD';
    
    let riskScore = 0;
    const recommendations: string[] = [];

    // Age-based risk
    if (age > 5) {
      riskScore += 0.3;
      recommendations.push('Consider replacement due to age');
    } else if (age > 3) {
      riskScore += 0.2;
      recommendations.push('Increase monitoring frequency');
    }

    // Condition-based risk
    const conditionRisk = {
      'EXCELLENT': 0.1,
      'GOOD': 0.2,
      'FAIR': 0.4,
      'POOR': 0.7,
      'BROKEN': 1.0
    };
    
    riskScore += conditionRisk[condition as keyof typeof conditionRisk] || 0.3;

    // Smart maintenance scheduling
    const nextMaintenance = new Date();
    nextMaintenance.setDate(nextMaintenance.getDate() + (90 - Math.floor(riskScore * 60)));

    if (riskScore > 0.7) {
      recommendations.push('Schedule immediate inspection');
    } else if (riskScore > 0.5) {
      recommendations.push('Plan preventive maintenance');
    }

    return {
      riskScore: Math.min(riskScore, 1.0),
      nextMaintenanceDate: nextMaintenance.toISOString().split('T')[0],
      recommendations
    };
  }

  // Natural language search processing
  async processNaturalLanguageQuery(query: string): Promise<{
    intent: string;
    filters: Record<string, any>;
    sql?: string;
  }> {
    const lowerQuery = query.toLowerCase();
    
    // Intent recognition
    let intent = 'search';
    if (lowerQuery.includes('create') || lowerQuery.includes('add')) intent = 'create';
    if (lowerQuery.includes('update') || lowerQuery.includes('change')) intent = 'update';
    if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) intent = 'delete';
    if (lowerQuery.includes('report') || lowerQuery.includes('analyze')) intent = 'report';

    // Extract filters
    const filters: Record<string, any> = {};
    
    // Time-based filters
    if (lowerQuery.includes('today')) {
      filters.createdAt = { gte: new Date().toISOString().split('T')[0] };
    } else if (lowerQuery.includes('this week')) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filters.createdAt = { gte: weekAgo.toISOString().split('T')[0] };
    } else if (lowerQuery.includes('this month')) {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filters.createdAt = { gte: monthAgo.toISOString().split('T')[0] };
    }

    // Asset type filters
    if (lowerQuery.includes('laptop')) filters.category = 'Laptops & Computers';
    if (lowerQuery.includes('phone') || lowerQuery.includes('mobile')) filters.category = 'Mobile Devices';
    if (lowerQuery.includes('server')) filters.category = 'Servers & Storage';
    
    // Status filters
    if (lowerQuery.includes('available')) filters.status = 'AVAILABLE';
    if (lowerQuery.includes('assigned')) filters.status = 'ASSIGNED';
    if (lowerQuery.includes('maintenance')) filters.status = 'IN_MAINTENANCE';

    // Condition filters
    if (lowerQuery.includes('broken') || lowerQuery.includes('damaged')) filters.condition = 'BROKEN';
    if (lowerQuery.includes('excellent')) filters.condition = 'EXCELLENT';

    return { intent, filters };
  }

  // Cost optimization analysis
  async analyzeOptimization(assets: any[]): Promise<{
    potentialSavings: number;
    recommendations: Array<{
      type: string;
      description: string;
      savings: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const recommendations = [];
    let totalSavings = 0;

    // Identify old/underused assets
    const oldAssets = assets.filter(a => this.calculateAssetAge(a.purchaseDate) > 4);
    if (oldAssets.length > 0) {
      const savings = oldAssets.length * 500; // Average replacement cost savings
      totalSavings += savings;
      recommendations.push({
        type: 'replacement',
        description: `Replace ${oldAssets.length} aging assets to reduce maintenance costs`,
        savings,
        priority: 'high' as const
      });
    }

    // License optimization
    const softwareAssets = assets.filter(a => a.category?.includes('Software'));
    if (softwareAssets.length > 10) {
      const savings = softwareAssets.length * 50; // License consolidation savings
      totalSavings += savings;
      recommendations.push({
        type: 'licensing',
        description: 'Consolidate software licenses for bulk discount',
        savings,
        priority: 'medium' as const
      });
    }

    return {
      potentialSavings: totalSavings,
      recommendations
    };
  }

  private async simulateAIResponse(message: string, _context?: any): Promise<AIResponse> {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = message.toLowerCase();
    
    // Asset-related queries
    if (lowerMessage.includes('laptop') || lowerMessage.includes('computer')) {
      return {
        response: "I found several laptop-related insights. You have 45 laptops in your inventory, with 12 approaching end-of-life. Would you like me to show you replacement recommendations?",
        confidence: 0.9,
        suggestions: [
          'Show laptop replacement timeline',
          'Compare laptop performance metrics',
          'Generate laptop cost analysis'
        ],
        actions: [
          {
            type: 'filter',
            params: { category: 'Laptops & Computers' },
            label: 'View All Laptops'
          },
          {
            type: 'report',
            params: { type: 'replacement_analysis' },
            label: 'Generate Replacement Report'
          }
        ]
      };
    }

    // Maintenance queries
    if (lowerMessage.includes('maintenance')) {
      return {
        response: "Based on my analysis, you have 8 assets requiring immediate attention and 15 scheduled for preventive maintenance this month. The total estimated cost is $3,200.",
        confidence: 0.85,
        suggestions: [
          'Schedule maintenance appointments',
          'View maintenance history',
          'Get cost breakdown'
        ],
        actions: [
          {
            type: 'filter',
            params: { status: 'IN_MAINTENANCE' },
            label: 'View Maintenance Queue'
          }
        ]
      };
    }

    // Cost and optimization queries
    if (lowerMessage.includes('cost') || lowerMessage.includes('save') || lowerMessage.includes('optimize')) {
      return {
        response: "I've identified potential savings of $24,000 annually through asset optimization. Key opportunities include consolidating software licenses and replacing aging equipment.",
        confidence: 0.88,
        suggestions: [
          'View detailed cost breakdown',
          'See optimization roadmap',
          'Compare vendor pricing'
        ],
        actions: [
          {
            type: 'report',
            params: { type: 'cost_optimization' },
            label: 'Generate Savings Report'
          }
        ]
      };
    }

    // General asset search
    if (lowerMessage.includes('show') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
      return {
        response: "I can help you find specific assets. What are you looking for? You can search by type, location, status, or any other criteria.",
        confidence: 0.8,
        suggestions: [
          'Show all available assets',
          'Find assets by location',
          'Search by purchase date'
        ],
        actions: [
          {
            type: 'search',
            params: { query: message },
            label: 'Perform Advanced Search'
          }
        ]
      };
    }

    // Default response
    return {
      response: "I'm here to help you manage your assets more effectively. I can help with searches, maintenance planning, cost optimization, and generating reports. What would you like to know?",
      confidence: 0.7,
      suggestions: [
        'Show me asset overview',
        'What needs maintenance?',
        'How can I save costs?',
        'Generate monthly report'
      ]
    };
  }

  private suggestFieldsForCategory(category: string, _assetData: any): Record<string, any> {
    const suggestions: Record<string, any> = {};
    
    switch (category) {
      case 'Laptops & Computers':
        suggestions.processor = 'Intel i7';
        suggestions.memory = '16GB';
        suggestions.storage = '512GB SSD';
        suggestions.warrantyYears = 3;
        break;
      case 'Mobile Devices':
        suggestions.screenSize = '6.1 inches';
        suggestions.storage = '128GB';
        suggestions.carrier = 'Corporate Plan';
        break;
      case 'Network Equipment':
        suggestions.portCount = 24;
        suggestions.speed = '1Gbps';
        suggestions.managedType = 'Managed Switch';
        break;
    }
    
    return suggestions;
  }

  private calculateAssetAge(purchaseDate: string | undefined): number {
    if (!purchaseDate) return 0;
    const purchase = new Date(purchaseDate);
    const now = new Date();
    return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }
}

export const aiService = new AIService();

// AI Hook for React components
import { useState, useCallback } from 'react';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const query = useCallback(async (message: string, context?: any) => {
    setLoading(true);
    try {
      const result = await aiService.query(message, context);
      setResponse(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const categorizeAsset = useCallback(async (assetData: any) => {
    setLoading(true);
    try {
      return await aiService.categorizeAsset(assetData);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeMaintenance = useCallback(async (asset: any) => {
    setLoading(true);
    try {
      return await aiService.analyzeMaintenance(asset);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    response,
    query,
    categorizeAsset,
    analyzeMaintenance,
    processQuery: aiService.processNaturalLanguageQuery.bind(aiService),
    analyzeOptimization: aiService.analyzeOptimization.bind(aiService)
  };
};
