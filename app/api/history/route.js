export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')
  const shares = searchParams.get('shares')
  
  if (!symbols || !shares) {
    return Response.json({ error: 'Missing symbols or shares' }, { status: 400 })
  }

  const symbolList = symbols.split(',')
  const sharesList = shares.split(',').map(Number)
  
  try {
    // Fetch 5 years of monthly data for each symbol
    const historyBySymbol = {}
    
    for (const symbol of symbolList) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=5y`,
          { 
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        )
        const data = await response.json()
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0]
          const timestamps = result.timestamp || []
          const closes = result.indicators?.quote?.[0]?.close || []
          
          historyBySymbol[symbol] = timestamps.map((ts, i) => ({
            date: ts * 1000,
            price: closes[i]
          })).filter(d => d.price !== null)
        }
      } catch (e) {
        console.error(`Error fetching history for ${symbol}:`, e)
      }
    }
    
    // Build portfolio value over time
    // Get all unique dates
    const allDates = new Set()
    Object.values(historyBySymbol).forEach(history => {
      history.forEach(d => allDates.add(d.date))
    })
    
    const sortedDates = Array.from(allDates).sort((a, b) => a - b)
    
    // Calculate portfolio value for each date
    const portfolioHistory = sortedDates.map(date => {
      let totalValue = 0
      let hasData = false
      
      symbolList.forEach((symbol, i) => {
        const symbolHistory = historyBySymbol[symbol] || []
        // Find the closest price on or before this date
        const priceData = symbolHistory.filter(d => d.date <= date).pop()
        if (priceData) {
          totalValue += priceData.price * sharesList[i]
          hasData = true
        }
      })
      
      return hasData ? {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round(totalValue)
      } : null
    }).filter(Boolean)
    
    return Response.json(portfolioHistory)
  } catch (error) {
    console.error('History API error:', error)
    return Response.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}