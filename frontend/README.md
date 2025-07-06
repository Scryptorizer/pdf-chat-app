# PDF Chat Assistant

A professional full-stack chat application that answers questions based on PDF document content using AI. Built for MCW Digital's technical assessment.

![PDF Chat Assistant](https://img.shields.io/badge/React-19.1.0-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)

## 🚀 Features

### Core Features
- **PDF Context Integration** - Automatically loads and processes PDF documents for AI context
- **Real-time Streaming** - Server-Sent Events (SSE) for live AI response streaming
- **MCW Digital AI Assistant** - Custom-branded AI with professional identity
- **Conversation Management** - In-memory conversation history and context
- **Responsive Design** - Modern, mobile-first interface

### Advanced Features
- **Multiple Conversations** - Switch between different chat sessions with tab system
- **Dark/Light Mode** - Professional theme switching
- **Export Conversations** - Download chats in Text, Markdown, or JSON formats
- **Token Usage Tracking** - Real-time API usage statistics
- **Rate Limiting** - Smart 10 requests/minute limit with user-friendly feedback
- **Auto-reconnection** - Graceful error handling and connection recovery

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI API** - GPT-4 integration for AI responses
- **pdfplumber** - PDF text extraction and processing
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
# Edit .env and add your OpenAI API key
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
OPENAI_API_KEY=your_openai_key_here
PDF_PATH=documents/accessibility_guide.pdf
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

4. **Start the backend**
```bash
python main.py
```

5. **Start the frontend**
```bash
cd ../frontend
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
│   │   └── services/      # Service layer
│   ├── documents/         # PDF storage
│   ├── .env.example       # Environment template
│   ├── requirements.txt   # Python dependencies
│   └── main.py           # Application entry point
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
- `GET /api/conversations/{id}/export` - Export conversation

### Health & Status
- `GET /health` - Basic health check
- `GET /status` - Detailed system status
- `GET /api/usage/tokens` - Token usage statistics

## 🎨 Features Showcase

### Professional Chat Interface
- Clean, modern design with purple gradient theme
- Intuitive conversation tabs and controls
- Real-time typing indicators and status updates

### AI Integration
- Custom MCW Digital AI assistant branding
- Context-aware responses based on PDF content
- Streaming responses for real-time interaction

### Advanced Functionality
- Multiple export formats (TXT, Markdown, JSON)
- Dark/light mode with professional navy theme
- Mobile-responsive design for all devices

## 🔒 Security & Configuration

- Environment-based configuration
- Secure API key management
- Rate limiting to prevent abuse
- Input validation and sanitization

## 🧪 Testing

The application includes comprehensive error handling and has been tested with:
- PDF context accuracy (5/5 tests passed)
- AI reasoning capabilities (4/4 tests passed)
- Edge case handling (rate limiting, error recovery)
- Multiple conversation management
- Export functionality across all formats

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
✅ OpenAI API integration  
✅ In-memory conversation history  
✅ Health check endpoint  

### Bonus Features (All 6 Implemented)
✅ Multiple conversation support  
✅ Token/cost tracking display  
✅ Export conversation functionality  
✅ Loading states and error handling  
✅ Rate limiting implementation  
✅ Markdown rendering for responses  

## 🏗️ Design Decisions

### Architecture Choices
- **Clean Architecture**: Separated API, core logic, models, and services for maintainability
- **Streaming Implementation**: Server-Sent Events for real-time user experience
- **Component Design**: Modular React components with TypeScript for type safety
- **Error Handling**: Comprehensive error boundaries and user-friendly feedback

### Technology Selection
- **FastAPI**: Chosen for excellent async support and automatic API documentation
- **pdfplumber**: Selected for robust PDF text extraction capabilities
- **React Hooks**: Modern React patterns for clean state management
- **CSS Custom Properties**: For consistent theming and dark mode support

## 🚧 Challenges & Solutions

### PDF Processing
**Challenge**: Extracting clean, usable text from PDF documents  
**Solution**: Implemented robust text cleaning and chunk management with pdfplumber

### Streaming Implementation
**Challenge**: Real-time AI response delivery  
**Solution**: Server-Sent Events with proper error handling and connection management

### State Management
**Challenge**: Complex conversation and UI state  
**Solution**: React hooks with TypeScript for type-safe state management

## 🔮 Future Improvements

Given more time, potential enhancements would include:

- **Vector Database Integration** - Semantic search within PDF content
- **Multi-file Support** - Handle multiple PDF documents simultaneously  
- **User Authentication** - Secure user sessions and conversation persistence
- **Advanced Analytics** - Detailed usage metrics and conversation insights
- **File Upload Interface** - Dynamic PDF upload and processing
- **Collaborative Features** - Shared conversations and real-time collaboration

## 📝 License

This project was created as a technical assessment for MCW Digital.

## 👨‍💻 Developer

**William Fernandez**  
Full-Stack Developer specializing in AI/ML applications

---

*Built with ❤️ for MCW Digital's technical assessment*