import logging
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models.chat_models import HealthResponse, AppStatus, PDFInfo
from core.config import get_settings
from core.pdf_processor import get_pdf_processor
from core.ai_client import validate_ai_setup

logger = logging.getLogger(__name__)
settings = get_settings()

# Create router for health endpoints
router = APIRouter(tags=["health"])

# Track application start time for uptime calculation
_app_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint as required by specifications.
    Returns comprehensive health status of all system components.
    """
    try:
        # Check PDF processor status
        pdf_processor = get_pdf_processor()
        pdf_loaded = pdf_processor is not None
        
        if pdf_loaded:
            try:
                # Verify PDF is actually accessible
                pdf_text = pdf_processor.get_full_text()
                pdf_loaded = bool(pdf_text and len(pdf_text) > 0)
            except Exception as e:
                logger.warning(f"PDF processor check failed: {e}")
                pdf_loaded = False
        
        # Check OpenAI API status
        openai_available = False
        try:
            openai_available = validate_ai_setup()
        except Exception as e:
            logger.warning(f"OpenAI validation failed: {e}")
            openai_available = False
        
        # Calculate uptime
        uptime_seconds = time.time() - _app_start_time
        
        # Determine overall status
        status = "healthy" if (pdf_loaded and openai_available) else "degraded"
        if not pdf_loaded and not openai_available:
            status = "unhealthy"
        
        return HealthResponse(
            status=status,
            version=settings.app_version,
            pdf_loaded=pdf_loaded,
            openai_available=openai_available,
            uptime=uptime_seconds
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="error",
            version=settings.app_version,
            pdf_loaded=False,
            openai_available=False,
            uptime=time.time() - _app_start_time
        )


@router.get("/status", response_model=AppStatus)
async def detailed_status():
    """
    Detailed application status with component breakdown.
    More comprehensive than basic health check.
    """
    try:
        # Check individual components
        components = {}
        
        # PDF Component
        pdf_processor = get_pdf_processor()
        pdf_status = False
        pdf_info = None
        
        if pdf_processor:
            try:
                pdf_text = pdf_processor.get_full_text()
                pdf_status = bool(pdf_text and len(pdf_text) > 0)
                
                if pdf_status:
                    stats = pdf_processor.get_summary_stats()
                    pdf_info = PDFInfo(
                        title=stats.get('metadata', {}).get('title', 'Unknown'),
                        total_pages=stats.get('total_pages', 0),
                        total_words=stats.get('total_words', 0),
                        total_characters=stats.get('total_characters', 0),
                        author=stats.get('metadata', {}).get('author', None),
                        creator=stats.get('metadata', {}).get('creator', None)
                    )
            except Exception as e:
                logger.warning(f"PDF status check failed: {e}")
                pdf_status = False
        
        components['pdf_processor'] = pdf_status
        
        # AI Component
        ai_status = False
        try:
            ai_status = validate_ai_setup()
        except Exception as e:
            logger.warning(f"AI status check failed: {e}")
            ai_status = False
        
        components['openai_api'] = ai_status
        
        # Configuration Component
        config_status = True
        try:
            # Basic config validation
            if not settings.openai_api_key:
                config_status = False
            if not settings.pdf_path:
                config_status = False
        except Exception:
            config_status = False
        
        components['configuration'] = config_status
        
        # Determine overall status
        all_healthy = all(components.values())
        some_healthy = any(components.values())
        
        if all_healthy:
            overall_status = "healthy"
        elif some_healthy:
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        return AppStatus(
            app_name=settings.app_name,
            version=settings.app_version,
            status=overall_status,
            components=components,
            pdf_info=pdf_info
        )
        
    except Exception as e:
        logger.error(f"Detailed status check failed: {e}")
        return AppStatus(
            app_name=settings.app_name,
            version=settings.app_version,
            status="error",
            components={
                'pdf_processor': False,
                'openai_api': False,
                'configuration': False
            }
        )


@router.get("/ping")
async def ping():
    """
    Simple ping endpoint for basic connectivity testing.
    """
    return {
        "message": "pong",
        "timestamp": datetime.now().isoformat(),
        "status": "ok"
    }


@router.get("/version")
async def get_version():
    """
    Get application version information.
    """
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug
    }


@router.get("/pdf-info")
async def get_pdf_info():
    """
    Get information about the loaded PDF document.
    """
    try:
        pdf_processor = get_pdf_processor()
        if not pdf_processor:
            raise HTTPException(status_code=503, detail="PDF processor not available")
        
        stats = pdf_processor.get_summary_stats()
        return {
            "pdf_loaded": True,
            "title": stats.get('metadata', {}).get('title', 'Unknown'),
            "total_pages": stats.get('total_pages', 0),
            "total_words": stats.get('total_words', 0),
            "total_characters": stats.get('total_characters', 0),
            "author": stats.get('metadata', {}).get('author', None),
            "creator": stats.get('metadata', {}).get('creator', None),
            "avg_words_per_page": stats.get('avg_words_per_page', 0)
        }
        
    except Exception as e:
        logger.error(f"Error getting PDF info: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving PDF information: {str(e)}")


@router.get("/readiness")
async def readiness_check():
    """
    Kubernetes-style readiness probe.
    Returns 200 if app is ready to serve traffic.
    """
    try:
        # Check critical components
        pdf_processor = get_pdf_processor()
        pdf_ready = pdf_processor is not None
        
        if pdf_ready:
            try:
                pdf_text = pdf_processor.get_full_text()
                pdf_ready = bool(pdf_text and len(pdf_text) > 0)
            except Exception:
                pdf_ready = False
        
        ai_ready = validate_ai_setup()
        
        if pdf_ready and ai_ready:
            return {"status": "ready", "timestamp": datetime.now().isoformat()}
        else:
            raise HTTPException(
                status_code=503,
                detail={
                    "status": "not_ready",
                    "pdf_ready": pdf_ready,
                    "ai_ready": ai_ready,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={"status": "error", "error": str(e), "timestamp": datetime.now().isoformat()}
        )