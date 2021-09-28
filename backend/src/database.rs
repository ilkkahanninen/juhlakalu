use crate::errors::JkError;
use actix_web::web;
use deadpool_postgres::Client;
use deadpool_postgres::Pool;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types::ToSql;

pub async fn create_db_pool() -> Pool {
    let config = crate::config::Config::from_env().unwrap();
    config.pg.create_pool(tokio_postgres::NoTls).unwrap()
}

pub async fn get_client(db_pool: web::Data<Pool>) -> Result<Client, JkError> {
    db_pool.get().await.map_err(JkError::PoolError)
}

pub async fn query<T: FromTokioPostgresRow>(
    client: &Client,
    query_str: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<Vec<T>, JkError> {
    let statement = client.prepare(query_str).await?;
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
    let statement = client.prepare(query_str).await?;
    let row = client.query_one(&statement, &params).await?;
    Ok(T::from_row_ref(&row).unwrap())
}

pub async fn query_exists(
    client: &Client,
    query_str: &str,
    params: &[&(dyn ToSql + Sync)],
) -> Result<bool, JkError> {
    let statement = client.prepare(query_str).await?;
    let row = client.query_opt(&statement, &params).await?;
    Ok(row.is_some())
}

pub async fn drop_tables(client: &Client) -> Result<(), JkError> {
    let query = include_str!("../migrations/drop_tables.sql");
    client.batch_execute(&query).await?;
    Ok(())
}

pub async fn create_tables(client: &Client) -> Result<(), JkError> {
    let query = include_str!("../migrations/create_tables.sql");
    client.batch_execute(&query).await?;
    Ok(())
}

pub async fn load_fixtures(client: &Client) -> Result<(), JkError> {
    let query = include_str!("../migrations/fixtures/tests.sql");
    client.batch_execute(&query).await?;
    Ok(())
}

#[allow(dead_code)]
pub async fn create_test_db_pool() -> Pool {
    dotenv::from_filename(".test.env").ok();
    let pool = create_db_pool().await;

    let client = pool.get().await.unwrap();
    drop_tables(&client).await.unwrap();
    create_tables(&client).await.unwrap();
    load_fixtures(&client).await.unwrap();

    pool
}
