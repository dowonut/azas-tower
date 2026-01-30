use serde::Serialize;

/// A point in 2D space
#[derive(Clone, Debug, Default, Serialize)]
pub struct Point(pub i32, pub i32);
