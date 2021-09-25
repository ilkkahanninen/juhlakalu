use actix_session::Session;
use actix_web::{get, post, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

use crate::database::{get_client, query_exists};
use crate::errors::{ErrorMessage, JkError};
use crate::users::{get_user, User};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Credentials {
    username: String,
    password: String,
}

async fn validate_credentials(client: &Client, credentials: &Credentials) -> Result<(), JkError> {
    let result = query_exists(
        client,
        "
          SELECT
            *
          FROM
            passwords
          WHERE
            username = $1
            AND password_hash = crypt($2, password_hash)
        ",
        &[&credentials.username, &credentials.password],
    )
    .await;

    match result {
        Ok(true) => Ok(()),
        _ => Err(JkError::Unauthorized),
    }
}

#[post("/login")]
async fn login_route(
    credentials: web::Json<Credentials>,
    db_pool: web::Data<Pool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    let client = get_client(db_pool).await?;
    validate_credentials(&client, &credentials).await?;
    let user = get_user(&client, &credentials.username).await?;
    session.set("user", &user)?;
    Ok(HttpResponse::Ok().json(user))
}

#[get("/logout")]
async fn logout_route(session: Session) -> impl Responder {
    session.clear();
    HttpResponse::Ok().finish()
}

#[get("/currentUser")]
async fn current_user_route(session: Session) -> Result<impl Responder, JkError> {
    let user_opt = session.get::<User>("user")?;
    match user_opt {
        Some(user) => Ok(HttpResponse::Ok().json(user)),
        None => Ok(HttpResponse::Ok().json(ErrorMessage::unauthorized())),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(current_user_route).service(login_route);
}
