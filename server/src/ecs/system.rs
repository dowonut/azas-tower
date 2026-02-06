use bevy_ecs::{prelude::Commands, system::ResMut};

use crate::ecs::resource::{GameRules, GameState};

pub fn print_message_system() {
    println!("I'm the print_message system!")
}

pub fn startup_system(mut commands: Commands, mut game_state: ResMut<GameState>) {
    commands.insert_resource(GameRules { max_players: 10 });

    game_state.total_players = 0;
}
