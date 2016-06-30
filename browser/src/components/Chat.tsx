import * as React from 'react';
import {ipcRenderer} from 'electron';

interface ChannelProps {
    name: string
    messages: {id: string, message: string, from: string}[]
}

class ChannelComponent extends React.Component<ChannelProps, {}> {
    constructor(props: ChannelProps) {
        super(props);
        this.state = {
            name: '#aeolus',
            messages: [
                {
                    from: "sheeo",
                    id: 'foo',
                    message: "test"
                }
            ]
        }
    }
    render() {
        let messages: JSX.Element[] = [];
        for(let msg of this.props.messages) {
            let {id,message,from} = msg;
            messages.push(<li key={id}><p><div className='from'>{from}</div>{message}</p></li>)
        }
        return <div className="channel">
            <h1>{this.props.name}</h1>
            <ul>
                {messages}
            </ul>
        </div>
    }
}

export interface ChatProps {
    channels: ChannelProps[];
}

export class ChatComponent extends React.Component<ChatProps, {}> {
    constructor(props: ChatProps) {
        super(props);
        this.state = {
            channels: ['#aeolus', '#foo']
        };
        ipcRenderer.on('chat', (...args: any[]) => console.log(args));
        console.log("...");
        console.log(ipcRenderer.listenerCount('chat'));
    }

    render() {
        let channels: JSX.Element[] = [];
        let foo = {};
        for(let channel of this.props.channels) {
            let {name,messages} = channel;
            channels.push(<ChannelComponent name={name} messages={messages}/>)
        }
        return (
            <div className="channels">
                {channels}
            </div>
        );
    }
}

export default ChatComponent;
