import * as React from 'react';
import {ipcRenderer} from 'electron';

interface ChatProps {
    
}

class ChatComponent extends React.Component<ChatProps, {}> {
    constructor(props: ChatProps) {
        super(props);
        ipcRenderer.on('chat', (...args: any[]) => console.log(args));
        console.log("...");
        console.log(ipcRenderer.listenerCount('chat'));
    }

    render() {
        return (
            <div className="chat">
                <h2>Chat</h2>
                <ul>
                    <li>
                        <div className="user">sheeo</div>
                        <div className="message">foo</div>
                    </li>
                </ul>
            </div>
        );
    }
}

export default ChatComponent;
