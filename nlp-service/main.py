"""
NLP Service para FinzApp - Parseo de SMS y push bancarios.

API FastAPI que recibe mensajes bancarios (SMS o push) y extrae información
de transacciones: monto, comercio, tipo, fecha y hora.

Endpoints:
- POST /parse — Parsea un mensaje bancario
- POST /parse/batch — Parsea múltiples mensajes
- GET /health — Health check
- POST /feedback — Recibe feedback del usuario para mejorar reglas
"""

import json
import logging
from pathlib import Path
from typing import Optional, List
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from parser.sms_parser import SMSParser, TransactionType
from parser.push_parser import PushParser


# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar FastAPI app
app = FastAPI(
    title="FinzApp NLP Service",
    description="Parser de SMS y push bancarios para FinzApp",
    version="1.0.0",
)

# Inicializar parsers
sms_parser = SMSParser()
push_parser = PushParser()

# Path para guardar feedback
FEEDBACK_FILE = Path("/app/data/feedback.jsonl")
FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)


# Modelos Pydantic para requests/responses
class ParseRequest(BaseModel):
    """Request para parseo de mensaje."""
    raw_text: str
    sender: str
    source: str = "sms"  # "sms" o "push"
    package_name: Optional[str] = None  # Para push, Android package name
    title: Optional[str] = None  # Para push, título de notificación


class TransactionInfo(BaseModel):
    """Información de transacción extraída."""
    amount: Optional[float]
    merchant: Optional[str]
    type: str
    transaction_at: Optional[str]
    bank: str
    confidence: float


class ParseResponse(BaseModel):
    """Response del endpoint de parseo."""
    raw_text: str
    parsed: TransactionInfo
    extracted_fields: dict
    error: Optional[str] = None


class FeedbackRequest(BaseModel):
    """Request para feedback del usuario."""
    raw_text: str
    sender: str
    source: str = "sms"
    corrections: dict  # {field: corrected_value}
    notes: Optional[str] = None


class HealthResponse(BaseModel):
    """Response del health check."""
    status: str
    timestamp: str
    version: str


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns:
        HealthResponse con estado del servicio
    """
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
    )


@app.post("/parse", response_model=ParseResponse)
async def parse_message(request: ParseRequest):
    """
    Parsea un mensaje bancario (SMS o push).

    Args:
        request: ParseRequest con datos del mensaje

    Returns:
        ParseResponse con información extraída y confidence score

    Raises:
        HTTPException: Si hay error en parseo
    """
    try:
        # Validar entrada
        if not request.raw_text or not request.raw_text.strip():
            raise HTTPException(
                status_code=400,
                detail="raw_text no puede estar vacío"
            )

        if not request.sender or not request.sender.strip():
            raise HTTPException(
                status_code=400,
                detail="sender no puede estar vacío"
            )

        # Parsear según source
        if request.source.lower() == "push":
            result = push_parser.parse(
                raw_text=request.raw_text,
                package_name=request.package_name,
                title=request.title,
            )
        else:  # Default: SMS
            result = sms_parser.parse(
                raw_text=request.raw_text,
                sender=request.sender,
            )

        # Construir response
        parsed_info = TransactionInfo(
            amount=result.amount,
            merchant=result.merchant,
            type=result.transaction_type.value,
            transaction_at=result.transaction_at.isoformat() if result.transaction_at else None,
            bank=result.bank,
            confidence=round(result.confidence, 2),
        )

        response = ParseResponse(
            raw_text=request.raw_text,
            parsed=parsed_info,
            extracted_fields=result.extracted_fields,
        )

        logger.info(
            f"Parsed message from {result.bank}: amount={result.amount}, "
            f"merchant={result.merchant}, confidence={result.confidence}"
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing message: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al parsear mensaje: {str(e)}"
        )


@app.post("/parse/batch", response_model=List[ParseResponse])
async def parse_batch(requests: List[ParseRequest]):
    """
    Parsea múltiples mensajes bancarios en batch.

    Args:
        requests: Lista de ParseRequest

    Returns:
        Lista de ParseResponse

    Raises:
        HTTPException: Si hay error
    """
    try:
        if not requests:
            raise HTTPException(
                status_code=400,
                detail="requests no puede estar vacío"
            )

        if len(requests) > 100:
            raise HTTPException(
                status_code=400,
                detail="Máximo 100 mensajes por batch"
            )

        responses = []
        for req in requests:
            # Usar el endpoint individual pero sin lanzar excepciones
            try:
                if req.source.lower() == "push":
                    result = push_parser.parse(
                        raw_text=req.raw_text,
                        package_name=req.package_name,
                        title=req.title,
                    )
                else:
                    result = sms_parser.parse(
                        raw_text=req.raw_text,
                        sender=req.sender,
                    )

                parsed_info = TransactionInfo(
                    amount=result.amount,
                    merchant=result.merchant,
                    type=result.transaction_type.value,
                    transaction_at=result.transaction_at.isoformat() if result.transaction_at else None,
                    bank=result.bank,
                    confidence=round(result.confidence, 2),
                )

                response = ParseResponse(
                    raw_text=req.raw_text,
                    parsed=parsed_info,
                    extracted_fields=result.extracted_fields,
                )
                responses.append(response)

            except Exception as e:
                logger.error(f"Error parsing message in batch: {str(e)}")
                responses.append(ParseResponse(
                    raw_text=req.raw_text,
                    parsed=TransactionInfo(
                        amount=None,
                        merchant=None,
                        type="unknown",
                        transaction_at=None,
                        bank="Unknown",
                        confidence=0.0,
                    ),
                    extracted_fields={},
                    error=str(e),
                ))

        logger.info(f"Batch parsed: {len(responses)} messages")
        return responses

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch parsing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error en parseo batch: {str(e)}"
        )


@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Recibe feedback del usuario para mejorar reglas del parser.

    Guarda en archivo JSONL para análisis posterior.

    Args:
        request: FeedbackRequest con texto original y correcciones

    Returns:
        JSON con confirmación

    Raises:
        HTTPException: Si hay error al guardar
    """
    try:
        # Crear registro de feedback
        feedback_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "raw_text": request.raw_text,
            "sender": request.sender,
            "source": request.source,
            "corrections": request.corrections,
            "notes": request.notes,
        }

        # Guardar a archivo JSONL
        with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_record, ensure_ascii=False) + "\n")

        logger.info(
            f"Feedback received for message from {request.sender}: "
            f"corrections={request.corrections}"
        )

        return {
            "status": "ok",
            "message": "Feedback guardado exitosamente",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error saving feedback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar feedback: {str(e)}"
        )


@app.get("/stats")
async def get_stats():
    """
    Obtiene estadísticas del servicio.

    Returns:
        JSON con conteo de feedback y otros stats
    """
    try:
        feedback_count = 0
        if FEEDBACK_FILE.exists():
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                feedback_count = sum(1 for _ in f)

        return {
            "status": "ok",
            "feedback_count": feedback_count,
            "service_version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler para excepciones HTTP."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler para excepciones generales."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
