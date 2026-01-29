use std::{collections::HashMap, sync::Arc};

use axum::routing::get;
use http::Method;
use rmpv::Value;
use serde::{Deserialize, Serialize};
use socketioxide::{
    SocketIo,
    extract::{Data, SocketRef, State},
    socket::DisconnectReason,
};
use tokio::sync::RwLock;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::FmtSubscriber;

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
enum MessageAuthorType {
    #[default]
    Server,
    User,
    Other,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
struct ServerMessage {
    author_type: MessageAuthorType,
    author_name: Option<String>,
    content: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ClientMessage {
    content: String,
}

#[derive(Clone, Debug)]
struct User {
    name: String,
}

#[derive(Clone, Debug)]
struct GameState {
    users: Arc<RwLock<HashMap<String, User>>>,
}

impl GameState {
    fn new() -> Self {
        Self {
            users: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn add_user(&self, id: String, user: User) {
        let mut users = self.users.write().await;
        users.insert(id, user);
    }

    async fn remove_user(&self, id: &str) {
        let mut users = self.users.write().await;
        users.remove(id);
    }

    async fn get_user(&self, id: &str) -> Option<User> {
        let users = self.users.read().await;
        users.get(id).cloned()
    }
}

async fn on_connect(socket: SocketRef, Data(data): Data<Value>, State(state): State<GameState>) {
    info!(ns = socket.ns(), ?socket.id, ?data, "Socket connected");

    // Add user to the HashMap when socket connects
    state
        .add_user(
            socket.id.to_string(),
            User {
                name: format!("anon-{}", socket.id),
            },
        )
        .await;

    socket
        .emit(
            "message",
            &ServerMessage {
                content: "Welcome to Aza's Tower!".to_string(),
                ..Default::default()
            },
        )
        .ok();

    // Handle receiving messages
    socket.on(
        "message",
        async |io: SocketIo,
               socket: SocketRef,
               Data::<ClientMessage>(message),
               State::<GameState>(state)| {
            info!(?message, "Received message:");

            let user = state.get_user(socket.id.as_str()).await.unwrap();

            io.emit(
                "message",
                &ServerMessage {
                    author_type: MessageAuthorType::User,
                    author_name: Some(user.name),
                    content: message.content,
                },
            )
            .await
            .ok();
        },
    );

    // Handle disconnects
    socket.on_disconnect(
        async |socket: SocketRef, reason: DisconnectReason, State(state): State<GameState>| {
            info!(?socket.id, ?reason, "Socket disconnected");
            // Remove user from the HashMap when socket disconnects
            state.remove_user(socket.id.as_str()).await;
        },
    );
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::builder()
        .with_state(GameState::new())
        .build_layer();

    io.ns("/", on_connect);

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any);

    let app = axum::Router::new()
        .route("/", get(async || "Hello, World!"))
        .layer(ServiceBuilder::new().layer(cors).layer(layer));

    info!("Starting server");

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3004")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
