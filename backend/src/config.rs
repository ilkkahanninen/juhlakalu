use serde::Deserialize;

pub use config::ConfigError;

use crate::errors::JkError;

#[derive(Deserialize)]
pub struct Config {
    pub server_addr: String,
    pub pg: deadpool_postgres::Config,
    pub jk_test: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, JkError> {
        let mut cfg = ::config::Config::new();
        cfg.set_default("server_addr", "127.0.0.1:8000")?;
        cfg.set_default("jk_test", false)?;
        cfg.merge(::config::Environment::new())?;
        Ok(cfg.try_into()?)
    }
}
