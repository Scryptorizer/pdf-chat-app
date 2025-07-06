from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
import uuid


class ChatRequest(BaseModel):
    """Chat message request model."""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context")
    
    @validator('message')
    def validate_message(cls, v):
        """Validate message content."""
        if not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")
        return v.strip()
    
    @validator('conversation_id')
    def validate_conversation_id(cls, v):
        """Validate conversation ID format."""
        if v is not None and len(v.strip()) == 0:
            return None
        return v


class ChatMessage(BaseModel):
    """Individual chat message model."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.now, description="Message timestamp")
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique message ID")
    
    @validator('role')
    def validate_role(cls, v):
        """Validate message role."""
        if v not in ['user', 'assistant']:
            raise ValueError("Role must be either 'user' or 'assistant'")
        return v


class ConversationHistory(BaseModel):
    """Conversation history model."""
    conversation_id: str = Field(..., description="Unique conversation identifier")
    messages: List[ChatMessage] = Field(default_factory=list, description="List of messages")
    created_at: datetime = Field(default_factory=datetime.now, description="Conversation creation time")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update time")
    message_count: int = Field(default=0, description="Total number of messages")
    
    def add_message(self, role: str, content: str) -> ChatMessage:
        """Add a new message to the conversation."""
        message = ChatMessage(role=role, content=content)
        self.messages.append(message)
        self.updated_at = datetime.now()
        self.message_count = len(self.messages)
        return message
    
    def get_recent_messages(self, limit: int = 10) -> List[Dict[str, str]]:
        """Get recent messages in OpenAI format."""
        recent = self.messages[-limit:] if limit > 0 else self.messages
        return [{"role": msg.role, "content": msg.content} for msg in recent]
    
    def clear_messages(self):
        """Clear all messages in the conversation."""
        self.messages.clear()
        self.message_count = 0
        self.updated_at = datetime.now()


class StreamingResponse(BaseModel):
    """Streaming response chunk model."""
    type: str = Field(..., description="Response type: 'content', 'error', or 'done'")
    content: Optional[str] = Field(None, description="Response content")
    conversation_id: Optional[str] = Field(None, description="Conversation ID")
    message_id: Optional[str] = Field(None, description="Message ID")
    
    @validator('type')
    def validate_type(cls, v):
        """Validate response type."""
        if v not in ['content', 'error', 'done']:
            raise ValueError("Type must be 'content', 'error', or 'done'")
        return v


class ChatResponse(BaseModel):
    """Complete chat response model."""
    message: str = Field(..., description="AI response message")
    conversation_id: str = Field(..., description="Conversation identifier")
    message_id: str = Field(..., description="Unique message ID")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")
    message_count: int = Field(..., description="Total messages in conversation")
    processing_time: Optional[float] = Field(None, description="Response processing time in seconds")


class ConversationSummary(BaseModel):
    """Conversation summary model."""
    conversation_id: str = Field(..., description="Conversation identifier")
    message_count: int = Field(..., description="Total number of messages")
    created_at: datetime = Field(..., description="Conversation creation time")
    updated_at: datetime = Field(..., description="Last update time")
    first_message: Optional[str] = Field(None, description="Preview of first user message")
    last_message: Optional[str] = Field(None, description="Preview of last message")


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.now, description="Health check timestamp")
    version: str = Field(..., description="Application version")
    pdf_loaded: bool = Field(..., description="Whether PDF is successfully loaded")
    openai_available: bool = Field(..., description="Whether OpenAI API is available")
    uptime: Optional[float] = Field(None, description="Application uptime in seconds")


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
    conversation_id: Optional[str] = Field(None, description="Related conversation ID")


class PDFInfo(BaseModel):
    """PDF document information model."""
    title: str = Field(..., description="PDF title")
    total_pages: int = Field(..., description="Total number of pages")
    total_words: int = Field(..., description="Total word count")
    total_characters: int = Field(..., description="Total character count")
    author: Optional[str] = Field(None, description="PDF author")
    creator: Optional[str] = Field(None, description="PDF creator")


class AppStatus(BaseModel):
    """Application status model."""
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Application version")
    status: str = Field(..., description="Overall status")
    components: Dict[str, bool] = Field(..., description="Component status")
    pdf_info: Optional[PDFInfo] = Field(None, description="PDF document information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Status timestamp")


# Bonus Feature Models (for later implementation)

class TokenUsage(BaseModel):
    """Token usage tracking model."""
    prompt_tokens: int = Field(..., description="Tokens used in prompt")
    completion_tokens: int = Field(..., description="Tokens used in completion")
    total_tokens: int = Field(..., description="Total tokens used")
    estimated_cost: Optional[float] = Field(None, description="Estimated API cost")


class ConversationExport(BaseModel):
    """Conversation export model."""
    conversation_id: str = Field(..., description="Conversation identifier")
    export_format: str = Field(..., description="Export format: 'markdown', 'json', 'txt'")
    exported_at: datetime = Field(default_factory=datetime.now, description="Export timestamp")
    content: str = Field(..., description="Exported content")
    
    @validator('export_format')
    def validate_export_format(cls, v):
        """Validate export format."""
        if v not in ['markdown', 'json', 'txt']:
            raise ValueError("Export format must be 'markdown', 'json', or 'txt'")
        return v