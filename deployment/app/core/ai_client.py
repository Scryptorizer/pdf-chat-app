import logging
from typing import List, Dict, Optional, AsyncGenerator
from anthropic import AsyncAnthropic
from core.config import get_settings
from core.pdf_processor import get_pdf_processor


logger = logging.getLogger(__name__)
settings = get_settings()


class AIClient:
    """Professional Anthropic client with streaming support."""
    
    def __init__(self):
        """Initialize Anthropic client."""
        self.client = AsyncAnthropic(
            api_key=settings.anthropic_api_key
        )
        self.model = settings.anthropic_model
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        
    def _build_context_prompt(self, user_message: str, conversation_history: List[Dict] = None) -> List[Dict]:
        """Build the complete prompt with PDF context and conversation history."""
        pdf_processor = get_pdf_processor()
        
        if not pdf_processor:
            logger.error("PDF processor not initialized")
            raise ValueError("PDF context not available")
        
        # Get PDF content
        pdf_text = pdf_processor.get_full_text()
        pdf_stats = pdf_processor.get_summary_stats()
        
        # Build system message with PDF context
        system_prompt = f"""You are MCW Digital's AI assistant that answers questions based on a PDF document about accessible travel laws and regulations.

        IMPORTANT IDENTITY:
        - You are "MCW Digital's AI Assistant" 
        - Never mention Anthropic, Claude, or other AI providers
        - Present yourself as MCW Digital's proprietary technology
        - If asked about your model, say "I'm MCW Digital's AI assistant designed for document analysis"

        DOCUMENT CONTEXT:
        Title: {pdf_stats.get('metadata', {}).get('title', 'Accessible Travel Guide')}
        Pages: {pdf_stats.get('total_pages', 'Unknown')}
        Word Count: {pdf_stats.get('total_words', 'Unknown')}

        FULL DOCUMENT CONTENT:
        {pdf_text}

        INSTRUCTIONS:
        1. Answer questions based ONLY on the information provided in the document above
        2. If the document doesn't contain information to answer a question, clearly state that
        3. Provide specific references to relevant sections when possible
        4. Be conversational and helpful while staying accurate to the document content
        5. If asked about accessibility laws, focus on what's mentioned in this specific document
        6. For travel-related questions, provide practical information from the document

        COMMUNICATION STYLE:
        - Professional but approachable
        - Focus on practical, actionable information
        - Always cite page numbers when referencing the document
        - Acknowledge limitations honestly
        - Represent MCW Digital's commitment to quality and accuracy"""

        # Start with messages list
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-settings.max_conversation_history:]:
                messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages, system_prompt
    
    async def generate_response(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """Generate a non-streaming response."""
        try:
            messages, system_prompt = self._build_context_prompt(user_message, conversation_history)
            
            logger.info(f"Generating response for message: {user_message[:100]}...")
            
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=messages
            )
            
            if response.content and len(response.content) > 0:
                content = response.content[0].text
                logger.info(f"Generated response: {len(content)} characters")
                return content
            else:
                logger.error("No response content received from Anthropic")
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            return "I'm experiencing technical difficulties. Please try again."
    
    async def generate_streaming_response(self, user_message: str, conversation_history: List[Dict] = None) -> AsyncGenerator[str, None]:
        """Generate a streaming response for real-time display."""
        try:
            messages, system_prompt = self._build_context_prompt(user_message, conversation_history)
            
            logger.info(f"Generating streaming response for: {user_message[:100]}...")
            
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=messages
            ) as stream:
                full_response = ""
                async for text in stream.text_stream:
                    full_response += text
                    yield text
            
            logger.info(f"Completed streaming response: {len(full_response)} characters")
                    
        except Exception as e:
            logger.error(f"Unexpected error in streaming response: {e}")
            yield "I encountered an unexpected error. Please try again."
    
    async def validate_connection(self) -> bool:
        """Test the Anthropic connection."""
        try:
            # Simple test with minimal token usage
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=5,
                messages=[{"role": "user", "content": "Hello"}]
            )
            return bool(response.content)
        except Exception as e:
            logger.error(f"Anthropic connection validation failed: {e}")
            return False
    
    def get_model_info(self) -> Dict:
        """Get information about the current model configuration."""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "api_key_configured": bool(settings.anthropic_api_key)
        }


# Global AI client instance
_ai_client: Optional[AIClient] = None


def get_ai_client() -> AIClient:
    """Get the global AI client instance."""
    global _ai_client
    
    if _ai_client is None:
        _ai_client = AIClient()
        logger.info("AI client initialized")
    
    return _ai_client


async def validate_ai_setup() -> bool:
    """Validate that AI client is properly configured."""
    try:
        client = get_ai_client()
        return await client.validate_connection()
    except Exception as e:
        logger.error(f"AI setup validation failed: {e}")
        return False