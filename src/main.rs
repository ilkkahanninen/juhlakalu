mod auth;
mod config;
mod database;
mod errors;
mod users;

use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use tokio_postgres::NoTls;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let config = crate::config::Config::from_env().unwrap();
    let db_pool = config.pg.create_pool(NoTls).unwrap();

    HttpServer::new(move || {
        App::new()
            .data(db_pool.clone())
            .service(web::scope("/auth").configure(auth::configure))
            .service(web::scope("/users").configure(users::configure))
    })
    .bind(config.server_addr)?
    .run()
    .await
}
