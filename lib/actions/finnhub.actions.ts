'use server';

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

function getFinnhubApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FINNHUB_API_KEY environment variable is required');
  }
  return apiKey;
}

async function fetchJSON(url: string, revalidateSeconds?: number) {
  const options: RequestInit = {
    headers: {
      'X-Finnhub-Token': getFinnhubApiKey(),
    },
  };

  if (revalidateSeconds) {
    options.cache = 'force-cache';
    options.next = { revalidate: revalidateSeconds };
  } else {
    options.cache = 'no-store';
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
  try {
    const { from, to } = getDateRange(5); // Last 5 days
    const articles: MarketNewsArticle[] = [];
    
    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);
      
      if (cleanSymbols.length === 0) {
        return await getNews(); // Fallback to general news
      }

      // Round-robin through symbols, max 6 times
      const maxRounds = Math.min(6, cleanSymbols.length);
      const articlesPerSymbol = Math.floor(6 / cleanSymbols.length);
      
      for (let round = 0; round < maxRounds; round++) {
        const symbol = cleanSymbols[round % cleanSymbols.length];
        
        try {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}`;
          const data = await fetchJSON(url);
          
          if (Array.isArray(data)) {
            // Find one valid article per round
            for (const article of data) {
              if (validateArticle(article)) {
                const formattedArticle = formatArticle(article, true, symbol, round);
                articles.push(formattedArticle);
                break; // Take only one article per round
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching news for symbol ${symbol}:`, error);
          // Continue to next symbol
        }
      }
    } else {
      // Fetch general market news
      const url = `${FINNHUB_BASE_URL}/news?category=general&from=${from}&to=${to}`;
      const data = await fetchJSON(url);
      
      if (Array.isArray(data)) {
        // Deduplicate by id/url/headline
        const seen = new Set<string>();
        const uniqueArticles: RawNewsArticle[] = [];
        
        for (const article of data) {
          if (validateArticle(article)) {
            const key = `${article.id}-${article.url}-${article.headline}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueArticles.push(article);
            }
          }
        }
        
        // Take top 6, format them
        const topArticles = uniqueArticles.slice(0, 6);
        for (const article of topArticles) {
          const formattedArticle = formatArticle(article, false);
          articles.push(formattedArticle);
        }
      }
    }
    
    // Sort by datetime (newest first)
    return articles.sort((a, b) => b.datetime - a.datetime);
    
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
}
