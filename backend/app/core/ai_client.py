import logging
from typing import List, Dict, Optional, AsyncGenerator
import openai
from openai import OpenAI
from core.config import get_settings
from core.pdf_processor import get_pdf_processor


logger = logging.getLogger(__name__)
settings = get_settings()


class AIClient:
    """Professional OpenAI client with streaming support."""
    
    def __init__(self):
        """Initialize OpenAI client."""
        self.client = OpenAI(
            api_key=settings.openai_api_key
        )
        self.model = settings.openai_model
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
        - Never mention OpenAI, GPT, or other AI providers
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

        # Start with system message
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-settings.max_conversation_history:]:
                messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    async def generate_response(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """Generate a non-streaming response."""
        try:
            messages = self._build_context_prompt(user_message, conversation_history)
            
            logger.info(f"Generating response for message: {user_message[:100]}...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=False
            )
            
            if response.choices and response.choices[0].message:
                content = response.choices[0].message.content
                logger.info(f"Generated response: {len(content)} characters")
                return content
            else:
                logger.error("No response content received from OpenAI")
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except openai.RateLimitError as e:
            logger.error(f"OpenAI rate limit exceeded: {e}")
            return "I'm currently experiencing high demand. Please try again in a moment."
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {e}")
            return "I'm experiencing technical difficulties. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error generating response: {e}")
            return "I encountered an unexpected error. Please try again."
    
    async def generate_streaming_response(self, user_message: str, conversation_history: List[Dict] = None) -> AsyncGenerator[str, None]:
        """Generate a streaming response for real-time display."""
        try:
            messages = self._build_context_prompt(user_message, conversation_history)
            
            logger.info(f"Generating streaming response for: {user_message[:100]}...")
            
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )
            
            full_response = ""
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content
            
            logger.info(f"Completed streaming response: {len(full_response)} characters")
                    
        except openai.RateLimitError as e:
            logger.error(f"OpenAI rate limit exceeded: {e}")
            yield "I'm currently experiencing high demand. Please try again in a moment."
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {e}")
            yield "I'm experiencing technical difficulties. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error in streaming response: {e}")
            yield "I encountered an unexpected error. Please try again."
    
    def validate_connection(self) -> bool:
        """Test the OpenAI connection."""
        try:
            # Simple test with minimal token usage
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return bool(response.choices)
        except Exception as e:
            logger.error(f"OpenAI connection validation failed: {e}")
            return False
    
    def get_model_info(self) -> Dict:
        """Get information about the current model configuration."""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "api_key_configured": bool(settings.openai_api_key)
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


def validate_ai_setup() -> bool:
    """Validate that AI client is properly configured."""
    try:
        client = get_ai_client()
        return client.validate_connection()
    except Exception as e:
        logger.error(f"AI setup validation failed: {e}")
        return False