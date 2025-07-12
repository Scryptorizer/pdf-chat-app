from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class EventStatus(str, Enum):
    """Event bidding status options."""
    OPEN = "open"
    EVALUATING = "evaluating"
    CLOSED = "closed"
    AWARDED = "awarded"
    CANCELLED = "cancelled"


class EventPriority(str, Enum):
    """Event priority levels."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EventType(str, Enum):
    """Types of events."""
    CORPORATE = "corporate"
    CONFERENCE = "conference"
    WEDDING = "wedding"
    RETREAT = "retreat"
    TRAINING = "training"
    PRODUCT_LAUNCH = "product_launch"
    BOARD_MEETING = "board_meeting"
    HOLIDAY_PARTY = "holiday_party"


class BidStatus(str, Enum):
    """Hotel bid status options."""
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class Event(BaseModel):
    """Main event model for bidding opportunities."""
    event_id: str = Field(default_factory=lambda: f"EVT{str(uuid.uuid4())[:8].upper()}")
    event_name: str = Field(..., min_length=1, max_length=200)
    client_company: str = Field(..., min_length=1, max_length=100)
    client_contact_name: Optional[str] = None
    client_contact_email: Optional[str] = None
    client_contact_phone: Optional[str] = None
    
    # Event Details
    event_type: EventType
    event_date: datetime
    event_end_date: Optional[datetime] = None
    duration_days: int = Field(default=1, ge=1, le=30)
    guest_count: int = Field(..., ge=1, le=10000)
    estimated_rooms_needed: Optional[int] = None
    
    # Budget Information
    budget_min: float = Field(..., ge=0)
    budget_max: float = Field(..., ge=0)
    budget_currency: str = Field(default="USD")
    
    # Requirements
    venue_requirements: str = Field(default="")
    special_requirements: str = Field(default="")
    catering_requirements: str = Field(default="")
    av_requirements: str = Field(default="")
    accessibility_requirements: str = Field(default="")
    
    # Location
    preferred_location: str = Field(..., min_length=1)
    location_flexibility: bool = Field(default=False)
    
    # Bidding Process
    rfp_deadline: datetime
    decision_date: Optional[datetime] = None
    status: EventStatus = Field(default=EventStatus.OPEN)
    priority: EventPriority = Field(default=EventPriority.MEDIUM)
    
    # Internal Tracking
    assigned_manager: str = Field(..., min_length=1)
    created_date: datetime = Field(default_factory=datetime.now)
    updated_date: datetime = Field(default_factory=datetime.now)
    notes: str = Field(default="")
    
    # Business Metrics
    estimated_commission: Optional[float] = None
    profit_margin_target: Optional[float] = None
    
    @validator('budget_max')
    def budget_max_must_be_greater_than_min(cls, v, values):
        if 'budget_min' in values and v < values['budget_min']:
            raise ValueError('budget_max must be greater than or equal to budget_min')
        return v
    
    @validator('event_end_date')
    def end_date_after_start_date(cls, v, values):
        if v and 'event_date' in values and v < values['event_date']:
            raise ValueError('event_end_date must be after event_date')
        return v
    
    @validator('rfp_deadline')
    def deadline_before_event_date(cls, v, values):
        if 'event_date' in values and v >= values['event_date']:
            raise ValueError('rfp_deadline must be before event_date')
        return v


class HotelBid(BaseModel):
    """Hotel bid response to an RFP."""
    bid_id: str = Field(default_factory=lambda: f"BID{str(uuid.uuid4())[:8].upper()}")
    event_id: str = Field(..., min_length=1)
    
    # Hotel Information
    hotel_name: str = Field(..., min_length=1, max_length=100)
    hotel_chain: str = Field(..., min_length=1, max_length=50)
    hotel_address: str = Field(..., min_length=1)
    hotel_city: str = Field(..., min_length=1)
    hotel_state: Optional[str] = None
    hotel_country: str = Field(default="USA")
    hotel_rating: float = Field(..., ge=1.0, le=5.0)
    
    # Contact Information
    contact_person: str = Field(..., min_length=1)
    contact_email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    contact_phone: str = Field(..., min_length=1)
    sales_manager: Optional[str] = None
    
    # Pricing Breakdown
    room_rate_per_night: float = Field(..., ge=0)
    total_room_cost: float = Field(..., ge=0)
    meeting_space_cost: float = Field(default=0, ge=0)
    catering_cost_per_person: float = Field(default=0, ge=0)
    total_catering_cost: float = Field(default=0, ge=0)
    av_equipment_cost: float = Field(default=0, ge=0)
    service_fees: float = Field(default=0, ge=0)
    taxes_and_fees: float = Field(default=0, ge=0)
    total_cost: float = Field(..., ge=0)
    
    # Capacity and Amenities
    rooms_available: int = Field(..., ge=1)
    meeting_rooms: List[str] = Field(default_factory=list)
    max_meeting_capacity: int = Field(default=0, ge=0)
    amenities: List[str] = Field(default_factory=list)
    special_features: List[str] = Field(default_factory=list)
    
    # Terms and Conditions
    cancellation_policy: str = Field(default="Standard")
    deposit_required: float = Field(default=0, ge=0)
    deposit_percentage: float = Field(default=0, ge=0, le=100)
    payment_terms: str = Field(default="Net 30")
    contract_flexibility: str = Field(default="Standard")
    
    # Submission Details
    submitted_date: datetime = Field(default_factory=datetime.now)
    response_time_hours: int = Field(default=24, ge=1)
    bid_valid_until: Optional[datetime] = None
    status: BidStatus = Field(default=BidStatus.SUBMITTED)
    
    # Performance Metrics
    past_events_with_us: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    average_client_rating: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Internal Notes
    internal_notes: str = Field(default="")
    competitive_advantages: List[str] = Field(default_factory=list)
    potential_issues: List[str] = Field(default_factory=list)
    
    @validator('total_cost')
    def validate_total_cost(cls, v, values):
        # Basic validation - in real app, would calculate from components
        if v <= 0:
            raise ValueError('total_cost must be greater than 0')
        return v


class HotelPartner(BaseModel):
    """Hotel partner relationship model."""
    partner_id: str = Field(default_factory=lambda: f"HTL{str(uuid.uuid4())[:8].upper()}")
    hotel_name: str = Field(..., min_length=1)
    hotel_chain: str = Field(..., min_length=1)
    
    # Location Details
    primary_location: str = Field(..., min_length=1)
    additional_locations: List[str] = Field(default_factory=list)
    regions_served: List[str] = Field(default_factory=list)
    
    # Partnership Details
    partnership_start_date: datetime
    partnership_tier: str = Field(default="Standard")  # Premium, Standard, Basic
    preferred_partner: bool = Field(default=False)
    
    # Performance Metrics
    total_events_completed: int = Field(default=0, ge=0)
    total_revenue_generated: float = Field(default=0.0, ge=0)
    average_response_time_hours: float = Field(default=24.0, ge=0)
    win_rate_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    client_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Contact Information
    primary_contact: str = Field(..., min_length=1)
    primary_email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    primary_phone: str = Field(..., min_length=1)
    account_manager: Optional[str] = None
    
    # Capabilities
    max_event_capacity: int = Field(default=500, ge=1)
    specialty_event_types: List[EventType] = Field(default_factory=list)
    key_amenities: List[str] = Field(default_factory=list)
    unique_selling_points: List[str] = Field(default_factory=list)
    
    # Financial Terms
    commission_rate: float = Field(default=10.0, ge=0.0, le=50.0)
    payment_terms: str = Field(default="Net 30")
    contract_end_date: Optional[datetime] = None
    
    # Status
    active: bool = Field(default=True)
    last_contact_date: Optional[datetime] = None
    notes: str = Field(default="")


class BusinessMetrics(BaseModel):
    """Business intelligence and KPI tracking."""
    metrics_id: str = Field(default_factory=lambda: f"MTR{str(uuid.uuid4())[:8].upper()}")
    date_calculated: datetime = Field(default_factory=datetime.now)
    period_start: datetime
    period_end: datetime
    
    # Event Metrics
    total_events: int = Field(default=0, ge=0)
    open_events: int = Field(default=0, ge=0)
    closed_events: int = Field(default=0, ge=0)
    awarded_events: int = Field(default=0, ge=0)
    average_event_value: float = Field(default=0.0, ge=0)
    
    # Revenue Metrics
    total_revenue_pipeline: float = Field(default=0.0, ge=0)
    confirmed_revenue: float = Field(default=0.0, ge=0)
    projected_revenue: float = Field(default=0.0, ge=0)
    average_commission: float = Field(default=0.0, ge=0)
    revenue_growth_percentage: float = Field(default=0.0)
    
    # Performance Metrics
    average_response_time_hours: float = Field(default=24.0, ge=0)
    bid_win_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    client_retention_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    partner_satisfaction_score: float = Field(default=0.0, ge=0.0, le=5.0)
    
    # Operational Metrics
    total_bids_received: int = Field(default=0, ge=0)
    average_bids_per_event: float = Field(default=0.0, ge=0)
    fastest_response_time_hours: float = Field(default=0.0, ge=0)
    slowest_response_time_hours: float = Field(default=0.0, ge=0)
    
    # Top Performers
    top_performing_hotels: List[str] = Field(default_factory=list)
    most_profitable_event_types: List[str] = Field(default_factory=list)
    busiest_locations: List[str] = Field(default_factory=list)
    peak_months: List[str] = Field(default_factory=list)


class DashboardSummary(BaseModel):
    """Dashboard summary for frontend display."""
    summary_date: datetime = Field(default_factory=datetime.now)
    
    # Quick Stats
    active_events_count: int = Field(default=0, ge=0)
    total_pipeline_value: float = Field(default=0.0, ge=0)
    pending_decisions: int = Field(default=0, ge=0)
    deadlines_this_week: int = Field(default=0, ge=0)
    
    # Recent Activity
    new_rfps_today: int = Field(default=0, ge=0)
    bids_submitted_today: int = Field(default=0, ge=0)
    decisions_made_today: int = Field(default=0, ge=0)
    
    # Performance Indicators
    current_win_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    average_deal_size: float = Field(default=0.0, ge=0)
    response_time_avg: float = Field(default=0.0, ge=0)
    
    # Alerts and Notifications
    urgent_deadlines: List[str] = Field(default_factory=list)
    overdue_responses: List[str] = Field(default_factory=list)
    high_value_opportunities: List[str] = Field(default_factory=list)


# Response Models for API endpoints
class EventListResponse(BaseModel):
    """Response for event list endpoints."""
    events: List[Event]
    total_count: int
    page: int = 1
    page_size: int = 50
    filters_applied: Dict[str, Any] = Field(default_factory=dict)


class BidComparisonResponse(BaseModel):
    """Response for bid comparison endpoints."""
    event: Event
    bids: List[HotelBid]
    comparison_metrics: Dict[str, Any]
    recommendation: Optional[str] = None


class AnalyticsResponse(BaseModel):
    """Response for analytics endpoints."""
    metrics: BusinessMetrics
    trends: Dict[str, List[float]] = Field(default_factory=dict)
    insights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# Business Intelligence Query Models
class BusinessQuery(BaseModel):
    """Business intelligence query model."""
    query: str = Field(..., min_length=1, max_length=1000)
    context: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    include_metrics: bool = Field(default=True)
    conversation_id: Optional[str] = None


class BusinessQueryResponse(BaseModel):
    """Business intelligence query response."""
    response: str
    data_sources: List[str] = Field(default_factory=list)
    metrics_used: Dict[str, Any] = Field(default_factory=dict)
    suggested_followups: List[str] = Field(default_factory=list)
    conversation_id: str
    processing_time: float = Field(default=0.0, ge=0)