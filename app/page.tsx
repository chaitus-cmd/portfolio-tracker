'use client'
import { Fragment } from 'react';


import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Default demo holdings
const defaultHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc', shares: 150, account: 'Brokerage' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', shares: 75, account: 'Brokerage' },
  { symbol: 'MSFT', name: 'Microsoft Corp', shares: 100, account: 'Brokerage' },
  { symbol: 'AMZN', name: 'Amazon.com Inc', shares: 50, account: 'Brokerage' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', shares: 80, account: 'Roth IRA' },
  { symbol: 'TSLA', name: 'Tesla Inc', shares: 60, account: 'Brokerage' },
  { symbol: 'META', name: 'Meta Platforms Inc', shares: 45, account: 'Brokerage' },
  { symbol: 'NFLX', name: 'Netflix Inc', shares: 30, account: 'IRA' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', shares: 120, account: 'Brokerage' },
  { symbol: 'CRM', name: 'Salesforce Inc', shares: 40, account: 'Brokerage' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 200, account: 'Roth IRA' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', shares: 100, account: 'IRA' },
  { symbol: 'BTC-USD', name: 'Bitcoin', shares: 0.5, account: 'Coinbase' },
]

const defaultWatchlist = [
  { symbol: 'PLTR', name: 'Palantir Technologies' },
  { symbol: 'COIN', name: 'Coinbase Global' },
]

// Sector and subsector mappings for common stocks
const STOCK_SECTORS: { [key: string]: { sector: string; subsector: string } } = {
  // Technology
  'AAPL': { sector: 'Technology', subsector: 'Consumer Electronics' },
  'MSFT': { sector: 'Technology', subsector: 'Software' },
  'GOOGL': { sector: 'Technology', subsector: 'Internet Services' },
  'GOOG': { sector: 'Technology', subsector: 'Internet Services' },
  'META': { sector: 'Technology', subsector: 'Social Media' },
  'NVDA': { sector: 'Technology', subsector: 'Semiconductors' },
  'AMD': { sector: 'Technology', subsector: 'Semiconductors' },
  'INTC': { sector: 'Technology', subsector: 'Semiconductors' },
  'CRM': { sector: 'Technology', subsector: 'Software' },
  'ORCL': { sector: 'Technology', subsector: 'Software' },
  'ADBE': { sector: 'Technology', subsector: 'Software' },
  'CSCO': { sector: 'Technology', subsector: 'Networking' },
  'AVGO': { sector: 'Technology', subsector: 'Semiconductors' },
  'QCOM': { sector: 'Technology', subsector: 'Semiconductors' },
  'TSM': { sector: 'Technology', subsector: 'Semiconductors' },
  'PLTR': { sector: 'Technology', subsector: 'Software' },
  
  // Consumer Discretionary
  'AMZN': { sector: 'Consumer Discretionary', subsector: 'E-Commerce' },
  'TSLA': { sector: 'Consumer Discretionary', subsector: 'Electric Vehicles' },
  'NKE': { sector: 'Consumer Discretionary', subsector: 'Apparel' },
  'SBUX': { sector: 'Consumer Discretionary', subsector: 'Restaurants' },
  'MCD': { sector: 'Consumer Discretionary', subsector: 'Restaurants' },
  'HD': { sector: 'Consumer Discretionary', subsector: 'Retail' },
  'LOW': { sector: 'Consumer Discretionary', subsector: 'Retail' },
  'TGT': { sector: 'Consumer Discretionary', subsector: 'Retail' },
  'COST': { sector: 'Consumer Discretionary', subsector: 'Retail' },
  'WMT': { sector: 'Consumer Discretionary', subsector: 'Retail' },
  
  // Communication Services
  'NFLX': { sector: 'Communication Services', subsector: 'Streaming' },
  'DIS': { sector: 'Communication Services', subsector: 'Entertainment' },
  'CMCSA': { sector: 'Communication Services', subsector: 'Media' },
  'T': { sector: 'Communication Services', subsector: 'Telecom' },
  'VZ': { sector: 'Communication Services', subsector: 'Telecom' },
  'TMUS': { sector: 'Communication Services', subsector: 'Telecom' },
  'SPOT': { sector: 'Communication Services', subsector: 'Streaming' },
  
  // Financials
  'JPM': { sector: 'Financials', subsector: 'Banks' },
  'BAC': { sector: 'Financials', subsector: 'Banks' },
  'WFC': { sector: 'Financials', subsector: 'Banks' },
  'GS': { sector: 'Financials', subsector: 'Investment Banking' },
  'MS': { sector: 'Financials', subsector: 'Investment Banking' },
  'V': { sector: 'Financials', subsector: 'Payments' },
  'MA': { sector: 'Financials', subsector: 'Payments' },
  'PYPL': { sector: 'Financials', subsector: 'Payments' },
  'SQ': { sector: 'Financials', subsector: 'Fintech' },
  'COIN': { sector: 'Financials', subsector: 'Crypto' },
  'BRK.B': { sector: 'Financials', subsector: 'Diversified' },
  'BLK': { sector: 'Financials', subsector: 'Asset Management' },
  
  // Healthcare
  'JNJ': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  'UNH': { sector: 'Healthcare', subsector: 'Insurance' },
  'PFE': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  'ABBV': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  'MRK': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  'LLY': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  'TMO': { sector: 'Healthcare', subsector: 'Life Sciences' },
  'ABT': { sector: 'Healthcare', subsector: 'Medical Devices' },
  'DHR': { sector: 'Healthcare', subsector: 'Life Sciences' },
  'BMY': { sector: 'Healthcare', subsector: 'Pharmaceuticals' },
  
  // Energy
  'XOM': { sector: 'Energy', subsector: 'Oil & Gas' },
  'CVX': { sector: 'Energy', subsector: 'Oil & Gas' },
  'COP': { sector: 'Energy', subsector: 'Oil & Gas' },
  'SLB': { sector: 'Energy', subsector: 'Oil Services' },
  'EOG': { sector: 'Energy', subsector: 'Oil & Gas' },
  'OXY': { sector: 'Energy', subsector: 'Oil & Gas' },
  
  // Industrials
  'BA': { sector: 'Industrials', subsector: 'Aerospace' },
  'CAT': { sector: 'Industrials', subsector: 'Machinery' },
  'UPS': { sector: 'Industrials', subsector: 'Logistics' },
  'FDX': { sector: 'Industrials', subsector: 'Logistics' },
  'HON': { sector: 'Industrials', subsector: 'Diversified' },
  'GE': { sector: 'Industrials', subsector: 'Diversified' },
  'LMT': { sector: 'Industrials', subsector: 'Defense' },
  'RTX': { sector: 'Industrials', subsector: 'Defense' },
  'DE': { sector: 'Industrials', subsector: 'Machinery' },
  
  // Consumer Staples
  'PG': { sector: 'Consumer Staples', subsector: 'Household Products' },
  'KO': { sector: 'Consumer Staples', subsector: 'Beverages' },
  'PEP': { sector: 'Consumer Staples', subsector: 'Beverages' },
  'PM': { sector: 'Consumer Staples', subsector: 'Tobacco' },
  'MO': { sector: 'Consumer Staples', subsector: 'Tobacco' },
  'CL': { sector: 'Consumer Staples', subsector: 'Household Products' },
  
  // Real Estate
  'AMT': { sector: 'Real Estate', subsector: 'REITs' },
  'PLD': { sector: 'Real Estate', subsector: 'REITs' },
  'CCI': { sector: 'Real Estate', subsector: 'REITs' },
  'EQIX': { sector: 'Real Estate', subsector: 'Data Centers' },
  'SPG': { sector: 'Real Estate', subsector: 'REITs' },
  'O': { sector: 'Real Estate', subsector: 'REITs' },
  
  // Materials
  'LIN': { sector: 'Materials', subsector: 'Chemicals' },
  'APD': { sector: 'Materials', subsector: 'Chemicals' },
  'SHW': { sector: 'Materials', subsector: 'Chemicals' },
  'FCX': { sector: 'Materials', subsector: 'Mining' },
  'NEM': { sector: 'Materials', subsector: 'Mining' },
  
  // Utilities
  'NEE': { sector: 'Utilities', subsector: 'Renewable Energy' },
  'DUK': { sector: 'Utilities', subsector: 'Electric Utilities' },
  'SO': { sector: 'Utilities', subsector: 'Electric Utilities' },
  'D': { sector: 'Utilities', subsector: 'Electric Utilities' },
  
  // ETFs
  'VOO': { sector: 'ETFs', subsector: 'Index Funds' },
  'VTI': { sector: 'ETFs', subsector: 'Index Funds' },
  'QQQ': { sector: 'ETFs', subsector: 'Index Funds' },
  'SPY': { sector: 'ETFs', subsector: 'Index Funds' },
  'IWM': { sector: 'ETFs', subsector: 'Index Funds' },
  'VGT': { sector: 'ETFs', subsector: 'Sector ETFs' },
  'XLK': { sector: 'ETFs', subsector: 'Sector ETFs' },
  'XLF': { sector: 'ETFs', subsector: 'Sector ETFs' },
  'XLE': { sector: 'ETFs', subsector: 'Sector ETFs' },
  'ARKK': { sector: 'ETFs', subsector: 'Thematic ETFs' },
  'ARKG': { sector: 'ETFs', subsector: 'Thematic ETFs' },
  'VYM': { sector: 'ETFs', subsector: 'Dividend ETFs' },
  'SCHD': { sector: 'ETFs', subsector: 'Dividend ETFs' },
  
  // Crypto
  'BTC-USD': { sector: 'Crypto', subsector: 'Bitcoin' },
  'ETH-USD': { sector: 'Crypto', subsector: 'Ethereum' },
}

// Sector colors
const SECTOR_COLORS: { [key: string]: string } = {
  'Technology': '#3b82f6',
  'Consumer Discretionary': '#8b5cf6',
  'Communication Services': '#ec4899',
  'Financials': '#10b981',
  'Healthcare': '#ef4444',
  'Energy': '#f59e0b',
  'Industrials': '#6366f1',
  'Consumer Staples': '#14b8a6',
  'Real Estate': '#f97316',
  'Materials': '#84cc16',
  'Utilities': '#06b6d4',
  'ETFs': '#64748b',
  'Crypto': '#eab308',
  'Other': '#9ca3af',
}

// Keywords that often explain stock movements
const PRIORITY_KEYWORDS = [
  'earnings', 'revenue', 'profit', 'loss', 'beat', 'miss', 'guidance',
  'upgrade', 'downgrade', 'rating', 'target', 'analyst',
  'FDA', 'approval', 'trial', 'drug',
  'lawsuit', 'settlement', 'investigation',
  'CEO', 'CFO', 'executive', 'resign', 'hire',
  'acquisition', 'merger', 'buyout', 'deal',
  'layoff', 'restructuring', 'cut',
  'dividend', 'buyback', 'split',
  'surge', 'plunge', 'soar', 'tank', 'crash', 'rally', 'jump', 'drop', 'fall', 'rise'
]

// Time period options
const TIME_PERIODS = [
  { label: '1D', value: '1d', range: '1d', interval: '5m' },
  { label: '5D', value: '5d', range: '5d', interval: '15m' },
  { label: '30D', value: '30d', range: '1mo', interval: '1d' },
  { label: '90D', value: '90d', range: '3mo', interval: '1d' },
]

export default function Dashboard() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('losers')
  const [timePeriod, setTimePeriod] = useState('1d')
  const [prices, setPrices] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [news, setNews] = useState<any[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('chat')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWatchlistModal, setShowWatchlistModal] = useState(false)
  const [newStock, setNewStock] = useState({ symbol: '', name: '', shares: '', account: 'Brokerage' })
  const [newWatchlistStock, setNewWatchlistStock] = useState({ symbol: '', name: '' })
  const [moverHeadlines, setMoverHeadlines] = useState<any>({})
  const [moverHeadlinesLoading, setMoverHeadlinesLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set())

  // Load holdings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-holdings')
    if (saved) {
      setHoldings(JSON.parse(saved))
    } else {
      setHoldings(defaultHoldings)
    }
    
    const savedWatchlist = localStorage.getItem('portfolio-watchlist')
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    } else {
      setWatchlist(defaultWatchlist)
    }
  }, [])

  // Save holdings to localStorage whenever they change
  useEffect(() => {
    if (holdings.length > 0) {
      localStorage.setItem('portfolio-holdings', JSON.stringify(holdings))
    }
  }, [holdings])

  // Save watchlist to localStorage
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('portfolio-watchlist', JSON.stringify(watchlist))
    }
  }, [watchlist])

  // Fetch live prices (includes watchlist)
  useEffect(() => {
    if (holdings.length === 0 && watchlist.length === 0) return
    
    async function fetchPrices() {
      setLoading(true)
      try {
        const allSymbols = [
          ...holdings.map(h => h.symbol), 
          ...watchlist.map(w => w.symbol),
          'SPY'
        ]
        const uniqueSymbols = [...new Set(allSymbols)]
        const period = TIME_PERIODS.find(p => p.value === timePeriod)
        const response = await fetch(`/api/market?symbols=${uniqueSymbols.join(',')}&range=${period?.range || '1d'}`)
        const data = await response.json()
        setPrices(data)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
      setLoading(false)
    }
    
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [holdings, watchlist, timePeriod])

  // Fetch historical data
  useEffect(() => {
    if (holdings.length === 0) return
    
    async function fetchHistory() {
      setHistoryLoading(true)
      try {
        const symbols = holdings.map(h => h.symbol).join(',')
        const shares = holdings.map(h => h.shares).join(',')
        const period = TIME_PERIODS.find(p => p.value === timePeriod)
        const response = await fetch(`/api/history?symbols=${symbols}&shares=${shares}&range=${period?.range || '1mo'}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          setHistoryData(data as any[])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      }
      setHistoryLoading(false)
    }
    fetchHistory()
  }, [holdings, timePeriod])

  // Fetch news
  useEffect(() => {
    async function fetchNews() {
      setNewsLoading(true)
      try {
        const topSymbols = ['NVDA', 'AAPL', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NFLX', 'AMD', 'CRM', 'MSFT']
        const response = await fetch(`/api/news?symbols=${topSymbols.join(',')}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          setNews(data as any[])
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      }
      setNewsLoading(false)
    }
    fetchNews()
  }, [])

  // Helper function to score headlines by relevance
  const scoreHeadline = (article: any, changePercent: number) => {
    let score = 0
    const title = article.title?.toLowerCase() || ''
    
    PRIORITY_KEYWORDS.forEach(keyword => {
      if (title.includes(keyword.toLowerCase())) {
        score += 10
      }
    })
    
    const positiveWords = ['surge', 'soar', 'rally', 'jump', 'rise', 'gain', 'beat', 'upgrade']
    const negativeWords = ['plunge', 'tank', 'crash', 'drop', 'fall', 'miss', 'downgrade', 'cut']
    
    if (changePercent > 0) {
      positiveWords.forEach(word => {
        if (title.includes(word)) score += 15
      })
    } else {
      negativeWords.forEach(word => {
        if (title.includes(word)) score += 15
      })
    }
    
    const hoursSincePublished = (Date.now() - article.publishedAt) / (1000 * 60 * 60)
    if (hoursSincePublished < 6) {
      score += 25
    } else if (hoursSincePublished < 12) {
      score += 15
    } else if (hoursSincePublished < 24) {
      score += 10
    }
    
    return score
  }

  // Fetch headlines for displayed movers
  useEffect(() => {
    if (loading || Object.keys(prices).length === 0) return
    
    async function fetchMoverHeadlines() {
      setMoverHeadlinesLoading(true)
      try {
        const allSymbols = [...holdings.map(h => h.symbol), ...watchlist.map(w => w.symbol)]
        const uniqueSymbols = [...new Set(allSymbols)]
        
        if (uniqueSymbols.length === 0) {
          setMoverHeadlinesLoading(false)
          return
        }
        
        const response = await fetch(`/api/news?symbols=${uniqueSymbols.join(',')}`)
        const data = await response.json()
        
        const headlinesBySymbol: any = {}
        if (Array.isArray(data)) {
          const articlesBySymbol: any = {}
          data.forEach((article: any) => {
            if (!articlesBySymbol[article.symbol]) {
              articlesBySymbol[article.symbol] = []
            }
            articlesBySymbol[article.symbol].push(article)
          })
          
          Object.keys(articlesBySymbol).forEach(symbol => {
            const articles = articlesBySymbol[symbol]
            const priceData = prices[symbol]
            const changePercent = priceData?.changePercent || 0
            
            const scoredArticles = articles.map((article: any) => ({
              ...article,
              relevanceScore: scoreHeadline(article, changePercent)
            }))
            
            scoredArticles.sort((a: any, b: any) => {
              if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore
              }
              return b.publishedAt - a.publishedAt
            })
            
            headlinesBySymbol[symbol] = scoredArticles.slice(0, 3)
          })
        }
        setMoverHeadlines(headlinesBySymbol)
      } catch (error) {
        console.error('Failed to fetch mover headlines:', error)
      }
      setMoverHeadlinesLoading(false)
    }
    
    fetchMoverHeadlines()
  }, [prices, holdings, watchlist, loading])

  // Toggle row expansion
  const toggleRowExpansion = (symbol: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(symbol)) {
        newSet.delete(symbol)
      } else {
        newSet.add(symbol)
      }
      return newSet
    })
  }

  // Toggle sector expansion
  const toggleSectorExpansion = (sector: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sector)) {
        newSet.delete(sector)
      } else {
        newSet.add(sector)
      }
      return newSet
    })
  }

  // Add a new stock
  const addStock = () => {
    if (!newStock.symbol || !newStock.shares) return
    
    const stock = {
      symbol: newStock.symbol.toUpperCase(),
      name: newStock.name || newStock.symbol.toUpperCase(),
      shares: parseFloat(newStock.shares),
      account: newStock.account
    }
    
    setHoldings(prev => [...prev, stock])
    setNewStock({ symbol: '', name: '', shares: '', account: 'Brokerage' })
    setShowAddModal(false)
  }

  // Add to watchlist
  const addToWatchlist = () => {
    if (!newWatchlistStock.symbol) return
    
    const stock = {
      symbol: newWatchlistStock.symbol.toUpperCase(),
      name: newWatchlistStock.name || newWatchlistStock.symbol.toUpperCase()
    }
    
    setWatchlist(prev => [...prev, stock])
    setNewWatchlistStock({ symbol: '', name: '' })
    setShowWatchlistModal(false)
  }

  // Remove a stock
  const removeStock = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol))
  }

  // Remove from watchlist
  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol))
  }

  // Reset to default holdings
  const resetHoldings = () => {
    setHoldings(defaultHoldings)
    setWatchlist(defaultWatchlist)
    localStorage.removeItem('portfolio-holdings')
    localStorage.removeItem('portfolio-watchlist')
  }

  // Calculate portfolio values with live prices
  const holdingsWithPrices = holdings.map(holding => {
    const priceData = prices[holding.symbol]
    const price = priceData?.price || 0
    const changePercent = priceData?.changePercent || 0
    const value = price * holding.shares
    return { ...holding, price, changePercent, value }
  })

  const watchlistWithPrices = watchlist.map(item => {
    const priceData = prices[item.symbol]
    const price = priceData?.price || 0
    const changePercent = priceData?.changePercent || 0
    return { ...item, price, changePercent }
  })

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.value, 0)
  const totalPreviousValue = holdingsWithPrices.reduce((sum, h) => {
    const priceData = prices[h.symbol]
    const prevPrice = priceData?.previousClose || priceData?.price || 0
    return sum + (prevPrice * h.shares)
  }, 0)
  const totalChange = totalValue - totalPreviousValue
  const totalChangePercent = totalPreviousValue > 0 ? (totalChange / totalPreviousValue) * 100 : 0

  const spyData = prices['SPY'] || {}
  const btcData = prices['BTC-USD'] || {}

  const sortedHoldings = [...holdingsWithPrices].sort((a, b) => {
    if (activeTab === 'losers') return a.changePercent - b.changePercent
    if (activeTab === 'gainers') return b.changePercent - a.changePercent
    return b.value - a.value
  })

  const displayedHoldings = activeTab === 'all' 
    ? sortedHoldings 
    : sortedHoldings.filter(h => activeTab === 'gainers' ? h.changePercent > 0 : h.changePercent < 0).slice(0, 6)

  // Calculate sector exposure
  const sectorExposure = holdingsWithPrices.reduce((acc, holding) => {
    const sectorInfo = STOCK_SECTORS[holding.symbol] || { sector: 'Other', subsector: 'Other' }
    const { sector, subsector } = sectorInfo
    
    if (!acc[sector]) {
      acc[sector] = { value: 0, subsectors: {}, holdings: [] }
    }
    acc[sector].value += holding.value
    acc[sector].holdings.push(holding)
    
    if (!acc[sector].subsectors[subsector]) {
      acc[sector].subsectors[subsector] = { value: 0, holdings: [] }
    }
    acc[sector].subsectors[subsector].value += holding.value
    acc[sector].subsectors[subsector].holdings.push(holding)
    
    return acc
  }, {} as { [key: string]: { value: number; subsectors: { [key: string]: { value: number; holdings: any[] } }; holdings: any[] } })

  // Sort sectors by value
  const sortedSectors = (Object.entries(sectorExposure) as [string, { value: number; subsectors: any; holdings: any[] }][])
  .sort((a, b) => b[1].value - a[1].value)

  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  const formatTime = (date: Date | null) => date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getPeriodLabel = () => {
    const period = TIME_PERIODS.find(p => p.value === timePeriod)
    return period?.label || '1D'
  }

  // Get market status summary (non-AI)
  const getMarketSummary = () => {
    const spyChange = spyData.changePercent || 0
    const topGainers = [...holdingsWithPrices].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3)
    const topLosers = [...holdingsWithPrices].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)
    
    let marketStatus = ''
    if (spyChange > 1) marketStatus = '📈 Markets are rallying today'
    else if (spyChange > 0) marketStatus = '📈 Markets are slightly up'
    else if (spyChange > -1) marketStatus = '📉 Markets are slightly down'
    else marketStatus = '📉 Markets are selling off'
    
    return { marketStatus, topGainers, topLosers, spyChange }
  }

  const marketSummary = getMarketSummary()

  // Send message to Claude
  const sendMessage = async () => {
    if (!inputValue.trim() || isAiLoading) return
    
    const userMessage = inputValue
    setInputValue('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsAiLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          portfolio: holdingsWithPrices.map(h => ({
            symbol: h.symbol,
            name: h.name,
            shares: h.shares,
            price: h.price,
            value: h.value,
            changePercent: h.changePercent,
            account: h.account
          }))
        })
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response || data.error }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I had trouble responding. Please try again.' }])
    }
    setIsAiLoading(false)
  }

  // Render expandable headlines row
  const renderHeadlinesRow = (symbol: string, colSpan: number) => {
    const headlines = moverHeadlines[symbol] || []
    if (!expandedRows.has(symbol)) return null
    
    return (
      <tr key={`${symbol}-headlines`} style={{ background: 'var(--bg-tertiary)' }}>
        <td colSpan={colSpan} style={{ padding: '12px 20px' }}>
          {moverHeadlinesLoading ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading headlines...</div>
          ) : headlines.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent news for {symbol}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {headlines.map((headline: any, idx: number) => (
                <div 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); headline?.link && window.open(headline.link, '_blank') }}
                  style={{ 
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    cursor: headline?.link ? 'pointer' : 'default',
                    padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-secondary)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{headline?.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{headline.publisher}</span>
                      <span style={{ 
                        fontSize: '11px', padding: '2px 6px',
                        background: headline.publishedAt > Date.now() - 6 * 60 * 60 * 1000 ? 'var(--accent-blue-dim)' : 'var(--bg-tertiary)',
                        color: headline.publishedAt > Date.now() - 6 * 60 * 60 * 1000 ? 'var(--accent-blue)' : 'var(--text-muted)',
                        borderRadius: '4px'
                      }}>{formatTimeAgo(headline.publishedAt)}</span>
                      {headline.relevanceScore >= 20 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--accent-orange-dim)', color: 'var(--accent-orange)', borderRadius: '4px', fontWeight: 600 }}>KEY</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Add Stock Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', width: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Add New Stock</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Symbol *</label>
                <input type="text" placeholder="e.g. AAPL" value={newStock.symbol} onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</label>
                <input type="text" placeholder="e.g. Apple Inc" value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shares *</label>
                <input type="number" placeholder="e.g. 100" value={newStock.shares} onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</label>
                <select value={newStock.account} onChange={(e) => setNewStock({ ...newStock, account: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }}>
                  <option value="Brokerage">Brokerage</option>
                  <option value="Roth IRA">Roth IRA</option>
                  <option value="IRA">IRA</option>
                  <option value="401k">401k</option>
                  <option value="Coinbase">Coinbase</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addStock} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-blue)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Watchlist Modal */}
      {showWatchlistModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', width: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Add to Watchlist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Symbol *</label>
                <input type="text" placeholder="e.g. PLTR" value={newWatchlistStock.symbol} onChange={(e) => setNewWatchlistStock({ ...newWatchlistStock, symbol: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</label>
                <input type="text" placeholder="e.g. Palantir Technologies" value={newWatchlistStock.name} onChange={(e) => setNewWatchlistStock({ ...newWatchlistStock, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '6px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowWatchlistModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addToWatchlist} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-purple)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Add to Watchlist</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', padding: '10px 24px', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
            🎯 Demo Mode — Add your own stocks below! Data resets on browser clear. Built by Chaitu.
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>P</span>
                  Portfolio AI
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  {lastUpdated && ` • Updated ${formatTime(lastUpdated)}`}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                {TIME_PERIODS.map(period => (
                  <button key={period.value} onClick={() => setTimePeriod(period.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
                      background: timePeriod === period.value ? 'var(--accent-blue)' : 'transparent',
                      color: timePeriod === period.value ? 'white' : 'var(--text-secondary)' }}>
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={resetHoldings} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>↺ Reset</button>
              <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent-blue)', color: 'white' }}>+ Add Stock</button>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', padding: '20px 24px', overflow: 'auto', background: 'var(--bg-primary)' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <SummaryCard label="Total Portfolio" value={loading ? '...' : formatCurrency(totalValue)} change={totalChange} changePercent={totalChangePercent} featured loading={loading} period={getPeriodLabel()} />
              <SummaryCard label="S&P 500 (SPY)" value={loading ? '...' : `$${formatNumber(spyData.price || 0)}`} changePercent={spyData.changePercent || 0} loading={loading} period={getPeriodLabel()} />
              <SummaryCard label="NASDAQ (QQQ)" value={loading ? '...' : `$${formatNumber(prices['QQQ']?.price || 0)}`} changePercent={prices['QQQ']?.changePercent || 0} loading={loading} period={getPeriodLabel()} />
              <SummaryCard label="Bitcoin" value={loading ? '...' : formatCurrency(btcData.price || 0)} changePercent={btcData.changePercent || 0} loading={loading} period={getPeriodLabel()} />
            </div>

            {/* Today's Movers */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)' }}>📈</span> Today&apos;s Movers
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(click row for news)</span>
                </h2>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                  <TabButton active={activeTab === 'gainers'} onClick={() => setActiveTab('gainers')}>Gainers</TabButton>
                  <TabButton active={activeTab === 'losers'} onClick={() => setActiveTab('losers')}>Losers</TabButton>
                  <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</TabButton>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Holding</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Change ({getPeriodLabel()})</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedHoldings.map((holding) => (
                    <Fragment key={holding.symbol}>
                      <tr onClick={() => toggleRowExpansion(holding.symbol)}
                        style={{ borderBottom: expandedRows.has(holding.symbol) ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: expandedRows.has(holding.symbol) ? 'var(--bg-tertiary)' : 'transparent' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{expandedRows.has(holding.symbol) ? '▼' : '▶'}</span>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{holding.symbol.slice(0, 2)}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{holding.symbol}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-muted)' }}>{holding.account}</span></td>
                        <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>{loading ? '...' : `$${formatNumber(holding.price)}`}</td>
                        <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>{loading ? '...' : formatCurrency(holding.value)}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                            background: holding.changePercent >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                            color: holding.changePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {loading ? '...' : `${holding.changePercent >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%`}
                          </span>
                        </td>
                        <td style={{ padding: '14px 10px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => removeStock(holding.symbol)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'var(--accent-red-dim)', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </td>
                      </tr>
                      {renderHeadlinesRow(holding.symbol, 6)}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Watchlist */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-purple)' }}>👁️</span> Watchlist
                </h2>
                <button onClick={() => setShowWatchlistModal(true)} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent-purple)', color: 'white' }}>+ Add</button>
              </div>

              {watchlistWithPrices.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No stocks in watchlist</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symbol</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Change ({getPeriodLabel()})</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlistWithPrices.map((item) => (
                      <Fragment key={item.symbol}>
                        <tr onClick={() => toggleRowExpansion(item.symbol)}
                          style={{ borderBottom: expandedRows.has(item.symbol) ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: expandedRows.has(item.symbol) ? 'var(--bg-tertiary)' : 'transparent' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{expandedRows.has(item.symbol) ? '▼' : '▶'}</span>
                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.symbol.slice(0, 2)}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.symbol}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>{loading ? '...' : `$${formatNumber(item.price)}`}</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                              background: item.changePercent >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                              color: item.changePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                              {loading ? '...' : `${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`}
                            </span>
                          </td>
                          <td style={{ padding: '14px 10px' }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => removeFromWatchlist(item.symbol)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'var(--accent-red-dim)', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          </td>
                        </tr>
                        {renderHeadlinesRow(item.symbol, 4)}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sector Exposure */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-orange)' }}>🎯</span> Sector Exposure
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(double-click for subsectors)</span>
                </h2>
              </div>

              <div style={{ padding: '16px 20px' }}>
                {/* Sector Bar Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sortedSectors.map(([sector, data]) => {
                    const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0
                    const isExpanded = expandedSectors.has(sector)
                    const sortedSubsectors = Object.entries(data.subsectors).sort(([, a], [, b]) => b.value - a.value)
                    
                    return (
                      <div key={sector}>
                        {/* Sector Row */}
                        <div 
                          onDoubleClick={() => toggleSectorExpansion(sector)}
                          style={{ cursor: 'pointer', padding: '8px 0' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{isExpanded ? '▼' : '▶'}</span>
                              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: SECTOR_COLORS[sector] || SECTOR_COLORS['Other'] }}></span>
                              <span style={{ fontSize: '14px', fontWeight: 500 }}>{sector}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({data.holdings.length} {data.holdings.length === 1 ? 'holding' : 'holdings'})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{formatCurrency(data.value)}</span>
                              <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${percentage}%`, 
                              background: SECTOR_COLORS[sector] || SECTOR_COLORS['Other'],
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>

                        {/* Subsector Breakdown */}
                        {isExpanded && (
                          <div style={{ marginLeft: '24px', marginTop: '8px', paddingLeft: '12px', borderLeft: `2px solid ${SECTOR_COLORS[sector] || SECTOR_COLORS['Other']}` }}>
                            {sortedSubsectors.map(([subsector, subData]) => {
                              const subPercentage = totalValue > 0 ? (subData.value / totalValue) * 100 : 0
                              const sectorPercentage = data.value > 0 ? (subData.value / data.value) * 100 : 0
                              
                              return (
                                <div key={subsector} style={{ padding: '6px 0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{subsector}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        ({subData.holdings.map(h => h.symbol).join(', ')})
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                      <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>{formatCurrency(subData.value)}</span>
                                      <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', minWidth: '60px', textAlign: 'right' }}>{subPercentage.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                  <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ 
                                      height: '100%', 
                                      width: `${sectorPercentage}%`, 
                                      background: SECTOR_COLORS[sector] || SECTOR_COLORS['Other'],
                                      opacity: 0.6,
                                      borderRadius: '2px'
                                    }}></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Portfolio History Chart */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-blue)' }}>📈</span> Portfolio Value ({getPeriodLabel()})
                {historyLoading && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(loading...)</span>}
              </h2>
              <div style={{ height: '250px' }}>
                {historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={{ stroke: 'var(--border)' }} axisLine={{ stroke: 'var(--border)' }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={{ stroke: 'var(--border)' }} axisLine={{ stroke: 'var(--border)' }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                      <Line type="monotone" dataKey="value" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    {historyLoading ? 'Loading...' : 'No data available'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Market Summary (Non-AI) */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-orange)' }}>📊</span> Market Overview
              </h2>
              
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
                {marketSummary.marketStatus}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>S&P 500</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: marketSummary.spyChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {marketSummary.spyChange >= 0 ? '+' : ''}{marketSummary.spyChange.toFixed(2)}%
                  </div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Your Portfolio</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: totalChangePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {!loading && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '8px' }}>🔥 Top Gainers</div>
                    {marketSummary.topGainers.filter(g => g.changePercent > 0).slice(0, 3).map(stock => (
                      <div key={stock.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{stock.symbol}</span>
                        <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-green)' }}>+{stock.changePercent.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '8px' }}>📉 Top Losers</div>
                    {marketSummary.topLosers.filter(l => l.changePercent < 0).slice(0, 3).map(stock => (
                      <div key={stock.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{stock.symbol}</span>
                        <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-red)' }}>{stock.changePercent.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Chat Panel */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)' }}>💬</span> Ask AI
                </h2>
              </div>
              
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px', maxHeight: '300px' }}>
                {chatMessages.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    Ask me anything about your portfolio!
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0,
                      background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-tertiary)'
                    }}>
                      {msg.role === 'ai' ? '✦' : 'C'}
                    </div>
                    <div style={{
                      padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap',
                      background: msg.role === 'ai' ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
                      borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                      maxWidth: '85%'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>✦</div>
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Thinking...</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
                  <input type="text" placeholder="Ask about your portfolio..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
                  <button onClick={sendMessage} disabled={isAiLoading} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-blue)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isAiLoading ? 0.5 : 1 }}>➤</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  <SuggestionChip onClick={() => setInputValue("What's my biggest position?")}>Biggest position?</SuggestionChip>
                  <SuggestionChip onClick={() => setInputValue("How am I doing today?")}>How am I doing?</SuggestionChip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ label, value, change, changePercent, featured, loading, period }: { label: string; value: string; change?: number; changePercent: number; featured?: boolean; loading: boolean; period: string }) {
  const isPositive = (changePercent || 0) >= 0
  return (
    <div style={{
      background: featured ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' : 'var(--bg-secondary)',
      border: `1px solid ${featured ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'}`,
      borderRadius: '12px', padding: '16px'
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px' }}>{value}</div>
      {!loading && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12px', fontWeight: 500, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {isPositive ? '↑' : '↓'}
          {change !== undefined && `$${Math.abs(change).toLocaleString(undefined, {maximumFractionDigits: 0})} `}
          ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{period}</span>
        </div>
      )}
    </div>
  )
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer',
      background: active ? 'var(--bg-secondary)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)'
    }}>{children}</button>
  )
}

function SuggestionChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <span onClick={onClick} style={{
      padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
      fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer'
    }}>{children}</span>
  )
}