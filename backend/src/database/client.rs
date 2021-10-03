use crate::errors::JkError;
use deadpool_postgres::Client;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types::ToSql;
use tokio_postgres::Statement;

use super::pool::DbPool;
use super::pool::DbPoolType;
use super::transaction::DbTransaction;

pub struct DbClient {
    pub client: Client,
    pub schema: &'static str,
    pub db_type: DbPoolType,
}

impl DbClient {
    pub async fn from(pool: &DbPool) -> Result<DbClient, JkError> {
        Ok(DbClient {
            client: pool.pool.get().await.map_err(JkError::PoolError)?,
            schema: pool.default_schema,
            db_type: pool.db_pool_type,
        })
    }

    pub async fn query<T>(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Vec<T>, JkError>
    where
        T: FromTokioPostgresRow,
    {
        let statement = self.prepare(query).await?;
        let result = self
            .client
            .query(&statement, params)
            .await?
            .iter()
            .map(|row| T::from_row_ref(row).expect("Query fields and struct match"))
            .collect::<Vec<T>>();
        Ok(result)
    }

    pub async fn query_one<T>(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<T, JkError>
    where
        T: FromTokioPostgresRow,
    {
        let statement = self.prepare(query).await?;
        let row = self.client.query_one(&statement, params).await?;
        Ok(T::from_row_ref(&row)?)
    }

    #[allow(dead_code)]
    pub async fn query_opt<T>(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Option<T>, JkError>
    where
        T: FromTokioPostgresRow,
    {
        let statement = self.prepare(query).await?;
        let result = self
            .client
            .query_opt(&statement, params)
            .await?
            .map(|row| T::from_row_ref(&row).map_err(JkError::PGMError));

        match result {
            Some(Err(e)) => Err(e),
            Some(Ok(r)) => Ok(Some(r)),
            None => Ok(None),
        }
    }

    pub async fn exists(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<bool, JkError> {
        let statement = self.prepare(query).await?;
        let row = self.client.query_opt(&statement, &params).await?;
        Ok(row.is_some())
    }

    pub async fn init_schema(&self) -> Result<(), JkError> {
        let schema_exists = self
            .exists(
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
        let query = include_str!("../../migrations/drop_tables.sql");
        Ok(self.batch_execute(&query).await?)
    }

    pub async fn create_schema(&self) -> Result<(), JkError> {
        let query = include_str!("../../migrations/create_tables.sql");
        Ok(self.batch_execute(&query).await?)
    }

    pub async fn load_fixtures(&self) -> Result<(), JkError> {
        let query = match self.db_type {
            DbPoolType::Test => include_str!("../../migrations/fixtures/tests.sql"),
            _ => include_str!("../../migrations/fixtures/initial.sql"),
        };
        Ok(self.batch_execute(&query).await?)
    }

    pub async fn transaction(&mut self) -> Result<DbTransaction<'_>, JkError> {
        Ok(DbTransaction {
            transaction: self.client.transaction().await?,
            schema: self.schema,
        })
    }

    async fn prepare(&self, query: &str) -> Result<Statement, JkError> {
        Ok(self.client.prepare(&self.with_schema(&query)).await?)
    }

    fn with_schema(&self, query: &str) -> String {
        query.replace("{{SCHEMA}}", self.schema)
    }
}
