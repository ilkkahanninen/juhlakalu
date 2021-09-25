use crate::errors::JkError;
use actix_web::web;
use deadpool_postgres::Client;
use deadpool_postgres::Pool;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types::ToSql;

pub async fn get_client(db_pool: web::Data<Pool>) -> Result<Client, JkError> {
    db_pool.get().await.map_err(JkError::PoolError)
}

pub async fn query<T: FromTokioPostgresRow>(
    client: &Client,
    query_str: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<Vec<T>, JkError> {
    let statement = client.prepare(query_str).await.unwrap();
    let result = client
        .query(&statement, &params)
        .await?
        .iter()
        .map(|row| T::from_row_ref(row).unwrap())
        .collect::<Vec<T>>();
    Ok(result)
}

pub async fn query_one<T: FromTokioPostgresRow>(
    client: &Client,
    query_str: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<T, JkError> {
    let statement = client.prepare(query_str).await.unwrap();
    let row = client.query_one(&statement, &params).await?;
    Ok(T::from_row_ref(&row).unwrap())
}

pub async fn query_exists(
    client: &Client,
    query_str: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<bool, JkError> {
    let statement = client.prepare(query_str).await.unwrap();
    let row = client.query_opt(&statement, &params).await?;
    Ok(row.is_some())
}
