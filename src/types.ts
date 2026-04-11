export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  latency: number;
  load: number;
  flag: string;
  ip: string;
  tier: 'standard' | 'premium';
  optimizedFor?: 'streaming' | 'gaming' | 'p2p';
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

export interface ConnectionStats {
  downloadSpeed: number;
  uploadSpeed: number;
  dataTransferred: number;
  duration: number;
}

export interface SecuritySettings {
  killSwitch: boolean;
  splitTunneling: boolean;
  dnsLeakProtection: boolean;
  adBlocker: boolean;
  protocol: 'OpenVPN' | 'WireGuard' | 'IKEv2';
  turboMode: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  tier: 'standard' | 'premium';
  expiryDate?: string;
  isAdmin?: boolean;
}
