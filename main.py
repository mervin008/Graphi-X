from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from apps.utils import router as calculator_router
from config import SERVER_URL, PORT, ENV
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="frnt"), name="static")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    with open("frnt/index.html") as f:
        return f.read()


app.include_router(calculator_router, prefix="/calculate", tags=["calculate"])

if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_URL, port=int(PORT), reload=(ENV == "dev"))