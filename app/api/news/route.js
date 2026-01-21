export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')
  
  if (!symbols) {
    return Response.json({ error: 'No symbols provided' }, { status: 400 })
  }

  const symbolList = symbols.split(',').slice(0, 10) // Limit to 10 symbols to avoid too many requests
  
  try {
    const allNews = []
    
    for (const symbol of symbolList) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3&quotesCount=0`,
          { 
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        )
        
        const data = await response.json()
        
        if (data.news && data.news.length > 0) {
          data.news.forEach(article => {
            allNews.push({
              symbol,
              title: article.title,
              link: article.link,
              publisher: article.publisher,
              publishedAt: article.providerPublishTime * 1000,
              thumbnail: article.thumbnail?.resolutions?.[0]?.url || null
            })
          })
        }
      } catch (e) {
        console.error(`Error fetching news for ${symbol}:`, e)
      }
    }
    
    // Sort by date (newest first) and remove duplicates by title
    const uniqueNews = allNews
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .filter((article, index, self) => 
        index === self.findIndex(a => a.title === article.title)
      )
      .slice(0, 15) // Return top 15 articles
    
    return Response.json(uniqueNews)
  } catch (error) {
    console.error('News API error:', error)
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}