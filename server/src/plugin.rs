use bevy::app::{App, Plugin, Startup, Update};
use bevy::prelude::IntoScheduleConfigs;

use crate::ecs::resource::GlobalMessages;
use crate::ecs::system::{
    client_sync_system, log_game_state_system, socket_event_receiver_system, startup_system,
    update_game_state_system,
};

/// The core plugin for the AzasTower server
pub struct AzasTowerPlugin;

impl Plugin for AzasTowerPlugin {
    fn build(&self, app: &mut App) {
        // Initialize global messages resource
        app.init_resource::<GlobalMessages>();

        // Add startup systems
        app.add_systems(Startup, startup_system);

        // Add update systems (run every tick)
        app.add_systems(
            Update,
            (
                socket_event_receiver_system,
                update_game_state_system,
                log_game_state_system,
                client_sync_system,
            )
                .chain(),
        );
    }
}
