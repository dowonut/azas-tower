use axum::routing::get;
use http::Method;
use socketioxide::{
    SocketIo,
    extract::{Data, SocketRef},
    socket::DisconnectReason,
};
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::FmtSubscriber;

async fn on_connect(s: SocketRef) {
    info!(ns = s.ns(), ?s.id, "Socket connected");

    s.on("message", async |s: SocketRef, Data::<String>(message)| {
        info!(?message, "Received message:");
        s.emit("message-back", &message).ok();
    });

    s.on_disconnect(async |s: SocketRef, reason: DisconnectReason| {
        info!(?s.id, ?reason, "Socket disconnected");
    });
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();

    io.ns("/", on_connect);

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any);

    let app = axum::Router::new()
        .route("/", get(async || "Hello, World!"))
        .layer(ServiceBuilder::new().layer(cors).layer(layer));

    info!("Starting server");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
