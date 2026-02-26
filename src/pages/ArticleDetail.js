import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
    ArrowLeft, Calendar, Tag, Loader2, Edit3,
    LogIn, User, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

function ArticleDetail() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await axios.get(`/articles/${id}`);
                setArticle(res.data);
            } catch (err) {
                setError("Article not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString(undefined, {
            weekday: "short", year: "numeric", month: "long", day: "numeric"
        });

    const formatTime = (iso) =>
        new Date(iso).toLocaleTimeString(undefined, {
            hour: "2-digit", minute: "2-digit"
        });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
                <p>Loading article...</p>
            </div>
        );
    }



    if (error || !article) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
                    <h2 className="text-xl font-semibold mb-2">Oops!</h2>
                    <p>{error || "Article not found"}</p>
                    <Link to="/" className="inline-block mt-4 text-primary-600 font-medium hover:underline">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = user && user.username === article.author;
    const wasUpdated =
        article.updated_at &&
        article.created_at &&
        new Date(article.updated_at) - new Date(article.created_at) > 60000;

    const tagList = article.tags
        ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto px-4 py-8 sm:py-12"
        >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-10">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors group"
                >
                    <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
                    Back to Explore
                </Link>

                {isOwner && (
                    <Link
                        to={`/edit/${article.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors shadow-sm"
                    >
                        <Edit3 size={16} />
                        Edit Article
                    </Link>
                )}
            </div>

            <article>
                {/* Header */}
                <header className="mb-12">
                    {/* Category Badge */}
                    {article.category && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold uppercase tracking-wider mb-6">
                            {article.category}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                        {article.title}
                    </h1>

                    {/* Author Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        {/* Author Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                                {article.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <User size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Author</span>
                                </div>
                                <span className="font-bold text-slate-800 text-lg">{article.author}</span>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex flex-col gap-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Calendar size={15} className="text-slate-400 shrink-0" />
                                <span>
                                    <span className="font-medium text-slate-700">Published:</span>{" "}
                                    {formatDate(article.created_at)} at {formatTime(article.created_at)}
                                </span>
                            </div>

                            {wasUpdated && (
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={15} className="text-slate-400 shrink-0" />
                                    <span>
                                        <span className="font-medium text-slate-700">Last updated:</span>{" "}
                                        {formatDate(article.updated_at)} at {formatTime(article.updated_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {tagList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-6">
                            <Tag size={16} className="text-slate-400 mr-1" />
                            {tagList.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:border-primary-300 hover:text-primary-600 transition-colors cursor-default"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Divider */}
                <div className="border-t border-slate-100 mb-12" />

                {/* Article Content */}
                <div
                    className="prose prose-lg sm:prose-xl prose-slate max-w-none
                        prose-headings:font-extrabold prose-headings:text-slate-900
                        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-primary-400 prose-blockquote:text-slate-600
                        prose-code:bg-slate-100 prose-code:text-primary-700 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
                        prose-img:rounded-2xl prose-img:shadow-soft"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Footer Tag Summary */}
                {tagList.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-100">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Filed under</p>
                        <div className="flex flex-wrap gap-2">
                            {tagList.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </motion.div>
    );
}

export default ArticleDetail;
