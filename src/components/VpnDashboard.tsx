import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Settings, 
  Globe, 
  Power, 
  Activity, 
  Lock, 
  ChevronRight, 
  Download, 
  Upload, 
  Clock,
  MapPin,
  RefreshCw,
  Info,
  LogIn,
  Calendar,
  Key,
  Smartphone,
  LayoutDashboard,
  Server as ServerIcon,
  ShieldCheck,
  FileText,
  Copy,
  User,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ServerList } from './ServerList';
import { SecurityPanel } from './SecurityPanel';
import { SpeedChart } from './SpeedChart';
import { Server, ConnectionStatus, ConnectionStats, SecuritySettings, UserProfile } from '../types';
import { SERVERS, generateMockStats } from '../constants';

interface VpnDashboardProps {
  userProfile: UserProfile;
  onSignOut: () => void;
}

export default function VpnDashboard({ userProfile, onSignOut }: VpnDashboardProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState<Server>(SERVERS[0]);
  const [stats, setStats] = useState<ConnectionStats>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    dataTransferred: 0,
    duration: 0
  });
  const [settings, setSettings] = useState<SecuritySettings>({
    killSwitch: true,
    splitTunneling: false,
    dnsLeakProtection: true,
    adBlocker: true,
    protocol: 'WireGuard',
    turboMode: userProfile.tier === 'premium',
    proxy: false
  });
  const [speedHistory, setSpeedHistory] = useState<{ time: string; download: number; upload: number }[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'servers' | 'security' | 'logs' | 'account'>('home');
  const [vpnKey, setVpnKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
    }
  };

  const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'success' | 'warning' }[]>([
    { time: new Date().toLocaleTimeString(), message: 'System initialized', type: 'info' },
    { time: new Date().toLocaleTimeString(), message: `User tier: ${userProfile.tier.toUpperCase()}`, type: 'info' },
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), message, type }, ...prev].slice(0, 50));
  };

  const handleSettingsUpdate = (newSettings: SecuritySettings) => {
    // Log protocol changes
    if (newSettings.protocol !== settings.protocol) {
      addLog(`Protocol changed to ${newSettings.protocol}`, 'info');
    }
    
    // Log security feature toggles
    if (newSettings.killSwitch !== settings.killSwitch) {
      addLog(`SECURITY ALERT: Kill Switch ${newSettings.killSwitch ? 'enabled' : 'disabled'}`, newSettings.killSwitch ? 'success' : 'warning');
    }
    if (newSettings.adBlocker !== settings.adBlocker) {
      addLog(`Security Update: Ad & Malware blocker ${newSettings.adBlocker ? 'active' : 'inactive'}`, 'info');
    }
    if (newSettings.dnsLeakProtection !== settings.dnsLeakProtection) {
      addLog(`DNS Leak Protection ${newSettings.dnsLeakProtection ? 'enabled' : 'disabled'}`, 'success');
    }
    if (newSettings.turboMode !== settings.turboMode) {
      addLog(`Turbo Mode ${newSettings.turboMode ? 'activated' : 'deactivated'}`, newSettings.turboMode ? 'success' : 'info');
    }
    if (newSettings.proxy !== settings.proxy) {
      addLog(`HTTP Proxy ${newSettings.proxy ? 'enabled' : 'disabled'}`, 'info');
    }

    setSettings(newSettings);
  };

  const toggleConnection = () => {
    if (status === 'disconnected') {
      setStatus('connecting');
      addLog(`Initiating connection to ${selectedServer.name}...`, 'info');
      setTimeout(() => {
        setStatus('connected');
        addLog(`Connected to ${selectedServer.name} (${selectedServer.ip})`, 'success');
        addLog(`Tunnel established using ${settings.protocol}`, 'success');
        if (settings.turboMode) addLog('Turbo Mode active: Optimizing for streaming', 'success');
      }, 2000);
    } else if (status === 'connected') {
      setStatus('disconnecting');
      addLog('Terminating secure tunnel...', 'info');
      setTimeout(() => {
        setStatus('disconnected');
        setStats({ downloadSpeed: 0, uploadSpeed: 0, dataTransferred: 0, duration: 0 });
        addLog('Disconnected from VPN', 'warning');
      }, 1500);
    }
  };

  const quickConnect = () => {
    if (status === 'disconnected') {
      const randomServer = SERVERS[Math.floor(Math.random() * SERVERS.length)];
      setSelectedServer(randomServer);
      setStatus('connecting');
      addLog(`Quick Connect: Selecting random server...`, 'info');
      addLog(`Initiating connection to ${randomServer.name}...`, 'info');
      setTimeout(() => {
        setStatus('connected');
        addLog(`Connected to ${randomServer.name} (${randomServer.ip})`, 'success');
        addLog(`Tunnel established using ${settings.protocol}`, 'success');
      }, 2000);
    }
  };

  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        const newStats = generateMockStats();
        setStats(prev => ({
          ...newStats,
          dataTransferred: prev.dataTransferred + (newStats.downloadSpeed + newStats.uploadSpeed) / 1024,
          duration: prev.duration + 1
        }));

        setSpeedHistory(prev => {
          const newData = [...prev, { 
            time: new Date().toLocaleTimeString(), 
            download: newStats.downloadSpeed, 
            upload: newStats.uploadSpeed 
          }];
          return newData.slice(-20);
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSpeedHistory([]);
    }
  }, [status]);

  useEffect(() => {
    addLog(`Protocol switched to ${settings.protocol}`, 'info');
  }, [settings.protocol]);

  useEffect(() => {
    addLog(`Kill Switch ${settings.killSwitch ? 'enabled' : 'disabled'}`, settings.killSwitch ? 'success' : 'warning');
  }, [settings.killSwitch]);

  useEffect(() => {
    if (status === 'connected' && !vpnKey) {
      const mockKey = `SWAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setVpnKey(mockKey);
      addLog('Connection key generated', 'success');
    } else if (status === 'disconnected') {
      setVpnKey('');
    }
  }, [status, vpnKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addLog('Key copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SWAL <span className="text-blue-500">VPN</span></span>
          </div>
          
          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <button 
              onClick={() => setActiveMobileTab('home')}
              className={`text-sm font-medium transition-colors ${activeMobileTab === 'home' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveMobileTab('servers')}
              className={`text-sm font-medium transition-colors ${activeMobileTab === 'servers' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
            >
              Servers
            </button>
            <button 
              onClick={() => setActiveMobileTab('security')}
              className={`text-sm font-medium transition-colors ${activeMobileTab === 'security' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
            >
              Security
            </button>
            <button 
              onClick={() => setActiveMobileTab('account')}
              className={`text-sm font-medium transition-colors ${activeMobileTab === 'account' ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
            >
              Account
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <AnimatePresence>
              {status === 'connected' && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                >
                  <Key className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none">VPN Active</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isAppInstalled && deferredPrompt && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInstallClick}
                className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white border-none h-8 px-3 text-xs"
              >
                <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                Download App
              </Button>
            )}
            
            <AnimatePresence>
              {status === 'connected' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20"
                >
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Secure</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Badge variant="outline" className={`${status === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'} px-3 py-1`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSignOut}
              className="text-zinc-400 hover:text-white"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Ad Placeholder */}
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <div className="w-full h-20 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-xs font-mono uppercase tracking-widest overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          Advertisement Placeholder
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:mb-0 mb-20">
        {/* Connection View - Always visible on desktop side-by-side, toggle on mobile */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 ${activeMobileTab !== 'home' ? 'hidden lg:grid' : 'grid'}`}>
          {/* Left Column: Connection Status & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden relative border-none sm:border-solid">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            
            {/* World Map Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <svg viewBox="0 0 800 400" className="w-full h-full scale-150 translate-y-10">
                <path fill="currentColor" d="M150,100 Q200,80 250,100 T350,120 T450,100 T550,130 T650,110 T750,140 V300 H150 Z" />
                <circle cx="200" cy="150" r="2" fill="currentColor" />
                <circle cx="300" cy="180" r="2" fill="currentColor" />
                <circle cx="450" cy="160" r="2" fill="currentColor" />
                <circle cx="600" cy="200" r="2" fill="currentColor" />
                <circle cx="150" cy="250" r="2" fill="currentColor" />
              </svg>
            </div>

            <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
              {/* Dynamic Background Glow */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-colors duration-1000 pointer-events-none opacity-20 ${
                status === 'connected' ? 'bg-green-500' : 
                status === 'connecting' ? 'bg-yellow-500' : 
                status === 'disconnecting' ? 'bg-red-500' : 
                'bg-blue-500'
              }`} />

              <div className="mb-8 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative"
                  >
                    {/* Pulsing rings when connected */}
                    {status === 'connected' && (
                      <>
                        <motion.div 
                          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-green-500/20"
                        />
                        <motion.div 
                          animate={{ scale: [1, 2.2], opacity: [0.2, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="absolute inset-0 rounded-full bg-green-500/10"
                        />
                      </>
                    )}

                    {/* Spinning ring when connecting */}
                    {(status === 'connecting' || status === 'disconnecting') && (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className={`absolute -inset-4 rounded-full border-2 border-t-transparent border-l-transparent ${
                          status === 'connecting' ? 'border-yellow-500' : 'border-red-500'
                        }`}
                      />
                    )}
                    
                    <button
                      onClick={toggleConnection}
                      disabled={status === 'connecting' || status === 'disconnecting'}
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10 ${
                        status === 'connected' 
                          ? 'bg-green-600 shadow-green-600/40' 
                          : status === 'connecting'
                          ? 'bg-yellow-600/20 border border-yellow-500/50 cursor-wait'
                          : status === 'disconnecting'
                          ? 'bg-red-600/20 border border-red-500/50 cursor-wait'
                          : 'bg-zinc-800 hover:bg-zinc-700 shadow-black'
                      }`}
                    >
                      {status === 'connected' ? (
                        <Shield className="w-12 h-12 text-white animate-pulse" />
                      ) : status === 'connecting' ? (
                        <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
                      ) : status === 'disconnecting' ? (
                        <RefreshCw className="w-12 h-12 text-red-500 animate-spin" />
                      ) : (
                        <Power className="w-12 h-12 text-zinc-400" />
                      )}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-2 relative z-10">
                <div 
                  className={`flex items-center justify-center gap-2 ${status === 'disconnected' ? 'cursor-pointer group' : ''}`}
                  onClick={status === 'disconnected' ? quickConnect : undefined}
                >
                  <h2 className={`text-2xl font-bold transition-colors duration-500 ${
                    status === 'connected' ? 'text-green-500' : 
                    status === 'connecting' ? 'text-yellow-500' : 
                    status === 'disconnecting' ? 'text-red-500' : 
                    'text-white group-hover:text-blue-500'
                  }`}>
                    {status === 'connected' ? 'Protected' : 
                     status === 'connecting' ? 'Securing Connection...' : 
                     status === 'disconnecting' ? 'Disconnecting...' : 
                     'Not Protected'}
                  </h2>
                  {status === 'connected' && settings.turboMode && (
                    <Badge className="bg-blue-600 animate-pulse">TURBO</Badge>
                  )}
                </div>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  {status === 'connected' 
                    ? `Encrypted connection via ${selectedServer.name}` 
                    : status === 'connecting'
                    ? 'Establishing secure tunnel...'
                    : 'Your internet traffic is currently exposed. Connect to secure your data.'}
                </p>
              </div>

              {status === 'connected' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-8 grid grid-cols-3 gap-8 w-full border-t border-zinc-800 pt-8"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Duration</p>
                    <p className="text-lg font-mono font-medium">{formatDuration(stats.duration)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Virtual IP</p>
                    <p className="text-lg font-mono font-medium text-blue-400">{selectedServer.ip}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Data Used</p>
                    <p className="text-lg font-mono font-medium">{stats.dataTransferred.toFixed(1)} MB</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Real-time Traffic</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    onClick={() => {
                      addLog('Running network speed test...', 'info');
                      setTimeout(() => addLog('Speed test complete: 48.2 Mbps DL / 12.5 Mbps UL', 'success'), 2000);
                    }}
                  >
                    Run Test
                  </Button>
                </div>
                <SpeedChart data={speedHistory} />
                <div className="flex justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-zinc-400">DL:</span>
                    <span>{stats.downloadSpeed.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-zinc-400">UL:</span>
                    <span>{stats.uploadSpeed.toFixed(1)} Mbps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Security Status</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Encryption</span>
                    <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">AES-256-GCM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Protocol</span>
                    <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">{settings.protocol}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">DNS Status</span>
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Encrypted
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Kill Switch</span>
                    <span className={`text-xs flex items-center gap-1 ${settings.killSwitch ? 'text-green-500' : 'text-zinc-500'}`}>
                      {settings.killSwitch ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Servers & Settings (On desktop, these are tabs) */}
        <div className="lg:col-span-5 hidden lg:block space-y-6">
          <Tabs defaultValue="servers" className="w-full">
            <TabsList className="w-full bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl h-12">
              <TabsTrigger value="servers" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-2" />
                Servers
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="servers" className="m-0">
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">Select Location</h3>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-500 hover:text-white">
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    <ServerList 
                      selectedServer={selectedServer} 
                      onSelect={(s) => {
                        if (status === 'connected') {
                          addLog(`Switching server to ${s.name}...`, 'info');
                          setTimeout(() => {
                            setSelectedServer(s);
                            setStatus('connecting');
                            setTimeout(() => {
                              setStatus('connected');
                              addLog(`Connected to ${s.name}`, 'success');
                            }, 1500);
                          }, 1000);
                        } else {
                          setSelectedServer(s);
                          addLog(`Target server set to ${s.name}`, 'info');
                        }
                      }} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0">
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-6">
                    <SecurityPanel 
                      settings={settings} 
                      onUpdate={handleSettingsUpdate} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="m-0">
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">Connection Logs</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-zinc-500 hover:text-blue-400"
                          onClick={() => {
                            const logText = logs.map(l => `[${l.time}] ${l.message}`).join('\n');
                            navigator.clipboard.writeText(logText);
                            addLog('Logs copied to clipboard', 'success');
                          }}
                        >
                          Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-zinc-500 hover:text-red-400"
                          onClick={() => setLogs([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[360px] pr-4">
                      <div className="space-y-3">
                        {logs.map((log, i) => (
                          <div key={i} className="flex gap-3 text-[11px] font-mono leading-relaxed items-start">
                            <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              log.type === 'success' ? 'bg-green-500' :
                              log.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <span className={
                              log.type === 'success' ? 'text-green-500/90' :
                              log.type === 'warning' ? 'text-yellow-500/90' :
                              'text-zinc-400'
                            }>
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="m-0">
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                        <User className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{userProfile.email.split('@')[0]}</h3>
                        <p className="text-sm text-zinc-500">{userProfile.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Subscription Tier</span>
                        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          {userProfile.tier.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Plan Expiry</span>
                        <span className="text-sm font-medium">{new Date(userProfile.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Current VPN Session Key</h4>
                      {status === 'connected' ? (
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-zinc-900 p-2 rounded text-sm font-mono text-blue-400 border border-zinc-800">
                            {vpnKey}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => copyToClipboard(vpnKey)}
                            className="text-zinc-400 hover:text-white"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      ) : (
                        <div className="py-2 text-center">
                          <p className="text-sm text-zinc-500 italic">Please connect to a server to generate your connection key.</p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => setActiveMobileTab('home')}
                            className="text-blue-500 p-0 h-auto mt-2"
                          >
                            Go to Dashboard
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <Card className="bg-blue-600/10 border-blue-500/20">
            <CardContent className="p-4 flex gap-4 items-start">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-400">Pro Tip</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Using the WireGuard protocol provides up to 3x faster speeds and lower latency compared to OpenVPN.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Mobile Specific Views */}
      <div className="lg:hidden space-y-6">
          {activeMobileTab === 'servers' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-zinc-900/40 border-zinc-800 border-none sm:border-solid">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">Servers</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-500 hover:text-white">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <ServerList 
                    selectedServer={selectedServer} 
                    onSelect={(s) => {
                      setSelectedServer(s);
                      setActiveMobileTab('home');
                      if (status === 'connected') {
                        toggleConnection(); // Quick reconnect logic
                        setTimeout(toggleConnection, 1000);
                      }
                    }} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeMobileTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-zinc-900/40 border-zinc-800 border-none sm:border-solid">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-6">Security Settings</h3>
                  <SecurityPanel 
                    settings={settings} 
                    onUpdate={handleSettingsUpdate} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeMobileTab === 'logs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-zinc-900/40 border-zinc-800 border-none sm:border-solid">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Activity Logs</h3>
                    <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-red-400">Clear</Button>
                  </div>
                  <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                    <div className="space-y-4">
                      {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 text-xs font-mono leading-relaxed items-start border-b border-zinc-800/50 pb-3">
                          <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                          <span className={
                            log.type === 'success' ? 'text-green-500' :
                            log.type === 'warning' ? 'text-yellow-500' :
                            'text-zinc-400'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeMobileTab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-zinc-900/40 border-zinc-800 border-none sm:border-solid">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <User className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{userProfile.email.split('@')[0]}</h3>
                      <p className="text-sm text-zinc-500">{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Subscription Tier</span>
                      <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1">
                        {userProfile.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Plan Expiry</span>
                      <span className="text-sm font-bold text-zinc-200">{new Date(userProfile.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Connection Key</h4>
                    {status === 'connected' ? (
                      <div className="flex items-center gap-3">
                        <code className="flex-1 bg-zinc-900 p-3 rounded-xl text-xs font-mono text-blue-400 border border-zinc-800 break-all">
                          {vpnKey}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(vpnKey)}
                          className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white shrink-0"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-3">
                        <p className="text-sm text-zinc-500">Please connect to a server to generate your connection key.</p>
                        <Button 
                          onClick={() => setActiveMobileTab('home')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold"
                        >
                          Connect Now
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl h-12 font-bold mt-4"
                    onClick={onSignOut}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-6 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={() => setActiveMobileTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'home' ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button 
            onClick={() => setActiveMobileTab('servers')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'servers' ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <ServerIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Servers</span>
          </button>
          <button 
            onClick={() => setActiveMobileTab('security')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'security' ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Security</span>
          </button>
          <button 
            onClick={() => setActiveMobileTab('logs')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'logs' ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Logs</span>
          </button>
          <button 
            onClick={() => setActiveMobileTab('account')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMobileTab === 'account' ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Account</span>
          </button>
        </div>
      </nav>

      {/* Footer / Status Bar - Hidden on mobile, shown on desktop */}
      <footer className="hidden lg:block border-t border-zinc-800/50 bg-black/50 backdrop-blur-xl py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>Current IP: 182.45.12.9 (Exposed)</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Expires: {new Date(userProfile.expiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Tier: {userProfile.tier}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Version 2.4.0</span>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
