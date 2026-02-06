#![deny(
    clippy::suspicious,
    clippy::complexity,
    clippy::perf,
    clippy::style,
    clippy::pedantic
)]

// use std::num::NonZeroU32;

use axum::routing::get;
use bevy_ecs::{prelude::World, schedule::Schedule};
use socketioxide::SocketIo;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

mod ecs;
mod handler;
mod state;
mod user;
mod utility;

use handler::on_connect;

use crate::ecs::{resource::GameState, system::print_message_system};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    // Set up socketioxide

    let (layer, io) = SocketIo::builder().req_path("/ws").build_layer();

    io.ns("/", on_connect);

    // Set up chron game loop

    tokio::spawn(async move {
        let mut world = World::new();

        world.insert_resource(GameState::default());

        let mut schedule = Schedule::default();

        schedule.add_systems(print_message_system);

        schedule.run(&mut world);

        // let updates_per_second = NonZeroU32::new(20).unwrap();
        // let frames_per_second = NonZeroU32::new(20).unwrap();
        // let clock = chron::Clock::new(updates_per_second).max_frame_rate(frames_per_second);

        // for tick in clock {
        //     match tick {
        //         chron::Tick::Update => {
        //             // info!("update");
        //         }
        //         chron::Tick::Render { interpolation: _ } => {
        //             // Emit current game state
        //             // let snapshot = state.get_snapshot().await;
        //             // io.emit("state", &snapshot).await.ok();
        //         }
        //     }
        //     tokio::task::yield_now().await;
        // }
    });

    // Set up axum

    let cors = CorsLayer::permissive();

    let app = axum::Router::new()
        .route("/", get(async || "Hello, World!"))
        .layer(ServiceBuilder::new().layer(cors).layer(layer));

    info!("Starting server");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3004").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
