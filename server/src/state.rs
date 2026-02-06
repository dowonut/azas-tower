use std::{collections::HashMap, sync::Arc};

use serde::Serialize;
use tokio::sync::RwLock;

use crate::{
    user::{User, UserUpdate},
    utility::Point,
};

#[derive(Clone, Debug)]
pub struct GameState(Arc<RwLock<InnerGameState>>);

#[derive(Clone, Debug, Serialize)]
pub struct InnerGameState {
    users: HashMap<String, User>,
}

impl GameState {
    fn new() -> Self {
        GameState(Arc::new(RwLock::new(InnerGameState {
            users: HashMap::new(),
        })))
    }

    pub async fn add_user(&self, id: impl Into<String>, user: User) {
        let mut state = self.0.write().await;
        state.users.insert(id.into(), user);
    }

    pub async fn remove_user(&self, id: &str) {
        let mut state = self.0.write().await;
        state.users.remove(id);
    }

    /// Update a user
    pub async fn update_user(&self, id: &str, update: UserUpdate) -> Option<User> {
        let mut state = self.0.write().await;
        let user = state.users.get_mut(id)?;

        if let Some(name) = update.name {
            user.name = name;
        }

        if let Some(position) = update.position {
            user.position = position;
        }

        Some(user.clone())
    }

    /// Returns a cloned user instance
    pub async fn get_user(&self, id: &str) -> Option<User> {
        let state = self.0.read().await;
        state.users.get(id).cloned()
    }

    /// Returns a cloned hashmap of all users
    // pub async fn get_users(&self) -> HashMap<String, User> {
    //     let state = self.0.read().await;
    //     state.users.clone()
    // }

    /// Returns a copy of the inner game state
    pub async fn get_snapshot(&self) -> InnerGameState {
        let state = self.0.read().await;
        state.clone()
    }
}

impl Default for GameState {
    fn default() -> Self {
        Self::new()
    }
}
