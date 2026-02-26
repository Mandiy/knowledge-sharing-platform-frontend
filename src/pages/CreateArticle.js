import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Sparkles, Save, X, Loader2, ArrowLeft, Tag as TagIcon, LayoutList } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function CreateArticle() {
  const navigate = useNavigate();
  const { id } = useParams(); // if id exists, we are editing

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(!!id);

  const categories = ["Technology", "Science", "Business", "Lifestyle", "Programming"];

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await axios.get(`/articles/${id}`);
      setForm({
        title: res.data.title,
        content: res.data.content,
        category: res.data.category || "",
        tags: res.data.tags || ""
      });
    } catch (err) {
      setError("Failed to load article for editing.");
      toast.error("Failed to load article.");
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value) => {
    setForm({ ...form, content: value });
  };

  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const improveWithAI = async (action) => {
    if (!form.content || form.content.trim() === "<p><br></p>") {
      toast.error("Please write some content first.");
      return;
    }

    setAiMenuOpen(false);
    let toastId;
    try {
      setAiLoading(true);
      setError("");

      const actionText = {
        'rewrite': "Rewriting content...",
        'grammar': "Fixing grammar...",
        'concise': "Making concise...",
        'title': "Generating title...",
      }[action] || "Working magic...";

      toastId = toast.loading(actionText);

      const res = await axios.post("/articles/ai/improve", {
        content: form.content,
        action
      });

      if (action === 'title') {
        const generatedTitle = res.data.improvedContent.replace("Suggested Title: ", "").trim();
        setForm({ ...form, title: generatedTitle });
        toast.success("Title generated!", { id: toastId });
      } else {
        setForm({ ...form, content: res.data.improvedContent });
        toast.success("Content improved!", { id: toastId });
      }

    } catch (err) {
      toast.error("AI Improvement failed.", { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.content) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await axios.put(`/articles/${id}`, form);
        toast.success("Article updated successfully!");
      } else {
        await axios.post("/articles", form);
        toast.success("Article published successfully!");
      }
      navigate("/dashboard");
    } catch (err) {
      const errMessage = err.response?.data?.error || `Error ${id ? "updating" : "creating"} article`;
      setError(errMessage);
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-6 sm:py-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {id ? "Edit Article" : "Write a New Article"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {id ? "Update your masterpiece." : "Share your knowledge with the world."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 sm:flex-none btn-secondary h-11"
            disabled={loading}
          >
            <X size={18} /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none btn-primary shadow-glow hover:-translate-y-0.5 h-11"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {id ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
          <X className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-4">
          <input
            name="title"
            className="w-full px-4 py-3 text-2xl sm:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
            placeholder="Article Title..."
            value={form.title}
            onChange={handleChange}
            autoFocus
          />
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Category */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <LayoutList size={16} className="text-primary-500" /> Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <TagIcon size={16} className="text-primary-500" /> Tags
            </label>
            <input
              name="tags"
              placeholder="React, CSS, Tutorial (comma separated)..."
              value={form.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Editor Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Content</span>

            {/* Glowing AI Button Dropdown */}
            <div className="relative group/btn z-10 w-48">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl blur opacity-30 group-hover/btn:opacity-70 transition duration-500"></div>
              <button
                type="button"
                className="relative w-full flex items-center justify-between gap-2 px-4 py-2 bg-white text-slate-800 font-semibold rounded-xl text-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                disabled={aiLoading}
              >
                <div className="flex items-center gap-2">
                  {aiLoading ? (
                    <Loader2 size={16} className="animate-spin text-purple-500" />
                  ) : (
                    <Sparkles size={16} className="text-purple-500" />
                  )}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    {aiLoading ? "Working..." : "Improve with AI"}
                  </span>
                </div>
                {!aiLoading && (
                  <svg className={`w-4 h-4 text-purple-500 transition-transform ${aiMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {aiMenuOpen && !aiLoading && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden glassmorphism flex flex-col py-1">
                  <button
                    type="button"
                    onClick={() => improveWithAI('rewrite')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    ✨ Rewrite Clearly
                  </button>
                  <button
                    type="button"
                    onClick={() => improveWithAI('grammar')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    📝 Fix Grammar
                  </button>
                  <button
                    type="button"
                    onClick={() => improveWithAI('concise')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
                  >
                    ✂️ Make Concise
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => improveWithAI('title')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
                  >
                    💡 Suggest Title
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* React Quill Instance */}
          <div className="quill-editor-wrapper bg-white">
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={handleContentChange}
              placeholder="Write your amazing story here..."
              // The classes for this are globally overridden in index.css
              className="quill-editor"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>
      </form>
    </motion.div>
  );
}

export default CreateArticle;