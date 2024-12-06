import { WatchTime
    
 } from "../types/interfaces";
export const getWatchTimeIcon = (watchTime: WatchTime): string => {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙'
    };
    return icons[watchTime] || '⏰';
  };