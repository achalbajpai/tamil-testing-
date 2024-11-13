import React, { useState } from 'react';
import { MessageCircle, Mic, Square, Loader2 } from 'lucide-react';
import { analyzeSentiment } from './utils/gemini';
import { indianLanguages } from './utils/languages';
import { SentimentChart } from './components/SentimentChart';
import { VoiceRecorder } from './components/VoiceRecorder';

function App() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'voice'>('text');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [sentiments, setSentiments] = useState({ happy: 0, sad: 0, mixed: 0 });
  const [transcribedText, setTranscribedText] = useState('');

  const handleAnalyze = async (text: string = input) => {
    if (!text.trim()) {
      setError('Please enter text or record your voice');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const analysis = await analyzeSentiment(text, language);
      setResult(analysis);
      
      setSentiments(prev => ({
        ...prev,
        [analysis.sentiment.toLowerCase()]: prev[analysis.sentiment.toLowerCase()] + 1
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    setTranscribedText(text);
    handleAnalyze(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 to-blue-300 p-4 sm:p-8">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-8 text-purple-900 drop-shadow-lg">
          Sentiment Analysis
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 transition-all duration-300 hover:shadow-3xl">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setInputType('text');
                setInput('');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors duration-300 ${
                inputType === 'text'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle size={20} />
              Text Input
            </button>
            <button
              onClick={() => {
                setInputType('voice');
                setInput('');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors duration-300 ${
                inputType === 'voice'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic size={20} />
              Voice Input
            </button>
          </div>

          {inputType === 'text' ? (
            <div className="mb-6">
              <textarea
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter your text here..."
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="mb-6">
              <VoiceRecorder onTranscription={handleVoiceResult} />
              {transcribedText && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300">
                  <p className="font-semibold text-purple-700">Transcribed Text:</p>
                  <p className="mt-2 text-gray-700">{transcribedText}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <select
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all duration-300 bg-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {indianLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {inputType === 'text' && (
              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center gap-2 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 transition-all duration-300">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 transition-all duration-300 hover:shadow-md">
              <h2 className="text-3xl font-semibold mb-4 text-purple-800">Analysis Result</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Overall Sentiment:</span>{' '}
                    <span
                      className={`px-3 py-1 rounded-full ${
                        result.sentiment === 'happy'
                          ? 'bg-green-100 text-green-800'
                          : result.sentiment === 'sad'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.sentiment}
                    </span>
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Confidence Score:</span>{' '}
                    <span className="text-purple-700">{result.confidence}%</span>
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Analysis in {indianLanguages.find(l => l.code === language)?.name}:</span>
                    <br />
                    <span className="italic text-gray-700">{result.translation}</span>
                  </p>
                </div>
                <SentimentChart sentiments={sentiments} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;