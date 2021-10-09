mod database;
mod types;

use actix_session::Session;
use actix_web::{get, web, HttpResponse, Responder};

use crate::{
    auth::get_user_session,
    database::{DbClient, DbPool},
    errors::JkError,
};

pub use self::types::{Compo, CompoState};

#[get("")]
async fn get_all(db_pool: web::Data<DbPool>, session: Session) -> Result<impl Responder, JkError> {
    let compos = match get_user_session(&session) {
        Ok(Some(user)) if user.is_admin() => {
            self::database::get_all(&DbClient::from(&db_pool).await?).await?
        }
        _ => self::database::get_visible(&DbClient::from(&db_pool).await?).await?,
    };
    Ok(HttpResponse::Ok().json(compos))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_all);
}
