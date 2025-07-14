import random
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.business_models import (
    Event, HotelBid, HotelPartner, BusinessMetrics, 
    DashboardSummary, EventStatus, EventPriority, 
    EventType, BidStatus
)


class MockDataGenerator:
    """Generate realistic business data for the Event Bidding Intelligence Platform."""
    
    def __init__(self):
        # Real company names for authenticity
        self.companies = [
            "Microsoft", "Google", "Apple", "Meta", "Amazon", "Salesforce", 
            "Oracle", "IBM", "Adobe", "Tesla", "Netflix", "Uber", "Airbnb",
            "Shopify", "Zoom", "Slack", "DocuSign", "HubSpot", "Zendesk",
            "Atlassian", "ServiceNow", "Workday", "Palantir", "Snowflake"
        ]
        
        # Event name templates for realism
        self.event_templates = {
            EventType.CORPORATE: [
                "Annual Sales Conference", "Q{} Review Meeting", "Leadership Summit",
                "All-Hands Meeting", "Strategy Planning Session", "Board Meeting"
            ],
            EventType.CONFERENCE: [
                "Tech Conference {}", "Innovation Summit", "Digital Transformation Forum",
                "Future of {} Conference", "Industry Leaders Summit", "Executive Forum"
            ],
            EventType.TRAINING: [
                "Leadership Development Program", "Sales Training Workshop", 
                "Technical Skills Bootcamp", "Compliance Training Session",
                "Product Knowledge Workshop", "Customer Service Excellence"
            ],
            EventType.PRODUCT_LAUNCH: [
                "{} Product Launch", "New Platform Unveiling", "Product Demo Day",
                "Innovation Showcase", "Technology Reveal", "Product Roadmap Presentation"
            ],
            EventType.RETREAT: [
                "Executive Retreat", "Team Building Retreat", "Strategic Planning Retreat",
                "Leadership Offsite", "Company Retreat", "Department Offsite"
            ],
            EventType.WEDDING: [
                "Wedding Reception", "Wedding Celebration", "Wedding Weekend",
                "Rehearsal Dinner", "Wedding Ceremony & Reception"
            ],
            EventType.BOARD_MEETING: [
                "Board Meeting", "Executive Board Meeting", "Quarterly Board Review",
                "Annual Board Meeting", "Strategic Board Session"
            ],
            EventType.HOLIDAY_PARTY: [
                "Holiday Party", "Year-End Celebration", "Christmas Party",
                "Holiday Celebration", "Annual Holiday Event"
            ]
        }
        
        # Hotel chains and properties
        self.hotel_chains = [
            "Marriott", "Hilton", "Hyatt", "InterContinental", "Sheraton", 
            "Westin", "DoubleTree", "Embassy Suites", "Courtyard", "Residence Inn",
            "Hampton Inn", "Holiday Inn", "Crowne Plaza", "Four Seasons", "Ritz-Carlton"
        ]
        
        # Major business cities
        self.cities = [
            "San Francisco", "New York", "Chicago", "Los Angeles", "Seattle",
            "Boston", "Austin", "Denver", "Miami", "Atlanta", "Dallas",
            "Philadelphia", "San Diego", "Phoenix", "Las Vegas"
        ]
        
        # Event managers
        self.managers = [
            "Sarah Johnson", "Michael Chen", "Lisa Rodriguez", "David Kim",
            "Amanda Williams", "Robert Taylor", "Jennifer Davis", "Mark Thompson"
        ]
        
        # Hotel amenities
        self.amenities = [
            "High-speed WiFi", "AV Equipment", "Parking", "Fitness Center",
            "Business Center", "Concierge", "Room Service", "Spa Services",
            "Airport Shuttle", "Catering Services", "Breakout Rooms", "Executive Lounge"
        ]
        
        # Meeting room types
        self.meeting_rooms = [
            "Grand Ballroom", "Executive Boardroom", "Conference Room A", "Conference Room B",
            "Breakout Room 1", "Breakout Room 2", "Theater", "Auditorium", "Classroom",
            "Reception Hall", "Exhibit Hall", "Rooftop Terrace"
        ]

    def generate_events(self, count: int = 15) -> List[Event]:
        """Generate realistic event data."""
        events = []
        
        for i in range(count):
            company = random.choice(self.companies)
            event_type = random.choice(list(EventType))
            location = random.choice(self.cities)
            
            # Generate realistic event name
            template = random.choice(self.event_templates[event_type])
            if "{}" in template:
                if "Q{}" in template:
                    event_name = template.format(random.choice([1, 2, 3, 4]))
                else:
                    event_name = template.format(company)
            else:
                event_name = f"{company} {template}"
            
            # Generate realistic dates
            event_date = datetime.now() + timedelta(days=random.randint(15, 365))
            rfp_deadline = event_date - timedelta(days=random.randint(14, 60))
            
            # Generate realistic guest count based on event type
            guest_ranges = {
                EventType.BOARD_MEETING: (10, 25),
                EventType.TRAINING: (20, 100),
                EventType.CORPORATE: (50, 500),
                EventType.CONFERENCE: (100, 1000),
                EventType.PRODUCT_LAUNCH: (75, 300),
                EventType.RETREAT: (15, 75)
            }
            min_guests, max_guests = guest_ranges.get(event_type, (50, 200))
            guest_count = random.randint(min_guests, max_guests)
            
            # Generate realistic budget based on guest count and event type
            base_cost_per_person = {
                EventType.BOARD_MEETING: random.randint(200, 500),
                EventType.TRAINING: random.randint(150, 300),
                EventType.CORPORATE: random.randint(200, 400),
                EventType.CONFERENCE: random.randint(300, 600),
                EventType.PRODUCT_LAUNCH: random.randint(400, 800),
                EventType.RETREAT: random.randint(250, 500)
            }
            
            cost_per_person = base_cost_per_person.get(event_type, 300)
            base_budget = guest_count * cost_per_person
            budget_min = int(base_budget * 0.8)
            budget_max = int(base_budget * 1.4)
            
            # Generate requirements based on event type
            requirements = self._generate_requirements(event_type, guest_count)
            
            event = Event(
                event_name=event_name,
                client_company=company,
                client_contact_name=f"{random.choice(['John', 'Sarah', 'Mike', 'Lisa', 'David', 'Amanda'])} {random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'])}",
                client_contact_email=f"{random.choice(['events', 'planning', 'meetings'])}@{company.lower().replace(' ', '')}.com",
                event_type=event_type,
                event_date=event_date,
                duration_days=random.choice([1, 1, 1, 2, 2, 3]),  # Most events are 1-2 days
                guest_count=guest_count,
                estimated_rooms_needed=int(guest_count * random.uniform(0.6, 0.9)),
                budget_min=budget_min,
                budget_max=budget_max,
                venue_requirements=requirements["venue"],
                special_requirements=requirements["special"],
                catering_requirements=requirements["catering"],
                av_requirements=requirements["av"],
                preferred_location=location,
                location_flexibility=random.choice([True, False]),
                rfp_deadline=rfp_deadline,
                status=random.choices(
                    [EventStatus.OPEN, EventStatus.EVALUATING, EventStatus.CLOSED, EventStatus.AWARDED],
                    weights=[50, 25, 15, 10]
                )[0],
                priority=random.choices(
                    [EventPriority.HIGH, EventPriority.MEDIUM, EventPriority.LOW],
                    weights=[20, 60, 20]
                )[0],
                assigned_manager=random.choice(self.managers),
                created_date=datetime.now() - timedelta(days=random.randint(1, 30)),
                estimated_commission=random.randint(5000, 25000),
                profit_margin_target=random.uniform(15, 35)
            )
            
            events.append(event)
        
        return events

    def generate_hotel_bids(self, events: List[Event]) -> List[HotelBid]:
        """Generate realistic hotel bids for events."""
        bids = []
        
        for event in events:
            # Skip cancelled events
            if event.status == EventStatus.CANCELLED:
                continue
                
            # Generate 3-7 bids per event
            bid_count = random.randint(3, 7)
            
            for i in range(bid_count):
                hotel_chain = random.choice(self.hotel_chains)
                hotel_name = f"{hotel_chain} {event.preferred_location}"
                
                # Generate realistic pricing
                room_rate = random.randint(120, 450)
                meeting_space_cost = random.randint(1500, 8000)
                catering_per_person = random.randint(35, 120)
                
                total_room_cost = room_rate * (event.estimated_rooms_needed or event.guest_count) * event.duration_days
                total_catering_cost = catering_per_person * event.guest_count * event.duration_days
                av_cost = random.randint(500, 3000)
                service_fees = (total_room_cost + meeting_space_cost + total_catering_cost) * 0.08
                taxes = (total_room_cost + meeting_space_cost + total_catering_cost + service_fees) * 0.12
                
                total_cost = total_room_cost + meeting_space_cost + total_catering_cost + av_cost + service_fees + taxes
                
                # Generate hotel details
                amenities_count = random.randint(4, 8)
                selected_amenities = random.sample(self.amenities, amenities_count)
                
                meeting_rooms_count = random.randint(2, 6)
                selected_meeting_rooms = random.sample(self.meeting_rooms, meeting_rooms_count)
                
                # Generate contact info
                contact_names = ["John", "Sarah", "Mike", "Lisa", "David", "Amanda", "Robert", "Jennifer"]
                contact_surnames = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore"]
                contact_person = f"{random.choice(contact_names)} {random.choice(contact_surnames)}"
                
                bid = HotelBid(
                    event_id=event.event_id,
                    hotel_name=hotel_name,
                    hotel_chain=hotel_chain,
                    hotel_address=f"{random.randint(100, 9999)} {random.choice(['Main St', 'Business Blvd', 'Conference Way', 'Executive Dr', 'Corporate Pkwy'])}",
                    hotel_city=event.preferred_location,
                    hotel_country="USA",
                    hotel_rating=round(random.uniform(3.2, 4.8), 1),
                    contact_person=contact_person,
                    contact_email=f"{contact_person.lower().replace(' ', '.')}@{hotel_chain.lower().replace(' ', '')}.com",
                    contact_phone=f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
                    room_rate_per_night=room_rate,
                    total_room_cost=total_room_cost,
                    meeting_space_cost=meeting_space_cost,
                    catering_cost_per_person=catering_per_person,
                    total_catering_cost=total_catering_cost,
                    av_equipment_cost=av_cost,
                    service_fees=service_fees,
                    taxes_and_fees=taxes,
                    total_cost=total_cost,
                    rooms_available=random.randint(event.guest_count, event.guest_count + 50),
                    meeting_rooms=selected_meeting_rooms,
                    max_meeting_capacity=random.randint(event.guest_count, event.guest_count + 100),
                    amenities=selected_amenities,
                    cancellation_policy=random.choice([
                        "Free cancellation up to 48 hours",
                        "Free cancellation up to 72 hours", 
                        "50% refund if cancelled within 7 days",
                        "Standard cancellation policy"
                    ]),
                    deposit_required=total_cost * random.uniform(0.1, 0.3),
                    deposit_percentage=random.choice([10, 15, 20, 25, 30]),
                    payment_terms=random.choice(["Net 30", "Net 15", "50% upfront, 50% on completion", "Full payment 30 days prior"]),
                    submitted_date=datetime.now() - timedelta(days=random.randint(1, 10)),
                    response_time_hours=random.randint(2, 48),
                    status=random.choices(
                        [BidStatus.SUBMITTED, BidStatus.UNDER_REVIEW, BidStatus.SHORTLISTED],
                        weights=[40, 35, 25]
                    )[0],
                    past_events_with_us=random.randint(0, 15),
                    success_rate=random.uniform(65, 95),
                    average_client_rating=round(random.uniform(3.8, 4.9), 1),
                    competitive_advantages=[
                        random.choice([
                            "Prime downtown location",
                            "State-of-the-art AV equipment",
                            "Award-winning catering",
                            "Dedicated event coordinator",
                            "Flexible meeting spaces",
                            "24/7 business center"
                        ])
                        for _ in range(random.randint(1, 3))
                    ]
                )
                
                bids.append(bid)
        
        return bids

    def generate_hotel_partners(self, count: int = 25) -> List[HotelPartner]:
        """Generate hotel partner relationships."""
        partners = []
        
        for i in range(count):
            hotel_chain = random.choice(self.hotel_chains)
            primary_city = random.choice(self.cities)
            
            # Generate additional locations
            additional_locations = random.sample(
                [city for city in self.cities if city != primary_city],
                random.randint(0, 4)
            )
            
            # Generate partnership metrics
            events_completed = random.randint(5, 50)
            avg_event_value = random.randint(25000, 150000)
            
            partner = HotelPartner(
                hotel_name=f"{hotel_chain} {primary_city}",
                hotel_chain=hotel_chain,
                primary_location=primary_city,
                additional_locations=additional_locations,
                regions_served=random.sample(["West Coast", "East Coast", "Midwest", "Southeast", "Southwest"], random.randint(1, 3)),
                partnership_start_date=datetime.now() - timedelta(days=random.randint(30, 1095)),
                partnership_tier=random.choices(
                    ["Premium", "Standard", "Basic"],
                    weights=[20, 60, 20]
                )[0],
                preferred_partner=random.choice([True, False]),
                total_events_completed=events_completed,
                total_revenue_generated=events_completed * avg_event_value,
                average_response_time_hours=random.uniform(2, 24),
                win_rate_percentage=random.uniform(25, 85),
                client_satisfaction_score=round(random.uniform(3.5, 4.9), 1),
                primary_contact=f"{random.choice(['John', 'Sarah', 'Mike', 'Lisa'])} {random.choice(['Smith', 'Johnson', 'Williams', 'Brown'])}",
                primary_email=f"events@{hotel_chain.lower().replace(' ', '')}.com",
                primary_phone=f"+1-{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
                max_event_capacity=random.randint(100, 1000),
                specialty_event_types=random.sample(list(EventType), random.randint(2, 4)),
                key_amenities=random.sample(self.amenities, random.randint(5, 10)),
                commission_rate=random.uniform(8, 18),
                active=random.choice([True, True, True, False]),  # Most are active
                last_contact_date=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            
            partners.append(partner)
        
        return partners

    def generate_business_metrics(self, events: List[Event], bids: List[HotelBid]) -> BusinessMetrics:
        """Generate business metrics from event and bid data."""
        period_start = datetime.now() - timedelta(days=30)
        period_end = datetime.now()
        
        # Calculate metrics from actual data
        total_events = len(events)
        open_events = len([e for e in events if e.status == EventStatus.OPEN])
        closed_events = len([e for e in events if e.status in [EventStatus.CLOSED, EventStatus.AWARDED]])
        awarded_events = len([e for e in events if e.status == EventStatus.AWARDED])
        
        total_pipeline = sum([b.total_cost for b in bids])
        confirmed_revenue = sum([b.total_cost for b in bids if b.status == BidStatus.ACCEPTED])
        
        return BusinessMetrics(
            period_start=period_start,
            period_end=period_end,
            total_events=total_events,
            open_events=open_events,
            closed_events=closed_events,
            awarded_events=awarded_events,
            average_event_value=total_pipeline / len(bids) if bids else 0,
            total_revenue_pipeline=total_pipeline,
            confirmed_revenue=confirmed_revenue,
            projected_revenue=total_pipeline * 0.3,  # Assume 30% conversion
            average_commission=total_pipeline * 0.12 / len(bids) if bids else 0,
            revenue_growth_percentage=random.uniform(5, 25),
            average_response_time_hours=random.uniform(8, 16),
            bid_win_rate=random.uniform(25, 40),
            client_retention_rate=random.uniform(70, 90),
            partner_satisfaction_score=random.uniform(4.0, 4.8),
            total_bids_received=len(bids),
            average_bids_per_event=len(bids) / total_events if total_events > 0 else 0,
            fastest_response_time_hours=random.uniform(1, 4),
            slowest_response_time_hours=random.uniform(24, 48),
            top_performing_hotels=[
                f"{random.choice(self.hotel_chains)} {random.choice(self.cities)}"
                for _ in range(5)
            ],
            most_profitable_event_types=[et.value for et in random.sample(list(EventType), 3)],
            busiest_locations=random.sample(self.cities, 5),
            peak_months=["March", "April", "September", "October", "November"]
        )

    def generate_dashboard_summary(self, events: List[Event], bids: List[HotelBid]) -> DashboardSummary:
        """Generate dashboard summary data."""
        active_events = [e for e in events if e.status == EventStatus.OPEN]
        this_week = datetime.now() + timedelta(days=7)
        deadlines_this_week = len([e for e in active_events if e.rfp_deadline <= this_week])
        
        return DashboardSummary(
            active_events_count=len(active_events),
            total_pipeline_value=sum([b.total_cost for b in bids]),
            pending_decisions=len([e for e in events if e.status == EventStatus.EVALUATING]),
            deadlines_this_week=deadlines_this_week,
            new_rfps_today=random.randint(0, 3),
            bids_submitted_today=random.randint(2, 8),
            decisions_made_today=random.randint(0, 2),
            current_win_rate=random.uniform(28, 45),
            average_deal_size=sum([b.total_cost for b in bids]) / len(bids) if bids else 0,
            response_time_avg=random.uniform(6, 18),
            urgent_deadlines=[
                f"{e.event_name} (Due: {e.rfp_deadline.strftime('%m/%d')})"
                for e in sorted(active_events, key=lambda x: x.rfp_deadline)[:3]
            ],
            high_value_opportunities=[
                f"{e.event_name} (${e.budget_max:,})"
                for e in sorted(active_events, key=lambda x: x.budget_max, reverse=True)[:3]
            ]
        )

    def _generate_requirements(self, event_type: EventType, guest_count: int) -> Dict[str, str]:
        """Generate realistic requirements based on event type."""
        base_requirements = {
            "venue": f"Meeting space for {guest_count} people",
            "special": "",
            "catering": "Standard business catering",
            "av": "Basic AV setup with microphones and projector"
        }
        
        if event_type == EventType.CORPORATE:
            base_requirements.update({
                "venue": f"Main auditorium for {guest_count}, plus 3-4 breakout rooms for 25-50 people each",
                "catering": "Continental breakfast, lunch, and networking reception",
                "av": "Professional AV with wireless mics, large screens, live streaming capability",
                "special": "Executive green room, registration area, branded signage space"
            })
        elif event_type == EventType.BOARD_MEETING:
            base_requirements.update({
                "venue": f"Executive boardroom for {guest_count} with privacy",
                "catering": "Premium catering, executive lunch service",
                "av": "High-end video conferencing, multiple screens",
                "special": "Confidential document handling, secure parking"
            })
        elif event_type == EventType.TRAINING:
            base_requirements.update({
                "venue": f"Classroom setup for {guest_count} with tables",
                "catering": "Light refreshments, working lunch",
                "av": "Interactive whiteboards, laptop connections",
                "special": "Hands-on workspace, reliable WiFi for all attendees"
            })
        elif event_type == EventType.PRODUCT_LAUNCH:
            base_requirements.update({
                "venue": f"Theater-style seating for {guest_count}, stage area",
                "catering": "Premium reception, cocktail service",
                "av": "Professional lighting, sound system, live streaming",
                "special": "Product display area, media interview space, branded environment"
            })
        
        return base_requirements

    def generate_all_mock_data(self) -> Dict[str, Any]:
        """Generate complete set of mock data for the platform."""
        # Generate once and always return the same data
        if not hasattr(self, '_static_data'):
            print("🏗️  Generating static business data...")
            events = self.generate_events(15)
            bids = self.generate_hotel_bids(events)
            partners = self.generate_hotel_partners(25)
            metrics = self.generate_business_metrics(events, bids)
            dashboard = self.generate_dashboard_summary(events, bids)
            
            self._static_data = {
                "events": events,
                "bids": bids,
                "partners": partners,
                "metrics": metrics,
                "dashboard": dashboard,
                "generated_at": datetime.now()
            }
            print(f"✅ Generated static data: {len(events)} events, {len(bids)} bids")
        
        return self._static_data


# Global instance for easy import
mock_generator = MockDataGenerator()


def get_mock_data() -> Dict[str, Any]:
    """Get all mock data for the platform including new bids."""
    return get_enhanced_mock_data()


def get_sample_events(count: int = 10) -> List[Event]:
    """Get sample events for testing."""
    return mock_generator.generate_events(count)


def get_sample_bids_for_event(event: Event, count: int = 5) -> List[HotelBid]:
    """Get sample bids for a specific event."""
    return mock_generator.generate_hotel_bids([event])[:count]

# Global storage for runtime data
_runtime_bids = []
_runtime_events = []

def add_new_bid(bid_data: dict) -> str:
    """Add a new bid to the runtime mock data."""
    try:
        # Generate new bid ID
        existing_bids = len(_runtime_bids)
        bid_id = f"BID-NEW-{existing_bids + 1:03d}"
        
        # Create bid object
        from datetime import datetime
        new_bid = HotelBid(
            bid_id=bid_id,
            event_id=bid_data.get('event_id', 'EVT001'),
            hotel_name=bid_data['hotel_name'],
            hotel_chain=bid_data.get('hotel_chain', bid_data['hotel_name'].split()[0]),
            hotel_address=f"123 Business St",
            hotel_city=bid_data.get('city', 'Downtown'),
            hotel_country="USA",
            hotel_rating=4.5,
            contact_person=bid_data['contact_person'],
            contact_email=f"{bid_data['contact_person'].lower().replace(' ', '.')}@{bid_data['hotel_name'].lower().replace(' ', '')}.com",
            contact_phone="+1-555-123-4567",
            room_rate_per_night=float(bid_data['room_rate']),
            total_room_cost=float(bid_data['total_cost']) * 0.6,  # Estimate
            meeting_space_cost=5000,
            catering_cost_per_person=75,
            total_catering_cost=15000,
            av_equipment_cost=2000,
            service_fees=float(bid_data['total_cost']) * 0.08,
            taxes_and_fees=float(bid_data['total_cost']) * 0.12,
            total_cost=float(bid_data['total_cost']),
            rooms_available=50,
            meeting_rooms=["Conference Room A", "Boardroom"],
            max_meeting_capacity=200,
            amenities=["WiFi", "Parking", "AV Equipment"],
            cancellation_policy="Standard cancellation policy",
            deposit_required=float(bid_data['total_cost']) * 0.25,
            deposit_percentage=25,
            payment_terms="Net 30",
            submitted_date=datetime.now(),
            response_time_hours=2,
            status=BidStatus.SUBMITTED,
            past_events_with_us=5,
            success_rate=85.0,
            average_client_rating=4.3,
            competitive_advantages=["New bid", "AI processed"]
        )
        
        # Add to runtime storage
        _runtime_bids.append(new_bid)
        
        print(f"✅ Added new bid: {bid_id} for {bid_data['hotel_name']}")
        return bid_id
        
    except Exception as e:
        print(f"❌ Error adding bid: {e}")
        return None

def get_all_bids_including_new():
    """Get all bids including newly added ones."""
    # Get original mock bids
    original_data = mock_generator.generate_all_mock_data()
    all_bids = original_data['bids'].copy()
    
    # Add runtime bids
    all_bids.extend(_runtime_bids)
    
    return all_bids

# Global variable to store consistent data
_consistent_data = None

def get_enhanced_mock_data():
    """Get mock data including any newly added bids."""
    global _consistent_data
    
    # Only generate once, then reuse
    if _consistent_data is None:
        print("🏗️ Generating ONE-TIME static business data...")
        _consistent_data = mock_generator.generate_all_mock_data()
        print(f"✅ Static data locked: {len(_consistent_data['events'])} events, {len(_consistent_data['bids'])} bids")
    
    # Use the same base data every time
    original_data = _consistent_data.copy()
    
    # Add new runtime bids to the data
    if _runtime_bids:
        print(f"🔄 Adding {len(_runtime_bids)} runtime bids to business data")
        original_data['bids'].extend(_runtime_bids)
        
        # Log the added bids for debugging
        for bid in _runtime_bids:
            print(f"   Added runtime bid: {bid.hotel_name} - ${bid.total_cost:,}")
    
    # Update counts
    original_data['total_bids'] = len(original_data['bids'])
    
    # Update dashboard metrics to reflect new bids
    if _runtime_bids:
        # Recalculate pipeline value including new bids
        total_pipeline = sum([bid.total_cost for bid in original_data['bids']])
        original_data['dashboard'].total_pipeline_value = total_pipeline
        
        print(f"📊 Updated pipeline value to ${total_pipeline:,}")
    
    return original_data

def refresh_business_data_with_new_bids():
    """Refresh the business data to include new bids for AI chat."""
    return get_enhanced_mock_data()


if __name__ == "__main__":
    # Test the mock data generator
    print("🧪 Testing Mock Data Generator...")
    data = get_mock_data()
    
    print(f"\n📊 Generated Data Summary:")
    print(f"   Events: {len(data['events'])}")
    print(f"   Bids: {len(data['bids'])}")
    print(f"   Partners: {len(data['partners'])}")
    print(f"   Pipeline Value: ${data['dashboard'].total_pipeline_value:,.0f}")
    print(f"   Active Events: {data['dashboard'].active_events_count}")
    
    print(f"\n🎯 Sample Events:")
    for event in data['events'][:3]:
        print(f"   • {event.event_name} - {event.guest_count} guests - ${event.budget_max:,}")
    
    print("\n✅ Mock data generator working perfectly!")