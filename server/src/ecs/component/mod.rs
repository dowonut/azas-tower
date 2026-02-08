use bevy::ecs::component::Component;
use serde::Serialize;
use typeshare::typeshare;

pub mod marker;

#[derive(Component, Debug, Serialize, PartialEq, Eq, Clone, Copy)]
#[serde(rename_all = "snake_case")]
#[typeshare]
pub enum ConnectionStatus {
    Online,
    Offline,
}

#[derive(Component, Default, Debug, Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Position {
    pub x: i16,
    pub y: i16,
}

#[derive(Component, Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ConnectionId(pub String);
