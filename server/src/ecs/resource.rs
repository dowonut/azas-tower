use bevy_ecs::prelude::Resource;

#[derive(Resource, Default)]
pub struct GameState {
    pub total_players: usize,
}

#[derive(Resource)]
pub struct GameRules {
    pub max_players: usize,
}
