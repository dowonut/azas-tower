use serde::Serialize;

use crate::utility::Point;

#[derive(Clone, Debug, Default, Serialize)]
pub struct User {
    pub name: String,
    pub position: Point,
}

#[derive(Debug, Default)]
pub struct UserUpdate {
    pub name: Option<String>,
    pub position: Option<Point>,
}
