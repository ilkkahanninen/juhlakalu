use crate::errors::JkError;
use actix_web::web;
use deadpool_postgres::Client;
use deadpool_postgres::Pool;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types::ToSql;
use tokio_postgres::Row;
use tokio_postgres::Statement;
use tokio_postgres::ToStatement;

#[derive(Clone)]
pub struct DbPool {
    pool: Pool,
    default_schema: &'static str,
    db_pool_type: DbPoolType,
}

#[derive(Clone, Copy)]
pub enum DbPoolType {
    Prod,
    Test,
}

pub struct DbClient {
    pub client: Client,
    pub schema: &'static str,
    pub db_type: DbPoolType,
}

impl DbClient {
    pub async fn from_pool(pool: DbPool) -> Result<DbClient, JkError> {
        Ok(DbClient {
            client: pool.pool.get().await.map_err(JkError::PoolError)?,
            schema: pool.default_schema,
            db_type: pool.db_pool_type,
        })
    }

    pub async fn from_data(pool: web::Data<DbPool>) -> Result<DbClient, JkError> {
        Ok(DbClient {
            client: pool.pool.get().await.map_err(JkError::PoolError)?,
            schema: pool.default_schema,
            db_type: pool.db_pool_type,
        })
    }

    pub async fn prepare(&self, query: &str) -> Result<Statement, JkError> {
        Ok(self.client.prepare(&self.with_schema(query)).await?)
    }

    pub async fn query<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Vec<Row>, JkError>
    where
        T: ?Sized + ToStatement,
    {
        Ok(self.client.query(statement, params).await?)
    }

    pub async fn query_one<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Row, JkError>
    where
        T: ?Sized + ToStatement,
    {
        Ok(self.client.query_one(statement, params).await?)
    }

    pub async fn query_opt<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Option<Row>, JkError>
    where
        T: ?Sized + ToStatement,
    {
        Ok(self.client.query_opt(statement, params).await?)
    }

    pub async fn init_schema(&self) -> Result<(), JkError> {
        let schema_exists = query_exists(
            self,
            "SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1",
            &[&self.schema],
        )
        .await?;

        if !schema_exists {
            self.create_schema().await?;
            self.load_fixtures().await?;
        }

        Ok(())
    }

    pub async fn batch_execute(&self, query: &str) -> Result<(), JkError> {
        Ok(self.client.batch_execute(&self.with_schema(query)).await?)
    }

    pub async fn drop_schema(&self) -> Result<(), JkError> {
        let query = include_str!("../migrations/drop_tables.sql");
        Ok(self.batch_execute(&query).await?)
    }

    pub async fn create_schema(&self) -> Result<(), JkError> {
        let query = include_str!("../migrations/create_tables.sql");
        Ok(self.batch_execute(&query).await?)
    }

    pub async fn load_fixtures(&self) -> Result<(), JkError> {
        let query = match self.db_type {
            DbPoolType::Prod => include_str!("../migrations/fixtures/initial.sql"),
            DbPoolType::Test => include_str!("../migrations/fixtures/tests.sql"),
        };
        Ok(self.batch_execute(&query).await?)
    }

    fn with_schema(&self, query: &str) -> String {
        query.replace("{{SCHEMA}}", self.schema)
    }
}

pub async fn create_db_pool(db_type: DbPoolType) -> Result<DbPool, JkError> {
    let config = crate::config::Config::from_env()?;
    let pool = DbPool {
        pool: config.pg.create_pool(tokio_postgres::NoTls)?,
        default_schema: match db_type {
            DbPoolType::Prod => "juhlakalu",
            DbPoolType::Test => "juhlakalu_test",
        },
        db_pool_type: db_type,
    };

    let client = DbClient::from_pool(pool.clone()).await?;
    client.init_schema().await?;

    Ok(pool)
}

pub async fn query<T: FromTokioPostgresRow>(
    client: &DbClient,
    query: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<Vec<T>, JkError> {
    let statement = client.prepare(&query).await?;
    let result = client
        .query(&statement, &params)
        .await?
        .iter()
        .map(|row| T::from_row_ref(row).expect("Query fields and struct match"))
        .collect::<Vec<T>>();
    Ok(result)
}

pub async fn query_one<T: FromTokioPostgresRow>(
    client: &DbClient,
    query: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<T, JkError> {
    let statement = client.prepare(&query).await?;
    let row = client.query_one(&statement, &params).await?;
    Ok(T::from_row_ref(&row)?)
}

pub async fn query_exists(
    client: &DbClient,
    query: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<bool, JkError> {
    let statement = client.prepare(query).await?;
    let row = client.query_opt(&statement, &params).await?;
    Ok(row.is_some())
}

#[allow(dead_code)]
pub async fn create_test_db_pool() -> Result<DbPool, JkError> {
    dotenv::from_filename(".test.env").ok();
    let pool = create_db_pool(DbPoolType::Test).await?;

    let client = DbClient::from_pool(pool.clone()).await?;
    client.drop_schema().await?;
    client.create_schema().await?;
    client.load_fixtures().await?;

    Ok(pool)
}
