'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Send, 
  FileText, 
  TrendingUp, 
  Target, 
  DollarSign,
  Users,
  Lightbulb,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
  Copy,
  RefreshCw
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  category?: string
}

const quickActions = [
  {
    title: "Business Strategy",
    description: "Get strategic advice for your business",
    icon: Target,
    prompt: "I need help developing a business strategy for my e-commerce store. Can you provide me with a step-by-step approach?"
  },
  {
    title: "Marketing Ideas",
    description: "Generate creative marketing campaigns",
    icon: TrendingUp,
    prompt: "Give me 5 innovative marketing ideas for a sustainable fashion brand targeting millennial women."
  },
  {
    title: "Financial Planning",
    description: "Get help with financial projections",
    icon: DollarSign,
    prompt: "Help me create a financial projection for my service-based business for the next 12 months."
  },
  {
    title: "Market Research",
    description: "Analyze market trends and competition",
    icon: BarChart3,
    prompt: "Can you help me analyze the current market trends in the wellness industry for women entrepreneurs?"
  },
  {
    title: "Content Creation",
    description: "Generate content for social media and blogs",
    icon: FileText,
    prompt: "Create a week's worth of social media content for a women's leadership coaching business."
  },
  {
    title: "Problem Solving",
    description: "Get solutions to business challenges",
    icon: Lightbulb,
    prompt: "I'm struggling with customer retention in my subscription box business. What strategies can help?"
  }
]

const sampleConversations = [
  {
    id: '1',
    title: 'Business Growth Strategy',
    lastMessage: 'Here are 5 key strategies to scale your business...',
    timestamp: '2 hours ago',
    category: 'Strategy'
  },
  {
    id: '2',
    title: 'Social Media Marketing',
    lastMessage: 'Your Instagram content strategy should focus on...',
    timestamp: '1 day ago',
    category: 'Marketing'
  },
  {
    id: '3',
    title: 'Funding Options',
    lastMessage: 'Based on your business stage, consider these funding options...',
    timestamp: '3 days ago',
    category: 'Finance'
  }
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Business Assistant. I\'m here to help you with all aspects of your business journey. Whether you need strategic advice, marketing ideas, financial planning, or solutions to specific challenges, I\'ve got you covered. What would you like to work on today?',
      timestamp: new Date(),
      category: 'Welcome'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (in real implementation, this would use z-ai-web-dev-sdk)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about: "${inputMessage}". Based on your business context and goals, here's my advice:\n\n1. **Analyze your current situation**: Take stock of where your business stands today\n2. **Identify key opportunities**: Look for areas where you can make the biggest impact\n3. **Create actionable steps**: Break down your goals into manageable tasks\n4. **Set measurable targets**: Define clear KPIs to track your progress\n5. **Review and adjust**: Regularly evaluate your progress and adjust your strategy\n\nWould you like me to elaborate on any of these points or help you create a specific action plan?`,
        timestamp: new Date(),
        category: 'Advice'
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Business Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your intelligent business partner for growth, strategy, and problem-solving
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Get instant help with common business tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Past Conversations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Past Conversations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm">{conversation.title}</div>
                      <Badge variant="outline" className="text-xs">
                        {conversation.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {conversation.lastMessage}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {conversation.timestamp}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <span>Business Assistant Chat</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {message.type === 'assistant' && (
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Ask me anything about your business..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">AI Capabilities</CardTitle>
                <CardDescription>
                  Discover what your AI Business Assistant can help you with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="strategy" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                    <TabsTrigger value="finance">Finance</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="strategy" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Business Planning</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Create comprehensive business plans, SWOT analysis, and strategic roadmaps
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Market Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Analyze market trends, competition, and identify growth opportunities
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="marketing" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Content Creation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate blog posts, social media content, and marketing copy
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Campaign Strategy</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Develop marketing campaigns and customer acquisition strategies
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="finance" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Financial Planning</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Create financial models, projections, and budgeting strategies
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Funding Strategy</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Identify funding opportunities and prepare investor pitches
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="operations" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Process Optimization</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Streamline business processes and improve efficiency
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Team Management</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Develop team structures and management strategies
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}