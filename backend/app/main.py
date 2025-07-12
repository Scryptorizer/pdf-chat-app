import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our modules
from core.config import get_settings
from core.pdf_processor import initialize_pdf_processor
from core.ai_client import validate_ai_setup
from services.chat_service import initialize_chat_service
from api.chat import router as chat_router
from api.health import router as health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    
    try:
        # Initialize Business Data
        logger.info("Loading business intelligence data...")
        from core.mock_data import get_mock_data
        business_data = get_mock_data()
        logger.info(f"✅ Business data loaded: {len(business_data['events'])} events, {len(business_data['bids'])} bids")  
        
        # Validate AI setup
        logger.info("Validating AI setup...")
        ai_valid = validate_ai_setup()
        if not ai_valid:
            logger.error("AI setup validation failed")
            raise RuntimeError("AI setup validation failed")
        
        logger.info("✅ AI setup validated successfully")
        
        # Initialize chat service
        logger.info("Initializing chat service...")
        chat_service = initialize_chat_service()
        logger.info("✅ Chat service initialized successfully")
        
        logger.info(f"🚀 {settings.app_name} startup complete!")
        
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    # Shutdown
    logger.info("Shutting down application...")
    logger.info("👋 Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="MCW Digital Event Bidding Intelligence Platform",
    version=settings.app_version,
    description="AI-powered Event Bidding Intelligence Platform - Business intelligence through conversation",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add routers
app.include_router(chat_router)
app.include_router(health_router)


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"The requested endpoint was not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )


@app.get("/")
async def root():
    """Root endpoint with application information."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs_url": "/docs",
        "health_check": "/health",
        "chat_endpoint": "/api/chat"
    }


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "name": "PDF Chat API",
        "version": settings.app_version,
        "endpoints": {
            "chat": "/api/chat",
            "conversations": "/api/conversations",
            "health": "/health",
            "status": "/status",
            "pdf_info": "/pdf-info"
        },
        "features": [
            "Real-time streaming responses",
            "PDF context integration",
            "Conversation management",
            "Export functionality",
            "Health monitoring"
        ]
    }


def create_app() -> FastAPI:
    """Factory function to create the FastAPI app."""
    return app


if __name__ == "__main__":
    """Run the application directly."""
    try:
        logger.info("Starting application server...")
        uvicorn.run(
            "main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level="info" if not settings.debug else "debug",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Application stopped by user")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)