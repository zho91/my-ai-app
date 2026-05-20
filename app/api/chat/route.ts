import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, model } = await req.json();

    // 1. 融合 OpenAI 系列
    if (model.startsWith('gpt-')) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: message }],
        }),
      });
      const data = await response.json();
      return NextResponse.json({ text: data.choices[0].message.content });
    } 
    
    // 2. 融合 Anthropic 系列
    else if (model.startsWith('claude-')) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: message }],
        }),
      });
      const data = await response.json();
      return NextResponse.json({ text: data.content[0].text });
    } 
    
    // 3. 融合 Google 系列
    else if (model.startsWith('gemini-')) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
          }),
        }
      );
      const data = await response.json();
      return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
    }

    return NextResponse.json({ error: '未知的模型系列' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
