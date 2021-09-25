use actix_web::{Error as ActixError, HttpResponse, ResponseError};
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper::Error as PGMError;
use tokio_postgres::Error as PGError;

#[derive(Display, From, Debug)]
pub enum JkError {
    NotFound,
    Unauthorized,
    PGError(PGError),
    PGMError(PGMError),
    PoolError(PoolError),
    ActixError(ActixError),
}

impl std::error::Error for JkError {}

#[derive(Serialize, Deserialize)]
pub struct ErrorMessage {
    error: &'static str,
    message: String,
}

impl ErrorMessage {
    pub fn not_found() -> Self {
        Self {
            error: "notFound",
            message: "Not found".into(),
        }
    }

    pub fn unauthorized() -> Self {
        Self {
            error: "unauthorized",
            message: "Unauthorized".into(),
        }
    }
}

impl ResponseError for JkError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            JkError::NotFound => HttpResponse::BadRequest().json(ErrorMessage::not_found()),

            JkError::Unauthorized => {
                HttpResponse::Unauthorized().json(ErrorMessage::unauthorized())
            }

            JkError::PoolError(ref err) => HttpResponse::InternalServerError().json(ErrorMessage {
                error: "internal.db.pool",
                message: err.to_string(),
            }),

            _ => HttpResponse::InternalServerError().json(ErrorMessage {
                error: "internal",
                message: "Internal server error".into(),
            }),
        }
    }
}
