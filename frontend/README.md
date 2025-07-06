# PDF Chat Assistant

A professional full-stack chat application that answers questions based on PDF document content using AI. Built for MCW Digital's technical assessment.

![PDF Chat Assistant](https://img.shields.io/badge/React-19.1.0-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue) ![Anthropic](https://img.shields.io/badge/Anthropic-Claude--4-purple)

## 🚀 Features

### Core Features
- **PDF Context Integration** - Automatically loads and processes PDF documents for AI context
- **Real-time Streaming** - Server-Sent Events (SSE) for live AI response streaming
- **MCW Digital AI Assistant** - Custom-branded AI with professional identity
- **Conversation Management** - In-memory conversation history and context
- **Responsive Design** - Modern, mobile-first interface

### Advanced Features
- **Multiple Conversations** - Switch between different chat sessions with tab system
- **Professional AI Branding** - MCW Digital identity with no external AI provider mentions
- **Smart Context Handling** - Accurate page references and contextual responses
- **Clear Conversation Controls** - Easy reset and conversation management
- **Enhanced Error Handling** - Graceful degradation and user-friendly feedback
- **Mobile-Responsive Design** - Optimized for all device sizes

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Anthropic API** - Claude 4 Sonnet integration for AI responses
- **PyPDF2** - PDF text extraction and processing
- **Server-Sent Events** - Real-time streaming implementation
- **Pydantic** - Data validation and serialization

### Frontend
- **React 19.1** - Latest React with hooks
- **TypeScript** - Type-safe development
- **CSS3** - Custom responsive design with gradients
- **ReactMarkdown** - AI response formatting

### Architecture
- **Clean Architecture** - Separated concerns (api/core/models/services)
- **Professional Error Handling** - Comprehensive error boundaries
- **Environment Configuration** - Secure API key management
- **RESTful API Design** - Standard HTTP methods and status codes

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your Anthropic API key
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd pdf-chat-app
```

2. **Backend Configuration**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

3. **Environment Setup**
Create `backend/.env` with:
```env
ANTHROPIC_API_KEY=your_anthropic_key_here
PDF_PATH=documents/accessibility_guide.pdf
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

4. **Start the backend**
```bash
cd backend/app
python main.py
```

5. **Start the frontend**
```bash
cd frontend
npm install
npm start
```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
pdf-chat-app/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── core/          # Business logic & utilities
│   │   ├── models/        # Pydantic data models
│   │   ├── services/      # Service layer
│   │   └── main.py       # Application entry point
│   ├── documents/         # PDF storage
│   ├── .env.example       # Environment template
│   ├── requirements.txt   # Python dependencies
│   └── application.py     # AWS deployment entry point
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   ├── App.css       # Styling
│   │   └── index.tsx     # Entry point
│   ├── package.json      # Node dependencies
│   └── public/           # Static assets
└── README.md
```

## 🔧 API Endpoints

### Chat
- `POST /api/chat` - Send message and receive streaming response
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/{id}` - Get specific conversation
- `DELETE /api/conversations/{id}` - Clear conversation

### Health & Status
- `GET /health` - Basic health check
- `GET /status` - Detailed system status

## 🎨 Features Showcase

### Professional Chat Interface
- Clean, modern design with responsive layout
- Intuitive conversation tabs and controls
- Real-time AI responses with proper streaming

### AI Integration
- Custom MCW Digital AI assistant branding
- Context-aware responses based on PDF content
- Professional identity management (no external AI provider mentions)
- Accurate page references and citations

### Advanced Functionality
- Multiple conversation support with tab switching
- Clear conversation controls
- Mobile-responsive design for all devices
- Enhanced error handling and user feedback

## 🔒 Security & Configuration

- Environment-based configuration
- Secure API key management
- Input validation and sanitization
- Professional error handling

## 🧪 Testing

The application has been thoroughly tested with:
- PDF context accuracy (✅ Verified with accessibility document)
- AI reasoning capabilities (✅ Proper responses with page citations)
- Multiple conversation management (✅ Tab switching works correctly)
- Clear conversation functionality (✅ Reset working properly)
- Cross-tab conversation isolation (✅ Separate conversation states)
- Professional AI branding (✅ MCW Digital identity maintained)

## 📈 Performance

- Real-time streaming responses
- Efficient PDF processing and caching
- Optimized React rendering
- Minimal API call overhead

## 🎯 Assessment Compliance

### Core Requirements (100% Complete)
✅ Single page React chat interface  
✅ FastAPI backend with streaming SSE  
✅ PDF context loading on startup  
✅ Anthropic API integration  
✅ In-memory conversation history  
✅ Health check endpoint  

### Bonus Features Implemented
✅ **Multiple conversation support** - Tab-based conversation switching  
✅ **Enhanced error handling** - Professional user-friendly feedback  
✅ **Professional AI branding** - MCW Digital identity with no external provider mentions  
✅ **Smart context handling** - Accurate page references and citations  
✅ **Mobile responsive design** - Optimized for all devices  
✅ **Clear conversation controls** - Easy conversation management  

## 🏗️ Design Decisions

### Architecture Choices
- **Clean Architecture**: Separated API, core logic, models, and services for maintainability
- **Streaming Implementation**: Server-Sent Events for real-time user experience
- **Component Design**: Modular React components with TypeScript for type safety
- **Error Handling**: Comprehensive error boundaries and user-friendly feedback

### Technology Selection
- **FastAPI**: Chosen for excellent async support and automatic API documentation
- **Anthropic Claude 4**: Selected for superior reasoning and context handling capabilities
- **React Hooks**: Modern React patterns for clean state management
- **CSS Custom Properties**: For consistent theming and responsive design

### AI Integration Strategy
- **Professional Branding**: MCW Digital identity maintained throughout
- **Context Management**: Smart PDF content integration with accurate citations
- **Response Quality**: Claude 4 Sonnet for superior comprehension and reasoning

## 🚧 Challenges & Solutions

### API Key Migration
**Challenge**: Original OpenAI key became invalid during development  
**Solution**: Successfully migrated to Anthropic API with improved response quality and maintained all functionality

### PDF Processing
**Challenge**: Extracting clean, usable text from PDF documents  
**Solution**: Implemented robust text cleaning and chunk management with PyPDF2

### Streaming Implementation
**Challenge**: Real-time AI response delivery  
**Solution**: Server-Sent Events with proper error handling and connection management

### Professional Branding
**Challenge**: Maintaining MCW Digital identity while using external AI services  
**Solution**: Custom system prompts and response filtering to ensure professional branding

## 🔮 Future Improvements

Given more time, potential enhancements would include:

- **Vector Database Integration** - Semantic search within PDF content
- **Multi-file Support** - Handle multiple PDF documents simultaneously  
- **User Authentication** - Secure user sessions and conversation persistence
- **Advanced Analytics** - Detailed usage metrics and conversation insights
- **File Upload Interface** - Dynamic PDF upload and processing
- **Export Functionality** - Download conversations in multiple formats

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend/app
python main.py

# Frontend
cd frontend
npm start
```

### AWS Elastic Beanstalk Ready
- Includes `application.py` for AWS deployment
- Environment configuration for production
- Scalable FastAPI backend architecture

## 📝 License

This project was created as a technical assessment for MCW Digital.

## 👨‍💻 Developer

**William Fernandez**  
Full-Stack Developer specializing in AI/ML applications  
*"Building intelligent solutions with clean, maintainable code"*

---

*Built with ❤️ for MCW Digital's technical assessment*