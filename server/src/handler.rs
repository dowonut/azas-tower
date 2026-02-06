use rmpv::Value;
use serde::{Deserialize, Serialize};
use socketioxide::{
    ProtocolVersion, SocketIo, TransportType,
    extract::{AckSender, Data, SocketRef, State},
    socket::DisconnectReason,
};
use tracing::info;

use crate::state::GameState;
use crate::{
    user::{User, UserUpdate},
    utility::Point,
};

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
enum MessageAuthorType {
    #[default]
    Server,
    User,
    // Other,
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

#[derive(Deserialize, Debug)]
struct PlayerMove {
    x: i32,
    y: i32,
}

pub async fn on_connect(
    _io: SocketIo,
    socket: SocketRef,
    Data(data): Data<Value>,
    State(state): State<GameState>,
    transport: TransportType,
    protocol: ProtocolVersion,
) {
    info!(ns = socket.ns(), ?socket.id, ?data, "Socket connected");
    info!(?transport, ?protocol, "Details");

    // Add user to the HashMap when socket connects
    state
        .add_user(
            socket.id.as_str(),
            User {
                name: format!("anon-{}", socket.id),
                position: Point(0, 128),
                ..Default::default()
            },
        )
        .await;

    // Send a welcome message
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
            info!(?message, "Received message");

            let user = state.get_user(socket.id.as_str()).await.unwrap();

            // Broadcast the message to all clients
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

    // Handle pings with acknowledgement
    socket.on("ping", async |ack: AckSender| {
        ack.send("pong").ok();
    });

    // Handle player movement
    socket.on(
        "player:move",
        async |socket: SocketRef, Data::<PlayerMove>(data), State(state): State<GameState>| {
            info!(?data, "Received player:move");

            // Update the user with the new position
            state
                .update_user(
                    socket.id.as_str(),
                    UserUpdate {
                        position: Some(Point(data.x, data.y)),
                        ..Default::default()
                    },
                )
                .await;
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
