import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Book, Plus, Search, BookOpen, CheckCircle, Heart, Trash2, X, Bookmark, LogOut, Loader2, Moon, Sun, Pencil, Star } from 'lucide-react';

// --- CONFIGURATION ---
const supabaseUrl = 'https://zbzstfcxhsnqquvkckpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienN0ZmN4aHNucXF1dmtja3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzY5MzcsImV4cCI6MjA4MDk1MjkzN30.H8Up419vlrd1SxtGVi091OyDYmnzTYV9Da_sscy03wk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [session, setSession] = useState(null);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fifiReadsTheme');
      return saved === 'dark';
    }
    return false;
  });

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('fifiReadsTheme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- REFINED COLOR PALETTE ---
  const colors = {
    bgLight: 'bg-slate-50', 
    bgDark: 'bg-slate-950',
    textLight: 'text-slate-800',
    textDark: 'text-slate-100',
    sectionBg: 'bg-[#fffcc9]',
  };

  const appBg = darkMode ? colors.bgDark : colors.bgLight;
  const appText = darkMode ? colors.textDark : colors.textLight;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ease-in-out ${appBg} ${appText} selection:bg-purple-200`}>
      {!session ? (
        <AuthScreen supabase={supabase} darkMode={darkMode} toggleTheme={toggleTheme} colors={colors} />
      ) : (
        <MainApp session={session} supabase={supabase} darkMode={darkMode} toggleTheme={toggleTheme} colors={colors} />
      )}
    </div>
  );
}
// --- AUTH COMPONENT ---
function AuthScreen({ supabase, darkMode, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
        if (error) throw error;
        setMessage('Check your email for the password reset link!');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Psst...Check your email for the confirmation link~');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100';
  const inputClass = darkMode 
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-purple-500' 
    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-300' : 'bg-white text-purple-600 shadow-sm'}`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`w-full max-w-md rounded-2xl p-8 border shadow-xl transition-all ${cardClass}`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800' : 'bg-purple-100'}`}>
            <BookOpen className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 className="text-2xl font-bold">{isReset ? 'Reset Password' : 'Welcome to Fifi Reads'}</h1>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isReset ? 'Forgot your password? Worry not! Just enter your email to receive a reset link.' : 'Your cozy corner for tracking books.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80" htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              autoComplete="email"
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} 
            />
          </div>
          {!isReset && (
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80" htmlFor="password">Password</label>
              <input 
                id="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} 
              />
              {isLogin && (
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className={`rounded border-gray-300 text-purple-600 focus:ring-purple-500 ${darkMode ? 'bg-slate-800 border-slate-600' : ''}`}
                      defaultChecked
                    />
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setIsReset(true); setMessage(''); }} className="text-xs font-medium hover:underline opacity-70 hover:opacity-100">Forgot Password?</button>
                </div>
              )}
            </div>
          )}
          {message && <p className="text-sm text-center bg-indigo-50 text-indigo-700 p-2 rounded border border-indigo-100">{message}</p>}
          <button type="submit" disabled={loading} className={`w-full font-bold py-3 rounded-xl transition-all flex justify-center items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-[#ccccff] hover:brightness-95 text-[#4c3b4d]'}`}>
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isReset ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {isReset ? (
             <button onClick={() => { setIsReset(false); setMessage(''); }} className="flex items-center justify-center gap-2 mx-auto hover:underline opacity-70 hover:opacity-100"><ArrowLeft className="w-3 h-3" /> Back to Sign In</button>
          ) : (
            <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} className="hover:underline opacity-70 hover:opacity-100">{isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}</button>
          )}
        </div>
      </div>
    </div>
  );
};

  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100';
  const inputClass = darkMode 
    ? 'bg-slate-800 border-slate-700 text-white focus:ring-purple-500' 
    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-300' : 'bg-white text-purple-600 shadow-sm'}`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`w-full max-w-md rounded-2xl p-8 border shadow-xl transition-all ${cardClass}`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800' : 'bg-purple-100'}`}>
            <BookOpen className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 className="text-2xl font-bold">{isReset ? 'Reset Password' : 'Welcome to Fifi Reads'}</h1>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isReset ? 'Forgot your password? Worry not! Just enter your email to receive a reset link.' : 'Your cozy corner for tracking books.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80" htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              autoComplete="email"
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} 
            />
          </div>
          {!isReset && (
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80" htmlFor="password">Password</label>
              <input 
                id="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} 
              />
              {isLogin && (
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className={`rounded border-gray-300 text-purple-600 focus:ring-purple-500 ${darkMode ? 'bg-slate-800 border-slate-600' : ''}`}
                      defaultChecked
                    />
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setIsReset(true); setMessage(''); }} className="text-xs font-medium hover:underline opacity-70 hover:opacity-100">Forgot Password?</button>
                </div>
              )}
            </div>
          )}
          {message && <p className="text-sm text-center bg-indigo-50 text-indigo-700 p-2 rounded border border-indigo-100">{message}</p>}
          <button type="submit" disabled={loading} className={`w-full font-bold py-3 rounded-xl transition-all flex justify-center items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-[#ccccff] hover:brightness-95 text-[#4c3b4d]'}`}>
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isReset ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {isReset ? (
             <button onClick={() => { setIsReset(false); setMessage(''); }} className="flex items-center justify-center gap-2 mx-auto hover:underline opacity-70 hover:opacity-100"><ArrowLeft className="w-3 h-3" /> Back to Sign In</button>
          ) : (
            <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} className="hover:underline opacity-70 hover:opacity-100">{isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}</button>
          )}
        </div>
      </div>
    </div>
  );
// --- MAIN APP COMPONENT ---
function MainApp({ session, supabase, darkMode, toggleTheme }) {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for Add/Edit
  const [editingId, setEditingId] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', status: 'toread', rating: 0, review: '' });

  useEffect(() => {
    if (session) fetchBooks();
  }, [session]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching books:', error);
      else setBooks(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getBookCover = async (title, author) => {
    try {
      const query = encodeURIComponent(`intitle:${title}+inauthor:${author}`);
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null;
      }
    } catch (error) { console.error("Error fetching cover:", error); }
    return null;
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    setLoading(true);

    try {
      let coverUrl = await getBookCover(newBook.title, newBook.author);
      if (!coverUrl) coverUrl = `https://placehold.co/150x220/e2e8f0/475569?text=${newBook.title.substring(0,3)}`;

      const bookData = {
        title: newBook.title,
        author: newBook.author,
        status: newBook.status,
        rating: newBook.rating,
        review: newBook.review,
        cover: coverUrl
      };

      if (editingId) {
        const { error } = await supabase.from('books').update(bookData).eq('id', editingId);
        if (error) throw error;
        setBooks(books.map(b => b.id === editingId ? { ...b, ...bookData } : b));
      } else {
        const { data, error } = await supabase.from('books').insert([{ ...bookData, user_id: session.user.id }]).select();
        if (error) throw error;
        setBooks([data[0], ...books]);
      }

      setNewBook({ title: '', author: '', status: 'toread', rating: 0, review: '' });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (error) {
      alert('Error saving book: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (book) => {
    setEditingId(book.id);
    setNewBook({ 
      title: book.title, 
      author: book.author, 
      status: book.status, 
      rating: book.rating || 0, 
      review: book.review || '' 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewBook({ title: '', author: '', status: 'toread', rating: 0, review: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) setBooks(books.filter(b => b.id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    setBooks(books.map(b => b.id === id ? { ...b, status: newStatus } : b));
    const { error } = await supabase.from('books').update({ status: newStatus }).eq('id', id);
    if (error) fetchBooks(); 
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true : book.status === filter;
    return matchesSearch && matchesFilter;
  });

  const STATUS_CONFIG = [
    { id: 'toread', label: 'To Read', icon: Bookmark, fill: 'fill-sky-500' },
    { id: 'ongoing', label: 'Reading', icon: BookOpen, fill: 'fill-indigo-500' },
    { id: 'completed', label: 'Completed', icon: CheckCircle, fill: 'fill-green-500' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, fill: 'fill-pink-500' },
  ];

  // Helper component for the Text Badge
  const StatusLabel = ({ status }) => {
    const config = STATUS_CONFIG.find(s => s.id === status) || STATUS_CONFIG[0];
    
    // Badge Colors - INCREASED CONTRAST
    const styles = {
      completed: "bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-200",
      ongoing: "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
      wishlist: "bg-pink-200 text-pink-900 dark:bg-pink-900/30 dark:text-pink-200",
      toread: "bg-sky-200 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200"
    };

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${styles[status]}`}>
        {config.label}
      </span>
    );
  };

  const headerBg = darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-purple-100';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-purple-100 hover:shadow-lg hover:shadow-purple-100';
  const inputClass = darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400';

  return (
    <>
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b shadow-sm transition-colors ${headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className="text-2xl font-bold tracking-tight">Fifi Reads</h1>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={openAddModal} className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 ${darkMode ? 'bg-purple-600 text-white' : 'bg-[#ccccff] text-[#4c3b4d] font-semibold'}`}>
              <Plus className="w-4 h-4" /> <span>Add Book</span>
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-slate-800 text-yellow-300' : 'hover:bg-purple-50 text-purple-600'}`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => supabase.auth.signOut()} className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-purple-50 text-slate-500'}`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          <button onClick={() => setFilter('all')} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${filter === 'all' ? (darkMode ? 'bg-purple-600 border-purple-600 text-white' : 'bg-[#4c3b4d] border-[#4c3b4d] text-white') : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-purple-100 text-slate-600')}`}>
            <Book className="w-4 h-4" /> All Books
          </button>
          {STATUS_CONFIG.map(status => (
            <button key={status.id} onClick={() => setFilter(status.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${filter === status.id ? (darkMode ? 'bg-purple-600 border-purple-600 text-white' : 'bg-[#4c3b4d] border-[#4c3b4d] text-white') : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-purple-100 text-slate-600')}`}>
              <status.icon className="w-4 h-4" /> {status.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className={`group rounded-2xl p-4 border transition-all duration-300 flex flex-col gap-4 h-full ${cardClass}`}>
              <div className="flex gap-4">
                <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-md relative bg-slate-200">
                  {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Book className="w-8 h-8" /></div>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (book.rating || 0) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(book)} className="opacity-50 hover:opacity-100 hover:text-blue-500 transition-opacity p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(book.id)} className="opacity-50 hover:opacity-100 hover:text-red-500 transition-opacity p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className={`font-bold mt-1 leading-tight line-clamp-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{book.title}</h3>
                  <p className="text-sm mt-1 line-clamp-1 opacity-70">{book.author}</p>
                  
                  {/* Status Label (Restored) */}
                  <div className="mt-2">
                    <StatusLabel status={book.status} />
                  </div>

                  {book.review && <p className="text-xs mt-2 opacity-60 line-clamp-2 italic">"{book.review}"</p>}
                </div>
              </div>

              <div className={`mt-auto pt-4 border-t flex justify-between items-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                {STATUS_CONFIG.map(status => {
                  const isActive = book.status === status.id;
                  return (
                    <button 
                      key={status.id}
                      onClick={() => handleStatusChange(book.id, status.id)}
                      title={status.label}
                      className={`p-2 rounded-full transition-all ${isActive ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                    >
                      {/* FIX: When active, fill with color but make STROKE white/dark to be visible */}
                      <status.icon className={`w-5 h-5 ${isActive ? `${status.fill} stroke-white dark:stroke-slate-900` : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <button onClick={openAddModal} className={`md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-40 ${darkMode ? 'bg-purple-600 text-white' : 'bg-[#4c3b4d] text-[#ccccff]'}`}>
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveBook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-50">Title</label>
                <input autoFocus type="text" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} placeholder="e.g. Kafka on the Shore" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-50">Author</label>
                <input type="text" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all ${inputClass}`} placeholder="e.g. Haruki Murakami" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">Status</label>
                <div className="flex justify-between gap-2">
                  {STATUS_CONFIG.map(status => {
                    const isActive = newBook.status === status.id;
                    return (
                      <button type="button" key={status.id} onClick={() => setNewBook({...newBook, status: status.id})} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${isActive ? (darkMode ? 'bg-slate-800 border-purple-500 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700') : (darkMode ? 'border-slate-800 text-slate-500 hover:bg-slate-800' : 'border-slate-100 text-slate-400 hover:bg-slate-50')}`}>
                        <status.icon className={`w-5 h-5 ${isActive ? `${status.fill} stroke-white dark:stroke-slate-900` : ''}`} />
                        <span className="text-[10px] font-medium">{status.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-50">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setNewBook({...newBook, rating: star})} className={`transition-transform hover:scale-110 ${star <= newBook.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        <Star className={`w-6 h-6 ${star <= newBook.rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-50">Review</label>
                <textarea rows="3" value={newBook.review} onChange={(e) => setNewBook({...newBook, review: e.target.value})} className={`w-full px-4 py-2 rounded-lg outline-none border focus:ring-2 transition-all resize-none ${inputClass}`} placeholder="What did you think?" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={!newBook.title || !newBook.author || loading} className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-[#4c3b4d] hover:opacity-90 text-[#ccccff]'}`}>
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? 'Save Changes' : 'Add to Library')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}