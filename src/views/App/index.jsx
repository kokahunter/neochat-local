import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Grid from "react-bootstrap/lib/Grid";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import { react } from "@nosplatform/api-functions";
import { u, wallet } from "@cityofzion/neon-js";
import { unhexlify } from "binascii";
// import { nosPropTypes } from "@nosplatform/api-functions/es6";
// import { injectNOS } from "../../nos";
import ChatMenu from "./../../components/ChatMenu";
import ChatContent from "./../../components/ChatContent";
import NosGrey from "./../../nos_grey.svg";
import NeoLogo from "./../../neo.svg";
import { encrypt, decrypt, getPublicKey } from "./../../crypto";

const { injectNOS, nosProps } = react.default;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recvCount: 0,
      sendCount: 0,
      chatMessages: {},
      activeAddress: "welcome",
      userAddress: "",
      userPkey: "",
      menu: {},
      filteredMessages: [],
      scriptHash: "31e7d16d418156600a7d1f6280b409ff4d707302",
      registered: false,
      userAccount: {}
    };
  }
  componentDidMount() {
    if (this.props.nos.exists) {
      this.props.nos.getAddress().then(address => {
        this.state.userAddress = address;
        this.setState({
          userAddress: this.state.userAddress
        });
        this.getUserPK().then(data => {
          this.state.userPkey = data;
          this.setState({
            userPkey: this.state.userPkey
          });
        });
        this.getUserAccount(this.state.scriptHash, this.state.userAddress);
      });
    }
  }

  getUserPK = async () => getPublicKey();

  getDateTime = unixTimestamp => {
    const date = new Date(unixTimestamp * 1000);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`;
    const seconds = `0${date.getSeconds()}`;
    return `${date.toLocaleDateString()} ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
  };
  getUserData = async (scriptHash, uuid) => {
    await this.handleGetStorage(scriptHash, uuid, false, false)
      .then(data => {
        if (data != null) {
          const tmp = this.deserialize(data, "account");
          this.state.userAccount = {
            key: tmp[0],
            uuid: tmp[1],
            name: tmp[2],
            time: this.getDateTime(tmp[3]),
            pkey: tmp[9]
          };
          this.state.registered = true;
          this.setState({
            userAccount: this.state.userAccount,
            registered: true
          });
        }
      })
      // eslint-disable-next-line no-alert
      .catch(err => alert(`getUserData Error: ${err.message}`));
  };
  getUserAccount = async (scriptHash, addr) => {
    await this.handleGetStorage(
      scriptHash,
      unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))),
      true,
      false
    )
      .then(data => {
        if (data === null) {
          this.setState({
            registered: false
          });
        } else {
          this.getUserData(scriptHash, data);
        }
      })
      // eslint-disable-next-line no-alert
      .catch(err => alert(`getUserAccount Error: ${err.message}`));
  };
  getMessageCount = async () => {
    await this.getRecvCount(this.state.scriptHash, this.state.userAddress);
    await this.getSendCount(this.state.scriptHash, this.state.userAddress);
  };
  getRecvCount = async (scriptHash, addr) => {
    await this.handleGetStorage(
      scriptHash,
      `${unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr)))}.receive.latest`,
      true,
      false
    )
      .then(data => {
        this.setState({
          recvCount: parseInt(data, 16)
        });
      })
      // eslint-disable-next-line no-alert
      .catch(err => alert(`Error: ${err.message}`));
  };
  getSendCount = async (scriptHash, addr) => {
    await this.handleGetStorage(
      scriptHash,
      `${unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr)))}.send.latest`,
      true,
      false
    )
      .then(data => {
        this.setState({
          sendCount: parseInt(data, 16)
        });
      })
      // eslint-disable-next-line no-alert
      .catch(err => alert(`Error: ${err.message}`));
  };
  getReceiverData = async uuid => {
    const data = await this.handleGetStorage(this.state.scriptHash, uuid, false, false);
    const tmp = this.deserialize(data, "account");
    return tmp;
  };
  verifyReceiver = async addr => {
    const uuid = await this.handleGetStorage(
      this.state.scriptHash,
      unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))),
      true,
      false
    );
    if (uuid === null) {
      return false;
    }
    const data = await this.getReceiverData(uuid);
    return data;
  };
  concatBytes = (source, start, length) => {
    let temp = "";
    for (let i = start; i < length; i += 1) temp += source[i];
    return temp;
  };
  createChat = async (addr, encrypted) => {
    /*
    menu[addr] = array:
      0: address
      1: boolean encrypted. True if receiver has account
      2: unique id
      3: display name
      4: public key
    */
    if (this.state.menu[addr] === undefined) {
      if (encrypted) {
        const data = await this.verifyReceiver(addr);
        this.state.menu[addr] = [addr, encrypted, data[1], data[2], data[9]];
        // this.setState({ menu: this.state.menu });
        return this.state.menu;
      }
      this.state.menu[addr] = [addr, encrypted];
      return this.state.menu;
      // this.setState({ menu: this.state.menu });
    } else if (this.state.menu[addr][1] === false && encrypted === true) {
      const data = await this.verifyReceiver(addr);
      this.state.menu[addr] = [addr, encrypted, data[1], data[2], data[9]];
      // this.setState({ menu: this.state.menu });
      return this.state.menu;
    }
    return false;
  };

  handleClick = e => {
    const clickKey = e;
    if (clickKey.length === 34) {
      // address handle chat filtered state messages
      const sortable = [];
      // send messages
      if (this.state.chatMessages.send[clickKey] !== undefined) {
        for (let i = 0; i < this.state.chatMessages.send[clickKey].length; i += 1) {
          // for(var [key,message,time] in this.state.chatMessages["send"][e.key]){
          const tmp = this.state.chatMessages.send[clickKey][i];
          const { key, time, message, direction } = tmp;
          const dateTime = this.getDateTime(tmp.time);
          // const key = this.state.chatMessages.send[clickKey][i].key;
          // const time = this.state.chatMessages.send[clickKey][i].time;
          // const message = this.state.chatMessages.send[clickKey][i].message;
          // const direction = this.state.chatMessages.send[clickKey][i].direction;
          // const dateTime = this.getDateTime(this.state.chatMessages.send[clickKey][i].time);
          sortable.push({
            key,
            time,
            message,
            direction,
            dateTime
          });
        }
      }
      // receive messages
      if (this.state.chatMessages.receive[clickKey] !== undefined) {
        for (let i = 0; i < this.state.chatMessages.receive[clickKey].length; i += 1) {
          // for(var [key,message,time] in this.state.chatMessages["send"][e.key]){
          const tmp = this.state.chatMessages.receive[clickKey][i];
          const { key, time, message, direction } = tmp;
          const dateTime = this.getDateTime(tmp.time);
          // var key = this.state.chatMessages.receive[clickKey][i].key;
          // var time = this.state.chatMessages.receive[clickKey][i].time;
          // var message = this.state.chatMessages.receive[clickKey][i].message;
          // var direction = this.state.chatMessages.receive[clickKey][i].direction;
          // var dateTime = this.getDateTime(this.state.chatMessages.receive[clickKey][i].time);
          sortable.push({
            key,
            time,
            message,
            direction,
            dateTime
          });
        }
      }
      sortable.sort((a, b) => a.time - b.time);
      this.setState({ filteredMessages: sortable });
    } else if (clickKey === "reload") {
      this.setState({ filteredMessages: [] });

      this.getMessageCount().then(() => {
        this.fetchMessages(
          this.state.scriptHash,
          this.state.userAddress,
          this.state.recvCount,
          this.state.sendCount
        );
      });
    } else {
      this.setState({ filteredMessages: [] });
    }
    this.setState({ activeAddress: clickKey });
  };
  /**
   * Deserializes a serialized array that's passed as a hexstring
   * @param {hexstring} rawData
   */
  deserialize = (rawData, realm) => {
    // Split into bytes of 2 characters
    const rawSplitted = rawData.match(/.{2}/g);
    // console.log(rawSplitted);
    // see https://github.com/neo-project/neo/blob/master/neo/SmartContract/StackItemType.cs for data types
    /*
        ByteArray = 0x00,
        Boolean = 0x01,
        Integer = 0x02,
        InteropInterface = 0x40,
        Array = 0x80,
        Struct = 0x81,
        Map = 0x82,
    */
    // skip 80 (array) => we do only array

    // the array length
    const arrayLen = parseInt(rawSplitted[1], 16);
    // console.log("arrayLen" + arrayLen);
    let offset = 2;
    const rawArray = [];
    // console.log(arrayLen);
    for (let i = 0; i < arrayLen; i += 1) {
      // get item type
      const itemType = parseInt(rawSplitted[offset], 16);
      // console.log("itemtype" + itemType)
      offset += 1;

      // get item length
      let itemLength = parseInt(rawSplitted[offset], 16);
      // console.log("itemLength" + itemLength)
      // serialize: https://github.com/neo-project/neo-vm/blob/master/src/neo-vm/Helper.cs#L41-L64
      offset += 1;
      if (itemLength === 253) {
        // new itemlentgh = reverse int of next 2
        itemLength = parseInt(u.reverseHex(this.concatBytes(rawSplitted, offset, offset + 2)), 16);
        offset += 2;

        /* d
          writer.Write((byte)0xFD);
          writer.Write((ushort)value);
        */
        /* s
        value = reader.ReadUInt16();
       */
      } else if (itemLength === 254) {
        // new itemlentgh = reverse int of next 4
        itemLength = parseInt(u.reverseHex(this.concatBytes(rawSplitted, offset, offset + 2)), 16);
        offset += 4;
        /* d
          writer.Write((byte)0xFE);
          writer.Write((uint)value);
        */
        /* s
       value = reader.ReadUInt32();
       */
      } else if (itemLength === 255) {
        // new itemlentgh = reverse int of next 8
        itemLength = parseInt(u.reverseHex(this.concatBytes(rawSplitted, offset, offset + 2)), 16);
        offset += 8;
        /* d
          writer.Write((byte)0xFF);
          writer.Write(value); */
        /* s
          value = reader.ReadUInt64();
          */
      } else {
        /* d
           writer.Write((byte)value);
          */
        /* s
          value = fb;
         */
      }
      // console.log("itemLength" + itemLength)
      // console.log(offset);
      let data = this.concatBytes(rawSplitted, offset, itemLength + offset);
      // console.log(i);
      // console.log(itemType);
      // console.log(data);
      // console.log(data);
      if (itemType === 2) {
        // console.log("data: " + parseInt(u.reverseHex(data),16));
        if (realm === "message") {
          data = u.reverseHex(data);
        } else {
          data = parseInt(u.reverseHex(data), 16);
        }
        // console.log ("TIME" + data);
      } else if (itemType === 0) {
        // [unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress))),
        // data = hexlify(u.reverseHex(wallet.getAddressFromScriptHash))
        if (realm === "message") {
          if (i === 0) {
            // console.log(u.hexstring2str(data));
            data = u.hexstring2str(data);
          } else if (i === 3 || i === 4) {
            data = parseInt(data, 16) === 1;
          } else {
            data = wallet.getAddressFromScriptHash(u.reverseHex(data));
          }
        } else if (i === 0) {
          data = wallet.getAddressFromScriptHash(u.reverseHex(data));
        } else {
          data = u.hexstring2str(data);
        }
      }
      rawArray.push(data);
      // console.log("pushed to array")
      offset = itemLength + offset;
      // console.log("new offset" + offset);
    }
    // 0:message
    // 1:time
    // 2:addr
    return rawArray;
  };
  fetchMessages = async (scriptHash, addr, recvCount, sendCount) => {
    // console.log(`ASF${sendCount}`);
    const { createChat } = this;
    // get received messages
    // console.log(`Getting ${recvCount} received messages`);
    const tmp = {
      send: {},
      receive: {}
    };
    let deserialized = [];
    let promises = [];
    const { deserialize } = this;
    if (recvCount > 0) {
      promises = [];
      for (let i = 0; i < recvCount; i += 1) {
        promises.push(
          this.handleGetStorage(
            scriptHash,
            `${unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr)))}.receive.${unhexlify(
              u.int2hex(i + 1)
            )}`,
            true,
            false
          )
        );
      }

      Promise.all(promises).then(results => {
        const count = [];
        results.forEach(async entry => {
          deserialized = [];
          deserialized = deserialize(entry, "message");
          let msgD = deserialized[0];
          const timeD = parseInt(deserialized[1], 16);
          const addrD = deserialized[2];
          const ipfsT = deserialized[3];
          const encryptedT = deserialized[4];
          const data = await createChat(addrD, encryptedT);
          if (data !== false) {
            this.setState({ menu: data });
          }
          if (tmp.receive[addrD] === undefined) {
            count[addrD] = 0;
            tmp.receive[addrD] = [{}];
          }
          if (encryptedT) {
            msgD = decrypt(this.state.menu[addrD][4], "", "", msgD);
          }
          tmp.receive[addrD][count[addrD]] = {
            key: `receive${count[addrD]}`,
            message: msgD,
            time: timeD,
            direction: "receive",
            ipfs: ipfsT,
            encrypted: encryptedT
          };
          count[addrD] += 1;
        });
      });
    }
    // get send messages
    if (sendCount > 0) {
      promises = [];
      for (let i = 0; i < sendCount; i += 1) {
        promises.push(
          this.handleGetStorage(
            scriptHash,
            `${unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr)))}.send.${unhexlify(
              u.int2hex(i + 1)
            )}`,
            true,
            false
          )
        );
      }
      Promise.all(promises).then(results => {
        const countt = [];
        results.forEach(async entry => {
          deserialized = [];
          deserialized = await deserialize(entry, "message");
          let msgD = deserialized[0];
          const timeD = parseInt(deserialized[1], 16);
          const addrD = deserialized[2];
          const ipfsT = deserialized[3];
          const encryptedT = deserialized[4];
          const data = await createChat(addrD, encryptedT);
          if (data !== false) {
            this.setState({ menu: data });
          }
          if (tmp.send[addrD] === undefined) {
            countt[addrD] = 0;
            tmp.send[addrD] = [{}];
          }
          if (encryptedT) {
            msgD = await decrypt(this.state.menu[addrD][4], "", "", msgD);
          }
          tmp.send[addrD][countt[addrD]] = {
            key: `send${countt[addrD]}`,
            message: msgD,
            time: timeD,
            direction: "send",
            ipfs: ipfsT,
            encrypted: encryptedT
          };
          countt[addrD] += 1;
        });
      });
    }
    this.state.chatMessages = tmp;
    await this.setState({ chatMessages: this.state.chatMessages });
  };
  handleInvoke = (scriptHash, operation, args) =>
    this.props.nos
      .invoke({ scriptHash, operation, args })
      // eslint-disable-next-line no-alert
      .then(txid => alert(`Invoke txid: ${txid} `))
      // eslint-disable-next-line no-alert
      .catch(err => alert(`Error: ${err.message}`));

  handleGetStorage = async (scriptHash, key, encodeInput, decodeOutput) =>
    this.props.nos
      .getStorage({ scriptHash, key, encodeInput, decodeOutput })
      // eslint-disable-next-line no-alert
      .catch(err => alert(`Storage Error: ${err.message}`));

  invokeRegister = (uuid, name) => {
    this.handleInvoke(this.state.scriptHash, "register", [
      unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress))),
      uuid,
      name,
      this.state.userPkey
    ]);
  };

  invokeSendChat = (addr, message, pk, encrypted) => {
    if (wallet.isAddress(addr)) {
      let messageE = message;
      let valid = true;

      if (pk !== false) {
        if (encrypted === 1 && wallet.isPublicKey(pk)) {
          messageE = encrypt(pk, message);
        } else {
          valid = false;
        }
      }
      if (valid) {
        this.handleInvoke(this.state.scriptHash, "sendMessage", [
          unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress))),
          unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))),
          messageE,
          0 /* IPFS parameter always false, until nOS storage or other storage will be used */,
          encrypted
        ]);
      } else {
        // eslint-disable-next-line no-alert
        alert(`Not a valid public key of receiver: ${pk}`);
      }
    } else {
      // eslint-disable-next-line no-alert
      alert(`Not a valid address: ${addr}`);
    }
  };
  render() {
    const { classes } = this.props;
    const { exists } = this.props.nos;
    return (
      <Grid className={classes.neoChat}>
        <Row className={classes.neoChatBody}>
          <Col className={classes.sider} sm={4}>
            <div className={classes.siderMain}>
              <Row className={classes.chatHeader}>
                <Col className={classes.siderHeaderInner} sm={1}>
                  <div className={classes.siderHeaderLogo}>
                    <img alt="NeoLogo" className="img-responsive" src={`.${NeoLogo}`} />
                  </div>
                </Col>
                <Col className={classes.siderHeaderInner} sm={10}>
                  <span className={classes.headerText5}>{this.state.userAddress}</span>
                </Col>
                <Col className={classes.siderHeaderInner} sm={1}>
                  {exists ? (
                    <DropdownButton
                      bsStyle="default"
                      title={
                        <div style={{ display: "inline-block" }}>
                          <Glyphicon glyph="cog" />
                        </div>
                      }
                      noCaret
                      key="1"
                      bsSize="small"
                      id="dropdown-setting-1"
                    >
                      <MenuItem eventKey="reload" onSelect={this.handleClick}>
                        Load messages
                      </MenuItem>
                      <MenuItem eventKey="new" onSelect={this.handleClick}>
                        New message
                      </MenuItem>
                      {this.state.registered ? (
                        <MenuItem eventKey="account" onSelect={this.handleClick}>
                          Account
                        </MenuItem>
                      ) : (
                        <MenuItem eventKey="register" onSelect={this.handleClick}>
                          Register
                        </MenuItem>
                      )}
                      <MenuItem divider />
                      <MenuItem eventKey="welcome" onSelect={this.handleClick}>
                        About
                      </MenuItem>
                    </DropdownButton>
                  ) : null}
                </Col>
              </Row>
              <Row className={classes.siderSearch}>
                <Col className={classes.siderSearchInner} sm={12}>
                  <FormGroup>
                    <FormControl
                      type="text"
                      placeholder="Search Address"
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row className={classes.siderChats}>
                <Col className={classes.siderChatsInner} sm={12}>
                  <ChatMenu
                    activeAddress={this.state.activeAddress}
                    menu={this.state.menu}
                    onClick={this.handleClick}
                    classes={classes}
                  />
                </Col>
              </Row>
            </div>
          </Col>
          <Col className={classes.chat} sm={8}>
            <ChatContent
              activeAddress={this.state.activeAddress}
              onInvokeSend={this.invokeSendChat}
              onInvokeRegister={this.invokeRegister}
              chatMessages={this.state.filteredMessages}
              classes={classes}
              userAccount={this.state.userAccount}
              verifyReceiver={this.verifyReceiver}
            />
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  "@import": "https://fonts.googleapis.com/css?family=Source+Sans+Pro",
  "@global html, body": {
    fontFamily: "Source Sans Pro,Helvetica,Arial,sans-serif",
    margin: 0,
    padding: 0,
    backgroundColor: "#f0f2f5"
  },
  App: {
    textAlign: "center"
  },
  intro: {
    fontSize: "large"
  },
  lineBreak: {
    width: "75%",
    borderTop: "1px solid #333333",
    margin: "32px auto"
  },
  neoChat: {
    overflow: "hidden",
    padding: 0,
    margin: "auto",
    top: `${19}px`,
    height: `calc(${100}vh - ${38}px)`,
    position: "relative",
    boxShadow: "0 1px 1px 0 rgba(0, 0, 0, .06), 0 2px 5px 0 rgba(0, 0, 0, .2)"
  },
  neoChatBody: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f7f7f7",
    height: `${100}%`,
    overflow: "hidden"
  },
  sider: {
    height: `${100}%`,
    margin: 0,
    padding: 0
  },
  siderMain: {
    padding: 0,
    margin: 0,
    top: 0,
    height: `${100}%`
  },
  siderHeaderInner: {
    height: `${100}%`,
    padding: 0,
    margin: 0
  },
  siderSearch: {
    margin: 0,
    backgroundColor: "#f7f7f7",
    height: `${60}px`,
    padding: "10px 5px 10px 5px"
  },
  siderSearchInner: {},
  siderChats: {
    padding: 0,
    margin: 0,
    height: `calc(${100}% - ${120}px)`,
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: "#fff",
    border: `${1}px solid #f7f7f7`
  },
  chatSearch: {
    width: `${100}%`
  },
  siderChatsInner: {
    padding: 0,
    margin: 0
  },
  siderChatBody: {
    height: `${65}px`,
    margin: 0,
    border: "none",
    borderBottom: `${1}px solid #f7f7f7`,
    position: "relative",
    padding: `${0}px`,
    borderTopLeftRadius: `${0}!important`,
    borderTopRightRadius: `${0}!important`,
    borderBottomLeftRadius: `${0}!important`,
    borderBottomRightRadius: `${0}!important`,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f2f2f2"
    }
  },
  noMargin: {
    margin: `${0}!important`
  },
  chat: {
    borderLeft: `${1}px solid rgba(0, 0, 0, .1);`,
    height: `${100}%`,
    // overflowY: "auto",
    margin: 0,
    padding: 0
  },
  chatHeader: {
    background: "#ececec",
    height: `${60}px`,
    margin: 0,
    zIndex: 447,
    padding: "10px 5px 10px 5px"
  },
  chatHeaderInner: {},
  chatMessages: {
    padding: 0,
    margin: 0,
    overflowY: "auto",
    height: `calc(${100}% - ${120}px)`,
    border: `${1}px solid #f7f7f7`,
    backgroundImage: `url(.${NosGrey})`,
    backgroundSize: "cover"
  },
  chatMessagesBody: {
    padding: 0,
    margin: 0
  },
  message: {
    margin: 0,
    width: "auto",
    height: "auto",
    padding: "2px 20px"
  },
  messageReceive: {
    maxWidth: "80%"
  },
  messageSend: {
    maxWidth: "80%",
    marginLeft: "20%",
    padding: "2px 20px"
  },
  messageText: {
    margin: 0,
    padding: `${5}px`,
    fontSize: `${14}px`,
    wordWrap: "break-word",
    fontWeight: 200,
    paddingBottom: 0
  },
  messageTime: {
    margin: 0,
    fontSize: `${12}px`,
    textAlign: "right",
    color: "#949494",
    float: "right"
  },
  chatReply: {
    height: `${60}px`,
    backgroundColor: "#F0F0F0",
    margin: 0,
    padding: "10px 5px 10px 5px"
  },
  replyEmojis: {},
  welcomeFooter: {},
  replyInput: {},
  replySend: {},
  receiver: {
    width: "auto",
    background: "#FFF",
    display: "inline-block",
    wordWrap: "break-word",
    padding: "4px 10px 7px 10px",
    textShadow: "0 1px 1px rgba(0, 0, 0, .2)",
    borderRadius: "0 13px 13px 13px"
  },
  sender: {
    width: "auto",
    float: "right",
    background: "#DCF8C7",
    display: "inline-block",
    wordWrap: "break-word",
    padding: "4px 10px 7px 10px",
    textShadow: "0 1px 1px rgba(0, 0, 0, .2)",
    borderRadius: "13px 0 13px 13px"
  },
  siderHeaderLogo: {
    height: `${100}%`,
    width: `${100}%`,
    padding: 0,
    margin: 0
  },
  headerText2: {
    margin: `${0}px`,
    display: "block",
    fontSize: `${1.7}em`,
    fontWweight: "bold"
  },
  headerText3: {
    margin: `${0}px`,
    display: "block",
    fontSize: `${1.5}em`,
    fontWweight: "bold"
  },
  headerText4: {
    margin: `${0}px`,
    display: "block",
    fontSize: `${1.17}em`,
    fontWweight: "bold"
  },
  headerText5: {
    margin: `${0}px`,
    display: "block",
    fontSize: `${1}em`,
    fontWweight: "bold"
  }
};

/*
const App = ({ classes }) => (
  <div className={classes.App}>
    <Header title="A nOS dApp starter-kit!" />
    <p className={classes.intro}>
      To get started, edit <code>src/views/App/index.js</code> and save to reload.
    </p>
    <p className={classes.intro}>Or test out the following demo functions!</p>
    <hr className={classes.lineBreak} />
    <NOSActions />
  </div>
);

*/
App.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  nos: nosProps.isRequired
};

export default injectNOS(injectSheet(styles)(App));

// export default injectStore((App));
