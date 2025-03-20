import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { ChatProvider, useChatConfig } from '../context';
import { ChatConfig } from '../config';

interface Message {
  text: string;
  isUser: boolean;
  isDone?: boolean;
}

interface AppProps {
  config: ChatConfig;
}

function ChatWidget() {
  const config = useChatConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragPosition = useRef({ x: 0, y: 0 });

  // 应用主题配置
  const theme = {
    primaryColor: config.theme?.primaryColor || '#3b82f6',
    secondaryColor: config.theme?.secondaryColor || '#e5e7eb',
    bubbleRadius: config.theme?.bubbleRadius || 8
  };

  // 应用本地化文本配置
  const localization = {
    placeholder: config.localization?.placeholder || 'Type your message...',
    sendButton: config.localization?.sendButton || 'Send',
    typingIndicator: config.localization?.typingIndicator || 'AI is typing...'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 先清空输入框
    setInput('');
    
    // 添加用户消息
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const payload = {
      content: input,
      bot_app_key: config?.botAppKey || 'jLKUTKgP',
      visitor_biz_id: config?.visitorBizId || 'test',
      session_id: config?.sessionId || 'test',
      visitor_labels: [],
    };

    try {
      const response = await fetch('https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // 添加AI消息占位符
      const aiMessage = { text: '', isUser: false, isDone: false };
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 标记消息已完成
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (!lastMessage.isUser) {
              lastMessage.isDone = true;
            }
            return newMessages;
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            setIsTyping(false); // 收到数据后隐藏 "AI is typing..."
            const jsonStr = line.slice(5).trim();

            try {
              const eventData = JSON.parse(jsonStr);
              if (eventData.type === 'reply' && eventData?.payload?.content && eventData?.payload?.can_rating) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  // 更新最后一个消息（即AI的回复）
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (!lastMessage.isUser) {
                    // 替换整个消息内容，而不是追加
                    lastMessage.text = eventData.payload.content;
                  }
                  return newMessages;
                });
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      // 如果出错，移除AI的占位消息
      setMessages(prev => prev.filter(msg => msg.text !== ''));
    } finally {
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    if (dragPosition.current.x !== data.x || dragPosition.current.y !== data.y) {
      setIsDragging(true);
    }
    dragPosition.current = data;
  };

  const handleDragStop = () => {
    if (!isDragging) {
      setShowChat(!showChat);
    }
    setIsDragging(false);
  };

  // 创建动态样式对象
  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    borderRadius: '9999px',
  };

  const userBubbleStyle = {
    backgroundColor: theme.primaryColor,
    borderRadius: `${theme.bubbleRadius}px`,
  };

  const aiBubbleStyle = {
    backgroundColor: theme.secondaryColor,
    borderRadius: `${theme.bubbleRadius}px`,
  };

  const sendButtonStyle = {
    backgroundColor: theme.primaryColor,
    borderRadius: `${theme.bubbleRadius / 2}px`,
  };

  // 添加复制功能
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // 可以在这里添加复制成功的提示
        console.log('复制成功');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Draggable
        onDrag={handleDrag}
        onStop={handleDragStop}
        position={dragPosition.current}
      >
        <button
          className="w-12 h-12 shadow-lg hover:opacity-90 text-white flex items-center justify-center cursor-move"
          style={buttonStyle}
        >
          💬
        </button>
      </Draggable>

      {showChat && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl animate-fade-in-up">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">智能问答</h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-3 py-1 max-w-[80%] break-words relative min-h-[2rem] ${
                    message.isUser
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}
                  style={message.isUser ? userBubbleStyle : aiBubbleStyle}
                >
                  <ReactMarkdown className="prose text-sm">{message.text}</ReactMarkdown>
                  {!message.isUser && message.text && message.isDone && (
                    <button
                      onClick={() => handleCopy(message.text)}
                      className="absolute bottom-1 right-1 text-sm text-gray-500 hover:text-gray-700"
                      title="复制内容"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-gray-500 italic">{localization.typingIndicator}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={localization.placeholder}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white hover:opacity-90"
                style={sendButtonStyle}
              >
                {localization.sendButton}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

interface IntelligentChatProps {
  config: ChatConfig;
}

const IntelligentChat: React.FC<IntelligentChatProps> = ({ config }) => {
  return (
    <ChatProvider config={config}>
      <ChatWidget />
    </ChatProvider>
  );
};

export { IntelligentChat };