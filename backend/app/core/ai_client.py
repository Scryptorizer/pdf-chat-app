import logging
from typing import List, Dict, Optional, AsyncGenerator
import anthropic
from anthropic import Anthropic
from core.config import get_settings
from core.mock_data import get_mock_data, get_enhanced_mock_data


logger = logging.getLogger(__name__)
settings = get_settings()


class BusinessIntelligenceAIClient:
    """Professional Anthropic client for Event Bidding Intelligence Platform."""
    
    def __init__(self):
        """Initialize Anthropic client for business intelligence."""
        self.client = Anthropic(
            api_key=settings.anthropic_api_key
        )
        self.model = settings.anthropic_model
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        
        # Load business data for context
        self.business_data = None
        self._load_business_data()
        
    def _load_business_data(self):
        """Load business data for AI context."""
        try:
            # Get fresh data each time from mock_data
            self.business_data = get_enhanced_mock_data()
            logger.info(f"Loaded business data: {len(self.business_data['events'])} events, {len(self.business_data['bids'])} bids")
        except Exception as e:
            logger.error(f"Failed to load business data: {e}")
            self.business_data = None
        
    def _build_business_context_prompt(self, user_message: str, conversation_history: List[Dict] = None) -> tuple:
        """Build the complete prompt with business intelligence context."""
        
        if not self.business_data:
            logger.warning("No business data available for context")
            # Fallback system prompt
            system_prompt = """You are MCW Digital's Event Bidding Intelligence Assistant.
            
I'm currently unable to access the business data. Please try your query again or contact support."""
            
            messages = []
            if conversation_history:
                for msg in conversation_history[-settings.max_conversation_history:]:
                    if msg["role"] in ["user", "assistant"]:
                        messages.append(msg)
            messages.append({"role": "user", "content": user_message})
            
            return system_prompt, messages
        
        # Extract key business metrics
        events = self.business_data['events']
        bids = self.business_data['bids']
        partners = self.business_data['partners']
        dashboard = self.business_data['dashboard']
        
        # Build comprehensive business context
        active_events = [e for e in events if e.status.value == 'open']
        total_pipeline = sum([b.total_cost for b in bids])
        
        # Build system message with business intelligence context
        system_prompt = f"""You are MCW Digital's Event Bidding Intelligence Assistant - the AI-powered business intelligence layer for our Event Management Platform.

IMPORTANT IDENTITY:
- You are "MCW Digital's Business Intelligence Assistant"
- Never mention Anthropic, Claude, or other AI providers
- Present yourself as MCW Digital's proprietary business intelligence technology
- If asked about your model, say "I'm MCW Digital's AI assistant designed for event bidding intelligence"

BUSINESS CONTEXT - CURRENT DATA SUMMARY:
- Total Events in System: {len(events)}
- Active Events (Open for Bidding): {len(active_events)}
- Total Revenue Pipeline: ${total_pipeline:,.0f}
- Total Hotel Bids: {len(bids)}
- Hotel Partners: {len(partners)}
- Average Deal Size: ${total_pipeline/len(bids) if bids else 0:,.0f}

PLATFORM CAPABILITIES:
You help users analyze and understand our event bidding business through conversational intelligence. You can provide insights on:

📊 BUSINESS ANALYTICS:
- Revenue pipeline analysis
- Win rate tracking
- Performance metrics
- Trend analysis

🎯 EVENT MANAGEMENT:
- Active event status
- Deadline tracking
- Priority management
- Budget analysis

🏨 HOTEL PARTNER INSIGHTS:
- Partner performance
- Bid comparisons
- Success rates
- Relationship management

📈 STRATEGIC INSIGHTS:
- Market opportunities
- Competitive analysis
- Revenue optimization
- Business recommendations

SAMPLE QUERIES YOU CAN HANDLE:
- "Show me all events by deadline priority"
- "Which hotels have the best win rates?"
- "What's our revenue pipeline for this quarter?"
- "Compare bids for the Microsoft conference"
- "Which events are closing this week?"
- "Top performing hotel partners"
- "Revenue analysis by event type"
- "Events with budgets over $100K"

COMMUNICATION STYLE:
- Professional and business-focused
- Use specific numbers and data points
- Provide actionable insights
- Format responses clearly with bullet points when appropriate
- Always reference real event names, hotel data, and metrics
- Be concise but comprehensive
- Focus on business value and decision-making support

RESPONSE APPROACH:
1. Understand the business intent behind the query
2. Access relevant data from our event and bidding database
3. Provide specific, data-driven insights
4. Include relevant metrics and comparisons
5. Offer actionable recommendations when appropriate
6. Format information for business decision-making

CURRENT BUSINESS SNAPSHOT:
Active High-Priority Events: {len([e for e in active_events if e.priority.value == 'high'])}
Urgent Deadlines (Next 7 Days): {len(dashboard.urgent_deadlines)}
Today's Activity: {dashboard.new_rfps_today} new RFPs, {dashboard.bids_submitted_today} bids submitted
Current Win Rate: {dashboard.current_win_rate:.1f}%

Remember: You're a business intelligence tool designed to help event managers make data-driven decisions. Always provide specific, actionable insights based on our real business data."""

        # Build messages array for Anthropic format
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-settings.max_conversation_history:]:
                # Convert to Anthropic format
                if msg["role"] in ["user", "assistant"]:
                    messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return system_prompt, messages
    
    def _get_relevant_data_for_query(self, user_message: str) -> str:
        """Extract relevant business data based on the user's query."""
        if not self.business_data:
            return ""
        
        query_lower = user_message.lower()
        relevant_data = []
        
        # Check what type of data the user is asking about
        if any(word in query_lower for word in ['event', 'events', 'conference', 'meeting']):
            events = self.business_data['events']
            relevant_data.append(f"\nCURRENT EVENTS DATA:")
            for event in events: # Limit to prevent token overflow
                relevant_data.append(f"• {event.event_name} - {event.client_company}")
                relevant_data.append(f"  Status: {event.status.value.title()}, Priority: {event.priority.value.title()}")
                relevant_data.append(f"  Guests: {event.guest_count}, Budget: ${event.budget_min:,} - ${event.budget_max:,}")
                relevant_data.append(f"  Deadline: {event.rfp_deadline.strftime('%Y-%m-%d')}, Location: {event.preferred_location}")
        
        if any(word in query_lower for word in ['hotel', 'bid', 'bids', 'partner', 'venue']):
            bids = self.business_data['bids']
            relevant_data.append(f"\nHOTEL BIDDING DATA (Sample):")
            for bid in bids:  # Shows all 75+ bids... Limit to prevent token overflow in case it does for now
                relevant_data.append(f"• {bid.hotel_name} - ${bid.total_cost:,.0f}")
                relevant_data.append(f"  Event ID: {bid.event_id}, Status: {bid.status.value.title()}")
                relevant_data.append(f"  Rating: {bid.hotel_rating}/5, Response Time: {bid.response_time_hours}h")
        
        if any(word in query_lower for word in ['revenue', 'pipeline', 'financial', 'money', 'profit']):
            metrics = self.business_data['metrics']
            relevant_data.append(f"\nFINANCIAL METRICS:")
            relevant_data.append(f"• Total Revenue Pipeline: ${metrics.total_revenue_pipeline:,.0f}")
            relevant_data.append(f"• Confirmed Revenue: ${metrics.confirmed_revenue:,.0f}")
            relevant_data.append(f"• Projected Revenue: ${metrics.projected_revenue:,.0f}")
            relevant_data.append(f"• Average Commission: ${metrics.average_commission:,.0f}")
            relevant_data.append(f"• Win Rate: {metrics.bid_win_rate:.1f}%")
        
        if any(word in query_lower for word in ['deadline', 'urgent', 'priority', 'week', 'today']):
            dashboard = self.business_data['dashboard']
            relevant_data.append(f"\nDEADLINE & PRIORITY DATA:")
            relevant_data.append(f"• Active Events: {dashboard.active_events_count}")
            relevant_data.append(f"• Deadlines This Week: {dashboard.deadlines_this_week}")
            relevant_data.append(f"• Urgent Deadlines: {', '.join(dashboard.urgent_deadlines)}")
            relevant_data.append(f"• High Value Opportunities: {', '.join(dashboard.high_value_opportunities)}")
        
        return '\n'.join(relevant_data)
    
    async def generate_response(self, user_message: str, conversation_history: List[Dict] = None) -> str:
        """Generate a non-streaming business intelligence response."""
        try:
            system_prompt, messages = self._build_business_context_prompt(user_message, conversation_history)
            
            # Add relevant data context to the system prompt
            relevant_data = self._get_relevant_data_for_query(user_message)
            if relevant_data:
                system_prompt += relevant_data
            
            logger.info(f"Generating business intelligence response for: {user_message[:100]}...")
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=messages
            )
            
            if response.content and len(response.content) > 0:
                content = response.content[0].text
                logger.info(f"Generated business response: {len(content)} characters")
                return content
            else:
                logger.error("No response content received from Anthropic")
                return "I apologize, but I couldn't generate a business intelligence response. Please try again."
                
        except anthropic.RateLimitError as e:
            logger.error(f"Anthropic rate limit exceeded: {e}")
            return "I'm currently experiencing high demand. Please try again in a moment."
        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {e}")
            return "I'm experiencing technical difficulties. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error generating business response: {e}")
            return "I encountered an unexpected error while analyzing business data. Please try again."
    
    async def generate_streaming_response(self, user_message: str, conversation_history: List[Dict] = None) -> AsyncGenerator[str, None]:
        """Generate a streaming business intelligence response."""
        try:
            system_prompt, messages = self._build_business_context_prompt(user_message, conversation_history)
            
            # Add relevant data context
            relevant_data = self._get_relevant_data_for_query(user_message)
            if relevant_data:
                system_prompt += relevant_data
            
            logger.info(f"Generating streaming business response for: {user_message[:100]}...")
            
            with self.client.messages.stream(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=messages
            ) as stream:
                full_response = ""
                for text in stream.text_stream:
                    full_response += text
                    yield text
            
            logger.info(f"Completed streaming business response: {len(full_response)} characters")
                    
        except anthropic.RateLimitError as e:
            logger.error(f"Anthropic rate limit exceeded: {e}")
            yield "I'm currently experiencing high demand. Please try again in a moment."
        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {e}")
            yield "I'm experiencing technical difficulties. Please try again."
        except Exception as e:
            logger.error(f"Unexpected error in streaming business response: {e}")
            yield "I encountered an unexpected error while analyzing business data. Please try again."
    
    def validate_connection(self) -> bool:
        """Test the Anthropic connection."""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hello"}]
            )
            return bool(response.content)
        except Exception as e:
            logger.error(f"Anthropic connection validation failed: {e}", exc_info=True)
            return False
    
    def get_model_info(self) -> Dict:
        """Get information about the current model configuration."""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "api_key_configured": bool(settings.anthropic_api_key),
            "business_data_loaded": bool(self.business_data),
            "events_count": len(self.business_data['events']) if self.business_data else 0,
            "bids_count": len(self.business_data['bids']) if self.business_data else 0
        }

    def refresh_business_data(self):
        """Refresh business data - useful for when new events are added."""
        try:
            # Import here to avoid circular imports
            from core.mock_data import get_enhanced_mock_data
            
            # Reload fresh data including new bids
            self.business_data = get_enhanced_mock_data()
            logger.info(f"✅ Business data refreshed: {len(self.business_data['events'])} events, {len(self.business_data['bids'])} bids")
            
            # Log the latest bids for debugging
            if self.business_data and 'bids' in self.business_data:
                latest_bids = self.business_data['bids'][-3:]  # Get last 3 bids
                for bid in latest_bids:
                    logger.info(f"   Latest bid: {bid.hotel_name} - ${bid.total_cost:,}")
                    
        except Exception as e:
            logger.error(f"Failed to refresh business data: {e}")


# Global AI client instance (renamed for clarity)
_ai_client: Optional[BusinessIntelligenceAIClient] = None


def get_ai_client() -> BusinessIntelligenceAIClient:
    """Get the global business intelligence AI client instance."""
    global _ai_client
    
    if _ai_client is None:
        _ai_client = BusinessIntelligenceAIClient()
        logger.info("Business Intelligence AI client initialized")
    
    return _ai_client


def validate_ai_setup() -> bool:
    """Validate that AI client is properly configured."""
    try:
        client = get_ai_client()
        return client.validate_connection()
    except Exception as e:
        logger.error(f"AI setup validation failed: {e}")
        return False


# Alias for backward compatibility
AIClient = BusinessIntelligenceAIClient