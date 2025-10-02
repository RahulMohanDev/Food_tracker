import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition label analyzer. Extract nutritional information from the nutrition label image and return ONLY a JSON object with the following format:
{
  "name": "product name",
  "servingSize": number (in grams),
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams - total carbohydrates),
  "fat": number (in grams - total fat)
}

Extract the values PER SERVING as shown on the label. If any value is not clearly visible, use 0.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this nutrition label and extract the nutritional information.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    let result = response.choices[0].message.content || '{}'

    // Remove markdown code blocks if present
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const nutritionData = JSON.parse(result)

    return NextResponse.json(nutritionData)
  } catch (error) {
    console.error('Error analyzing label:', error)
    return NextResponse.json({ error: 'Failed to analyze nutrition label' }, { status: 500 })
  }
}
