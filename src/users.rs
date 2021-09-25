use crate::database::get_client;
use crate::database::query;
use crate::database::query_one;
use crate::errors::JkError;
use actix_web::{get, web, HttpResponse, Responder};
use deadpool_postgres::Client;
use deadpool_postgres::Pool;
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "users")]
pub struct User {
    pub username: String,
}

pub async fn get_user(client: &Client, username: &str) -> Result<User, JkError> {
    query_one::<User>(
        client,
        "SELECT username FROM users WHERE username = $1",
        &[&username],
    )
    .await
}

pub async fn get_users(client: &Client) -> Result<Vec<User>, JkError> {
    query::<User>(client, "SELECT username FROM users", &[]).await
}

#[get("")]
async fn get_users_route(db_pool: web::Data<Pool>) -> Result<impl Responder, JkError> {
    let users = get_users(&get_client(db_pool).await?).await?;
    Ok(HttpResponse::Ok().json(users))
}

#[get("/{username}")]
async fn get_user_route(
    web::Path(username): web::Path<String>,
    db_pool: web::Data<Pool>,
) -> Result<impl Responder, JkError> {
    let user = get_user(&get_client(db_pool).await?, &username).await?;
    Ok(HttpResponse::Ok().json(user))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_users_route).service(get_user_route);
}
