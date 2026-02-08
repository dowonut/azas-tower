use bevy::asset::uuid::Uuid;
use crossbeam_channel::{Receiver, Sender};
use rmpv::Value;
use serde::{Deserialize, Serialize};
use socketioxide::extract::{AckSender, Data, SocketRef, State};
use socketioxide::socket::DisconnectReason;
use socketioxide::{ProtocolVersion, SocketIo, TransportType};
use tracing::info;
use typeshare::typeshare;

#[derive(Debug, Clone)]
pub struct SocketContext {
    pub socket_id: String,
    pub player_id: Uuid,
}

#[derive(Debug)]
pub enum SocketEvent {
    Connected {
        context: SocketContext,
    },
    Disconnected {
        context: SocketContext,
        reason: DisconnectReason,
    },
    Message {
        context: SocketContext,
        content: String,
    },
}

pub type SocketEventSender = Sender<SocketEvent>;
pub type SocketEventReceiver = Receiver<SocketEvent>;

pub fn create_socket_event_channel() -> (SocketEventSender, SocketEventReceiver) {
    crossbeam_channel::unbounded()
}

#[derive(Serialize, Default, Debug, Clone)]
#[serde(rename_all = "snake_case")]
#[typeshare]
pub enum MessageAuthorType {
    #[default]
    Server,
    User,
    Other,
}

#[derive(Serialize, Default, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ServerMessage {
    pub author_type: MessageAuthorType,
    pub author_name: Option<String>,
    pub content: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
struct ClientMessage {
    content: String,
}

#[derive(Deserialize, Debug)]
struct PlayerMove {
    x: i32,
    y: i32,
}

/// Handles new socket connections
pub async fn on_connect(
    _io: SocketIo,
    socket: SocketRef,
    transport: TransportType,
    protocol: ProtocolVersion,
    Data(data): Data<Value>,
    State(socket_tx): State<SocketEventSender>,
) {
    let player_id = Uuid::new_v4();
    let socket_id = socket.id.to_string();
    let context = SocketContext {
        socket_id: socket_id.clone(),
        player_id,
    };

    info!(
        ns = socket.ns(),
        ?socket_id,
        ?player_id,
        ?data,
        ?transport,
        ?protocol,
        "Socket connected"
    );

    // Send connection event
    socket_tx
        .send(SocketEvent::Connected {
            context: context.clone(),
        })
        .ok();

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
    let socked_context_cloned = context.clone();
    socket.on(
        "message",
        async |Data::<ClientMessage>(message), State(socket_tx): State<SocketEventSender>| {
            socket_tx
                .send(SocketEvent::Message {
                    context: socked_context_cloned,
                    content: message.content,
                })
                .ok();
        },
    );

    // Handle pings with acknowledgement
    socket.on("ping", async |ack: AckSender| {
        ack.send("pong").ok();
    });

    // Handle player movement
    socket.on("player:move", async |Data::<PlayerMove>(data)| {
        info!(?data, "Received player:move");

        // // Update the user with the new position
        // state
        //     .update_user(
        //         socket.id.as_str(),
        //         UserUpdate {
        //             position: Some(Point(data.x, data.y)),
        //             ..Default::default()
        //         },
        //     )
        //     .await;
    });

    // Handle disconnects
    let socked_context_cloned = context.clone();
    socket.on_disconnect(
        async |reason: DisconnectReason, State(socket_tx): State<SocketEventSender>| {
            socket_tx
                .send(SocketEvent::Disconnected {
                    context: socked_context_cloned,
                    reason,
                })
                .ok();
        },
    );
}
