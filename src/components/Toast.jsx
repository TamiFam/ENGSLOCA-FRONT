import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 1200 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    const base = "fixed top-4 right-4 z-50 border-2 border-black px-4 py-3 font-black text-sm shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200";
    
    switch (type) {
      case 'error': return `${base} bg-red-500 text-white`;
      case 'warning': return `${base} bg-yellow-300 text-black`;
      case 'success': return `${base} bg-green-400 text-black`;
      default: return `${base} bg-white text-black`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return '⛔';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '💡';
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-center gap-2">
        <span>{getIcon()}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:scale-125 transition-transform duration-150"
        >
          ×
        </button>
      </div>
    </div>
  );
}