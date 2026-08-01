import base64
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.responses import JSONResponse

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="SpeechSense transcription server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscribeRequest(BaseModel):
    audioBase64: str
    mimeType: str = "audio/webm"


def _transcribe_with_provider(audio_bytes: bytes):
    provider = os.getenv("TRANSCRIPTION_PROVIDER", "mock")
    if provider == "mock":
        return ""

    if provider == "azure":
        endpoint = os.getenv("AZURE_SPEECH_ENDPOINT")
        key = os.getenv("AZURE_SPEECH_KEY")
        if not endpoint or not key:
            raise RuntimeError("AZURE_SPEECH_ENDPOINT and AZURE_SPEECH_KEY are required")
        req = urllib.request.Request(
            f"{endpoint.rstrip('/')}/speechtotext/v3.1/transcriptions:transcribe",
            data=json.dumps({"audio": base64.b64encode(audio_bytes).decode("ascii")}).encode("utf-8"),
            headers={"Content-Type": "application/json", "Ocp-Apim-Subscription-Key": key},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            payload = json.load(response)
            return (payload.get("text") or "").strip()

    if provider == "openai":
        endpoint = os.getenv("OPENAI_TRANSCRIBE_URL")
        api_key = os.getenv("OPENAI_API_KEY")
        if not endpoint or not api_key:
            raise RuntimeError("OPENAI_TRANSCRIBE_URL and OPENAI_API_KEY are required")
        req = urllib.request.Request(
            endpoint,
            data=json.dumps({"audio": base64.b64encode(audio_bytes).decode("ascii")}).encode("utf-8"),
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            payload = json.load(response)
            return (payload.get("transcript") or "").strip()

    raise RuntimeError(f"Unsupported transcription provider: {provider}")

@app.get("/")
def serve_index():
    return FileResponse(BASE_DIR / "index.html")


@app.get("/index.html")
def serve_index_html():
    return FileResponse(BASE_DIR / "index.html")


@app.post("/api/transcribe")
def transcribe(req: TranscribeRequest):
    try:
        audio_bytes = base64.b64decode(req.audioBase64)
        if not audio_bytes:
            return JSONResponse({"transcript": ""}, status_code=400)

        text = _transcribe_with_provider(audio_bytes)
        return {"transcript": text}
    except Exception as exc:
        return JSONResponse({"transcript": "", "error": str(exc)}, status_code=500)


app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "3001")))
