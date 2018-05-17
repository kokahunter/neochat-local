import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { nosPropTypes } from "@nosplatform/api-functions/es6";
import { injectStore } from "./../../store";
import { injectNOS } from "../../nos";
import { u, wallet } from "@cityofzion/neon-js";
import ChatMenu from "./../../components/ChatMenu";
import ChatContent from "./../../components/ChatContent";
import { str2hexstring, int2hex, hexstring2str} from "@cityofzion/neon-js/src/utils";
import { Layout, Menu, Breadcrumb, Icon, Input } from 'antd';
import {unhexlify,hexlify} from 'binascii';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
const Search = Input.Search;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recvCount: 0,
      sendCount: 0,
      chatMessages: {
      },
      activeAddress: "new",
      userAddress: "",
      menu: { },
      filteredMessages:[],
      scriptHash: "8622cca4d552ebbb6a2e1c98473c2bc82aecad38"
    }
  }
  componentDidMount() {
    var promise = [];
    var temp;
    promise.push(this.handleGetAddress());
    Promise.all(promise).then(result => {
      temp = result.toString();
      this.setState({
        userAddress: temp
      })
    });
  }

  handleGetStorage = async (scriptHash, key) =>
    await this.props.nos.getStorage(scriptHash, key);
  handleInvoke = async (scriptHash, operation, args) =>
      await this.props.nos.invoke(scriptHash, operation, args);

  handleTestInvoke = async (scriptHash, operation, args) =>
    alert(JSON.stringify(await this.props.nos.testInvoke(scriptHash, operation, args)));
  
  handleGetAddress = async () => await this.props.nos.getAddress();

  getRecvCount = async (scriptHash, addr) =>
    this.setState({
      recvCount: parseInt(await this.props.nos.getStorage(scriptHash, unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))) + ".receive.latest"),16)
    })
  getSendCount = async (scriptHash, addr) => {
    this.setState({
      sendCount: parseInt(await this.props.nos.getStorage(scriptHash, unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))) + ".send.latest"), 16)
    })
  }

  fetchMessages = async (scriptHash, addr, recvCount, sendCount) => {
    var count = 0;
    const { createChat } = this;
    //get received messages
    console.log("Getting " + recvCount + " received messages");
    var tmp = {
      send: {},
      receive: {}
    }
    var deserialized = [];
    const { deserialize } = this;
    if (recvCount > 0){
      var promises = [];
      for (var i = 0; i< recvCount; i++){
        promises.push(this.handleGetStorage(scriptHash, unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))) + ".receive." + unhexlify(u.int2hex(i+1))));
      }

      Promise.all(promises).then(results => {
        //TODO here the message needs to get deserialized so we get the send-from address, time and message
        var count = 0;
        results.forEach(function(entry){
          deserialized = [];
          deserialized = deserialize(entry);
          var msgD =  deserialized[0];
          var timeD =  parseInt(deserialized[1],16);
          var addrD = deserialized[2];
          console.log("MESSAGE " + msgD);
          console.log("TIME " +timeD);
          console.log("ADDRESS " + addrD);
          if (tmp["receive"][addrD] == undefined){
            count = 0;
            tmp["receive"][addrD] = [{}];
          } 
          tmp["receive"][addrD][count] = {
            key: "receive"+count,
            message: msgD,
            time: timeD,
            direction: "receive"
          }
          createChat(addrD);
          count++;
        });
        console.log("Received messages: " + JSON.stringify(tmp["receive"]));
        this.state.chatMessages = tmp;
        this.setState(
          {chatMessages: this.state.chatMessages}
        )
      });
    }
    //get send messages
    console.log("Getting " + sendCount + " sent messages");
    if (sendCount > 0){
      var promises = [];
      for (var i = 0; i< sendCount; i++){
        promises.push(this.handleGetStorage(scriptHash, unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))) + ".send." + unhexlify(u.int2hex(i+1))));
      }
      Promise.all(promises).then(results => {
        //TODO here the messaage needs to get deserialized so we get the send-to address, time and message
        var count = 0;
        results.forEach(function(entry){
          deserialized = [];
          deserialized = deserialize(entry);
          var msgD =  deserialized[0];
          var timeD =  parseInt(deserialized[1],16);
          var addrD = deserialized[2];

          if (tmp["send"][addrD] == undefined){
            count = 0;
            console.log("here");
            tmp["send"][addrD] = [{}];
          } 
          tmp["send"][addrD][count] = {
            key: "send"+count,
            message: msgD,
            time: timeD,
            direction: "send"
          }
          createChat(addrD);
          count++;
        });
        console.log("Sent messages:" + JSON.stringify(tmp["send"]));
        this.state.chatMessages = tmp;
        this.setState(
          {chatMessages: this.state.chatMessages}
        )
      });
    }
  }
  /**
 * Deserializes a serialized array that's passed as a hexstring
 * @param {hexstring} rawData
 */
  deserialize = rawData => {
    // Split into bytes of 2 characters
    var rawSplitted = rawData.match(/.{2}/g);
    //console.log(rawSplitted);
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
    var arrayLen = parseInt(rawSplitted[1], 16);
    //console.log("arrayLen" + arrayLen);
    let offset = 2;
    var rawArray = [];
  
    for (let i = 0; i < arrayLen; i += 1) {
      //get item type
      var itemType = parseInt(rawSplitted[offset], 16);
      //console.log("itemtype" + itemType)
      offset += 1;

      //get item length
      var itemLength = parseInt(rawSplitted[offset], 16);
      console.log("itemLength" + itemLength)
      offset += 1;
      //console.log(offset);
      let data = this.concatBytes(rawSplitted,offset,itemLength + offset);
      if (itemType == 2){
        //console.log("data: " + parseInt(u.reverseHex(data),16));
        data = u.reverseHex(data);
        console.log ("TIME" + data);
      }
      else if(itemType == 0){
        //[unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress))),
        //data = hexlify(u.reverseHex(wallet.getAddressFromScriptHash))
        if(i==0){
          //console.log(u.hexstring2str(data));
          data = u.hexstring2str(data);
        }
        else{
          data = wallet.getAddressFromScriptHash(u.reverseHex(data))
          //console.log(wallet.getAddressFromScriptHash(u.reverseHex(data)));
        }
      }
      rawArray.push(data);
      //console.log("pushed to array")
      offset = itemLength + offset;
      //console.log("new offset" + offset);
    }
    //0:message
    //1:time
    //2:addr
    return rawArray;
  };

  concatBytes = (source, start, length) => {
    var temp = "";
    for (var i = start; i < length; i += 1) temp += source[i];
    return temp;
  };
    createChat = (addr) => {
      //var timestamp = (new Date()).getTime();
      //var chat = addr + "-" + timestamp;
      this.state.menu[addr] = addr;
      this.setState({menu: this.state.menu});
    }

    handleClick = (e) => {
      
      var clickKey = e.key;
      if(clickKey.length == 34){
        //address handle chat filtered state messages
        console.log("OK");
        var tmp = [{}];
        var sortable = [];
        //send messages
        if(this.state.chatMessages["send"][clickKey] != undefined){
          for(var i = 0; i < this.state.chatMessages["send"][clickKey].length; i++){    
            console.log("send" + i); 
            //for(var [key,message,time] in this.state.chatMessages["send"][e.key]){
              //console.log(JSON.stringify(key));
              var key = this.state.chatMessages["send"][clickKey][i]["key"];
              var time = this.state.chatMessages["send"][clickKey][i]["time"];
              var message = this.state.chatMessages["send"][clickKey][i]["message"];
              var direction = this.state.chatMessages["send"][clickKey][i]["direction"];
              var dateTime = this.getDateTime(this.state.chatMessages["send"][clickKey][i]["time"]);
              sortable.push({key: key, time: time, message: message, direction: direction, dateTime: dateTime})
            }
        }
        //receive messages
        if(this.state.chatMessages["receive"][clickKey] != undefined){
          for(var i = 0; i < this.state.chatMessages["receive"][clickKey].length; i++){     
            console.log("recv" + i); 
            //for(var [key,message,time] in this.state.chatMessages["send"][e.key]){
              //console.log(JSON.stringify(key));
              var key = this.state.chatMessages["receive"][clickKey][i]["key"];
              var time = this.state.chatMessages["receive"][clickKey][i]["time"];
              var message = this.state.chatMessages["receive"][clickKey][i]["message"];
              var direction = this.state.chatMessages["receive"][clickKey][i]["direction"];
              var dateTime = this.getDateTime(this.state.chatMessages["receive"][clickKey][i]["time"]);
              sortable.push({key: key, time: time, message: message, direction: direction, dateTime: dateTime})
          }
        }
        sortable.sort(function(a,b){
          return a.time - b.time;
        });
        console.log("Set sorted by time messages for " + clickKey + " :" + JSON.stringify(sortable));
        this.setState({filteredMessages: sortable});
      }
      /*
        this.getSendCount(this.state.userAddress);
        this.getRecvCount(this.state.userAddress);
        this.fetchMessages("83a3c98f5bd40f544f7905f3b5ae107e914f425e",this.state.userAddress,this.state.recvCount,this.state.sendCount);
      */
      else if(clickKey == "reload"){
        this.setState({filteredMessages: []});
        var promises = [];
        promises.push(this.getSendCount(this.state.scriptHash,this.state.userAddress));
        promises.push(this.getRecvCount(this.state.scriptHash,this.state.userAddress));
        Promise.all(promises).then(()=>{
          this.fetchMessages(this.state.scriptHash,this.state.userAddress,this.state.recvCount,this.state.sendCount);
        });
      }
      else{
        this.setState({filteredMessages: []});
      }
      this.setState({activeAddress: clickKey});
    }
    getDateTime = (unix_timestamp) => {
      var date = new Date(unix_timestamp*1000);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      return date.toLocaleDateString() + " " + (hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2));
    }
    invokeSendChat = (addr, message) => {
      const { invoke,getAddress } = this.props.nos;   
      console.log("Invoke 'sendMessage'");
      console.log("from: " + this.state.userAddress);
      console.log("to: " + addr);
      console.log("message: " + message);
      invoke(
        this.state.scriptHash,
        "sendMessage",
        [unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress))),
        unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(addr))),
        message,
        message],          
      );
    }
  render() {
    const { classes, store: {recvCount, sendCount} } = this.props;  
    const scriptHashNeoChat = this.state.scriptHash;
    //const addr = ba.unhexlify(u.reverseHex(wallet.getScriptHashFromAddress(this.state.userAddress)));
    const operation1 = u.str2hexstring("sendMessage");
    //const a1 = ba.unhexlify(u.reverseHex(wallet.getScriptHashFromAddress("AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y")));
    const a1= u.str2hexstring("AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y");
    const a2 = u.str2hexstring("test");
    const args2 = [a1,a1,a2,a2];
    return (
      <Layout>
        <Header className="header">
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1">NEO Chat</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>NeoChat</Breadcrumb.Item>
            <Breadcrumb.Item>{this.state.activeAddress}</Breadcrumb.Item>
          </Breadcrumb>
          <Layout style={{ padding: '24px 0', background: '#fff' }}>
          <Sider width={200} style={{ background: '#fff' }}>
            <ChatMenu menu={this.state.menu} onClick={this.handleClick}/>    
          </Sider>        
            <Content style={{ padding: '0 24px', minHeight: 280}}>   
              <ChatContent activeAddress={this.state.activeAddress} onInvokeSend={this.invokeSendChat} chatMessages={this.state.filteredMessages}/>
            </Content>
          </Layout>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Your Address: {this.state.userAddress} | Sent Messages: {this.state.sendCount} | Received Messages: {this.state.recvCount}
        </Footer>
      </Layout>
    );
  }
}

const styles = {
  "@import": "https://fonts.googleapis.com/css?family=Source+Sans+Pro",
  "@global html, body": {
    fontFamily: "Source Sans Pro",
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
  nos: nosPropTypes.isRequired,
  store: PropTypes.objectOf(PropTypes.any).isRequired
};

export default injectStore(injectNOS(injectSheet(styles)(App)));

//export default injectStore((App));