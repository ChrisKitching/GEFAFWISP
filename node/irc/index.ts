import {Client} from 'irc';

export class IrcClient {
  ircClient: Client;
  onMessage: (message: string) => void;
  
  constructor(nickname: string, channels: string[], webContents: {send: (channel: string, message: string) => void}) {
    this.ircClient = new Client('irc.faforever.com', nickname, {channels: channels});
    this.onMessage = (message) => webContents.send('chat', message);
    this.ircClient.on('message#', (from: string, to: string, message: string) => {
      this.onMessage(`<${from}> ${message}`);
    });
    this.ircClient.on('raw', console.log);
    this.ircClient.on('motd', (message: string) => {
      console.log("received motd with:", message);
    });
    this.ircClient.on('error', (err: Error) => console.error(err));
  }
}
