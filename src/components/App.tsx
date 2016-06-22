import "../styles/Hello.scss";
import * as React from "react";
import HelloComponent from "./Hello.tsx";

interface AppProps {
  name:string
}

class AppComponent extends React.Component<AppProps, {}> {
  constructor(props:AppProps) {
    super(props);
  }

  render() {
    return (
        <HelloComponent name = {this.props.name
  } />
  )
    ;
  }
}

export default AppComponent;
