import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { Search, Filter, Loader2, BookOpen, X, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Technology", "Science", "Business", "Lifestyle", "Programming"];

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const fetchArticles = useCallback(async (search, cat) => {
    try {
      setLoading(true);
      setError("");
      let query = `/articles?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (cat) query += `category=${encodeURIComponent(cat)}`;
      const res = await axios.get(query);
      setArticles(res.data);
    } catch (err) {
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch when search/category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(searchQuery, category);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, category, fetchArticles]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
  };

  const hasActiveFilters = searchQuery || category;

  const containerAnimations = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemAnimations = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <div className="space-y-10">
      {/* ─── Hero / Search Section ─── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 sm:p-16 text-center shadow-sm"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Discover{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Perspectives
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Read, write, and grow with our community. Explore ideas that matter
            across technology, science, and life.
          </p>

          {/* ── Search + Category Filter ── */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              <input
                type="text"
                id="article-search"
                placeholder="Search by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 text-slate-900 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative sm:w-52">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-11 pr-8 py-4 text-slate-900 bg-slate-50 border border-transparent rounded-2xl appearance-none focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all cursor-pointer"
              >
                <option value="">All Topics</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* ── Active Filter Pills ── */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap items-center justify-center gap-2 mt-5"
              >
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    <Search size={13} />
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-primary-900 ml-0.5">
                      <X size={13} />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    <Filter size={13} />
                    {category}
                    <button onClick={() => setCategory("")} className="hover:text-violet-900 ml-0.5">
                      <X size={13} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-800 text-sm underline underline-offset-2 transition-colors"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ─── Articles Feed ─── */}
      <section>
        {/* Result count */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 text-sm font-medium">
              {articles.length > 0
                ? `Showing ${articles.length} article${articles.length !== 1 ? "s" : ""}${hasActiveFilters ? " for your search" : ""}`
                : null}
            </p>
            {hasActiveFilters && articles.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 font-medium hover:text-primary-800 transition-colors"
              >
                Show all articles
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
            <p className="text-sm">Loading the feed...</p>
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 border-dashed"
          >
            <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {hasActiveFilters ? "No results found" : "No articles yet"}
            </h3>
            <p className="text-slate-500 max-w-sm">
              {hasActiveFilters
                ? "Try different keywords or remove your filters."
                : "Be the first to share something amazing!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 btn-secondary"
              >
                <X size={16} /> Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerAnimations}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {articles.map((article) => {
              const tags = article.tags
                ? article.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3)
                : [];

              return (
                <motion.div key={article.id} variants={itemAnimations}>
                  <Link to={`/article/${article.id}`} className="block h-full">
                    <article className="group flex flex-col h-full bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:border-primary-100 hover:-translate-y-1 transition-all duration-300">

                      <div className="flex-1">
                        {/* Category */}
                        {article.category && (
                          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4">
                            {article.category}
                          </span>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                          {article.summary || "No summary available."}
                        </p>

                        {/* Tag chips */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors"
                              >
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer: Author + Date */}
                      <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                            {article.author.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {article.author}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock size={12} />
                          <span className="text-xs font-medium">
                            {new Date(article.created_at).toLocaleDateString(undefined, {
                              month: "short", day: "numeric", year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>

                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default Home;