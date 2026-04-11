import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Zap, Globe, Lock } from 'lucide-react';
import { SecuritySettings } from '../types';

interface SecurityPanelProps {
  settings: SecuritySettings;
  onUpdate: (settings: SecuritySettings) => void;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof SecuritySettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Kill Switch</Label>
            <p className="text-xs text-zinc-500">Block internet if VPN drops</p>
          </div>
        </div>
        <Switch 
          checked={settings.killSwitch} 
          onCheckedChange={(val) => handleChange('killSwitch', val)} 
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Split Tunneling</Label>
            <p className="text-xs text-zinc-500">Choose apps to bypass VPN</p>
          </div>
        </div>
        <Switch 
          checked={settings.splitTunneling} 
          onCheckedChange={(val) => handleChange('splitTunneling', val)} 
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-green-500" />
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">DNS Leak Protection</Label>
            <p className="text-xs text-zinc-500">Prevent DNS queries leaking</p>
          </div>
        </div>
        <Switch 
          checked={settings.dnsLeakProtection} 
          onCheckedChange={(val) => handleChange('dnsLeakProtection', val)} 
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-purple-500" />
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Ad & Malware Blocker</Label>
            <p className="text-xs text-zinc-500">Block malicious domains</p>
          </div>
        </div>
        <Switch 
          checked={settings.adBlocker} 
          onCheckedChange={(val) => handleChange('adBlocker', val)} 
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 transition-all">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-400" />
          <div className="space-y-0.5">
            <Label className="text-sm font-medium text-blue-400">
              Turbo Mode
            </Label>
            <p className="text-xs text-zinc-500">Optimized for 4K streaming & gaming</p>
          </div>
        </div>
        <Switch 
          checked={settings.turboMode} 
          onCheckedChange={(val) => handleChange('turboMode', val)} 
        />
      </div>

      {settings.turboMode && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="p-3 rounded-lg bg-blue-600/5 border border-blue-500/20 space-y-3 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-blue-400 uppercase font-bold">Streaming Bypass</Label>
            <Badge className="bg-blue-600 text-[8px] h-4">ACTIVE</Badge>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-blue-400 uppercase font-bold">Gaming Low-Latency</Label>
            <Badge className="bg-blue-600 text-[8px] h-4">ACTIVE</Badge>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-blue-400 uppercase font-bold">Smart Routing</Label>
            <Badge className="bg-blue-600 text-[8px] h-4">ACTIVE</Badge>
          </div>
        </motion.div>
      )}

      <div className="pt-2">
        <Label className="text-xs text-zinc-500 mb-2 block uppercase tracking-wider font-bold">Protocol</Label>
        <Select 
          value={settings.protocol} 
          onValueChange={(val: any) => handleChange('protocol', val)}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select protocol" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="WireGuard">WireGuard (Recommended)</SelectItem>
            <SelectItem value="OpenVPN">OpenVPN (TCP/UDP)</SelectItem>
            <SelectItem value="IKEv2">IKEv2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
