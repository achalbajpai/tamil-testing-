import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcesing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;

    // Configure recognition settings
    recognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');

      if (event.results[0].isFinal) {
        onTranscription(transcript);
        stopRecording();
      }
    };

    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}. Please try again.`);
      stopRecording();
    };

    recognition.current.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [onTranscription]);

  const startRecording = async () => {
    try {
      setError('');
      setIsProcessing(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognition.current) {
        recognition.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please ensure you have granted microphone permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (recognition.current && isRecording) {
      recognition.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcesing || !!error}
        className={`p-4 rounded-full ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white disabled:opacity-50`}
      >
        {isRecording ? <Square size={24} /> : <Mic size={24} />}
      </button>
      
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-sm text-gray-600">
          {isProcesing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Initializing...
            </span>
          ) : isRecording ? (
            'Recording... Click to stop'
          ) : (
            'Click to start recording'
          )}
        </p>
      )}
    </div>
  );
};