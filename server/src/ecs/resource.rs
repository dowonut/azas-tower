use bevy::ecs::resource::Resource;
use serde::Serialize;
use socketioxide::SocketIo;
use typeshare::typeshare;

use crate::socket::{ServerMessage, SocketEventReceiver};

#[derive(Resource, Default, Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct GameState {
    pub total_players: u32,
    pub tick_count: u32,
}

#[derive(Resource, Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct GlobalMessages(pub Vec<ServerMessage>);

#[derive(Resource, Debug)]
#[typeshare]
pub struct GameRules {
    pub max_players: u32,
}

#[derive(Resource, Debug)]
pub struct SocketChannel(pub SocketEventReceiver);

#[derive(Resource, Debug)]
pub struct SocketIoResource(pub SocketIo);
