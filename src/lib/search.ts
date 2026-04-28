// Utility functions for Tavily Web Search

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export const performWebSearch = async (query: string): Promise<SearchResult[]> => {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  
  if (!apiKey) {
    console.warn("Tavily API Key missing. Returning mock search results.");
    return [
      { title: "Mock Result 1", url: "https://example.com/1", content: "This is a mock search result." },
      { title: "Mock Result 2", url: "https://example.com/2", content: "Please add your Tavily API key to .env" }
    ];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content
    }));
  } catch (error) {
    console.error("Web Search Error:", error);
    return [];
  }
};
