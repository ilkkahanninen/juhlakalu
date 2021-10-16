use crate::{
    database::{DbClient, Id},
    errors::JkError,
};

use super::{Compo, CompoState, CompoUpdate};

fn build_select_query(condition: Option<&str>) -> String {
    format!(
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
    )
}

pub async fn get_all(client: &DbClient) -> Result<Vec<Compo>, JkError> {
    client.query(&build_select_query(None), &[]).await
}

pub async fn get_public(client: &DbClient) -> Result<Vec<Compo>, JkError> {
    client
        .query(
            &build_select_query(Some("compo_states.visible = TRUE")),
            &[],
        )
        .await
}

pub async fn get(client: &DbClient, id: i32, public_only: bool) -> Result<Option<Compo>, JkError> {
    let condition = format!(
        "compos.id = $1{}",
        match public_only {
            true => " AND compo_stats.public = TRUE",
            false => "",
        }
    );
    client
        .query_opt(&build_select_query(Some(&condition)), &[&id])
        .await
}

pub async fn create(client: &DbClient, compo: &CompoUpdate) -> Result<Id, JkError> {
    client
        .query_one(
            "
            INSERT INTO {{SCHEMA}}.compos(
                title,
                description,
                state
            ) VALUES ($1, $2, $3)
            RETURNING id
            ",
            &[&compo.title, &compo.description, &compo.state],
        )
        .await
}

pub async fn update(client: &DbClient, id: i32, compo: &CompoUpdate) -> Result<u64, JkError> {
    client
        .execute(
            "
            UPDATE {{SCHEMA}}.compos
            SET
                title = $1,
                description = $2,
                state = $3
            WHERE id = $4;
            ",
            &[&compo.title, &compo.description, &compo.state, &id],
        )
        .await
}

pub async fn get_states(client: &DbClient) -> Result<Vec<CompoState>, JkError> {
    client
        .query(
            "
            SELECT
                id,
                name,
                public,
                accept_entries,
                voting_open,
                results_public,
                \"order\"
            FROM juhlakalu.compo_states
            ORDER BY \"order\"
            ",
            &[],
        )
        .await
}
