import '../styles/Hello.scss'
import * as React from 'react';

interface HelloProps {
  name?: string // Optional name
}

class HelloComponent extends React.Component<HelloProps, {}> {
  constructor(props: HelloProps) {
    super(props);
  }

  private _sayHello(x: string = '') {
    return `Hello ${x}`;
  }

  render() {
    return (
      <div className="HelloComponent">
        <p className="greeting">{this._sayHello(this.props.name)}</p>
      </div>
    );
  }
}

export default HelloComponent;
