import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketProduct {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  reviews?: number;
  salesSignal: 'hot' | 'rising' | 'steady' | 'new';
  seller: string;
  marketplace: 'etsy' | 'gumroad';
  url: string;
  thumbnail?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, marketplace = 'all', limit = 12 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scanning marketplace for:', query, 'on', marketplace);

    const products: MarketProduct[] = [];
    
    // Search Etsy
    if (marketplace === 'all' || marketplace === 'etsy') {
      const etsyQuery = `site:etsy.com ${query} digital download`;
      console.log('Searching Etsy:', etsyQuery);
      
      const etsyResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: etsyQuery,
          limit: Math.ceil(limit / 2),
        }),
      });

      if (etsyResponse.ok) {
        const etsyData = await etsyResponse.json();
        console.log('Etsy results:', etsyData.data?.length || 0);
        
        if (etsyData.success && etsyData.data) {
          for (const result of etsyData.data) {
            if (result.url?.includes('etsy.com/listing')) {
              const priceMatch = result.markdown?.match(/\$(\d+(?:\.\d{2})?)/);
              const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
              
              const reviewMatch = result.markdown?.match(/(\d+(?:,\d+)?)\s*(?:reviews?|sales?)/i);
              const reviews = reviewMatch ? parseInt(reviewMatch[1].replace(',', '')) : undefined;
              
              const sellerMatch = result.url?.match(/etsy\.com\/shop\/([^\/\?]+)/);
              const seller = sellerMatch ? sellerMatch[1] : 'Etsy Seller';

              products.push({
                id: `etsy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: result.title?.replace(' - Etsy', '').substring(0, 80) || 'Digital Product',
                price: priceMatch ? `$${priceMatch[1]}` : 'Price varies',
                priceValue,
                reviews,
                salesSignal: reviews && reviews > 100 ? 'hot' : reviews && reviews > 20 ? 'rising' : 'steady',
                seller,
                marketplace: 'etsy',
                url: result.url,
                thumbnail: result.metadata?.ogImage,
                description: result.description?.substring(0, 200),
              });
            }
          }
        }
      }
    }

    // Search Gumroad
    if (marketplace === 'all' || marketplace === 'gumroad') {
      const gumroadQuery = `site:gumroad.com ${query}`;
      console.log('Searching Gumroad:', gumroadQuery);
      
      const gumroadResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: gumroadQuery,
          limit: Math.ceil(limit / 2),
        }),
      });

      if (gumroadResponse.ok) {
        const gumroadData = await gumroadResponse.json();
        console.log('Gumroad results:', gumroadData.data?.length || 0);
        
        if (gumroadData.success && gumroadData.data) {
          for (const result of gumroadData.data) {
            if (result.url?.includes('gumroad.com')) {
              const priceMatch = result.markdown?.match(/\$(\d+(?:\.\d{2})?)/);
              const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
              
              const sellerMatch = result.url?.match(/gumroad\.com\/([^\/\?]+)/);
              const seller = sellerMatch ? sellerMatch[1] : 'Gumroad Creator';

              products.push({
                id: `gumroad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: result.title?.replace(' | Gumroad', '').substring(0, 80) || 'Digital Product',
                price: priceMatch ? `$${priceMatch[1]}` : 'Price varies',
                priceValue,
                salesSignal: 'steady',
                seller,
                marketplace: 'gumroad',
                url: result.url,
                thumbnail: result.metadata?.ogImage,
                description: result.description?.substring(0, 200),
              });
            }
          }
        }
      }
    }

    // Generate insights using AI
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    let insights = {
      avgPrice: '$0',
      priceRange: { min: 0, max: 0 },
      topPatterns: [] as string[],
      opportunities: [] as string[],
      commonElements: [] as string[],
      missingElements: [] as string[],
    };

    if (deepseekApiKey && products.length > 0) {
      const prices = products.filter(p => p.priceValue > 0).map(p => p.priceValue);
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      insights.avgPrice = `$${avgPrice.toFixed(2)}`;
      insights.priceRange = { min: minPrice, max: maxPrice };

      try {
        const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You analyze marketplace product data to identify patterns and opportunities for digital product sellers. Return JSON only.'
              },
              {
                role: 'user',
                content: `Analyze these ${query} products from marketplaces and identify patterns and gaps:
                
${products.slice(0, 8).map(p => `- ${p.title} (${p.price}) - ${p.description || 'No description'}`).join('\n')}

Return JSON with:
{
  "topPatterns": ["pattern1", "pattern2", "pattern3"],
  "opportunities": ["gap1", "gap2"],
  "commonElements": ["element1", "element2"],
  "missingElements": ["missing1", "missing2"]
}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                insights.topPatterns = parsed.topPatterns || [];
                insights.opportunities = parsed.opportunities || [];
                insights.commonElements = parsed.commonElements || [];
                insights.missingElements = parsed.missingElements || [];
              }
            } catch (e) {
              console.log('Could not parse AI insights:', e);
            }
          }
        }
      } catch (e) {
        console.log('AI analysis failed, using basic insights:', e);
      }
    }

    console.log(`Found ${products.length} products`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          products,
          insights,
          query,
          marketplace,
          totalFound: products.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scanning marketplace:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scan marketplace';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
