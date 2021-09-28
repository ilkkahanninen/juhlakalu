use actix_web::{get, web, HttpResponse};
use deadpool_postgres::Pool;

use crate::{
    database::{get_client, load_fixtures},
    errors::JkError,
};

#[get("/reset")]
pub async fn reset_fixtures(db_pool: web::Data<Pool>) -> Result<HttpResponse, JkError> {
    let client = get_client(db_pool).await?;
    load_fixtures(&client).await?;
    Ok(HttpResponse::Ok().finish())
}

#[get("")]
pub async fn ack() -> HttpResponse {
    HttpResponse::Ok().body("ack")
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    println!("***** WARNING: Running in test mode *****");
    cfg.service(reset_fixtures).service(ack);
}
