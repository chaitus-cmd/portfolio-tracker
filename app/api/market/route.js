export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')
  const range = searchParams.get('range') || '1d'
  
  if (!symbols) {
    return Response.json({ error: 'No symbols provided' }, { status: 400 })
  }

  const symbolList = symbols.split(',')
  
  // Map range to Yahoo Finance parameters
  const rangeConfig = {
    '1d': { range: '5d', interval: '1d', daysBack: 1 },
    '5d': { range: '5d', interval: '1d', daysBack: 5 },
    '1mo': { range: '1mo', interval: '1d', daysBack: 30 },
    '3mo': { range: '3mo', interval: '1d', daysBack: 90 },
  }
  
  const config = rangeConfig[range] || rangeConfig['1d']
  
  try {
    const quotes = {}
    
    for (const symbol of symbolList) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${config.interval}&range=${config.range}`,
          { 
            next: { revalidate: 60 },
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        )
        
        const data = await response.json()
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0]
          const meta = result.meta
          const closes = result.indicators?.quote?.[0]?.close?.filter(c => c !== null) || []
          
          const currentPrice = meta.regularMarketPrice
          
          let previousClose
          
          if (range === '1d') {
            // For 1 day, use yesterday's close
            previousClose = closes.length >= 2 
              ? closes[closes.length - 2] 
              : meta.previousClose
          } else {
            // For other periods, use the first available close price in the range
            previousClose = closes.length > 0 
              ? closes[0] 
              : meta.previousClose
          }
          
          const change = currentPrice - previousClose
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
          
          quotes[symbol] = {
            price: currentPrice,
            previousClose: previousClose,
            change: change,
            changePercent: changePercent,
            range: range
          }
        }
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e)
      }
    }
    
    return Response.json(quotes)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}