use bevy::ecs::entity::Entity;
use bevy::ecs::name::Name;
use bevy::ecs::query::{Changed, Or, With};
use bevy::ecs::system::{Commands, Query, Res, ResMut};
use bevy::tasks::AsyncComputeTaskPool;
use serde::Serialize;
use tracing::info;
use typeshare::typeshare;

use crate::ecs::bundle::PlayerBundle;
use crate::ecs::component::marker::Player;
use crate::ecs::component::{ConnectionId, ConnectionStatus, Position};
use crate::ecs::resource::{GameRules, GameState, GlobalMessages, SocketChannel, SocketIoResource};
use crate::socket::{MessageAuthorType, ServerMessage, SocketEvent};

pub fn startup_system(mut commands: Commands, mut game_state: ResMut<GameState>) {
    commands.insert_resource(GameRules { max_players: 10 });

    game_state.total_players = 0;
}

pub fn log_game_state_system(game_state: Res<GameState>) {
    info!(?game_state.tick_count);
}

pub fn update_game_state_system(mut game_state: ResMut<GameState>) {
    game_state.tick_count += 1;
}

pub fn socket_event_receiver_system(
    socket_channel: Res<SocketChannel>,
    mut commands: Commands,
    mut game_state: ResMut<GameState>,
    mut global_messages: ResMut<GlobalMessages>,
    mut query: Query<(&ConnectionId, &mut ConnectionStatus), With<Player>>,
    // mut players: Query<&mut ConnectionStatus, With<Player>>,
) {
    for message in socket_channel.0.try_iter() {
        match message {
            SocketEvent::Connected { context } => {
                info!("Socket {} connected", context.socket_id);

                // Spawn a new player entity when a socket connects
                commands.spawn(PlayerBundle::new(
                    "someone".to_string(),
                    context.socket_id.clone(),
                ));

                // Increment total players in game state
                game_state.total_players += 1;
            }
            SocketEvent::Disconnected { context, reason } => {
                info!("Socket {} disconnected: {:?}", context.socket_id, reason);

                // Find the entity with the matching connection ID and mark it as offline
                for (connection_id, mut connection_status) in &mut query {
                    if connection_id.0 == context.socket_id
                        && *connection_status == ConnectionStatus::Online
                    {
                        *connection_status = ConnectionStatus::Offline;
                        // if let Some(mut entity_commands) = commands.get_entity(entity).ok() {
                        //     entity_commands.insert(ConnectionStatus::Offline);
                        //     entity_commands.insert
                        // }
                        // if let Ok(mut status) = players.get_mut(entity) {
                        //     *status = ConnectionStatus::Offline;
                        // }
                        // break;
                    }
                }

                // Decrement total players in game state
                game_state.total_players -= 1;
            }
            SocketEvent::Message { context, content } => {
                info!("Received message from {}: {}", context.socket_id, content);
                global_messages.0.push(ServerMessage {
                    author_type: MessageAuthorType::User,
                    author_name: Some(context.socket_id),
                    content,
                });
            }
        }
    }
}

/// A packet sent to clients containing relevant information for syncing game state
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
struct ClientSyncPacket {
    game_state: GameState,
    global_messages: Vec<ServerMessage>,
    entities: Vec<PlayerBundle>,
}

/// System responsible for syncing game state with clients
pub fn client_sync_system(
    game_state: Res<GameState>,
    global_messages: Res<GlobalMessages>,
    io: Res<SocketIoResource>,
    query: Query<
        (&Name, &Position, &ConnectionStatus, &ConnectionId),
        (
            With<Player>,
            Or<(Changed<Position>, Changed<ConnectionStatus>)>,
        ),
    >,
) {
    let pool = AsyncComputeTaskPool::get();

    // Create sync packet
    let client_sync_packet = ClientSyncPacket {
        game_state: game_state.clone(),
        global_messages: global_messages.0.clone(),
        entities: query
            .iter()
            .map(|(name, pos, status, conn_id)| PlayerBundle {
                player: Player,
                name: name.clone(),
                position: *pos,
                connection_id: conn_id.clone(),
                connection_status: *status,
            })
            .collect(),
    };

    // Send sync packet to all clients via a background task
    let io_cloned = io.0.clone();
    pool.spawn(async move {
        // Send global messages
        io_cloned.emit("sync", &client_sync_packet).await.ok();
    })
    .detach();
}
