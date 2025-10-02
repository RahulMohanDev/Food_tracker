import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, description } = body

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a nutritionist AI. Analyze the food image and description provided and return ONLY a JSON object with nutritional estimates per serving. Format:
{
  "name": "food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servingSize": number (in grams)
}`,
      },
    ]

    if (imageBase64 && description) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this food: ${description}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      })
    } else if (description) {
      messages.push({
        role: 'user',
        content: `Analyze this food: ${description}`,
      })
    } else {
      return NextResponse.json({ error: 'Either image or description required' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    })

    const result = response.choices[0].message.content
    const nutritionData = JSON.parse(result || '{}')

    return NextResponse.json(nutritionData)
  } catch (error) {
    console.error('Error analyzing food:', error)
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 })
  }
}
