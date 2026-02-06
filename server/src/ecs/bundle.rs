use crate::ecs::component::*;
use bevy_ecs::prelude::Bundle;

#[derive(Bundle, Default)]
struct PlayerBundle {
    pub entity: Entity,
    pub player: Player,
    pub position: Position,
}
