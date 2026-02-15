import { Input } from "@pixi/ui";
import {
  Application,
  Container,
  Graphics,
  GraphicsContext,
  Text,
  type FillInput,
  type TextStyleOptions,
} from "pixi.js";
import type { Server } from "@classes/server";
import { MessageAuthorType, type ServerMessage } from "@generated/server";
import type { Game } from "./game";

export class GameConsole extends Container {
  private MARGIN = 10;
  private PADDING = 10;
  private MESSAGE_HEIGHT = 24;
  private MAX_MESSAGES = 10;
  private TEXT_OFFSET = 4;
  private MIN_INPUT_WIDTH = 300;
  private BACKGROUND_COLOR: FillInput = { h: 0, s: 0, l: 0, a: 0.8 };
  private TEXT_STYLE: TextStyleOptions = {
    stroke: undefined,
    fill: "white",
    textBaseline: "ideographic",
  };

  game: Game;
  messageContainer: Container;
  messages: ServerMessage[] = [];
  input: Input & { bg: Graphics };

  constructor({ game }: { game: Game }) {
    super();

    this.game = game;

    // Create message container
    // This is the actual container containing all visible console messages
    const _messageContainer = new Container({ label: "messageContainer" });
    this.messageContainer = _messageContainer;
    this.addChild(this.messageContainer);

    // Create input for sending messages/commands
    const inputWidth = Math.max(
      this.messageContainer.width,
      this.MIN_INPUT_WIDTH,
    );
    const inputHeight = this.MESSAGE_HEIGHT + this.PADDING * 2;
    const _input = new Input({
      bg: new Graphics()
        .rect(0, 0, inputWidth, inputHeight)
        .fill({ h: 0, s: 0, l: 10, a: 0.8 }),
      textStyle: this.TEXT_STYLE,
      align: "left",
      placeholder: "Say something...",
      padding: this.PADDING,
      maxLength: 100,
    });
    // Cast as any because input will always have a Graphics background
    this.input = _input as any;
    this.input.x = this.MARGIN;
    this.input.y = this.game.app.screen.height - inputHeight - this.MARGIN;
    this.input.onEnter.connect((value) => {
      if (!value) return;

      // Send the typed message to the server
      this.game.server.sendMessage({
        content: value,
      });

      this.input.value = "";
    });
    this.addChild(this.input);

    // Listen to messages from the server
    this.game.server.onMessage((message) => {
      console.log(`Console received message:`, message);
      // this.replaceMessages(messages);
      this.addMessage(message);
    });
  }

  /** Trigger the console to render */
  render() {
    this.messageContainer.removeChildren();
    if (this.messages.length < 1) return;

    // Slice messages on overflow
    let visibleMessages: Partial<ServerMessage>[] = this.messages;
    if (visibleMessages.length > this.MAX_MESSAGES) {
      visibleMessages = visibleMessages.slice(-this.MAX_MESSAGES);
      visibleMessages.unshift({
        authorType: MessageAuthorType.Other,
        content: "...",
      });
    }

    const margin = this.MARGIN;
    const padding = this.PADDING;
    const messageHeight = this.MESSAGE_HEIGHT;
    const consoleHeight = visibleMessages.length * messageHeight + padding * 2;

    // Move container
    this.messageContainer.y =
      this.game.app.screen.height - consoleHeight - margin - this.input.height;
    this.messageContainer.x = 0 + margin;

    // Create messages
    const messageContainer = new Container();
    for (let i = 0; i < visibleMessages.length; i++) {
      const message = visibleMessages[i];
      const messageY = i * messageHeight + padding - this.TEXT_OFFSET;
      const typePrefix =
        message.authorType === MessageAuthorType.Server ? "server" : null;
      const authorPrefix =
        message.authorType === MessageAuthorType.User
          ? message.authorName
          : null;
      const typePrefixText = typePrefix
        ? new Text({
            text: `[${typePrefix}] `,
            style: { ...this.TEXT_STYLE, fill: "tomato" },
            x: padding,
            y: messageY,
          })
        : null;
      const authorPrefixText = authorPrefix
        ? new Text({
            text: `<${authorPrefix}> `,
            style: { ...this.TEXT_STYLE, fill: "darkgray" },
            x: padding + (typePrefixText?.width || 0),
            y: messageY,
          })
        : null;
      const contentText = new Text({
        text: `${message.content}`,
        style: this.TEXT_STYLE,
        x:
          padding +
          (typePrefixText?.width || 0) +
          (authorPrefixText?.width || 0),
        y: messageY,
      });
      if (typePrefixText) messageContainer.addChild(typePrefixText);
      if (authorPrefixText) messageContainer.addChild(authorPrefixText);
      messageContainer.addChild(contentText);
    }

    // Create background
    const backgroundContext = new GraphicsContext()
      .rect(0, 0, messageContainer.width + padding * 2, consoleHeight)
      .fill(this.BACKGROUND_COLOR);
    const background = new Graphics(backgroundContext);

    this.messageContainer.addChild(background);
    this.messageContainer.addChild(messageContainer);

    // Update input width
    this.input.bg.width = background.width;
  }

  /** Add a message to the console */
  addMessage(...messages: ServerMessage[]) {
    for (const message of messages) {
      if (this.messages.some((x) => x.id === message.id)) continue;
      this.messages.push(message);
    }

    this.render();
  }

  /** Replace all messages in the console */
  replaceMessages(messages: ServerMessage[]) {
    this.messages = messages;

    this.render();
  }
}
