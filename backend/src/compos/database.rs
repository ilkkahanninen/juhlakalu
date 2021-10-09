use crate::{database::DbClient, errors::JkError};

use super::Compo;

async fn get(client: &DbClient, condition: Option<&str>) -> Result<Vec<Compo>, JkError> {
    let query = format!(
        "
        SELECT
            compos.id,
            compos.title,
            compos.description,
            compos.state,
            compo_states.name AS state_name,
            compo_states.public AS public,
            compo_states.accept_entries AS accept_entries,
            compo_states.voting_open AS voting_open,
            compo_states.results_public AS results_public
        FROM {{{{SCHEMA}}}}.compos
        JOIN {{{{SCHEMA}}}}.compo_states ON (compos.state = compo_states.id)
        {}
        ",
        match condition {
            Some(c) => format!("WHERE {}", &c),
            None => String::new(),
        }
    );

    client.query(&query, &[]).await
}

pub async fn get_all(client: &DbClient) -> Result<Vec<Compo>, JkError> {
    get(client, None).await
}

pub async fn get_visible(client: &DbClient) -> Result<Vec<Compo>, JkError> {
    get(client, Some("compo_states.visible = TRUE")).await
}
