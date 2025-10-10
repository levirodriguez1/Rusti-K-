from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from io import BytesIO
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ARQUEO Models
class Gasto(BaseModel):
    concepto: str
    monto: float

class ArqueoCreate(BaseModel):
    tienda: str
    responsable: str
    fecha: datetime = Field(default_factory=datetime.now)
    fondo_inicial: float
    venta_tarjetas: float
    # Córdobas por denominación
    cordobas_1: int = 0
    cordobas_5: int = 0
    cordobas_10: int = 0
    cordobas_20: int = 0
    cordobas_50: int = 0
    cordobas_100: int = 0
    cordobas_500: int = 0
    # Dólares por denominación
    dolares_1: int = 0
    dolares_5: int = 0
    dolares_10: int = 0
    dolares_20: int = 0
    dolares_50: int = 0
    dolares_100: int = 0
    # Gastos
    gastos: List[Gasto] = []

class Arqueo(ArqueoCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total_cordobas: float = 0
    total_dolares: float = 0
    total_dolares_cordobas: float = 0
    total_gastos: float = 0
    total_final: float = 0

# Exchange rate constant
EXCHANGE_RATE = 36.5

# Helper function to calculate totals
def calculate_totals(arqueo_data: dict) -> dict:
    # Calculate córdobas total
    total_cordobas = (
        arqueo_data.get('cordobas_1', 0) * 1 +
        arqueo_data.get('cordobas_5', 0) * 5 +
        arqueo_data.get('cordobas_10', 0) * 10 +
        arqueo_data.get('cordobas_20', 0) * 20 +
        arqueo_data.get('cordobas_50', 0) * 50 +
        arqueo_data.get('cordobas_100', 0) * 100 +
        arqueo_data.get('cordobas_500', 0) * 500
    )
    
    # Calculate dollars total
    total_dolares = (
        arqueo_data.get('dolares_1', 0) * 1 +
        arqueo_data.get('dolares_5', 0) * 5 +
        arqueo_data.get('dolares_10', 0) * 10 +
        arqueo_data.get('dolares_20', 0) * 20 +
        arqueo_data.get('dolares_50', 0) * 50 +
        arqueo_data.get('dolares_100', 0) * 100
    )
    
    # Convert dollars to córdobas
    total_dolares_cordobas = total_dolares * EXCHANGE_RATE
    
    # Calculate total expenses
    total_gastos = sum(gasto.get('monto', 0) for gasto in arqueo_data.get('gastos', []))
    
    # Calculate final total
    total_final = (
        arqueo_data.get('fondo_inicial', 0) +
        arqueo_data.get('venta_tarjetas', 0) +
        total_cordobas +
        total_dolares_cordobas -
        total_gastos
    )
    
    return {
        'total_cordobas': total_cordobas,
        'total_dolares': total_dolares,
        'total_dolares_cordobas': total_dolares_cordobas,
        'total_gastos': total_gastos,
        'total_final': total_final
    }

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "ARQUEO API - Sistema de Gestión Financiera"}

@api_router.post("/arqueo", response_model=Arqueo)
async def create_arqueo(input: ArqueoCreate):
    try:
        arqueo_dict = input.dict()
        
        # Calculate totals
        totals = calculate_totals(arqueo_dict)
        arqueo_dict.update(totals)
        
        # Create arqueo object
        arqueo_obj = Arqueo(**arqueo_dict)
        
        # Insert into database
        result = await db.arqueos.insert_one(arqueo_obj.dict())
        
        return arqueo_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/arqueo", response_model=List[Arqueo])
async def get_arqueos():
    try:
        arqueos = await db.arqueos.find().sort("fecha", -1).to_list(1000)
        return [Arqueo(**arqueo) for arqueo in arqueos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/arqueo/{arqueo_id}", response_model=Arqueo)
async def get_arqueo(arqueo_id: str):
    try:
        arqueo = await db.arqueos.find_one({"id": arqueo_id})
        if not arqueo:
            raise HTTPException(status_code=404, detail="Arqueo not found")
        return Arqueo(**arqueo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/arqueo/{arqueo_id}/pdf")
async def generate_pdf(arqueo_id: str):
    try:
        # Get arqueo data
        arqueo = await db.arqueos.find_one({"id": arqueo_id})
        if not arqueo:
            raise HTTPException(status_code=404, detail="Arqueo not found")
        
        # Create PDF in memory
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # PDF Content
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, height - 50, "ARQUEO - Sistema de Gestión Financiera")
        
        pdf.setFont("Helvetica", 12)
        y_position = height - 100
        
        # Basic info
        pdf.drawString(50, y_position, f"Tienda: {arqueo['tienda']}")
        y_position -= 20
        pdf.drawString(50, y_position, f"Responsable: {arqueo['responsable']}")
        y_position -= 20
        pdf.drawString(50, y_position, f"Fecha: {arqueo['fecha']}")
        y_position -= 40
        
        # Financial details
        pdf.drawString(50, y_position, f"Fondo Inicial: C$ {arqueo['fondo_inicial']:.2f}")
        y_position -= 20
        pdf.drawString(50, y_position, f"Venta con Tarjetas: C$ {arqueo['venta_tarjetas']:.2f}")
        y_position -= 20
        pdf.drawString(50, y_position, f"Total Córdobas: C$ {arqueo['total_cordobas']:.2f}")
        y_position -= 20
        pdf.drawString(50, y_position, f"Total Dólares: US$ {arqueo['total_dolares']:.2f} (C$ {arqueo['total_dolares_cordobas']:.2f})")
        y_position -= 20
        pdf.drawString(50, y_position, f"Total Gastos: C$ {arqueo['total_gastos']:.2f}")
        y_position -= 20
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y_position, f"TOTAL FINAL: C$ {arqueo['total_final']:.2f}")
        
        pdf.save()
        buffer.seek(0)
        
        # Convert to base64
        pdf_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            "pdf_base64": pdf_base64,
            "filename": f"arqueo_{arqueo['tienda']}_{arqueo_id}.pdf"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()