import React from "react";
import injectSheet from "react-jss";
import { injectNOS } from "../../nos";
import { injectStore } from "./../../store";
import { Icon, Row, Col } from 'antd';

const styles = {
  chat: {
    background: "#000000"
  }
};

class ChatContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputAddress: "",
            message: "",
            count: 0
        }
    }
    handleChangeAddr(event) {
        this.setState({inputAddress: event.target.value})
      }
      handleChangeMsg(event) {
        this.setState({message: event.target.value});
        this.setState({count: this.state.message.length + 1});
    }
  render() {
      if (this.props.activeAddress == "new"){
        return (
            <React.Fragment>
                  <div>
                  {            
                    <div className="newMessage">
                        To: <input type="text" value={this.state.inputAddress} onChange={this.handleChangeAddr.bind(this)} key="addr" />
                        <br />
                        Message: <input value={this.state.message} onChange={this.handleChangeMsg.bind(this)} key="newMessage" />
                        <button
                            onClick={({}) => this.props.onInvokeSend(this.state.inputAddress,this.state.message)}
                        >
                            Send
                        </button>
                    </div>
                    }
                  </div>
            </React.Fragment>
          )
      }
      else if (this.props.activeAddress == "reload"){
          return ""
      }
      else{
        return (
            <React.Fragment>   
                <div>
                    {
                        <div style={{paddingBottom:10 + "px",marginBottom: 5 + "px",overflow: "auto", maxHeight:500 + "px"}}>
                            {
                                this.props.chatMessages.map(t=> {
                                    if(t.direction == "receive"){
                                        return(  
                                        <Row key={t.key} type="flex" justify="start">
                                            <Col style={{minHeight: 40, background: "#dfdfdf",marginBottom:5 + "px",padding:2+"px"}} span={14}>
                                                <Row align="top" type="flex" justify="start">
                                                    <Col>{t.message}</Col>
                                                </Row>
                                                <Row align="bottom" type="flex" justify="end">
                                                    <Col>{t.dateTime}</Col>
                                                </Row>
                                            </Col>
                                        </Row>)
                                    } else if(t.direction == "send"){
                                        return (
                                        <Row key={t.key} align="middle" type="flex" justify="end">
                                            <Col style={{minHeight: 40, background: "#72c245",marginBottom:5 + "px", padding:2+"px"}} align="right" span={14}>
                                                <Row align="top" type="flex" justify="start">
                                                    <Col>{t.message}</Col>
                                                </Row>
                                                <Row align="bottom" type="flex" justify="end">
                                                    <Col>{t.dateTime}</Col>
                                                </Row>
                                            </Col>
                                        </Row>)
                                    }
                                })
                            }
                        </div>
                    }
                    {            
                    <div className="newMessage" align="bottom" style={{}}>
                        <input maxLength="254" value={this.state.message} onChange={this.handleChangeMsg.bind(this)} key="newMessage" />
                        <button
                            onClick={({}) => {
                                                this.props.onInvokeSend(this.props.activeAddress,this.state.message);
                                                this.setState({
                                                    message: "",
                                                    count: 0
                                                });
                                            }}
                        >
                            Send 
                        </button> 
                        {this.state.count} / 255
                    </div>
                    }
                </div>
            </React.Fragment>
          )
      }
  }
}

export default injectStore(injectNOS(injectSheet(styles)(ChatContent)));
