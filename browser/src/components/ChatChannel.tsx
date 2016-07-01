import React = JSX.React;


interface ChannelProps {
    name: string
    messages: {id: string, message: string, from: string}[]
}

/**
 * Component representing one chat channel, its user list, and its input box.
 */
class ChatChannel extends React.Component<ChannelProps, {}> {
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
