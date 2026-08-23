import React, { useState } from 'react';
import { AICommandResult, Priority } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAiCommand: (command: string) => Promise<AICommandResult>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteAiCommand
}) => {
  const [commandText, setCommandText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { sender: 'user' | 'ai'; text: string; actionApplied?: string }[]
  >([
    {
      sender: 'ai',
      text: 'Hello! I am your LifeHub AI Assistant. You can speak or type commands like "Add a high priority task to review PR", "Log $30 for groceries", or "I drank 500ml of water". How can I assist you today?'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const cmd = textToSend || commandText;
    if (!cmd.trim() || isLoading) return;

    const userMsg = cmd.trim();
    setCommandText('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await onExecuteAiCommand(userMsg);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.summary,
          actionApplied:
            result.actionType !== 'general_response'
              ? `Action executed: ${result.actionType.replace('_', ' ').toUpperCase()}`
              : undefined
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I had trouble executing that command. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCommands = [
    'Add task: Finalize quarterly budget report [HIGH]',
    'Log $45 for team coffee meeting',
    'I just drank 500ml water',
    'Summarize my productivity for today'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1c2028] border border-[#21262d] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00285d]/50 border border-[#adc6ff]/40 flex items-center justify-center text-[#adc6ff]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#dfe2ee]">LifeHub AI & Voice Assistant</h2>
              <p className="text-[10px] text-[#c2c6d6]">Powered by Gemini 3.6 Flash</p>
            </div>
          </div>
          <button
            id="close-ai-assistant-modal-btn"
            onClick={onClose}
            className="text-[#8c909f] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Message Chat Feed */}
        <div className="flex-grow overflow-y-auto space-y-3 p-1 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#adc6ff] text-[#00285d] font-medium rounded-br-none'
                    : 'bg-[#181c24] text-[#dfe2ee] micro-border rounded-bl-none'
                }`}
              >
                {msg.text}
                {msg.actionApplied && (
                  <div className="mt-2 pt-1 border-t border-[#4edea3]/30 text-[10px] text-[#4edea3] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    <span>{msg.actionApplied}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#adc6ff] p-2">
              <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
              <span>Processing command with Gemini...</span>
            </div>
          )}
        </div>

        {/* Sample Command Chips */}
        <div className="space-y-1.5 pt-2 border-t border-[#21262d]">
          <p className="text-[10px] font-semibold text-[#8c909f] uppercase tracking-wider">
            Sample Voice / Text Shortcuts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(cmd)}
                className="px-2.5 py-1 bg-[#181c24] hover:bg-[#31353e] text-[#c2c6d6] hover:text-[#adc6ff] rounded-lg text-[11px] micro-border transition-all cursor-pointer text-left"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 pt-2"
        >
          <input
            id="ai-command-prompt-input"
            type="text"
            placeholder="Type or speak a LifeHub command..."
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            className="flex-grow bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] placeholder-[#8c909f] focus:border-[#adc6ff] outline-none"
            disabled={isLoading}
          />
          <button
            id="send-ai-command-btn"
            type="submit"
            disabled={isLoading || !commandText.trim()}
            className="bg-[#adc6ff] text-[#00285d] px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#adc6ff]/90 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
