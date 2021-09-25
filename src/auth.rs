use actix_web::Responder;
use actix_web::{get, web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
  name: String,
}

#[get("/currentUser")]
async fn hello() -> impl Responder {
  HttpResponse::Ok().json(User {
    name: "Heikki".into(),
  })
}

#[get("/user/{name}")]
async fn get_user(web::Path(name): web::Path<String>) -> impl Responder {
  HttpResponse::Ok().json(User { name })
}

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(hello).service(get_user);
}
