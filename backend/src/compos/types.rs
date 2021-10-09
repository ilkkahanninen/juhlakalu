use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;
use ts_rs::{export, TS};

#[derive(Debug, Deserialize, Serialize, TS, PostgresMapper)]
#[pg_mapper(table = "compos")]
pub struct Compo {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub state: String,
    pub state_name: String,
    pub public: bool,
    pub accept_entries: bool,
    pub voting_open: bool,
    pub results_public: bool,
}

#[derive(Debug, Deserialize, Serialize, TS)]
pub struct CompoState {
    pub id: String,
    pub order: i32,
    pub name: String,
    pub public: bool,
    pub accept_entries: bool,
    pub voting_open: bool,
    pub results_public: bool,
}

export! {
    Compo => "frontend/src/rust-types/Compo.ts",
    CompoState => "frontend/src/rust-types/CompoState.ts",
}
