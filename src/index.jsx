import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { create as createJss } from "jss";
import camelCase from "jss-camel-case";
import nested from "jss-nested";
import globalStyles from "jss-global";
import vendorPrefixer from "jss-vendor-prefixer";
import { JssProvider } from "react-jss";
import PropTypes from "prop-types";
import App from "./views/App";

import { StoreProvider, defaultStore } from "./store";

const jss = createJss();

jss.use(vendorPrefixer(), camelCase(), globalStyles(), nested());

class NeoChat extends React.Component {
  static propTypes = {
    children: PropTypes.objectOf(PropTypes.any).isRequired
  };

  /* eslint-disable react/no-unused-state */
  state = Object.assign(defaultStore, {
    setRecvCount: recvCount => {
      Object.assign(this.state.recvCount, recvCount);
    },
    setSendCount: sendCount => {
      Object.assign(this.state.sendCount, sendCount);
    }
  });
  /* eslint-enable */

  render() {
    const { children } = this.props;
    return <StoreProvider value={this.state}>{children}</StoreProvider>;
  }
}

ReactDOM.render(
  <NeoChat>
    <JssProvider jss={jss}>
      <App />
    </JssProvider>
  </NeoChat>,
  document.getElementById("root")
);
