use bevy::ecs::bundle::Bundle;
use bevy::ecs::name::Name;
use serde::Serialize;
use typeshare::typeshare;

use crate::ecs::component::marker::{Offline, Online, Player};
use crate::ecs::component::{ConnectionId, ConnectionStatus, Position};

/// Player bundle
#[derive(Bundle, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PlayerBundle {
    pub player: Player,
    #[typeshare(serialized_as = "String")]
    pub name: Name,
    pub position: Position,
    pub connection_id: ConnectionId,
    pub connection_status: ConnectionStatus,
    // pub online: Online,
}

// #[derive(Bundle, Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// #[typeshare]
// pub struct OnlinePlayerBundle {
//     pub player_bundle: PlayerBundle,
//     pub online: Online,
// }

// #[derive(Bundle, Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// #[typeshare]
// pub struct OfflinePlayerBundle {
//     pub player_bundle: PlayerBundle,
//     pub offline: Offline,
// }

impl PlayerBundle {
    pub fn new(name: String, connection_id: String) -> Self {
        PlayerBundle {
            player: Player,
            name: Name::new(name),
            position: Position { x: 0, y: 0 },
            connection_id: ConnectionId(connection_id),
            connection_status: ConnectionStatus::Online,
            // online: Online,
        }
    }
}
