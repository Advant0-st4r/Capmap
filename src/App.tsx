import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  BarChart3, 
  FileUp, 
  Download, 
  Settings, 
  ChevronRight, 
  Plus, 
  Search,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateMetrics, generateVisualization } from './services/geminiService';
import { User, Capability, Metric } from './types';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ user }: { user: User | null }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Network, label: 'Capabilities', path: '/capabilities' },
    { icon: BarChart3, label: 'Processes', path: '/processes' },
    { icon: ImageIcon, label: 'Visualization', path: '/visualization' },
    { icon: FileUp, label: 'Upload', path: '/upload' },
    { icon: Download, label: 'Export', path: '/export' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-[#141414] text-white h-screen fixed left-0 top-0 flex flex-col border-r border-white/10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-black fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight">CapMap AI</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-emerald-500 text-black font-medium" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-black" : "text-zinc-500 group-hover:text-white")} />
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
            {user?.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-zinc-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PageHeader = ({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
      {description && <p className="text-zinc-400">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[#1A1A1A] border border-white/5 rounded-2xl p-6", className)}>
    {children}
  </div>
);

// --- Pages ---

const Dashboard = () => {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader 
        title="Executive Dashboard" 
        description="Real-time KPI summary and capability health overview."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between h-40">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Total Capabilities</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">42</span>
            <div className="flex items-center text-emerald-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12%
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between h-40">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Maturity Index</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">3.8</span>
            <div className="flex items-center text-emerald-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +0.4
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between h-40">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">AI Generations</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">128</span>
            <div className="flex items-center text-zinc-500 text-sm font-medium">
              Daily Limit: 500
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <h3 className="text-lg font-semibold text-white mb-6">Capability Growth</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="h-96">
          <h3 className="text-lg font-semibold text-white mb-6">Domain Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
};

const Capabilities = () => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCap, setSelectedCap] = useState<Capability | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/capabilities')
      .then(res => res.json())
      .then(data => {
        setCapabilities(data);
        setLoading(false);
      });
  }, []);

  const handleGenerateMetrics = async (cap: Capability) => {
    setSelectedCap(cap);
    setGenerating(true);
    try {
      const result = await generateMetrics(cap.name, cap.domain);
      setMetrics(result);
      // Log interaction
      fetch('/api/user/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'mock-user',
          eventType: 'metric_generation',
          entityType: 'capability',
          entityId: cap.id,
          metadata: { name: cap.name }
        })
      });
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader 
        title="Business Capabilities" 
        description="Inventory of organizational capabilities and their maturity levels."
        actions={
          <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-400 transition-colors">
            <Plus className="w-5 h-5" />
            Add Capability
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden" id="capability-list">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search capabilities..." 
                className="bg-transparent border-none outline-none text-white flex-1 text-sm"
              />
            </div>
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : capabilities.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">No capabilities found. Add one to get started.</div>
              ) : capabilities.map(cap => (
                <div 
                  key={cap.id} 
                  className={cn(
                    "p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group",
                    selectedCap?.id === cap.id && "bg-white/5"
                  )}
                  onClick={() => handleGenerateMetrics(cap)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-emerald-500">
                      {cap.maturity_level}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{cap.name}</h4>
                      <p className="text-xs text-zinc-500">{cap.domain}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedCap ? (
              <motion.div
                key={selectedCap.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="sticky top-6" id="metrics-panel">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Metrics: {selectedCap.name}</h3>
                    {generating && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
                  </div>
                  
                  <div className="space-y-4">
                    {generating ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-zinc-800/50 animate-pulse rounded-xl" />
                      ))
                    ) : metrics.length > 0 ? (
                      metrics.map((m, i) => (
                        <div key={i} className="p-4 bg-zinc-800/30 rounded-xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{m.name}</p>
                            <p className="text-xl font-bold text-white">{m.value}{m.unit}</p>
                          </div>
                          {m.trend === 'up' ? <ArrowUpRight className="text-emerald-500" /> : 
                           m.trend === 'down' ? <ArrowDownRight className="text-rose-500" /> : 
                           <Minus className="text-zinc-500" />}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-sm">Select a capability to view AI-generated metrics.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center text-center py-24">
                <Network className="w-16 h-16 text-zinc-800 mb-6" />
                <h3 className="text-white font-medium mb-2">No Capability Selected</h3>
                <p className="text-zinc-500 text-sm max-w-[200px]">Click on a capability from the list to view its detailed metrics and KPIs.</p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Visualization = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await generateVisualization(prompt);
      setImageUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader 
        title="AI Visualization" 
        description="Generate architectural diagrams and capability maps using Gemini."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1" id="viz-controls">
          <h3 className="text-lg font-semibold text-white mb-6">Prompt Builder</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Diagram Type</label>
              <select className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors">
                <option>Capability Map</option>
                <option>Process Flow</option>
                <option>IT Asset Relationship</option>
                <option>Maturity Heatmap</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Context / Description</label>
              <textarea 
                id="viz-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A multi-layered capability map for a retail organization focusing on supply chain and logistics..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors h-32 resize-none"
              />
            </div>
            <button 
              id="viz-generate-btn"
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
              Generate Visualization
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Output Preview</h3>
            {imageUrl && (
              <button className="text-emerald-500 text-sm font-medium flex items-center gap-2 hover:underline">
                <Download className="w-4 h-4" />
                Download Image
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black/20 rounded-xl border border-dashed border-white/10 flex items-center justify-center relative overflow-hidden">
            {loading ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-zinc-500">Gemini is crafting your visualization...</p>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Generated Visualization" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500">Your generated diagram will appear here.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const user = await res.json();
      onLogin(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Zap className="w-10 h-10 text-black fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CapMap AI</h1>
          <p className="text-zinc-500">Enterprise Business Architecture, Powered by AI.</p>
        </div>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Work Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Continue to Dashboard
            </button>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-xs text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to CapMap AI",
      description: "Let's get you started with a quick tour of the platform.",
      target: "nav-dashboard",
      action: "Next",
      path: "/"
    },
    {
      title: "Upload Your Data",
      description: "Start by uploading your business capability dataset here.",
      target: "nav-upload",
      action: "Go to Upload",
      path: "/upload"
    },
    {
      title: "Generate Metrics",
      description: "Once your data is in, navigate to Capabilities to generate AI-powered KPIs.",
      target: "nav-capabilities",
      action: "Go to Capabilities",
      path: "/capabilities"
    },
    {
      title: "AI Visualization",
      description: "Finally, use Gemini to create professional architectural diagrams.",
      target: "nav-visualization",
      action: "Go to Visualization",
      path: "/visualization"
    },
    {
      title: "All Set!",
      description: "You're ready to map your enterprise. Enjoy the power of CapMap AI.",
      target: "nav-dashboard",
      action: "Finish",
      path: "/"
    }
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('capmap_tutorial_seen');
    if (hasSeenTutorial) setIsVisible(false);
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      navigate(steps[nextStep].path);
    } else {
      setIsVisible(false);
      localStorage.setItem('capmap_tutorial_seen', 'true');
    }
  };

  if (!isVisible) return null;

  const currentStep = steps[step];
  const targetElement = document.getElementById(currentStep.target);
  const rect = targetElement?.getBoundingClientRect();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />
      
      <AnimatePresence>
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute z-[110] pointer-events-auto"
          style={{
            top: rect ? rect.top + rect.height / 2 : '50%',
            left: rect ? rect.right + 20 : '50%',
            transform: rect ? 'translateY(-50%)' : 'translate(-50%, -50%)'
          }}
        >
          <div className="w-80 bg-[#1A1A1A] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === step ? "w-6 bg-emerald-500" : "w-2 bg-zinc-800"
                    )} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Step {step + 1} of {steps.length}</span>
            </div>
            
            <h4 className="text-white font-bold text-lg mb-2">{currentStep.title}</h4>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{currentStep.description}</p>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setIsVisible(false); localStorage.setItem('capmap_tutorial_seen', 'true'); }}
                className="text-zinc-500 text-xs font-medium hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
              <button 
                onClick={handleNext}
                className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
              >
                {currentStep.action}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          {rect && (
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1A1A1A] border-l border-b border-emerald-500/30 rotate-45" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Highlight Target */}
      {rect && (
        <motion.div 
          initial={false}
          animate={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
          className="absolute border-2 border-emerald-500 rounded-xl z-[105] pointer-events-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        />
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <Onboarding />
      <div className="min-h-screen bg-[#0A0A0A] text-zinc-300 flex">
        <Sidebar user={user} />
        
        <main className="flex-1 ml-64 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/capabilities" element={<Capabilities />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/processes" element={
              <div className="text-center py-24">
                <BarChart3 className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Processes</h2>
                <p className="text-zinc-500">Process mapping and linking is coming soon.</p>
              </div>
            } />
            <Route path="/upload" element={
              <div className="text-center py-24">
                <FileUp className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Upload Dataset</h2>
                <p className="text-zinc-500">Bulk upload capabilities via CSV or Excel.</p>
              </div>
            } />
            <Route path="/export" element={
              <div className="text-center py-24">
                <Download className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Export Center</h2>
                <p className="text-zinc-500">Generate PDF, CSV, and XLSX reports.</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="text-center py-24">
                <Settings className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-zinc-500">Manage your profile and API usage quotas.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
