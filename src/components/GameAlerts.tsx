// Game Alerts & Notifications Component
// Real-time alerts for injuries, milestones, critical moments

'use client';

import { AlertCircle, TrendingUp, Heart, CheckCircle } from 'lucide-react';

interface GameAlert {
  id: string;
  type: 'injury' | 'milestone' | 'upset' | 'critical' | 'turnover';
  title: string;
  description: string;
  team?: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  resolved?: boolean;
}

interface GameAlertsProps {
  alerts: GameAlert[];
  maxDisplay?: number;
}

export function GameAlerts({ alerts, maxDisplay = 6 }: GameAlertsProps) {
  const activeAlerts = alerts.slice(-maxDisplay).reverse();

  const getAlertIcon = (type: GameAlert['type']) => {
    switch (type) {
      case 'injury':
        return <Heart className="w-4 h-4" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      case 'upset':
        return <AlertCircle className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'turnover':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: GameAlert['type'], severity: GameAlert['severity']) => {
    if (type === 'injury') return 'border-red-500/50 bg-red-500/10';
    if (type === 'turnover') return 'border-orange-500/50 bg-orange-500/10';
    if (type === 'milestone') return 'border-green-500/50 bg-green-500/10';
    if (severity === 'high') return 'border-red-500/50 bg-red-500/10';
    if (severity === 'medium') return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-blue-500/50 bg-blue-500/10';
  };

  const getAlertTextColor = (type: GameAlert['type']) => {
    if (type === 'injury') return 'text-red-400';
    if (type === 'turnover') return 'text-orange-400';
    if (type === 'milestone') return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-gray-400 px-1">LIVE ALERTS</div>
      
      {activeAlerts.length === 0 ? (
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-2 rounded-lg p-2.5 transition-all ${getAlertColor(alert.type, alert.severity)} ${
                alert.resolved ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex-shrink-0 ${getAlertTextColor(alert.type)}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-300 mt-0.5">{alert.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {alert.timestamp}
                    </span>
                  </div>
                  {alert.team && (
                    <div className="mt-1 text-xs text-gray-400">{alert.team}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
