use actix_web::{http::StatusCode, Error as ActixError, HttpResponse, ResponseError};
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper::Error as PGMError;
use tokio_postgres::Error as PGError;
use ts_rs::{export, TS};

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

impl JkError {
    pub fn error_and_message(&self) -> (&'static str, &'static str) {
        match self {
            JkError::NotFound => ("notFound", "Not found"),
            JkError::Unauthorized => ("unauthorized", "Unauthorized"),
            _ => ("internal", "Internal server error"),
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
pub struct ErrorMessage {
    status_code: u16,
    error: &'static str,
    message: &'static str,
}

export! { ErrorMessage => "frontend/src/rust-types/ErrorMessage.ts" }

impl ResponseError for JkError {
    fn status_code(&self) -> StatusCode {
        match self {
            JkError::NotFound => StatusCode::NOT_FOUND,
            JkError::Unauthorized => StatusCode::UNAUTHORIZED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        let (error, message) = self.error_and_message();

        HttpResponse::build(status_code).json(ErrorMessage {
            status_code: status_code.as_u16(),
            error,
            message,
        })
    }
}
