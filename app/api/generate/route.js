import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    // Google Gemini API URL (Using gemini-1.5-flash model for speed)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a social media expert. Write 3 short, catchy Instagram captions with emojis and hashtags based on this topic: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    // Google API Response Structure ko handle karein
    if (data.candidates && data.candidates.length > 0) {
      const resultText = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ result: resultText });
    } else {
      console.error("Gemini API Error:", data);
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}