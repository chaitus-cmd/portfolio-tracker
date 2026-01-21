import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { message, portfolio } = await request.json()

    const systemPrompt = `You are a helpful AI assistant for a personal investment portfolio app. You have access to the user's real portfolio data.

PORTFOLIO DATA:
${JSON.stringify(portfolio, null, 2)}

GUIDELINES:
- Be concise and direct
- Reference specific holdings by ticker symbol when relevant
- Use actual numbers from their portfolio
- If asked about market movements, explain based on the data you have
- For investment advice, remind them you're an AI and they should consult a financial advisor for major decisions
- Be conversational and friendly`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ]
    })

    return Response.json({ 
      response: response.content[0].text 
    })
  } catch (error) {
    console.error('Claude API error:', error)
    return Response.json(
      { error: 'Failed to get response from AI' }, 
      { status: 500 }
    )
  }
}
