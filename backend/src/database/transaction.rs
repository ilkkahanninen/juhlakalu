use deadpool_postgres::Transaction;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::{types::ToSql, Statement};

use crate::errors::JkError;

pub struct DbTransaction<'a> {
    pub transaction: Transaction<'a>,
    pub schema: &'static str,
}

impl<'a> DbTransaction<'a> {
    pub async fn query_one<T>(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<T, JkError>
    where
        T: FromTokioPostgresRow,
    {
        let statement = self.prepare(query).await?;
        let row = self.transaction.query_one(&statement, params).await?;
        Ok(T::from_row_ref(&row)?)
    }

    pub async fn execute(
        &self,
        query: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<u64, JkError> {
        let statement = self.prepare(query).await?;
        let row_count = self.transaction.execute(&statement, params).await?;
        Ok(row_count)
    }

    pub async fn commit(self) -> Result<(), JkError> {
        Ok(self.transaction.commit().await?)
    }

    async fn prepare(&self, query: &str) -> Result<Statement, JkError> {
        Ok(self.transaction.prepare(&self.with_schema(&query)).await?)
    }

    fn with_schema(&self, query: &str) -> String {
        query.replace("{{SCHEMA}}", self.schema)
    }
}
