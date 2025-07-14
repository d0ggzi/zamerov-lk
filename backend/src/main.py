import fastapi

from fastapi.middleware.cors import CORSMiddleware

from src.api.auth import auth_router, user_router
from src.api.order import order_router
from src.api.request import request_router
from src.api.service import service_router
from src.utils.middleware import catch_exceptions_middleware

app = fastapi.FastAPI()
app.middleware("http")(catch_exceptions_middleware)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(service_router)
app.include_router(request_router)
app.include_router(order_router)
