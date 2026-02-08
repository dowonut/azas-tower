use bevy::ecs::component::Component;
use serde::Serialize;
use typeshare::typeshare;

#[derive(Component, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Player;

#[derive(Component, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Online;

#[derive(Component, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Offline;
