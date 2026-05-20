'use client';
import { useState } from 'react';

export default function AggregatorChat() {
  const [message, setMessage] = useState('');
  const [currentModel, setCurrentModel] = useState('gemini-3.5-flash');
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 预设支持融合的模型列表
  const models = [
    'gemini-3.5-flash',
    'gemini-3.1-pro',
    'gpt-5.5-flash',
    'claude-3-5-sonnet',
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setChatLog((prev) => [...prev, { role: 'user', text: message }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model: currentModel }),
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { role: 'ai', text: data.text || data.error }]);
    } catch (e) {
      setChatLog((prev) => [...prev, { role: 'system', text: '请求失败' }]);
    }
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 font-sans text-slate-800 bg-white">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-bold flex items-center gap-1">🚀 聚合器</h1>
        <select 
          value={currentModel} 
          onChange={(e) => setCurrentModel(e.target.value)}
          className="border rounded px-2 py-1 bg-slate-50 text-sm shadow-sm"
        >
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </header>

      <main className="flex-1 overflow-y-auto my-4 space-y-3 p-3 bg-slate-50 rounded-lg border">
        {chatLog.map((chat, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${chat.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white shadow border mr-auto'}`}>
            <p className="whitespace-pre-line text-sm">{chat.text}</p>
          </div>
        ))}
        {loading && <p className="text-slate-400 text-xs animate-pulse">AI 正在深度思考中...</p>}
      </main>

      <footer className="flex gap-2">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`让 ${currentModel} 帮点什么？`}
          className="flex-1 border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          发送
        </button>
      </footer>
    </div>
  );
}
