import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { imageBase64, description } = body

    if (!description && !imageBase64) {
      return NextResponse.json({ error: 'Either image or description required' }, { status: 400 })
    }

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a nutritionist AI. Analyze the food image and/or description provided and return ONLY a JSON object with nutritional estimates. Format:
{
  "name": "food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servingSize": number (in grams)
}

Provide realistic estimates based on typical serving sizes. Do not include any markdown formatting or code blocks, just the raw JSON object.`,
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
    } else if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this food image and provide nutritional information.',
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
        content: `Analyze this food and provide nutritional information: ${description}`,
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    })

    let result = response.choices[0].message.content || '{}'

    // Remove markdown code blocks if present
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const nutritionData = JSON.parse(result)

    // Validate the response has required fields
    if (!nutritionData.name || nutritionData.calories === undefined) {
      throw new Error('Invalid response from AI - missing required fields')
    }

    return NextResponse.json(nutritionData)
  } catch (error) {
    logError('POST /api/analyze-food', error, {
      hasImage: !!body?.imageBase64,
      hasDescription: !!body?.description
    })

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze food'
    return NextResponse.json({
      error: 'Failed to analyze food. Please try again or enter manually.',
      details: errorMessage
    }, { status: 500 })
  }
}
