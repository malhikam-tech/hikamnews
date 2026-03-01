import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  tldr: string;
  category: string;
  publishedAt: string;
  sources: { title: string; uri: string }[];
  imageUrl?: string;
}

export async function fetchLatestNews(category: string = "umum", searchQuery: string = ""): Promise<NewsArticle[]> {
  try {
    const prompt = searchQuery 
      ? `Cari dan berikan 5 berita terkini, akurat, dan nyata terkait pencarian: "${searchQuery}".`
      : `Berikan 5 berita terkini, akurat, dan nyata di Indonesia atau Global untuk kategori: ${category}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${prompt} 
      Sertakan judul, ringkasan singkat (summary), konten lengkap (content), dan ringkasan poin-poin (tldr) dalam format JSON. 
      Gunakan bahasa Indonesia yang formal namun modern. Pastikan data berasal dari sumber berita terpercaya.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              summary: { type: "STRING" },
              content: { type: "STRING" },
              tldr: { type: "STRING", description: "Ringkasan poin-poin berita" },
              category: { type: "STRING" },
            },
            required: ["title", "summary", "content", "tldr", "category"],
          },
        },
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `news-${index}-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      sources: sources.slice(0, 2), // Attach some relevant sources
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/450`,
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
