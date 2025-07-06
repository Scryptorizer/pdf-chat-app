import logging
import time
import uuid
from typing import Dict, List, Optional, AsyncGenerator
from datetime import datetime, timedelta  
import json

from models.chat_models import (
    ConversationHistory, 
    ChatMessage, 
    ConversationSummary,
    TokenUsage,
    ConversationExport
)
from core.ai_client import get_ai_client
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ChatService:
    """Core chat service handling conversation management and AI interactions."""
    
    def __init__(self):
        """Initialize chat service."""
        self.conversations: Dict[str, ConversationHistory] = {}
        self.ai_client = get_ai_client()
        self.token_usage_stats = {
            "total_conversations": 0,
            "total_messages": 0,
            "total_tokens": 0,
            "total_cost": 0.0,
            "session_start": datetime.now()
        }
        
    async def process_message_stream(self, message: str, conversation_id: str) -> AsyncGenerator[str, None]:
        """
        Process a user message and return streaming AI response.
        This is the core method for handling chat interactions.
        """
        try:
            # Get or create conversation
            conversation = self._get_or_create_conversation(conversation_id)
            
            # Add user message to conversation
            user_message = conversation.add_message("user", message)
            logger.info(f"Added user message to conversation {conversation_id}: {message[:100]}...")
            
            # Get conversation history for context
            conversation_history = conversation.get_recent_messages(settings.max_conversation_history)
            
            # Stream AI response
            response_content = ""
            start_time = time.time()
            
            async for chunk in self.ai_client.generate_streaming_response(message, conversation_history):
                if chunk:
                    response_content += chunk
                    yield chunk
            
            # Add AI response to conversation
            if response_content:
                ai_message = conversation.add_message("assistant", response_content)
                
                # Update statistics
                self.token_usage_stats["total_messages"] += 2  # user + assistant
                processing_time = time.time() - start_time
                
                logger.info(f"Completed streaming response for {conversation_id}: "
                          f"{len(response_content)} chars in {processing_time:.2f}s")
            else:
                logger.warning(f"Empty response generated for conversation {conversation_id}")
                yield "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            logger.error(f"Error in process_message_stream: {e}")
            yield f"I encountered an error: {str(e)}. Please try again."
    
    async def process_message(self, message: str, conversation_id: str) -> str:
        """
        Process a user message and return complete AI response (non-streaming).
        """
        try:
            # Get or create conversation
            conversation = self._get_or_create_conversation(conversation_id)
            
            # Add user message
            user_message = conversation.add_message("user", message)
            
            # Get conversation history
            conversation_history = conversation.get_recent_messages(settings.max_conversation_history)
            
            # Generate AI response
            start_time = time.time()
            response = await self.ai_client.generate_response(message, conversation_history)
            
            if response:
                # Add AI response to conversation
                ai_message = conversation.add_message("assistant", response)
                
                # Update statistics
                self.token_usage_stats["total_messages"] += 2
                processing_time = time.time() - start_time
                
                logger.info(f"Generated response for {conversation_id}: "
                          f"{len(response)} chars in {processing_time:.2f}s")
                
                return response
            else:
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            logger.error(f"Error in process_message: {e}")
            return f"I encountered an error: {str(e)}. Please try again."
    
    def _get_or_create_conversation(self, conversation_id: str) -> ConversationHistory:
        """Get existing conversation or create new one."""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = ConversationHistory(
                conversation_id=conversation_id
            )
            self.token_usage_stats["total_conversations"] += 1
            logger.info(f"Created new conversation: {conversation_id}")
        
        return self.conversations[conversation_id]
    
    def get_conversation(self, conversation_id: str) -> Optional[ConversationHistory]:
        """Get specific conversation by ID."""
        return self.conversations.get(conversation_id)
    
    def get_conversation_summaries(self) -> List[ConversationSummary]:
        """Get summaries of all conversations."""
        summaries = []
        
        for conv_id, conversation in self.conversations.items():
            first_message = None
            last_message = None
            
            if conversation.messages:
                # Find first user message
                user_messages = [msg for msg in conversation.messages if msg.role == "user"]
                if user_messages:
                    first_message = user_messages[0].content[:100] + "..." if len(user_messages[0].content) > 100 else user_messages[0].content
                
                # Get last message
                if conversation.messages:
                    last_msg = conversation.messages[-1]
                    last_message = last_msg.content[:100] + "..." if len(last_msg.content) > 100 else last_msg.content
            
            summary = ConversationSummary(
                conversation_id=conv_id,
                message_count=conversation.message_count,
                created_at=conversation.created_at,
                updated_at=conversation.updated_at,
                first_message=first_message,
                last_message=last_message
            )
            summaries.append(summary)
        
        # Sort by most recent first
        summaries.sort(key=lambda x: x.updated_at, reverse=True)
        return summaries
    
    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear/reset a specific conversation."""
        if conversation_id in self.conversations:
            self.conversations[conversation_id].clear_messages()
            logger.info(f"Cleared conversation: {conversation_id}")
            return True
        return False
    
    def clear_all_conversations(self) -> int:
        """Clear all conversations and return count cleared."""
        count = len(self.conversations)
        self.conversations.clear()
        
        # Reset statistics
        self.token_usage_stats.update({
            "total_conversations": 0,
            "total_messages": 0,
            "session_start": datetime.now()
        })
        
        logger.info(f"Cleared all {count} conversations")
        return count
    
    def export_conversation(self, conversation_id: str, format: str) -> Optional[str]:
        """Export conversation in specified format (bonus feature)."""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return None
        
        if format == "json":
            return self._export_as_json(conversation)
        elif format == "markdown":
            return self._export_as_markdown(conversation)
        elif format == "txt":
            return self._export_as_txt(conversation)
        else:
            return None
    
    def _export_as_json(self, conversation: ConversationHistory) -> str:
        """Export conversation as JSON."""
        export_data = {
            "conversation_id": conversation.conversation_id,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "message_count": conversation.message_count,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_id": msg.message_id
                }
                for msg in conversation.messages
            ]
        }
        return json.dumps(export_data, indent=2)
    
    def _export_as_markdown(self, conversation: ConversationHistory) -> str:
        """Export conversation as Markdown."""
        lines = [
            f"# Conversation Export",
            f"",
            f"**Conversation ID:** {conversation.conversation_id}",
            f"**Created:** {conversation.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Updated:** {conversation.updated_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Messages:** {conversation.message_count}",
            f"",
            f"---",
            f""
        ]
        
        for msg in conversation.messages:
            role_label = "🧑 **User**" if msg.role == "user" else "🤖 **Assistant**"
            timestamp = msg.timestamp.strftime('%H:%M:%S')
            
            lines.extend([
                f"## {role_label} ({timestamp})",
                f"",
                msg.content,
                f"",
                f"---",
                f""
            ])
        
        return "\n".join(lines)
    
    def _export_as_txt(self, conversation: ConversationHistory) -> str:
        """Export conversation as plain text."""
        lines = [
            f"Conversation Export",
            f"==================",
            f"",
            f"Conversation ID: {conversation.conversation_id}",
            f"Created: {conversation.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"Updated: {conversation.updated_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"Messages: {conversation.message_count}",
            f"",
            f"Messages:",
            f"---------",
            f""
        ]
        
        for i, msg in enumerate(conversation.messages, 1):
            role_label = "User" if msg.role == "user" else "Assistant"
            timestamp = msg.timestamp.strftime('%H:%M:%S')
            
            lines.extend([
                f"[{i}] {role_label} ({timestamp}):",
                msg.content,
                f"",
                f"{'-' * 50}",
                f""
            ])
        
        return "\n".join(lines)
    
    def get_token_usage_stats(self) -> Dict:
        """Get token usage statistics (bonus feature)."""
        uptime = (datetime.now() - self.token_usage_stats["session_start"]).total_seconds()
        
        return {
            **self.token_usage_stats,
            "uptime_seconds": uptime,
            "avg_messages_per_conversation": (
                self.token_usage_stats["total_messages"] / max(1, self.token_usage_stats["total_conversations"])
            ),
            "conversations_active": len(self.conversations)
        }
    
    def get_conversation_count(self) -> int:
        """Get total number of active conversations."""
        return len(self.conversations)
    
    def cleanup_old_conversations(self, max_age_hours: int = 24) -> int:
        """Clean up conversations older than specified hours."""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        to_remove = []
        
        for conv_id, conversation in self.conversations.items():
            if conversation.updated_at < cutoff_time:
                to_remove.append(conv_id)
        
        for conv_id in to_remove:
            del self.conversations[conv_id]
        
        if to_remove:
            logger.info(f"Cleaned up {len(to_remove)} old conversations")
        
        return len(to_remove)


# Global chat service instance
_chat_service: Optional[ChatService] = None


def get_chat_service() -> ChatService:
    """Get the global chat service instance."""
    global _chat_service
    
    if _chat_service is None:
        _chat_service = ChatService()
        logger.info("Chat service initialized")
    
    return _chat_service


def initialize_chat_service() -> ChatService:
    """Initialize and return the chat service."""
    global _chat_service
    _chat_service = ChatService()
    logger.info("Chat service initialized")
    return _chat_service