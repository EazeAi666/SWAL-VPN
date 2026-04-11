import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Server } from '../types';
import { SERVERS } from '../constants';
import { Signal, Users } from 'lucide-react';

interface ServerListProps {
  selectedServer: Server;
  onSelect: (server: Server) => void;
}

export const ServerList: React.FC<ServerListProps> = ({ selectedServer, onSelect }) => {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {SERVERS.map((server) => {
          return (
            <button
              key={server.id}
              onClick={() => onSelect(server)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                selectedServer.id === server.id
                  ? 'bg-blue-600/10 border-blue-500/50 text-white'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{server.flag}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{server.name}</p>
                    {server.optimizedFor === 'streaming' && (
                      <Badge className="h-4 text-[8px] px-1 bg-blue-600 hover:bg-blue-600">
                        TURBO
                      </Badge>
                    )}
                  </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs opacity-60">{server.city}</p>
                  {server.optimizedFor && (
                    <span className="text-[8px] text-blue-400 uppercase font-bold tracking-tighter">
                      • {server.optimizedFor}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Signal className={`w-3 h-3 ${server.latency < 50 ? 'text-green-500' : server.latency < 150 ? 'text-yellow-500' : 'text-red-500'}`} />
                <span className="text-[10px] font-mono">{server.latency}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-mono">{server.load}%</span>
              </div>
            </div>
          </button>
        );
      })}
      </div>
    </ScrollArea>
  );
};
