/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  TrendingUp, 
  Globe, 
  Cpu, 
  Trophy, 
  Briefcase, 
  ChevronRight,
  ExternalLink,
  Clock,
  Share2,
  FlaskConical,
  Map,
  Zap,
  Moon,
  Sun,
  Bookmark,
  Sparkles,
  ArrowRight,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { fetchLatestNews, NewsArticle } from './services/geminiService';
import Markdown from 'react-markdown';

const CATEGORIES = [
  { id: 'umum', label: 'Utama', icon: Globe },
  { id: 'global', label: 'Global', icon: Zap },
  { id: 'geopolitik', label: 'Geopolitik', icon: Map },
  { id: 'sains', label: 'Sains', icon: FlaskConical },
  { id: 'teknologi', label: 'Teknologi', icon: Cpu },
  { id: 'bisnis', label: 'Bisnis', icon: Briefcase },
  { id: 'olahraga', label: 'Olahraga', icon: Trophy },
];

const TRENDING_TOPICS = [
  "Ibu Kota Nusantara",
  "Kecerdasan Buatan",
  "Ekonomi Digital",
  "Piala Dunia 2026",
  "Perubahan Iklim"
];

export default function App() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('umum');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isSearching) {
      loadNews(activeCategory);
    }
  }, [activeCategory, isSearching]);

  async function loadNews(category: string, query: string = "") {
    setLoading(true);
    const data = await fetchLatestNews(category, query);
    setNews(data);
    setLoading(false);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      loadNews('', searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    loadNews(activeCategory);
  };

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleShare = async (article: NewsArticle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Link disalin ke papan klip!");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark text-zinc-100' : 'text-zinc-900'}`}>
      {/* Navigation */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-serif font-bold tracking-tighter cursor-pointer" onClick={() => clearSearch()}>
                Hikam<span className="text-emerald-600">News</span>
              </h1>
              <div className="hidden lg:flex items-center gap-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsSearching(false);
                    }}
                    className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                      activeCategory === cat.id && !isSearching ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-700">
                <Search size={18} className="text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Cari berita..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-40 text-zinc-900 dark:text-zinc-100"
                />
                {isSearching && (
                  <button type="button" onClick={clearSearch} className="ml-2 text-zinc-400 hover:text-zinc-600">
                    <X size={14} />
                  </button>
                )}
              </form>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={darkMode ? "Mode Terang" : "Mode Gelap"}
              >
                {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-zinc-600" />}
              </button>

              <button 
                className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-4 py-6 space-y-4"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setIsSearching(false);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <cat.icon size={20} className="text-emerald-600" />
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-2">
                <TrendingUp size={16} />
                {isSearching ? `Hasil Pencarian: ${searchQuery}` : 'Berita Terkini'}
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight max-w-3xl">
                {isSearching ? (
                  <>Menampilkan hasil untuk <span className="italic text-zinc-400 dark:text-zinc-500">"{searchQuery}"</span></>
                ) : (
                  <>Informasi Akurat, <br />
                  <span className="italic text-zinc-400 dark:text-zinc-500">Terpercaya & Mendalam.</span></>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-zinc-200 dark:bg-zinc-800 aspect-video rounded-2xl mb-4" />
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-1" />
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.map((article, idx) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group cursor-pointer flex flex-col news-card-hover bg-white dark:bg-zinc-900/50 p-4 rounded-3xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="relative overflow-hidden rounded-2xl aspect-video mb-4">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shadow-sm">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <Clock size={12} />
                          {format(new Date(article.publishedAt), 'd MMMM yyyy', { locale: id })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark size={12} />
                          {calculateReadingTime(article.content)} mnt baca
                        </div>
                      </div>
                      <h3 className="text-xl font-bold leading-snug group-hover:text-emerald-600 transition-colors mb-3">
                        {article.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        Baca Selengkapnya <ChevronRight size={14} />
                      </span>
                      <div className="flex gap-2">
                        <button 
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(article);
                          }}
                        >
                          <Share2 size={14} className="text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-12">
            {/* Trending Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                <Sparkles size={16} /> Topik Populer
              </h4>
              <div className="space-y-4">
                {TRENDING_TOPICS.map((topic, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSearchQuery(topic);
                      setIsSearching(true);
                      loadNews('', topic);
                    }}
                    className="flex items-center justify-between w-full group text-left p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-600">
                      #{topic}
                    </span>
                    <ArrowRight size={14} className="text-zinc-300 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Widget */}
            <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20">
              <Mail size={32} className="mb-4 opacity-80" />
              <h4 className="text-xl font-serif font-bold mb-2">Hikam Daily</h4>
              <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
                Dapatkan ringkasan berita terbaik langsung di email Anda setiap pagi.
              </p>
              {subscribed ? (
                <div className="bg-emerald-500/50 p-3 rounded-xl text-center text-sm font-medium">
                  Terima kasih telah berlangganan!
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email Anda" 
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm placeholder:text-emerald-200 focus:ring-2 focus:ring-white/50 outline-none"
                  />
                  <button className="w-full bg-white text-emerald-600 font-bold py-2 rounded-xl text-sm hover:bg-emerald-50 transition-colors">
                    Berlangganan
                  </button>
                </form>
              )}
            </div>

            {/* Quote of the day */}
            <div className="p-6 border-l-2 border-emerald-600 italic text-zinc-500 dark:text-zinc-400 text-sm">
              "Jurnalisme adalah apa yang seseorang tidak ingin diterbitkan; sisanya adalah hubungan masyarakat."
              <br />
              <span className="not-italic font-bold text-zinc-900 dark:text-zinc-100 mt-2 block">— George Orwell</span>
            </div>
          </aside>
        </div>
      </main>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            >
              <button 
                className="absolute top-6 right-6 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-full shadow-lg z-10 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => setSelectedArticle(null)}
              >
                <X size={20} />
              </button>

              <div className="p-0">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-[300px] md:h-[450px] object-cover"
                />
                <div className="p-6 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {selectedArticle.category}
                    </span>
                    <span className="text-zinc-400 text-sm flex items-center gap-2">
                      <Clock size={14} />
                      {format(new Date(selectedArticle.publishedAt), 'EEEE, d MMMM yyyy', { locale: id })}
                    </span>
                    <span className="text-zinc-400 text-sm flex items-center gap-2">
                      <Bookmark size={14} />
                      {calculateReadingTime(selectedArticle.content)} mnt baca
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 leading-tight">
                    {selectedArticle.title}
                  </h2>

                  {/* AI TL;DR Section */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-10 border border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                      <Sparkles size={16} /> AI Ringkasan (TL;DR)
                    </h4>
                    <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedArticle.tldr}
                    </div>
                  </div>

                  <div className="prose prose-zinc dark:prose-invert max-w-none mb-12">
                    <div className="markdown-body text-zinc-700 dark:text-zinc-300 leading-loose text-lg">
                      <Markdown>{selectedArticle.content}</Markdown>
                    </div>
                  </div>

                  {selectedArticle.sources.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 md:p-8 border border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <Globe size={16} /> Sumber Terverifikasi
                      </h4>
                      <div className="space-y-3">
                        {selectedArticle.sources.map((source, idx) => (
                          <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between group p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                          >
                            <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600">
                              {source.title}
                            </span>
                            <ExternalLink size={16} className="text-zinc-300 group-hover:text-emerald-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h1 className="text-4xl font-serif font-bold tracking-tighter mb-6">
                Hikam<span className="text-emerald-500">News</span>
              </h1>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                Menyajikan berita terkini dengan standar jurnalisme tinggi dan dukungan teknologi AI untuk akurasi data yang maksimal.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-500">Kategori</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                {CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setIsSearching(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="hover:text-white transition-colors"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-500">Kontak</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li>Email: redaksi@hikamnews.com</li>
                <li>Alamat: Jakarta, Indonesia</li>
                <li className="flex gap-4 pt-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                    <Share2 size={16} />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-zinc-800 text-zinc-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} HikamNews. Seluruh hak cipta dilindungi.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
