// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
 id: string;
 content: string;
 role: 'user' | 'assistant';
 timestamp: string;
}

interface StreamResponse {
 type: 'content' | 'error' | 'done';
 content?: string;
 conversation_id?: string;
 message_id?: string;
}

interface ConversationMessages {
 [key: string]: Message[];
}

interface ChatInterfaceProps {
  conversations: string[];
  setConversations: (convs: string[]) => void;
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  conversationMessages: ConversationMessages;
  setConversationMessages: (msgs: ConversationMessages) => void;
}

const API_BASE_URL = "https://pdf-chat-app-h0ew.onrender.com";

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId,
  conversationMessages,
  setConversationMessages
}) => {
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isConnected, setIsConnected] = useState(true);
 const [tokenStats, setTokenStats] = useState({ total_messages: 0, total_conversations: 0 });
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const currentMessages = conversationMessages[activeConversationId] || [];

 const scrollToBottom = () => {
   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
   scrollToBottom();
 }, [currentMessages]);

 const fetchTokenStats = async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/api/usage/tokens`);
     if (response.ok) {
       const stats = await response.json();
       setTokenStats(stats);
     }
   } catch (error) {
     console.warn('Failed to fetch token stats:', error);
   }
 };

 useEffect(() => {
   fetchTokenStats();
   const interval = setInterval(fetchTokenStats, 5000);
   return () => clearInterval(interval);
 }, []);

 const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      role,
      timestamp: new Date().toISOString()
    };
   
   setConversationMessages((prev) => ({
     ...prev,
     [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
   }));
   
   return newMessage.id;
 };

 const updateLastMessage = (content: string) => {
   setConversationMessages((prev) => {
     const currentMessages = prev[activeConversationId] || [];
     if (currentMessages.length > 0) {
       const updatedMessages = [...currentMessages];
       updatedMessages[updatedMessages.length - 1] = {
         ...updatedMessages[updatedMessages.length - 1],
         content
       };
       return {
         ...prev,
         [activeConversationId]: updatedMessages
       };
     }
     return prev;
   });
 };

 const createNewConversation = () => {
   const newId = Math.random().toString(36).substring(2, 15);
   setConversations([...conversations, newId]);
   setActiveConversationId(newId);
   setConversationMessages({
     ...conversationMessages,
     [newId]: []
   });
 };

 const switchConversation = (conversationId: string) => {
   setActiveConversationId(conversationId);
 };

 const handleSendMessage = async () => {
   if (!inputValue.trim() || isLoading) return;
 
   const userMessage = inputValue.trim();
   setInputValue('');
   setIsLoading(true);
 
   addMessage(userMessage, 'user');
 
   try {
     const response = await fetch(`${API_BASE_URL}/api/chat`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         message: userMessage,
         conversation_id: activeConversationId
       })
     });
 
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
 
     const reader = response.body?.getReader();
     if (!reader) {
       throw new Error('No response body reader available');
     }
 
     let assistantMessageId: string | null = null;
     let accumulatedContent = '';
     const decoder = new TextDecoder();
 
     let buffer = '';
     try {
       while (true) {
         const { done, value } = await reader.read();
         
         if (done) {
           setIsLoading(false);
           break;
         }

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split('\n');
         
         buffer = lines.pop() || '';

         for (const line of lines) {
           if (line.includes('{"type":')) {
             try {
               const jsonStart = line.indexOf('{"type":');
               const jsonStr = line.substring(jsonStart).trim();
               if (!jsonStr) continue;
               const data = JSON.parse(jsonStr);
               
               if (data.type === 'content' && data.content) {
                 accumulatedContent += data.content;
                 
                 if (!assistantMessageId) {
                   assistantMessageId = addMessage(accumulatedContent, 'assistant');
                 } else {
                   updateLastMessage(accumulatedContent);
                 }
               } else if (data.type === 'done') {
                 setIsLoading(false);
                 return;
               } else if (data.type === 'error') {
                 console.error('Server error:', data.content);
                 addMessage(`Server error: ${data.content || 'Unknown error occurred'}`, 'assistant');
                 setIsLoading(false);
                 return;
               }
             } catch (parseError) {
               console.error('Error parsing SSE data:', parseError, 'Line:', line);
             }
           }
         }
       }
     } finally {
       reader.releaseLock();
     }
 
   } catch (error) {
     console.error('Error sending message:', error);
     
     if (error instanceof Error) {
       if (error.message.includes('429')) {
         addMessage('🚦 Whoa, slow down there! You\'ve hit the rate limit (10 messages per minute). Take a coffee break and try again in a minute! ☕', 'assistant');
       } else if (error.message.includes('503')) {
         addMessage('🔧 The service is temporarily unavailable. Please try again in a moment.', 'assistant');
       } else if (error.message.includes('500')) {
         addMessage('⚠️ Internal server error. The backend team has been notified.', 'assistant');
       } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
         addMessage('🌐 Network connection error. Please check your internet connection and try again.', 'assistant');
       } else {
         addMessage(`❌ Connection error: ${error.message}. Please try again.`, 'assistant');
       }
     } else {
       addMessage('❌ An unexpected error occurred. Please try again.', 'assistant');
     }
     
     setIsLoading(false);
     setIsConnected(false);
     
     setTimeout(() => {
       setIsConnected(true);
     }, 3000);
   }
 };

 const handleKeyPress = (e: React.KeyboardEvent) => {
   if (e.key === 'Enter' && !e.shiftKey) {
     e.preventDefault();
     handleSendMessage();
   }
 };

 const clearConversation = async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/api/conversations/${activeConversationId}`, {
       method: 'DELETE'
     });
     
     if (!response.ok) {
       console.warn('Failed to clear conversation on backend, status:', response.status);
     }
   } catch (error) {
     console.warn('Failed to clear conversation on backend:', error);
   }
   
   setConversationMessages({
     ...conversationMessages,
     [activeConversationId]: []
   });
 };
 
 const exportConversation = async (format: string) => {
   try {
     const response = await fetch(`${API_BASE_URL}/api/conversations/${activeConversationId}/export?format=${format}`);
     if (response.ok) {
       const blob = await response.blob();
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `conversation_${activeConversationId}.${format}`;
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(url);
       document.body.removeChild(a);
     } else {
       console.error('Export failed with status:', response.status);
       addMessage('⚠️ Export failed. Please try again.', 'assistant');
     }
   } catch (error) {
     console.error('Export failed:', error);
     addMessage('⚠️ Export failed due to network error.', 'assistant');
   }
 };

 const trySampleQuestion = (question: string) => {
   setInputValue(question);
 };

 return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm" style={{height: 'calc(100vh - 120px)'}}>
     {/* FIXED AI Assistant Header - Stays at top always */}
     <div className="sticky top-0 z-10 p-6 border-b border-gray-200 bg-white">
       <div className="flex justify-between items-center">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">💬 AI Business Intelligence Assistant</h1>
           <p className="text-gray-600 mt-1">Ask questions about events, hotels, revenue, and business insights</p>
         </div>
         <div className="flex items-center space-x-3">
           <span className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
             {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
           </span>
           <span className="text-sm text-gray-600">
             Messages: {tokenStats.total_messages}
           </span>
         </div>
       </div>
     </div>

     {/* FIXED Conversation Controls - Stays below header always */}
     <div className="sticky top-24 z-10 p-4 border-b border-gray-200 bg-gray-50">
       <div className="flex justify-between items-center">
         <div className="flex space-x-2">
           <button 
             onClick={createNewConversation}
             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
           >
             ➕ New Chat
           </button>
           <button 
             onClick={clearConversation}
             className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
             disabled={currentMessages.length === 0}
           >
             🗑️ Clear
           </button>
         </div>

         {conversations.length > 1 && (
           <div className="flex space-x-1">
             {conversations.map((convId: string, index: number) => (
               <button
                 key={convId}
                 onClick={() => switchConversation(convId)}
                 className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                   convId === activeConversationId 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                 }`}
               >
                 Chat {index + 1}
               </button>
             ))}
           </div>
         )}

         <select 
           onChange={(e) => e.target.value && exportConversation(e.target.value)}
           className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
           disabled={currentMessages.length === 0}
           value=""
         >
           <option value="">📤 Export...</option>
           <option value="txt">📝 Text</option>
           <option value="markdown">📄 Markdown</option>
           <option value="json">📋 JSON</option>
         </select>
       </div>
     </div>

     {/* SCROLLABLE Messages Area - Takes remaining height */}
     <div className="flex-1 overflow-y-auto p-6">
       {currentMessages.length === 0 ? (
         <div className="text-center py-12">
           <div className="text-6xl mb-4">🤖</div>
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Business Intelligence!</h2>
           <p className="text-gray-600 mb-8">Ask me anything about your event bidding business</p>
           <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
             <p className="font-semibold text-gray-900 mb-4">Try asking:</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {[
                 "Show me all active events",
                 "Which hotels have the best win rates?",
                 "What's our revenue pipeline?",
                 "Events closing this week",
                 "Compare bids for Adobe conference",
                 "Revenue analysis by event type"
               ].map((question: string, index: number) => (
                 <button
                   key={index}
                   onClick={() => trySampleQuestion(question)}
                   className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                 >
                   <span className="text-blue-600 font-medium">"{question}"</span>
                 </button>
               ))}
             </div>
           </div>
         </div>
       ) : (
         <div className="space-y-6">
           {currentMessages.map((message: Message) => (
             <div
               key={message.id}
               className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
               <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                 <div className="flex items-center space-x-2 mb-2">
                   <span className="text-sm font-medium text-gray-700">
                     {message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                   </span>
                   <span className="text-xs text-gray-500">
                     {new Date(message.timestamp).toLocaleTimeString()}
                   </span>
                 </div>
                 <div className={`p-4 rounded-lg ${
                   message.role === 'user' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-900'
                 }`}>
                   {message.role === 'assistant' ? (
                     <ReactMarkdown className="prose prose-sm max-w-none">{message.content}</ReactMarkdown>
                   ) : (
                     <p className="whitespace-pre-wrap">{message.content}</p>
                   )}
                 </div>
               </div>
             </div>
           ))}
           
           {isLoading && (
             <div className="flex justify-start">
               <div className="max-w-3xl">
                 <div className="flex items-center space-x-2 mb-2">
                   <span className="text-sm font-medium text-gray-700">🤖 AI Assistant</span>
                   <span className="text-xs text-gray-500">thinking...</span>
                 </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                   <div className="flex space-x-1">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                 </div>
               </div>
             </div>
           )}
           
           <div ref={messagesEndRef} />
         </div>
       )}
     </div>

     {/* FIXED Input Area - Stays at bottom always */}
     <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50">
       <div className="flex space-x-3">
         <textarea
           value={inputValue}
           onChange={(e) => setInputValue(e.target.value)}
           onKeyPress={handleKeyPress}
           placeholder="Ask about events, hotels, revenue, or any business insights..."
           disabled={isLoading || !isConnected}
           rows={3}
           className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
         />
         <button
           onClick={handleSendMessage}
           disabled={!inputValue.trim() || isLoading || !isConnected}
           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
         >
           {isLoading ? '⏳' : '📤'}
         </button>
       </div>
       <p className="text-xs text-gray-500 mt-2">
         Press Enter to send, Shift+Enter for new line
         {!isConnected && ' • Backend connection lost'}
       </p>
     </div>
   </div>
 );
};

export default ChatInterface;