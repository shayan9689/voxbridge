/**
 * Call room right sidebar: Chat / People tabs, messages, input
 */

import { useState } from 'react';

const MOCK_MESSAGES = [
  { id: '1', author: 'Sarah Chen', time: '10:42 AM', text: 'Have we looked at the latest latency metrics for the Tokyo region?', isAi: false },
  { id: '2', author: 'VoiceAssistant AI', time: '10:42 AM', text: 'According to the dashboard, Tokyo latency averaged 42ms over the last hour, which is within our 50ms SLA.', isAi: true },
];

export default function CallRoomChat({ participantCount = 0, messages, onSendMessage, participants = [] }) {
  const displayMessages = messages && messages.length > 0 ? messages : MOCK_MESSAGES;
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (t && onSendMessage) onSendMessage(t);
    setInput('');
  };

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 bg-white border-l border-[var(--card-border)] flex-col">
      <div className="flex border-b border-[var(--card-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'people' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          People ({participantCount})
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Today</p>
              {displayMessages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs text-[var(--text-secondary)]">
                    {m.isAi ? 'AI' : m.author.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{m.author}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{m.time}</p>
                    <p className="text-sm text-[var(--text-primary)] mt-0.5">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--card-border)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="+ Message the room..."
                  className="flex-1 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button type="submit" className="p-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]" aria-label="Send">
                  <SendIcon />
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">i</span>
                Messages are end-to-end encrypted
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {participants.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No participants yet.</p>
            ) : (
              participants.map((p) => (
                <div key={p.socketId} className="flex items-center gap-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-[var(--text-secondary)]">
                    {(p.userName || p.socketId).slice(0, 1)}
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{p.userName || p.socketId}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function SendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
