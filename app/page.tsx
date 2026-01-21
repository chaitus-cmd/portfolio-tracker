'use client'

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

export default function Dashboard() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('losers')
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
  const [newStock, setNewStock] = useState({ symbol: '', name: '', shares: '', account: 'Brokerage' })

  // Load holdings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-holdings')
    if (saved) {
      setHoldings(JSON.parse(saved))
    } else {
      setHoldings(defaultHoldings)
    }
  }, [])

  // Save holdings to localStorage whenever they change
  useEffect(() => {
    if (holdings.length > 0) {
      localStorage.setItem('portfolio-holdings', JSON.stringify(holdings))
    }
  }, [holdings])

  // Fetch live prices
  useEffect(() => {
    if (holdings.length === 0) return
    
    async function fetchPrices() {
      setLoading(true)
      try {
        const allSymbols = [...holdings.map(h => h.symbol), 'SPY']
        const response = await fetch(`/api/market?symbols=${allSymbols.join(',')}`)
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
  }, [holdings])

  // Fetch historical data
  useEffect(() => {
    if (holdings.length === 0) return
    
    async function fetchHistory() {
      setHistoryLoading(true)
      try {
        const symbols = holdings.map(h => h.symbol).join(',')
        const shares = holdings.map(h => h.shares).join(',')
        const response = await fetch(`/api/history?symbols=${symbols}&shares=${shares}`)
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
  }, [holdings])

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

  // Remove a stock
  const removeStock = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol))
  }

  // Reset to default holdings
  const resetHoldings = () => {
    setHoldings(defaultHoldings)
    localStorage.removeItem('portfolio-holdings')
  }

  // Calculate portfolio values with live prices
  const holdingsWithPrices = holdings.map(holding => {
    const priceData = prices[holding.symbol]
    const price = priceData?.price || 0
    const changePercent = priceData?.changePercent || 0
    const value = price * holding.shares
    return { ...holding, price, changePercent, value }
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Add Stock Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            width: '400px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Add New Stock</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Symbol *</label>
                <input
                  type="text"
                  placeholder="e.g. AAPL"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    marginTop: '6px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apple Inc"
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    marginTop: '6px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shares *</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={newStock.shares}
                  onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    marginTop: '6px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</label>
                <select
                  value={newStock.account}
                  onChange={(e) => setNewStock({ ...newStock, account: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    marginTop: '6px'
                  }}
                >
                  <option value="Brokerage">Brokerage</option>
                  <option value="Roth IRA">Roth IRA</option>
                  <option value="IRA">IRA</option>
                  <option value="401k">401k</option>
                  <option value="Coinbase">Coinbase</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addStock}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-blue)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '24px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>P</div>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Portfolio AI</span>
        </div>

        <nav>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '8px' }}>Overview</div>
          <NavItem icon="dashboard" label="Dashboard" active />
          <NavItem icon="holdings" label="Holdings" />
          <NavItem icon="performance" label="Performance" />
          <NavItem icon="history" label="History" />

          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '8px', marginTop: '24px' }}>Accounts</div>
          <AccountBadge name="Vanguard" color="#c41230" />
          <AccountBadge name="Fidelity" color="#4aa74b" />
          <AccountBadge name="Robinhood" color="#00c805" />
          <NavItem icon="add" label="Link Account" />
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <NavItem icon="settings" label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          {/* Demo Disclaimer Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 500,
            textAlign: 'center'
          }}>
            🎯 Demo Mode — Add your own stocks below! Data resets on browser clear. Built by Chaitu.
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px'
          }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Welcome to Portfolio AI 👋</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                {lastUpdated && ` • Updated ${formatTime(lastUpdated)}`}
                {loading && ' • Refreshing...'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={resetHoldings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                ↺ Reset
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'var(--accent-blue)',
                  color: 'white'
                }}
              >
                + Add Stock
              </button>
            </div>
          </div>
        </header>

        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gridTemplateRows: 'auto 1fr auto',
          gap: '20px',
          padding: '20px 24px',
          overflow: 'auto',
          background: 'var(--bg-primary)'
        }}>
          {/* Summary Cards */}
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <SummaryCard label="Total Portfolio" value={loading ? '...' : formatCurrency(totalValue)} change={totalChange} changePercent={totalChangePercent} featured loading={loading} />
            <SummaryCard label="S&P 500 (SPY)" value={loading ? '...' : `$${formatNumber(spyData.price || 0)}`} changePercent={spyData.changePercent || 0} loading={loading} />
            <SummaryCard label="NASDAQ (QQQ)" value={loading ? '...' : `$${formatNumber(prices['QQQ']?.price || 0)}`} changePercent={prices['QQQ']?.changePercent || 0} loading={loading} />
            <SummaryCard label="Bitcoin" value={loading ? '...' : formatCurrency(btcData.price || 0)} changePercent={btcData.changePercent || 0} loading={loading} />
          </div>

          {/* Holdings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)' }}>📈</span> Today&apos;s Movers
                  {loading && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(loading...)</span>}
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
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Change</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedHoldings.map((holding) => (
                    <tr key={holding.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        <span style={{
                          display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                          background: holding.changePercent >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                          color: holding.changePercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                          {loading ? '...' : `${holding.changePercent >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <button
                          onClick={() => removeStock(holding.symbol)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'var(--accent-red-dim)',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Allocation */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-blue)' }}>📊</span> Asset Allocation
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'conic-gradient(var(--accent-blue) 0deg 180deg, var(--accent-purple) 180deg 252deg, var(--accent-green) 252deg 306deg, var(--accent-orange) 306deg 360deg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{loading ? '...' : `$${(totalValue / 1000).toFixed(0)}k`}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <LegendItem color="var(--accent-blue)" label="Individual Stocks" value="50%" />
                  <LegendItem color="var(--accent-purple)" label="Index Funds & ETFs" value="30%" />
                  <LegendItem color="var(--accent-green)" label="Thematic ETFs" value="15%" />
                  <LegendItem color="var(--accent-orange)" label="Cash & Crypto" value="5%" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat & News */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: '600px' }}>
            {/* Tab Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', borderRadius: '12px 12px 0 0' }}>
              <TabButton active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')}>
                💬 Ask AI
              </TabButton>
              <TabButton active={rightPanelTab === 'news'} onClick={() => setRightPanelTab('news')}>
                📰 News {newsLoading ? '' : `(${news.length})`}
              </TabButton>
            </div>

            {/* Chat Panel */}
            {rightPanelTab === 'chat' && (
              <>
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px', maxHeight: '400px' }}>
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
                    <input
                      type="text"
                      placeholder="Ask about your portfolio..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    />
                    <button 
                      onClick={sendMessage}
                      disabled={isAiLoading}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-blue)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isAiLoading ? 0.5 : 1 }}
                    >
                      ➤
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    <SuggestionChip onClick={() => setInputValue("What's my biggest position?")}>What&apos;s my biggest position?</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue("How am I doing today?")}>How am I doing today?</SuggestionChip>
                  </div>
                </div>
              </>
            )}

            {/* News Panel */}
            {rightPanelTab === 'news' && (
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
                {newsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading news...
                  </div>
                ) : news.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No news available
                  </div>
                ) : (
                  news.map((article, i) => {
                    return (
                      <div
                        key={i}
                        onClick={() => window.open(article.link, '_blank')}
                        style={{
                          display: 'block',
                          padding: '14px 16px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {article.thumbnail && (
                            <img 
                              src={article.thumbnail} 
                              alt="" 
                              style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
                              {article.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', borderRadius: '4px', fontWeight: 600 }}>
                                {article.symbol}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {article.publisher} · {formatTimeAgo(article.publishedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Portfolio History Chart */}
          <div style={{ 
            gridColumn: '1 / -1', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: '12px', 
            padding: '20px' 
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-blue)' }}>📈</span> Portfolio Value Over Time
              {historyLoading && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(loading...)</span>}
            </h2>
            <div style={{ height: '300px' }}>
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--accent-blue)" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  {historyLoading ? 'Loading historical data...' : 'No historical data available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
      background: active ? 'var(--accent-blue-dim)' : 'transparent'
    }}>
      <span style={{ opacity: 0.7 }}>
        {icon === 'dashboard' && '▦'}{icon === 'holdings' && '$'}{icon === 'performance' && '📈'}{icon === 'history' && '🕐'}{icon === 'add' && '+'}{icon === 'settings' && '⚙'}
      </span>
      {label}
    </div>
  )
}

function AccountBadge({ name, color }: { name: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></span>
      {name}
    </div>
  )
}

function SummaryCard({ label, value, change, changePercent, featured, loading }: { label: string; value: string; change?: number; changePercent: number; featured?: boolean; loading: boolean }) {
  const isPositive = (changePercent || 0) >= 0
  return (
    <div style={{
      background: featured ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' : 'var(--bg-secondary)',
      border: `1px solid ${featured ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'}`,
      borderRadius: '12px', padding: '20px'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px' }}>{value}</div>
      {!loading && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '13px', fontWeight: 500, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {isPositive ? '↑' : '↓'}
          {change !== undefined && `$${Math.abs(change).toLocaleString(undefined, {maximumFractionDigits: 0})} `}
          ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
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

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }}></span>
      {label}
      <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{value}</span>
    </div>
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
