import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface VoiceInputProps {
  className?: string;
}

/**
 * Visual-only microphone button for demo purposes.
 * Does not implement actual speech-to-text.
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({ className }) => {
  const [isListening, setIsListening] = React.useState(false);

  return (
    <button
      onClick={() => setIsListening(!isListening)}
      className={cn(
        'relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
        isListening
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700',
        className
      )}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      )}
      {isListening ? <MicOff className="h-4 w-4 relative z-10" /> : <Mic className="h-4 w-4" />}
    </button>
  );
};