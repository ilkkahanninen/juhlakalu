mod auth;
mod config;
mod database;
mod errors;
mod tests;
mod users;

use actix_files::{Files, NamedFile};
use actix_session::CookieSession;
use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    middleware::Logger,
    web, App, HttpServer, ResponseError,
};
use dotenv::dotenv;
use errors::JkError;

use crate::database::DbPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info,warn,error");
    env_logger::init();
    dotenv().ok();

    let config = crate::config::Config::from_env()?;

    let is_test_mode = config.jk_test;

    let db_pool = DbPool::new(match is_test_mode {
        false => database::DbPoolType::Prod,
        true => database::DbPoolType::Test,
    })
    .await?;

    println!("Starting server: http://{}", &config.server_addr);

    HttpServer::new(move || {
        let app = App::new()
            .data(db_pool.clone())
            .wrap(Logger::new("%a %r -> %s (%b bytes, %D ms)"))
            .wrap(
                CookieSession::signed(&[0; 32])
                    .secure(false)
                    .name("session"),
            )
            .configure(configure_api);

        let app = if is_test_mode {
            app.service(web::scope("/__tests").configure(tests::configure))
        } else {
            app
        };

        app.configure(configure_static_file_sharing)
            .default_service(web::to(|| JkError::NotFound.error_response()))
    })
    .bind(&config.server_addr)?
    .run()
    .await
}

fn configure_api(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(web::scope("/auth").configure(auth::configure))
            .service(web::scope("/users").configure(users::configure)),
    );
}

fn configure_static_file_sharing(cfg: &mut web::ServiceConfig) {
    cfg.service(
        Files::new("/", "./frontend/target")
            .index_file("index.html")
            .default_handler(|req: ServiceRequest| {
                let (http_req, _payload) = req.into_parts();
                async {
                    let response = NamedFile::open("./frontend/target/index.html")?
                        .into_response(&http_req)?;
                    Ok(ServiceResponse::new(http_req, response))
                }
            }),
    );
}
