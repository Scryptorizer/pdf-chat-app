import logging
import time
from collections import defaultdict
import uuid
from typing import Dict
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json

from models.chat_models import (
    ChatRequest, 
    ChatResponse, 
    StreamingResponse as StreamModel,
    ErrorResponse,
    ConversationSummary
)
from services.chat_service import get_chat_service
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Simple rate limiting
request_counts = defaultdict(list)
RATE_LIMIT = 10  # requests per minute

# Create router for chat endpoints
router = APIRouter(prefix="/api", tags=["chat"])

# In-memory storage for conversations
conversations: Dict[str, dict] = {}


def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    minute_ago = now - 60
    
    # Clean old requests
    request_counts[client_ip] = [req_time for req_time in request_counts[client_ip] if req_time > minute_ago]
    
    # Check if under limit
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return False
    
    # Add current request
    request_counts[client_ip].append(now)
    return True


@router.post("/chat")
async def chat_endpoint(request: ChatRequest, client_request: Request):
    """
    Main chat endpoint - handles both regular and streaming responses.
    Returns SSE stream as required by the specifications.
    """
    start_time = time.time()
    
    try:
        # Check rate limit
        client_ip = client_request.client.host
        if not check_rate_limit(client_ip):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Get or create conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get chat service
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(
                status_code=503, 
                detail="Chat service unavailable"
            )
        
        logger.info(f"Processing chat request: {request.message[:100]}... (conversation: {conversation_id})")
        
        # Create streaming response
        async def generate_sse_stream():
            try:
                message_id = str(uuid.uuid4())
                response_content = ""
                
                # Stream the AI response
                async for chunk in chat_service.process_message_stream(
                    message=request.message,
                    conversation_id=conversation_id
                ):
                    if chunk:
                        response_content += chunk
                        
                        # Send content chunk
                        stream_response = StreamModel(
                            type="content",
                            content=chunk,
                            conversation_id=conversation_id,
                            message_id=message_id
                        )
                        yield f"data: {stream_response.json()}\n\n"
                
                # Send completion signal
                completion_response = StreamModel(
                    type="done",
                    conversation_id=conversation_id,
                    message_id=message_id
                )
                yield f"data: {completion_response.json()}\n\n"
                
                processing_time = time.time() - start_time
                logger.info(f"Chat response completed in {processing_time:.2f}s")
                
            except Exception as e:
                logger.error(f"Error in streaming response: {e}")
                error_response = StreamModel(
                    type="error",
                    content=f"An error occurred: {str(e)}",
                    conversation_id=conversation_id
                )
                yield f"data: {error_response.json()}\n\n"
        
        # Return Server-Sent Events response
        return EventSourceResponse(
            generate_sse_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/conversations")
async def list_conversations():
    """Get list of all conversations (bonus feature)."""
    try:
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        summaries = chat_service.get_conversation_summaries()
        return {"conversations": summaries}
        
    except Exception as e:
        logger.error(f"Error listing conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get specific conversation history."""
    try:
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        conversation = chat_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {
            "conversation_id": conversation_id,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_id": msg.message_id
                }
                for msg in conversation.messages
            ],
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "message_count": conversation.message_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear/reset a specific conversation."""
    try:
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        success = chat_service.clear_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"message": f"Conversation {conversation_id} cleared successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations")
async def clear_all_conversations():
    """Clear all conversations."""
    try:
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        cleared_count = chat_service.clear_all_conversations()
        return {"message": f"Cleared {cleared_count} conversations"}
        
    except Exception as e:
        logger.error(f"Error clearing all conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Bonus Feature: Export conversation
@router.get("/conversations/{conversation_id}/export")
async def export_conversation(conversation_id: str, format: str = "markdown"):
    """Export conversation in various formats (bonus feature)."""
    try:
        if format not in ["markdown", "json", "txt"]:
            raise HTTPException(status_code=400, detail="Invalid export format")
        
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        exported_content = chat_service.export_conversation(conversation_id, format)
        if not exported_content:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Set appropriate content type and filename
        content_types = {
            "markdown": "text/markdown",
            "json": "application/json",
            "txt": "text/plain"
        }
        
        filename = f"conversation_{conversation_id}.{format}"
        
        return StreamingResponse(
            iter([exported_content]),
            media_type=content_types[format],
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Bonus Feature: Token usage tracking
@router.get("/usage/tokens")
async def get_token_usage():
    """Get token usage statistics (bonus feature)."""
    try:
        chat_service = get_chat_service()
        if not chat_service:
            raise HTTPException(status_code=503, detail="Chat service unavailable")
        
        usage_stats = chat_service.get_token_usage_stats()
        return usage_stats
        
    except Exception as e:
        logger.error(f"Error getting token usage: {e}")
        raise HTTPException(status_code=500, detail=str(e))