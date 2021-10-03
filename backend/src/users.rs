use std::vec;

use crate::auth::set_user_session;
use crate::auth::validate_admin_role;
use crate::database::DbClient;
use crate::database::DbPool;
use crate::errors::JkError;
use actix_session::Session;
use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;
use ts_rs::{export, TS};

#[derive(Deserialize, PostgresMapper, Serialize, Debug, TS)]
#[pg_mapper(table = "users")]
pub struct User {
    pub username: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub roles: Vec<String>,
}

impl User {
    pub fn is_admin(&self) -> bool {
        self.roles.contains(&"admin".into())
    }
}

impl From<NewUser> for User {
    fn from(user: NewUser) -> Self {
        Self {
            username: user.username,
            email: user.email,
            phone: user.phone,
            roles: vec![],
        }
    }
}

#[derive(Deserialize, PostgresMapper, Serialize, Debug, TS)]
#[pg_mapper(table = "users")]
pub struct NewUser {
    pub username: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password: String,
}

export! {
  User => "frontend/src/rust-types/User.ts",
  NewUser => "frontend/src/rust-types/NewUser.ts"
}

pub async fn get_user(client: &DbClient, username: &str) -> Result<User, JkError> {
    client
        .query_one::<User>(
            "
        SELECT
          users.username,
          users.email,
          users.phone,
          COALESCE(
            array_agg(user_roles.role) FILTER (WHERE user_roles.role IS NOT NULL),
            ARRAY[]::text[]
          ) AS roles
      FROM
          {{SCHEMA}}.users
          LEFT JOIN {{SCHEMA}}.user_roles ON user_roles.username = users.username
        WHERE
          users.username = $1
        GROUP BY
          users.username
        ",
            &[&username],
        )
        .await
}

pub async fn get_users(client: &DbClient) -> Result<Vec<User>, JkError> {
    client
        .query::<User>(
            "
        SELECT
          users.username,
          users.email,
          users.phone,
          array_agg(user_roles.role) AS roles
        FROM
          {{SCHEMA}}.users
          LEFT JOIN {{SCHEMA}}.user_roles ON user_roles.username = users.username
        GROUP BY
          users.username
        ",
            &[],
        )
        .await
}

pub async fn create_user(client: &mut DbClient, new_user: &NewUser) -> Result<User, JkError> {
    let transaction = client.transaction().await?;

    let user = transaction
        .query_one::<User>(
            "
        INSERT INTO {{SCHEMA}}.users (
            username,
            email,
            phone
        ) VALUES($1, $2, $3)
        RETURNING
            username,
            email,
            phone,
            ARRAY[]::text[] as roles
        ",
            &[&new_user.username, &new_user.email, &new_user.phone],
        )
        .await?;

    crate::auth::set_user_password(&transaction, &new_user.username, &new_user.password).await?;

    transaction.commit().await?;
    Ok(user)
}

#[get("")]
async fn get_users_route(
    db_pool: web::Data<DbPool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    let users = get_users(&DbClient::from(&db_pool).await?).await?;
    Ok(HttpResponse::Ok().json(users))
}

#[get("/{username}")]
async fn get_user_route(
    web::Path(username): web::Path<String>,
    db_pool: web::Data<DbPool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    let user = get_user(&DbClient::from(&db_pool).await?, &username).await?;
    Ok(HttpResponse::Ok().json(user))
}

#[post("/signup")]
async fn create_user_route(
    db_pool: web::Data<DbPool>,
    session: Session,
    user: web::Json<NewUser>,
) -> Result<impl Responder, JkError> {
    let user = create_user(&mut DbClient::from(&db_pool).await?, &user).await?;
    set_user_session(&session, &user)?;
    Ok(HttpResponse::Ok().json(user))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_users_route)
        .service(get_user_route)
        .service(create_user_route);
}
