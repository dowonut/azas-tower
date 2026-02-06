use bevy_ecs::prelude::Component;

#[derive(Component, Default)]
pub struct Position {
    pub x: i16,
    pub y: i16,
}

#[derive(Default)]
pub struct Username(String);

#[derive(Component, Default)]
pub struct Player {
    pub username: Username,
}

#[derive(Component, Default)]
pub struct Entity;
