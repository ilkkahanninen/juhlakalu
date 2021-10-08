use actix_web::web;
use validator::Validate;

use crate::errors::JkError;

pub fn validate(data: &web::Json<impl Validate>) -> Result<(), JkError> {
    Ok(data.validate()?)
}
