use std::io::{Error, ErrorKind};

use actix_web::{http::StatusCode, web, Error as ActixError, HttpResponse, ResponseError};
use config::ConfigError;
use deadpool_postgres::config::ConfigError as PoolConfigError;
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper::Error as PGMError;
use tokio_postgres::Error as PGError;
use ts_rs::{export, TS};
use validator::{Validate, ValidationErrors};

#[derive(Display, From, Debug)]
pub enum JkError {
    NotFound,
    Unauthorized,
    AlreadyExists,
    ConfigError(ConfigError),
    PGError(PGError),
    PGMError(PGMError),
    PoolError(PoolError),
    PoolConfigError(PoolConfigError),
    ActixError(ActixError),
    ValidationError(ValidationErrors),
}

impl std::error::Error for JkError {}

impl JkError {
    pub fn errorcode(&self) -> ErrorCode {
        match self {
            JkError::NotFound => ErrorCode::NotFound,
            JkError::Unauthorized => ErrorCode::Unauthorized,
            JkError::PGError(error) if Self::is_unique_constraint_violation(error) => {
                ErrorCode::AlreadyExists
            }
            JkError::ValidationError(_) => ErrorCode::ValidationError,
            _ => ErrorCode::Internal,
        }
    }

    pub fn is_unique_constraint_violation(error: &PGError) -> bool {
        error
            .to_string()
            .contains("duplicate key value violates unique constrain")
    }
}

impl From<JkError> for Error {
    fn from(error: JkError) -> Self {
        match error {
            JkError::PoolError(_) => Error::new(
                ErrorKind::ConnectionRefused,
                format!(
                    "Could not initialize a database pool (probably invalid host or credentials, or Postgres is not running)",
                ),
            ),
            JkError::ConfigError(error) => Error::new(
                ErrorKind::InvalidData,
                format!("Invalid configuration: {}", error.to_string()),
            ),
            JkError::ActixError(error) => Error::new(
                ErrorKind::Other,
                format!("Actix error: {}", error.to_string()),
            ),
            _ => Error::new(ErrorKind::Other, "Unexpected error"),
        }
    }
}

#[derive(Serialize, TS)]
pub struct ErrorMessage {
    status_code: u16,
    error: ErrorCode,
    message: &'static str,
    info: Option<String>,
}

#[derive(Serialize, Deserialize, TS)]
pub enum ErrorCode {
    NotFound,
    Unauthorized,
    AlreadyExists,
    Internal,
    ValidationError,
}

impl ErrorCode {
    fn message(&self) -> &'static str {
        match self {
            ErrorCode::NotFound => "Not found",
            ErrorCode::Unauthorized => "Unauthorized",
            ErrorCode::AlreadyExists => "Already exists",
            ErrorCode::Internal => "Internal server error",
            ErrorCode::ValidationError => "Validation error",
        }
    }
}

export! {
   ErrorMessage => "frontend/src/rust-types/ErrorMessage.ts",
   ErrorCode => "frontend/src/rust-types/ErrorCode.ts",
}

impl ResponseError for JkError {
    fn status_code(&self) -> StatusCode {
        match self {
            JkError::NotFound => StatusCode::NOT_FOUND,
            JkError::Unauthorized => StatusCode::UNAUTHORIZED,
            JkError::PGError(error) if Self::is_unique_constraint_violation(error) => {
                StatusCode::CONFLICT
            }
            JkError::ValidationError(_) => StatusCode::BAD_REQUEST,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        let error = self.errorcode();
        let message = error.message();
        let info = match self {
            JkError::ValidationError(errors) => Some(errors.to_string()),
            _ => None,
        };

        HttpResponse::build(status_code).json(ErrorMessage {
            status_code: status_code.as_u16(),
            error,
            message,
            info,
        })
    }
}
