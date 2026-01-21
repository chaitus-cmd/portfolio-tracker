export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')
  
  if (!symbols) {
    return Response.json({ error: 'No symbols provided' }, { status: 400 })
  }

  const symbolList = symbols.split(',')
  
  try {
    const quotes = {}
    
    for (const symbol of symbolList) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
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
          // Use the second-to-last close price as previous close (more reliable)
          const previousClose = closes.length >= 2 
            ? closes[closes.length - 2] 
            : meta.previousClose
          
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100
          
          quotes[symbol] = {
            price: currentPrice,
            previousClose: previousClose,
            change: change,
            changePercent: changePercent
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