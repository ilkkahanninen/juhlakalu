use actix_session::Session;
use actix_web::{get, web, HttpResponse, Responder};
use deadpool_postgres::Pool;

use crate::database::get_client;
use crate::errors::{ErrorMessage, JkError};
use crate::users::{get_user, User};

#[get("/login")]
async fn login_route(
    db_pool: web::Data<Pool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    let user = get_user(&get_client(db_pool).await?, "zorro").await?;
    session.set("user", &user)?;
    Ok(HttpResponse::Ok().json(user))
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
