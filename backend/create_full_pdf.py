from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

def create_full_accessibility_pdf():
    doc = SimpleDocTemplate("documents/accessibility_guide.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title Page
    story.append(Paragraph("Accessible Travel Around the World: A Guide to Handicap Laws and Regulations", styles['Title']))
    story.append(PageBreak())
    
    # Page 1: Introduction
    story.append(Paragraph("Page 1: Introduction", styles['Heading2']))
    story.append(Paragraph("Travel should be an enriching experience for everyone, regardless of physical ability. This guide explores global accessibility, highlights the rights of disabled travelers, and provides practical tools and legal knowledge to navigate the world with confidence. From legal protections to local infrastructure, this resource is designed to empower and inform.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 2: Why Accessibility Matters
    story.append(Paragraph("Page 2: Why Accessibility Matters", styles['Heading2']))
    story.append(Paragraph("Accessibility is more than convenience; it's a fundamental right. For the 1.3 billion people globally who experience significant disability, travel can be full of obstacles. From poorly designed facilities to unclear policies, barriers persist. But with better understanding and awareness, these barriers can be removed. This page explores the human, social, and economic importance of accessible tourism.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 3: Legal Framework Overview
    story.append(Paragraph("Page 3: Legal Framework Overview", styles['Heading2']))
    story.append(Paragraph("The UN Convention on the Rights of Persons with Disabilities (CRPD) is the cornerstone of global disability rights. It calls for equal access to transportation, information, and tourism. Over 180 countries are parties to the CRPD, though implementation varies. This section introduces key global treaties and summarizes how nations incorporate disability rights into their laws.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 4: North America - Overview
    story.append(Paragraph("Page 4: North America - Overview", styles['Heading2']))
    story.append(Paragraph("North America offers some of the world's most comprehensive accessibility protections. The U.S. and Canada lead in legal enforcement, while Mexico is making gradual improvements. This section provides a high-level comparison of their legal frameworks and real-world accessibility outcomes.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 5: United States - ADA Overview
    story.append(Paragraph("Page 5: United States - ADA Overview", styles['Heading2']))
    story.append(Paragraph("The Americans with Disabilities Act (ADA) of 1990 prohibits discrimination and mandates accessibility in public life. This includes transportation, hotels, websites, and tourism services. The ADA is strictly enforced, making the U.S. a highly accessible destination for travelers with disabilities.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 6: United States - Transportation Access
    story.append(Paragraph("Page 6: United States - Transportation Access", styles['Heading2']))
    story.append(Paragraph("Airlines must comply with the Air Carrier Access Act (ACAA), providing boarding assistance and accessible seating. Public transit systems in major cities have wheelchair-accessible buses, subways, and stations. Amtrak offers accessible seating and restrooms. Rideshare companies are also beginning to provide adaptive vehicle options.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 7: United States - Accommodations and Attractions
    story.append(Paragraph("Page 7: United States - Accommodations and Attractions", styles['Heading2']))
    story.append(Paragraph("Hotels must provide accessible rooms with roll-in showers, visual alarms, and compliant doorways. Museums, national parks, and historic sites typically include ramps, audio guides, and wheelchair rentals. Disney parks, the Smithsonian, and the National Parks Service are leaders in inclusive design.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 8: Canada - Accessibility Standards
    story.append(Paragraph("Page 8: Canada - Accessibility Standards", styles['Heading2']))
    story.append(Paragraph("Canada's Accessible Canada Act (ACA) of 2019 promotes barrier-free access in federally regulated sectors. Provincial laws like Ontario's AODA (Accessibility for Ontarians with Disabilities Act) go further in requiring accessible business practices. Major cities like Toronto and Vancouver offer strong public infrastructure and accessible transit.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 9: Mexico - Challenges and Progress
    story.append(Paragraph("Page 9: Mexico - Challenges and Progress", styles['Heading2']))
    story.append(Paragraph("Mexico passed a General Law for the Inclusion of People with Disabilities in 2011, yet real-world enforcement remains inconsistent. Tourist hubs like Cancún and Mexico City are becoming more accessible, but rural areas lag behind. This section highlights key resources and destinations.", styles['Normal']))
    story.append(PageBreak())
    
    # Page 10: Central America - Regional Overview
    story.append(Paragraph("Page 10: Central America - Regional Overview", styles['Heading2']))
    story.append(Paragraph("Costa Rica has emerged as a leader, promoting eco-tourism with accessible lodges and national parks. Panama's public transit upgrades and infrastructure projects are steps forward, but widespread challenges remain due to geography and funding. Travelers are advised to contact services in advance.", styles['Normal']))
    
    doc.build(story)
    print("✅ Created full 10-page accessibility_guide.pdf successfully!")
    print("📄 The PDF now contains all 10 pages of content.")

if __name__ == "__main__":
    create_full_accessibility_pdf()