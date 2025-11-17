import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message, category, sessionId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Import Supabase client dynamically
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Extract user from JWT token (basic validation)
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get session details to include recommendations in context
    const { data: session } = await supabase
      .from('sessions')
      .select('category, recommendations')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build conversation history (reverse order since we got newest first)
    const conversationHistory = (recentMessages || []).reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    conversationHistory.push({ role: 'user', content: message });

    // Build context from recommendations
    const recommendations = session.recommendations || [];
    const recommendationsContext = recommendations.length > 0 
      ? `The user was previously recommended: ${recommendations.map((r: { title: string }) => r.title).join(', ')}.`
      : '';

    // Build category-specific context
    let categoryContext = '';
    if (category) {
      switch (category) {
        case 'Game':
          categoryContext = 'You are discussing games. Be knowledgeable about gaming trends, platforms, and genres.';
          break;
        case 'Movie':
          categoryContext = 'You are discussing movies. Be knowledgeable about cinema, directors, actors, and film genres.';
          break;
        case 'Anime':
          categoryContext = 'You are discussing anime. Be knowledgeable about anime series, manga adaptations, and Japanese animation.';
          break;
        case 'TV Series':
          categoryContext = 'You are discussing TV series. Be knowledgeable about television shows, streaming platforms, and series.';
          break;
      }
    }

    const systemPrompt = `You are Zappy, a helpful and knowledgeable entertainment recommender.

${categoryContext}
${recommendationsContext}

Your instructions are:
1. **Stay on Topic**: Only answer questions related to entertainment (games, movies, anime, TV). Politely decline any other topics.
2. **Be Helpful**: Provide useful information, suggestions, and engage in meaningful conversation about entertainment.
3. **Be Honest**: If you don't know something, clearly state that you don't have details about it. Don't invent information.
4. **Be Concise**: Keep your answers helpful and to the point.
5. **Be Conversational**: Engage naturally with the user, asking follow-up questions when appropriate.`;

    // Generate AI response
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantResponse = completion.choices[0]?.message?.content || "I'm not sure how to respond.";

    // Save assistant message to database
    await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        content: assistantResponse,
        role: 'assistant',
        user_id: userId
      });

    return NextResponse.json({ response: assistantResponse });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}