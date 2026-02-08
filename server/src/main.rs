#![deny(
    clippy::suspicious,
    clippy::complexity,
    clippy::perf,
    clippy::style,
    clippy::pedantic
)]

use std::time::Duration;

use axum::routing::get;
use bevy::DefaultPlugins;
use bevy::app::{App, PluginGroup, ScheduleRunnerPlugin};
use bevy::log::LogPlugin;
use socketioxide::SocketIo;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

mod ecs;
mod plugin;
mod socket;

use crate::ecs::resource::{GameState, SocketChannel, SocketIoResource};
use crate::plugin::AzasTowerPlugin;
use crate::socket::{create_socket_event_channel, on_connect};

/// The server tick rate in ticks per second
const TICK_RATE: u8 = 1;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    // ========= Socketioxide =========

    let (socker_tx, socket_rx) = create_socket_event_channel();

    let (layer, io) = SocketIo::builder()
        .req_path("/ws")
        .with_state(socker_tx.clone())
        .build_layer();

    io.ns("/", on_connect);

    // ============= Axum =============

    tokio::spawn(async move {
        let cors = CorsLayer::permissive();

        let app = axum::Router::new()
            .route("/", get(async || "Hello, World!"))
            .layer(ServiceBuilder::new().layer(cors).layer(layer));

        info!("Starting server");

        let listener = tokio::net::TcpListener::bind("0.0.0.0:3004").await.unwrap();
        axum::serve(listener, app).await.unwrap();
    });

    // ============= Bevy =============

    // Create Bevy app
    let mut app = App::new();

    // Configure app
    app.init_resource::<GameState>()
        .insert_resource(SocketIoResource(io.clone()))
        .insert_resource(SocketChannel(socket_rx))
        .add_plugins((
            // Add default plugins
            DefaultPlugins
                // Configure the schedule runner to match the server tick rate
                .set(ScheduleRunnerPlugin::run_loop(Duration::from_secs_f32(
                    1.0 / TICK_RATE as f32,
                )))
                // Disable Bevy's default logging as we are using tracing
                .disable::<LogPlugin>(),
            // Add the core AzasTower plugin
            AzasTowerPlugin,
        ));

    // Start app
    app.run();

    Ok(())
}
