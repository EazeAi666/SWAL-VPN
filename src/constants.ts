import { Server } from './types';

export const SERVERS: Server[] = [
  { id: 'us-la', name: 'USA Los Angeles', country: 'USA', city: 'Los Angeles', latency: 42, load: 35, flag: '🇺🇸', ip: '104.21.45.12', tier: 'standard' },
  { id: 'us-miami', name: 'USA Miami', country: 'USA', city: 'Miami', latency: 38, load: 42, flag: '🇺🇸', ip: '104.21.45.15', tier: 'standard' },
  { id: 'ca-tor', name: 'Canada Toronto', country: 'Canada', city: 'Toronto', latency: 35, load: 40, flag: '🇨🇦', ip: '192.168.1.1', tier: 'standard' },
  { id: 'ca-van', name: 'Canada Vancouver', country: 'Canada', city: 'Vancouver', latency: 48, load: 25, flag: '🇨🇦', ip: '192.168.1.5', tier: 'standard' },
  { id: 'uk-lon', name: 'UK London', country: 'UK', city: 'London', latency: 12, load: 30, flag: '🇬🇧', ip: '45.12.89.4', tier: 'standard' },
  { id: 'de-fra', name: 'Germany Frankfurt', country: 'Germany', city: 'Frankfurt', latency: 18, load: 65, flag: '🇩🇪', ip: '80.123.45.67', tier: 'standard' },
  { id: 'jp-tok', name: 'Japan Tokyo (Turbo)', country: 'Japan', city: 'Tokyo', latency: 145, load: 20, flag: '🇯🇵', ip: '122.45.67.89', tier: 'standard', optimizedFor: 'streaming' },
  { id: 'fr-par', name: 'France Paris (Turbo)', country: 'France', city: 'Paris', latency: 22, load: 50, flag: '🇫🇷', ip: '5.6.7.8', tier: 'standard', optimizedFor: 'streaming' },
  { id: 'sg-sg', name: 'Singapore', country: 'Singapore', city: 'Singapore', latency: 98, load: 55, flag: '🇸🇬', ip: '13.45.67.12', tier: 'standard' },
  { id: 'au-syd', name: 'Australia Sydney', country: 'Australia', city: 'Sydney', latency: 210, load: 15, flag: '🇦🇺', ip: '1.2.3.4', tier: 'standard' },
];

export const generateMockStats = () => ({
  downloadSpeed: Math.random() * 50 + 10,
  uploadSpeed: Math.random() * 20 + 5,
  dataTransferred: Math.random() * 1000,
  duration: 0,
});
