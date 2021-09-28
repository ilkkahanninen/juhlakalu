use serde::Deserialize;

pub use ::config::ConfigError;

#[derive(Deserialize)]
pub struct Config {
    pub server_addr: String,
    pub pg: deadpool_postgres::Config,
    pub jk_test: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let mut cfg = ::config::Config::new();
        cfg.set_default("jk_test", false)?;
        cfg.merge(::config::Environment::new())?;
        cfg.try_into()
    }
}
