import React from "react";

const defaultStore = {
  recvCount: 0,
  sendCount: 0
};

const { Provider: StoreProvider, Consumer: StoreConsumer } = React.createContext({});

const injectStore = Component => props => (
  <StoreConsumer>{store => <Component store={store} {...props} />}</StoreConsumer>
);

export { StoreProvider, StoreConsumer, injectStore, defaultStore };
