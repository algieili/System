from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS (only once)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"backend": "working"}

from supabase_client import supabase

@app.get("/supabase-test")
def supabase_test():
    try:
        res = supabase.table("tasks").select("*").limit(1).execute()

        return {
            "supabase": "connected",
            "data": res.data
        }

    except Exception as e:
        return {
            "supabase": "error",
            "message": str(e)
        }
