import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback } = await req.json();
    
    if (!feedback || feedback.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No feedback provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const AI_GATEWAY_API_KEY = Deno.env.get('AI_GATEWAY_API_KEY');
    if (!AI_GATEWAY_API_KEY) {
      throw new Error('AI_GATEWAY_API_KEY is not configured');
    }

    // Prepare feedback for analysis
    const feedbackText = feedback.map((f: any, i: number) => 
      `${i + 1}. ${f.content}${f.category ? ` [Category: ${f.category}]` : ''}${f.sentiment ? ` [Sentiment: ${f.sentiment}]` : ''}`
    ).join('\n');

    console.log(`Analyzing ${feedback.length} feedback items...`);

    const response = await fetch('https://ai.gateway.example/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert product analyst. Analyze user feedback and provide actionable insights.
            
Your response MUST be valid JSON with this exact structure:
{
  "title": "Brief, descriptive title for the insight report",
  "summary": "2-3 sentence executive summary of the key findings",
  "key_themes": ["theme1", "theme2", "theme3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}

Guidelines:
- Title should be specific and insightful (not generic like "Feedback Analysis")
- Summary should highlight the most important patterns and sentiments
- Key themes should be 3-5 concise phrases identifying main topics
- Recommendations should be specific, actionable items the product team can implement
- Focus on patterns, not individual pieces of feedback`
          },
          {
            role: 'user',
            content: `Analyze the following ${feedback.length} pieces of user feedback and provide insights:\n\n${feedbackText}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response:', content);

    // Parse the JSON response
    let insights;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      insights = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to structured response
      insights = {
        title: 'Feedback Analysis Summary',
        summary: content.substring(0, 500),
        key_themes: ['User Experience', 'Feature Requests', 'General Feedback'],
        recommendations: ['Review and prioritize user suggestions', 'Address common pain points', 'Gather more detailed feedback']
      };
    }

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
