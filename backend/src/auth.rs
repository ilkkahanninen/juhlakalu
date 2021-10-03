use actix_session::Session;
use actix_web::{get, post, web, HttpResponse, Responder};
use ts_rs::{export, TS};

use crate::database::{DbClient, DbPool, DbTransaction};
use crate::errors::JkError;
use crate::users::{get_user, User};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, TS)]
pub struct Credentials {
    username: String,
    password: String,
}

export! {
    Credentials => "frontend/src/rust-types/Credentials.ts"
}

async fn validate_credentials(client: &DbClient, credentials: &Credentials) -> Result<(), JkError> {
    let result = client
        .exists(
            "
          SELECT
            *
          FROM
            {{SCHEMA}}.user_passwords
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

pub fn validate_admin_role(session: &Session) -> Result<(), JkError> {
    match session.get::<User>("user")? {
        Some(user) if user.is_admin() => Ok(()),
        _ => Err(JkError::Unauthorized),
    }
}

pub fn set_user_session(session: &Session, user: &User) -> Result<(), JkError> {
    Ok(session.set("user", &user)?)
}

// TODO: Implement Queryable trait to database and use it here instead
pub async fn set_user_password(
    transaction: &DbTransaction<'_>,
    username: &str,
    password: &str,
) -> Result<(), JkError> {
    transaction
        .execute(
            "
            INSERT INTO {{SCHEMA}}.user_passwords (
                username,
                password_hash
            ) VALUES ($1, crypt($2, gen_salt('bf', 4)))
            ON CONFLICT (username)
            DO UPDATE SET
                password_hash = EXCLUDED.password_hash
            ",
            &[&username, &password],
        )
        .await?;

    Ok(())
}

#[post("/login")]
async fn login_route(
    credentials: web::Json<Credentials>,
    db_pool: web::Data<DbPool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    let client = DbClient::from(&db_pool).await?;
    validate_credentials(&client, &credentials).await?;
    let user = get_user(&client, &credentials.username).await?;
    set_user_session(&session, &user)?;
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
        None => Err(JkError::Unauthorized),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(current_user_route)
        .service(login_route)
        .service(logout_route);
}

#[cfg(test)]
mod tests {
    use crate::database::DbPool;

    use super::*;
    use actix_web::{http::StatusCode, test, App};

    #[actix_rt::test]
    #[serial_test::serial]
    async fn test_login_success() {
        let resp = run_login_test(Credentials {
            username: "admin".into(),
            password: "admin2".into(),
        })
        .await;
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_rt::test]
    #[serial_test::serial]
    async fn test_login_unauthorized() {
        let resp = run_login_test(Credentials {
            username: "xxxxx".into(),
            password: "foo".into(),
        })
        .await;
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    async fn run_login_test(credentials: Credentials) -> actix_web::dev::ServiceResponse {
        let pool = DbPool::new_test().await.unwrap();
        let mut app = test::init_service(
            App::new()
                .data(pool)
                .wrap(
                    actix_session::CookieSession::signed(&[0; 32])
                        .secure(false)
                        .name("session"),
                )
                .configure(configure),
        )
        .await;

        let req = test::TestRequest::post()
            .uri("/login")
            .set_json(&credentials);

        test::call_service(&mut app, req.to_request()).await
    }
}
