use actix_web::{HttpResponse, ResponseError};
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper::Error as PGMError;
use tokio_postgres::Error as PGError;

#[derive(Display, From, Debug)]
pub enum JkError {
  NotFound,
  PGError(PGError),
  PGMError(PGMError),
  PoolError(PoolError),
}

impl std::error::Error for JkError {}

#[derive(Serialize, Deserialize)]
pub struct ErrorMessage {
  id: &'static str,
  message: String,
}

impl ResponseError for JkError {
  fn error_response(&self) -> HttpResponse {
    match *self {
      JkError::NotFound => HttpResponse::BadRequest().json(ErrorMessage {
        id: "notFound",
        message: "Not found".into(),
      }),

      JkError::PoolError(ref err) => HttpResponse::InternalServerError().json(ErrorMessage {
        id: "internal.db.pool",
        message: err.to_string(),
      }),

      _ => HttpResponse::InternalServerError().json(ErrorMessage {
        id: "internal.other",
        message: "Internal server error".into(),
      }),
    }
  }
}
