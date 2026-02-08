use bevy::ecs::component::Component;
use serde::Serialize;
use typeshare::typeshare;

// #[derive(Component, Default, TS)]
// #[ts(export)]
// pub struct Player;

// #[derive(Component, Default, Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// #[typeshare]
// pub struct GameEntity;

// #[derive(Component, Debug, Serialize)]
// #[serde(rename_all = "snake_case")]
// #[typeshare]
// pub enum GameEntityType {
//     Player,
//     // Enemy,
//     // Item,
// }

// #[derive(Component, Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// #[typeshare]
// pub struct IsOnline;

// #[derive(Component, TS)]
// pub struct ConnectionStatus(pub bool);

#[derive(Component, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
#[typeshare]
pub enum ConnectionStatus {
    Online,
    Offline,
}

// #[derive(Component, TS)]
// pub struct Online;
// #[derive(Component, TS)]
// pub struct Offline;

#[derive(Component, Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Position {
    pub x: i16,
    pub y: i16,
}

#[derive(Component, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ConnectionId(pub String);
