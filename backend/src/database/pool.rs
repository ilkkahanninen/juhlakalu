use deadpool_postgres::Pool;

use crate::errors::JkError;

use super::client::DbClient;

#[derive(Clone)]
pub struct DbPool {
    pub pool: Pool,
    pub default_schema: &'static str,
    pub db_pool_type: DbPoolType,
}

#[derive(Clone, Copy)]
#[allow(dead_code)]
pub enum DbPoolType {
    Prod,
    Dev,
    Test,
}

impl DbPool {
    pub async fn new(db_type: DbPoolType) -> Result<DbPool, JkError> {
        let config = crate::config::Config::from_env()?;
        let pool = DbPool {
            pool: config.pg.create_pool(tokio_postgres::NoTls)?,
            default_schema: match db_type {
                DbPoolType::Prod => "juhlakalu",
                DbPoolType::Dev => "juhlakalu_dev",
                DbPoolType::Test => "juhlakalu_test",
            },
            db_pool_type: db_type,
        };

        let client = DbClient::from(&pool).await?;
        client.init_schema().await?;

        Ok(pool)
    }

    #[allow(dead_code)]
    pub async fn new_test() -> Result<DbPool, JkError> {
        dotenv::from_filename(".test.env").ok();
        let pool = DbPool::new(DbPoolType::Test).await?;

        let client = DbClient::from(&pool).await?;
        client.drop_schema().await?;
        client.create_schema().await?;
        client.load_fixtures().await?;

        Ok(pool)
    }
}
