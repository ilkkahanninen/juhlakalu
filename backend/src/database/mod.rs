mod client;
mod pool;
mod transaction;

use tokio_pg_mapper_derive::PostgresMapper;

pub use self::client::DbClient;
pub use self::pool::{DbPool, DbPoolType};
pub use self::transaction::DbTransaction;

// Generic data types for query results

#[derive(Debug, PostgresMapper)]
#[pg_mapper(table = "")]
pub struct Id {
    pub id: i32,
}
