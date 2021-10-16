mod database;
mod types;

use actix_session::Session;
use actix_web::{get, post, put, web, HttpResponse, Responder};

use crate::{
    auth::{is_admin, validate_admin_role},
    database::{DbClient, DbPool},
    errors::JkError,
};

pub use self::types::{Compo, CompoState, CompoUpdate};

#[get("")]
async fn get_all(db_pool: web::Data<DbPool>, session: Session) -> Result<impl Responder, JkError> {
    let compos = if is_admin(&session) {
        self::database::get_all(&DbClient::from(&db_pool).await?).await?
    } else {
        self::database::get_public(&DbClient::from(&db_pool).await?).await?
    };
    Ok(HttpResponse::Ok().json(compos))
}

#[get("/{id}")]
async fn get_by_id(
    web::Path(id): web::Path<i32>,
    db_pool: web::Data<DbPool>,
    session: Session,
) -> Result<impl Responder, JkError> {
    let public_only = !is_admin(&session);
    let compo = self::database::get(&DbClient::from(&db_pool).await?, id, public_only).await?;
    match compo {
        Some(compo) => Ok(HttpResponse::Ok().json(compo)),
        _ => Err(JkError::NotFound),
    }
}

#[get("/states")]
async fn get_states(db_pool: web::Data<DbPool>) -> Result<impl Responder, JkError> {
    let states = self::database::get_states(&DbClient::from(&db_pool).await?).await?;
    Ok(HttpResponse::Ok().json(states))
}

#[post("")]
async fn create(
    db_pool: web::Data<DbPool>,
    session: Session,
    compo: web::Json<CompoUpdate>,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    let created = self::database::create(&DbClient::from(&db_pool).await?, &compo).await?;

    let compo = self::database::get(&DbClient::from(&db_pool).await?, created.id, false).await?;
    match compo {
        Some(compo) => Ok(HttpResponse::Ok().json(compo)),
        _ => Err(JkError::NotFound),
    }
}

#[put("/{id}")]
async fn update(
    web::Path(id): web::Path<i32>,
    db_pool: web::Data<DbPool>,
    session: Session,
    compo: web::Json<CompoUpdate>,
) -> Result<impl Responder, JkError> {
    validate_admin_role(&session)?;
    self::database::update(&DbClient::from(&db_pool).await?, id, &compo).await?;

    let compo = self::database::get(&DbClient::from(&db_pool).await?, id, false).await?;
    match compo {
        Some(compo) => Ok(HttpResponse::Ok().json(compo)),
        _ => Err(JkError::NotFound),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(get_all)
        .service(get_states)
        .service(get_by_id)
        .service(create)
        .service(update);
}
