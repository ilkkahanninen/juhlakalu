use actix_web::{get, web, HttpResponse};

use crate::{
    database::{DbClient, DbPool},
    errors::JkError,
};

#[get("/reset")]
pub async fn reset_fixtures(db_pool: web::Data<DbPool>) -> Result<HttpResponse, JkError> {
    let client = DbClient::from_data(db_pool).await?;
    client.drop_schema().await?;
    client.create_schema().await?;
    client.load_fixtures().await?;
    Ok(HttpResponse::Ok().finish())
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    println!("***** WARNING: Running in test mode *****");
    cfg.service(reset_fixtures);
}
