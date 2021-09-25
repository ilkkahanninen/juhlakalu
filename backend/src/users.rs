use crate::auth::validate_admin_role;
use crate::database::get_client;
use crate::database::query;
use crate::database::query_one;
use crate::errors::JkError;
use actix_session::Session;
use actix_web::{get, web, HttpResponse, Responder};
use deadpool_postgres::Client;
use deadpool_postgres::Pool;
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;
use ts_rs::{export, TS};

#[derive(Deserialize, PostgresMapper, Serialize, Debug, TS)]
#[pg_mapper(table = "users")]
pub struct User {
    pub username: String,
    pub roles: Vec<String>,
}

impl User {
    pub fn is_admin(&self) -> bool {
        self.roles.contains(&"admin".into())
    }
}

export! {
  User => "frontend/src/rust-types/User.ts"
}

pub async fn get_user(client: &Client, username: &str) -> Result<User, JkError> {
    query_one::<User>(
        client,
        "
        SELECT
          users.username,
          array_agg(user_roles.role) AS roles
        FROM
          users
          LEFT JOIN user_roles ON user_roles.username = users.username
        WHERE
          users.username = $1
        GROUP BY
          users.username
        ",
        &[&username],
    )
    .await
}

pub async fn get_users(client: &Client) -> Result<Vec<User>, JkError> {
    query::<User>(
        client,
        "
        SELECT
          users.username,
          array_agg(user_roles.role) AS roles
        FROM
          users
          LEFT JOIN user_roles ON user_roles.username = users.username
        GROUP BY
          users.username
        ",
        &[],
    )
    .await
}

#[get("")]
async fn get_users_route(
    db_pool: web::Data<Pool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    let users = get_users(&get_client(db_pool).await?).await?;
    Ok(HttpResponse::Ok().json(users))
}

#[get("/{username}")]
async fn get_user_route(
    web::Path(username): web::Path<String>,
    db_pool: web::Data<Pool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    let user = get_user(&get_client(db_pool).await?, &username).await?;
    Ok(HttpResponse::Ok().json(user))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_users_route).service(get_user_route);
}
