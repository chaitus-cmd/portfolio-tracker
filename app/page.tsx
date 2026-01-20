'use client'

import { useState } from 'react'

// Your actual portfolio data
const portfolioData = {
  totalValue: 1127432,
  dayChange: -14832,
  dayChangePercent: -1.30,
  holdings: [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', shares: 56.006, price: 243.12, value: 13617, change: -3.31, account: 'Roth IRA' },
    { symbol: 'CRWV', name: 'CoreWeave Inc', shares: 50, price: 89.45, value: 4472, change: -5.12, account: 'Brokerage' },
    { symbol: 'TSLA', name: 'Tesla Inc', shares: 29, price: 410.89, value: 11916, change: -2.87, account: 'Brokerage' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', shares: 67, price: 228.34, value: 15299, change: -2.45, account: 'Brokerage' },
    { symbol: 'META', name: 'Meta Platforms Inc', shares: 5.004, price: 593.21, value: 2969, change: -2.08, account: 'Brokerage' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', shares: 1101, price: 225.43, value: 248198, change: -1.54, account: 'Brokerage' },
    { symbol: 'GOOG', name: 'Alphabet Inc', shares: 171.97, price: 318.52, value: 54773, change: -1.23, account: 'Brokerage' },
    { symbol: 'AAPL', name: 'Apple Inc', shares: 54.64, price: 234.21, value: 12797, change: -0.89, account: 'Brokerage' },
    { symbol: 'NFLX', name: 'Netflix Inc', shares: 250, price: 925.43, value: 231358, change: 0.45, account: 'Brokerage' },
    { symbol: 'SHLD', name: 'Global X Defense Tech ETF', shares: 519, price: 79.23, value: 41120, change: 1.20, account: 'Brokerage' },
  ]
}

const marketData = {
  sp500: { value: 6836.24, change: -1.30 },
  nasdaq: { value: 23201.45, change: -1.10 },
  bitcoin: { value: 91121, change: -2.02 }
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('losers')
  const [chatMessages, setChatMessages] = useState([
    { role: 'user', content: 'Why is my portfolio down today?' },
    { role: 'ai', content: "Your portfolio is down -$14,832 (-1.30%) today, largely due to Trump's new tariff threats against European allies over Greenland.\n\nYour biggest losers:\n• CRWV -5.12% — AI infrastructure stocks hit hard\n• NVDA -3.31% — Tech selloff on bond yield fears\n• TSLA -2.87% — Broad risk-off sentiment\n\nYour defense ETF SHLD is actually up +1.2%, providing some cushion." }
  ])
  const [inputValue, setInputValue] = useState('')

  const sortedHoldings = [...portfolioData.holdings].sort((a, b) => {
    if (activeTab === 'losers') return a.change - b.change
    if (activeTab === 'gainers') return b.change - a.change
    return b.value - a.value
  })

  const displayedHoldings = activeTab === 'all' 
    ? sortedHoldings 
    : sortedHoldings.slice(0, 5)

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
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

        {/* Nav */}
        <nav>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '8px' }}>
            Overview
          </div>
          <NavItem icon="dashboard" label="Dashboard" active />
          <NavItem icon="holdings" label="Holdings" />
          <NavItem icon="performance" label="Performance" />
          <NavItem icon="history" label="History" />

          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px', marginBottom: '8px', marginTop: '24px' }}>
            Accounts
          </div>
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
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Good morning, Chaitu 👋</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tuesday, January 20, 2026 • Markets are open</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" icon="refresh">Sync</Button>
            <Button variant="primary" icon="doc">Daily Brief</Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gridTemplateRows: 'auto 1fr',
          gap: '20px',
          padding: '20px 24px',
          overflow: 'auto',
          background: 'var(--bg-primary)'
        }}>
          {/* Summary Cards */}
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <SummaryCard 
              label="Total Portfolio" 
              value={formatCurrency(portfolioData.totalValue)}
              change={portfolioData.dayChange}
              changePercent={portfolioData.dayChangePercent}
              featured
            />
            <SummaryCard 
              label="S&P 500" 
              value={formatNumber(marketData.sp500.value)}
              changePercent={marketData.sp500.change}
            />
            <SummaryCard 
              label="NASDAQ" 
              value={formatNumber(marketData.nasdaq.value)}
              changePercent={marketData.nasdaq.change}
            />
            <SummaryCard 
              label="Bitcoin" 
              value={formatCurrency(marketData.bitcoin.value)}
              changePercent={marketData.bitcoin.change}
            />
          </div>

          {/* Main Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Holdings Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)' }}>📈</span>
                  Today's Movers
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
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Holding</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedHoldings.map((holding, i) => (
                    <tr key={holding.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                          }}>{holding.symbol.slice(0, 2)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{holding.symbol}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{holding.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-muted)' }}>{holding.account}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>${formatNumber(holding.price)}</td>
                      <td style={{ padding: '14px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>{formatCurrency(holding.value)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                          background: holding.change >= 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                          color: holding.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Allocation Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-blue)' }}>📊</span>
                Asset Allocation
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    var(--accent-blue) 0deg 180deg,
                    var(--accent-purple) 180deg 252deg,
                    var(--accent-green) 252deg 306deg,
                    var(--accent-orange) 306deg 360deg
                  )`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>$1.1M</div>
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

          {/* AI Chat Panel */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content',
            maxHeight: '600px'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: 600
            }}>
              <span style={{ color: 'var(--accent-blue)' }}>💬</span>
              Ask AI
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-tertiary)'
                  }}>
                    {msg.role === 'ai' ? '✦' : 'C'}
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    background: msg.role === 'ai' ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
                    borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '4px'
              }}>
                <input
                  type="text"
                  placeholder="Ask about your portfolio..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--accent-blue)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ➤
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <SuggestionChip>What's my AI exposure?</SuggestionChip>
                <SuggestionChip>Tax loss opportunities</SuggestionChip>
                <SuggestionChip>Rebalancing ideas</SuggestionChip>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components
function NavItem({ icon, label, active }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '8px',
      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
      background: active ? 'var(--accent-blue-dim)' : 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.15s'
    }}>
      <span style={{ opacity: 0.7 }}>
        {icon === 'dashboard' && '▦'}
        {icon === 'holdings' && '$'}
        {icon === 'performance' && '📈'}
        {icon === 'history' && '🕐'}
        {icon === 'add' && '+'}
        {icon === 'settings' && '⚙'}
      </span>
      {label}
    </div>
  )
}

function AccountBadge({ name, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></span>
      {name}
    </div>
  )
}

function Button({ children, variant, icon }) {
  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      border: variant === 'primary' ? 'none' : '1px solid var(--border)',
      background: variant === 'primary' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      transition: 'all 0.15s'
    }}>
      {icon === 'refresh' && '↻'}
      {icon === 'doc' && '📄'}
      {children}
    </button>
  )
}

function SummaryCard({ label, value, change, changePercent, featured }) {
  const isPositive = (changePercent || 0) >= 0
  return (
    <div style={{
      background: featured ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' : 'var(--bg-secondary)',
      border: `1px solid ${featured ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-1px' }}>{value}</div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '8px',
        fontSize: '13px',
        fontWeight: 500,
        color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
      }}>
        {isPositive ? '↑' : '↓'}
        {change !== undefined && `$${Math.abs(change).toLocaleString()} `}
        ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
      </div>
    </div>
  )
}

function TabButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      border: 'none',
      cursor: 'pointer',
      background: active ? 'var(--bg-secondary)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      transition: 'all 0.15s'
    }}>
      {children}
    </button>
  )
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }}></span>
      {label}
      <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}

function SuggestionChip({ children }) {
  return (
    <span style={{
      padding: '6px 12px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      fontSize: '12px',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      transition: 'all 0.15s'
    }}>
      {children}
    </span>
  )
}