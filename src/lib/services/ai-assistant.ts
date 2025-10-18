import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AIConversationContext {
  userId: string
  businessProfile?: any
  userGoals?: string[]
  industry?: string
  businessStage?: string
  previousConversations?: AIMessage[]
}

export interface BusinessAnalysisRequest {
  type: 'swot' | 'market' | 'competitor' | 'financial' | 'strategy'
  businessData: any
  additionalContext?: string
}

export class AIAssistantService {
  private static instance: AIAssistantService
  private zai: any = null

  private constructor() {}

  static async getInstance(): Promise<AIAssistantService> {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService()
      await AIAssistantService.instance.initialize()
    }
    return AIAssistantService.instance
  }

  private async initialize() {
    try {
      this.zai = await ZAI.create()
      console.log('Z-AI SDK initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Z-AI SDK:', error)
      throw error
    }
  }

  async generateBusinessInsights(context: AIConversationContext, query: string): Promise<string> {
    try {
      if (!this.zai) {
        throw new Error('Z-AI SDK not initialized')
      }

      // Build comprehensive context
      const systemPrompt = this.buildSystemPrompt(context)
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]

      const completion = await this.zai.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })

      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.'
    } catch (error) {
      console.error('Error generating business insights:', error)
      throw error
    }
  }

  async performBusinessAnalysis(request: BusinessAnalysisRequest): Promise<any> {
    try {
      if (!this.zai) {
        throw new Error('Z-AI SDK not initialized')
      }

      const analysisPrompt = this.buildAnalysisPrompt(request)
      
      const completion = await this.zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert business analyst providing detailed insights and recommendations.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      
      // Parse and structure the response
      return this.parseAnalysisResponse(response, request.type)
    } catch (error) {
      console.error('Error performing business analysis:', error)
      throw error
    }
  }

  async generateBusinessPlan(context: AIConversationContext, requirements: any): Promise<string> {
    try {
      if (!this.zai) {
        throw new Error('Z-AI SDK not initialized')
      }

      const prompt = `
        Generate a comprehensive business plan based on the following information:
        
        Business Context:
        - Industry: ${context.industry || 'Not specified'}
        - Business Stage: ${context.businessStage || 'Not specified'}
        - User Goals: ${context.userGoals?.join(', ') || 'Not specified'}
        
        Business Profile:
        ${JSON.stringify(context.businessProfile, null, 2)}
        
        Specific Requirements:
        ${JSON.stringify(requirements, null, 2)}
        
        Please provide a detailed business plan including:
        1. Executive Summary
        2. Business Description
        3. Market Analysis
        4. Organization and Management
        5. Service or Product Line
        6. Marketing and Sales
        7. Funding Request (if applicable)
        8. Financial Projections
        9. Appendix (if needed)
      `

      const completion = await this.zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert business plan writer with experience helping women entrepreneurs succeed.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })

      return completion.choices[0]?.message?.content || 'Unable to generate business plan.'
    } catch (error) {
      console.error('Error generating business plan:', error)
      throw error
    }
  }

  async analyzeDocument(documentContent: string, analysisType: string): Promise<any> {
    try {
      if (!this.zai) {
        throw new Error('Z-AI SDK not initialized')
      }

      const prompt = `
        Analyze the following document content and provide insights:
        
        Document Type: ${analysisType}
        Content: ${documentContent}
        
        Please provide:
        1. Summary of key points
        2. Actionable insights
        3. Recommendations
        4. Potential risks or concerns
        5. Next steps
      `

      const completion = await this.zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert document analyst specializing in business documents.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      return this.parseDocumentAnalysis(response)
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw error
    }
  }

  async searchBusinessInfo(query: string): Promise<any> {
    try {
      if (!this.zai) {
        throw new Error('Z-AI SDK not initialized')
      }

      // Use web search function if available
      const searchResult = await this.zai.functions.invoke("web_search", {
        query: query,
        num: 5
      })

      return searchResult
    } catch (error) {
      console.error('Error searching business info:', error)
      throw error
    }
  }

  private buildSystemPrompt(context: AIConversationContext): string {
    let prompt = `You are an AI business assistant specializing in helping women entrepreneurs succeed. 
    Provide practical, actionable advice based on the user's specific business context and goals.
    
    User Context:
    - Business Stage: ${context.businessStage || 'Not specified'}
    - Industry: ${context.industry || 'Not specified'}
    - Goals: ${context.userGoals?.join(', ') || 'Not specified'}
    
    Business Profile: ${JSON.stringify(context.businessProfile, null, 2)}
    
    Guidelines:
    1. Provide specific, actionable advice
    2. Consider the unique challenges faced by women entrepreneurs
    3. Focus on practical steps that can be implemented immediately
    4. Be encouraging but realistic
    5. Suggest resources and tools when appropriate
    6. Consider scalability and sustainability
    7. Address potential challenges and how to overcome them
    `
    
    if (context.previousConversations && context.previousConversations.length > 0) {
      prompt += `\nPrevious Conversation Context:\n`
      context.previousConversations.slice(-5).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`
      })
    }
    
    return prompt
  }

  private buildAnalysisPrompt(request: BusinessAnalysisRequest): string {
    const basePrompt = `Perform a ${request.type.toUpperCase()} analysis based on the following business data:
    
    Business Data: ${JSON.stringify(request.businessData, null, 2)}
    
    `
    
    switch (request.type) {
      case 'swot':
        return basePrompt + `Provide a detailed SWOT analysis covering:
        1. Strengths - Internal positive attributes and resources
        2. Weaknesses - Internal negative attributes and limitations
        3. Opportunities - External factors that can benefit the business
        4. Threats - External factors that could harm the business
        
        For each section, provide specific examples and actionable insights.`
        
      case 'market':
        return basePrompt + `Provide a comprehensive market analysis including:
        1. Target market demographics and psychographics
        2. Market size and growth potential
        3. Market trends and opportunities
        4. Customer needs and pain points
        5. Market entry strategies
        
        Include data-driven insights and recommendations.`
        
      case 'competitor':
        return basePrompt + `Conduct a competitor analysis covering:
        1. Key competitors and their market positioning
        2. Competitive advantages and disadvantages
        3. Market share analysis
        4. Competitor strengths and weaknesses
        5. Differentiation strategies
        
        Provide actionable competitive intelligence.`
        
      case 'financial':
        return basePrompt + `Perform a financial analysis including:
        1. Revenue projections and forecasts
        2. Cost structure analysis
        3. Break-even analysis
        4. Cash flow projections
        5. Investment requirements
        6. ROI analysis
        
        Provide realistic financial projections and recommendations.`
        
      case 'strategy':
        return basePrompt + `Develop a business strategy covering:
        1. Vision and mission alignment
        2. Strategic objectives and goals
        3. Competitive strategy
        4. Growth strategy
        5. Operational strategy
        6. Risk management
        
        Provide a comprehensive strategic plan with actionable steps.`
        
      default:
        return basePrompt + `Provide a comprehensive business analysis with actionable insights and recommendations.`
    }
  }

  private parseAnalysisResponse(response: string, type: string): any {
    // Parse the AI response and structure it based on analysis type
    const sections = response.split(/\n\s*\n/)
    const result: any = { type, summary: '', sections: [] }
    
    sections.forEach(section => {
      const lines = section.split('\n')
      const title = lines[0]?.replace(/^#+\s*/, '').trim()
      const content = lines.slice(1).join('\n').trim()
      
      if (title && content) {
        result.sections.push({ title, content })
      }
    })
    
    result.summary = result.sections[0]?.content || response
    return result
  }

  private parseDocumentAnalysis(response: string): any {
    // Parse document analysis response
    const sections = response.split(/\n\s*\n/)
    return {
      summary: sections[0] || '',
      insights: sections.slice(1).map(section => section.trim()).filter(Boolean),
      rawResponse: response
    }
  }
}