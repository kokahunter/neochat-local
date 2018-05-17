import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { nosPropTypes } from "@nosplatform/api-functions/es6";
import { injectStore } from "./../../store";
import { u, wallet } from "@cityofzion/neon-js"
import { injectNOS } from "../../nos";
import { Button } from 'antd';


const styles = {
  button: {
    margin: "16px",
    fontSize: "14px"
  }
};

class NOSActions extends React.Component {

  handleGetAddress = async () => alert(await this.props.nos.getAddress());

  handleClaimGas = () =>
    this.props.nos
      .claimGas()
      .then(alert)
      .catch(alert);

  handleGetBalance = async scriptHash => alert(await this.props.nos.getBalance(scriptHash));

  handleTestInvoke = async (scriptHash, operation, args) =>
    alert(await this.props.nos.testInvoke(scriptHash, operation, args));

  handleInvoke = async (scriptHash, operation, args) =>
    alert(await this.props.nos.testInvoke(scriptHash, operation, args));

  handleGetStorage = async (scriptHash, key) =>
    await this.props.nos.getStorage(scriptHash, key);

  handleRecvCount = async (scriptHash, addr) =>
    this.setState({
      recvCount: await this.props.nos.getStorage(scriptHash, addr + ".receive.latest")
    })
  handleSendCount = async (scriptHash, addr) =>
    //this.setProps({
    //  sendCount: await this.props.nos.getStorage(scriptHash, addr + ".send.latest")
    //})
    this.props.store.sendCount = await this.props.nos.getStorage(scriptHash, addr + ".send.latest");
    //alert(await this.props.nos.getStorage(scriptHash, addr + ".send.latest"));

  handleRecvMessage = async (scriptHash, addr, index) =>
    await this.props.nos.getStorage(scriptHash, addr + ".receive.1");

  handleSendMessage = async (scriptHash, addr, index) =>
    await this.props.nos.getStorage(scriptHash, addr + ".send." + index);

  fetchRecvMessages = async (scriptHash, addr, count) => {
    var ba = require('binascii');
    if (count > 0){
      var promises = [];
      for (var i = 0; i< count; i++){
        promises.push(this.handleGetStorage(scriptHash, addr + ".receive." + ba.unhexlify(u.int2hex(i+1))));
      }

      var tmp = [];
      Promise.all(promises).then(results => {
        //this.state.recvMessages[i] = result;
        count = 0;
        results.forEach(function(entry){
          console.log("tst");
          console.log(entry);
          tmp[count] = entry;
          count++;
        });
        this.props.recvMessages = tmp;
      });
    }
  }

  render() {
    const { classes } = this.props;
    const { sendCount, recvCount } = this.props.store;

    
    // Get Balance
    const neo = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
    // const gas = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    // const rpx = "ecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9";

    // (test) Invoke
    const scriptHashNeoAuth = "2f228c37687d474d0a65d7d82d4ebf8a24a3fcbc";
    const operation = "9937f74e-1edc-40ae-96ad-1120166eab1b";
    const args = "ef68bcda-2892-491a-a7e6-9c4cb1a11732";

    // Get Storage
    const scriptHashNeoChat = "83a3c98f5bd40f544f7905f3b5ae107e914f425e";
    //const addr = ba.unhexlify(u.reverseHex(wallet.getScriptHashFromAddress("AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y")));

    var ba = require('binascii'); 
    const addr = ba.unhexlify(u.reverseHex(wallet.getScriptHashFromAddress("AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y")));

    return (
      <React.Fragment>
        <Button type="primary">Button</Button>
        Send: {sendCount} | Recive: {recvCount}
        <button
          className={classes.button}
          onClick={() => alert(sendCount +" "+ recvCount)}
        >
          show state resv messages
        </button>
        <button
          className={classes.button}
          onClick={() => this.fetchRecvMessages(scriptHashNeoChat,addr,recvCount)}
        >
          fetch recv messages
        </button>
        <button
          className={classes.button}
          onClick={() => this.handleSendCount(scriptHashNeoChat,addr)}
        >
          count sent messages
        </button>
        <button
          className={classes.button}
          onClick={() => this.handleRecvCount(scriptHashNeoChat,addr)}
        >
          count received messages
        </button>
        <button className={classes.button} onClick={this.handleGetAddress}>
          Get Address
        </button>
        <button className={classes.button} onClick={() => this.handleGetBalance(neo)}>
          Get NEO Balance
        </button>
        {/*
          <button
            className={classes.button}
            onClick={() => this.handleGetBalance(gas)}
          >
            Get GAS Balance
          </button>
          <button
            className={classes.button}
            onClick={() => this.handleGetBalance(rpx)}
          >
            Get RPX Balance
          </button>
        */}
        <button className={classes.button} onClick={this.handleClaimGas}>
          Claim Gas
        </button>
        <button
          className={classes.button}
          onClick={() => this.handleTestInvoke(scriptHashNeoAuth, operation, args)}
        >
          TestInvoke (NeoAuth)
        </button>
        {/*
          <button
            className={classes.button}
            onClick={() => this.handleInvoke(scriptHashNeoAuth, operation, args)}
          >
            Invoke (NeoAuth)
          </button>
        */}
        <button
          className={classes.button}
          onClick={() => this.handleGetStorage(scriptHashNeoBlog, key)}
        >
          GetStorage (NeoBlog)
        </button>
      </React.Fragment>
    );
  }
}

NOSActions.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  nos: nosPropTypes.isRequired,
  store: PropTypes.objectOf(PropTypes.any).isRequired
};

export default injectStore(injectNOS(injectSheet(styles)(NOSActions)));
