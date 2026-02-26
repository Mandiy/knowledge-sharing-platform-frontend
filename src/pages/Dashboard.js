import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Edit, Trash2, Plus, FileText, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchMyArticles();
    }, [user]);

    const fetchMyArticles = async () => {
        try {
            if (!user) return;
            // Depending on the backend route, this might be a dedicated endpoint
            // Adjusting to fetch all and filter client-side just in case the dedicated route is missing
            const res = await axios.get("/articles");
            const myArticles = res.data.filter((a) => a.author === user.username);
            setArticles(myArticles);
        } catch (err) {
            setError("Failed to load your articles.");
            toast.error("Failed to load your articles");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;

        try {
            await axios.delete(`/articles/${id}`);
            setArticles(articles.filter(article => article.id !== id));
            toast.success("Article deleted successfully");
        } catch (err) {
            toast.error("Failed to delete article");
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerAnimations = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const rowAnimations = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your authored articles and publications.</p>
                </div>

                <Link to="/create" className="btn-primary shadow-glow hover:-translate-y-0.5 whitespace-nowrap">
                    <Plus size={18} /> New Article
                </Link>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search your articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        Total Published: <span className="text-slate-900 font-bold ml-1">{articles.length}</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
                            <p>Loading your content...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-[400px] text-red-500 bg-red-50/50">
                            {error}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No articles yet</h3>
                            <p className="text-slate-500 max-w-sm mb-6">You haven't published anything yet. Draft your first masterpiece today!</p>
                            <Link to="/create" className="btn-secondary">
                                <Plus size={18} /> Start Writing
                            </Link>
                        </div>
                    ) : filteredArticles.length === 0 ? (
                        <div className="flex items-center justify-center h-[400px] text-slate-500">
                            No articles match your search criteria.
                        </div>
                    ) : (
                        <motion.div
                            variants={containerAnimations}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-slate-100"
                        >
                            {filteredArticles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    variants={rowAnimations}
                                    className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/article/${article.id}`} className="block hover:underline decoration-primary-300 underline-offset-4">
                                            <h4 className="text-lg font-bold text-slate-900 truncate mb-1">
                                                {article.title}
                                            </h4>
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                                            {article.category && (
                                                <span className="inline-flex items-center font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-md text-xs">
                                                    {article.category}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Published
                                            </span>
                                            <span>
                                                Created: {new Date(article.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={`/edit/${article.id}`}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                                            title="Edit Article"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                                            title="Delete Article"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
