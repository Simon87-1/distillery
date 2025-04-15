import asyncio
import logging
import time
from typing import List, Union, Annotated
import jwt

from fastapi import (
    FastAPI,
    Header,
    WebSocket,
    WebSocketDisconnect,
    Body
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import AnyHttpUrl, BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from starlette.middleware.sessions import SessionMiddleware
import json
import os
from typing import List, Dict, Any, Optional


class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:8000",
        "http://localhost:8005",
    ]
    TENANT_NAME: str = ""
    APP_CLIENT_ID: str = ""
    OPENAPI_CLIENT_ID: str = ""
    AUTH_POLICY_NAME: str = ""
    SCOPE_DESCRIPTION: str = "user_impersonation"
    CERNER_CLIENT_ID: str = ""
    CERNER_CLIENT_SECRET: str = ""
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    MIDDLEWARE_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="allow"
    )


settings = Settings()

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=settings.MIDDLEWARE_SECRET)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


async def validate_provider(provider_id: str) -> bool:
    return provider_id == "portal"


@app.websocket("/ws/distill")
async def ws_distill(websocket: WebSocket):
    await websocket.accept()
    try:
        provider_id = await websocket.receive_text()
        if True:#await validate_provider(provider_id):
            while True:
                data = await websocket.receive_json()
                total_rows = len(data["rows"])

                for id, _ in enumerate(data["rows"]):
                    await asyncio.sleep(1)
                    progress = (id + 1) / total_rows
                    await websocket.send_json({"progress": progress})

                res = eval(open("backend/src/dummy_response.txt", "r").read())

                await websocket.send_json(res)
        else:
            await websocket.close()
    except WebSocketDisconnect:
        pass

class SummaryData(BaseModel):
    sections: List[Dict[str, Any]]

@app.post("/generate-pdf")
async def generate_pdf(data: SummaryData):
    # In a real implementation, we would process the summary data here
    # and generate a dynamic PDF based on the data
    print(f"Received summary data with {len(data.sections)} sections")
    
    # For now, we'll just return a static PDF file
    pdf_path = os.path.join(os.path.dirname(__file__), "../../frontend/public/README.pdf")
    return FileResponse(pdf_path, media_type="application/pdf", filename="result.pdf")

if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.DEBUG)
    uvicorn.run(app, host="localhost", port=3000)
