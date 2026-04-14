'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat({ projectId }: { projectId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Waddle AI. Ask me anything about your project, or try: \"What's at risk?\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
      const response = await fetch(`${apiBase}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, projectId: projectId ?? '' }),
      });

      const data = await response.json() as { data?: { answer: string } };
      const answer = data.data?.answer ?? 'Sorry, I could not answer that right now.';

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error connecting to AI service. Please check your API configuration.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <span className="text-lg">🤖</span>
        <h3 className="font-semibold text-slate-900">Waddle AI</h3>
        <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
          Active
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void sendMessage()}
            placeholder="Ask about your project..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={loading}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {["What's at risk?", "Summarize sprint", "Who's overloaded?"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:border-brand-300 hover:text-brand-600"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
