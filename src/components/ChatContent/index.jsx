import React from "react";
import injectSheet from "react-jss";
import { injectNOS } from "../../nos";
import { injectStore } from "./../../store";
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Glyphicon from 'react-bootstrap/lib/Glyphicon'; 
import Button from 'react-bootstrap/lib/Button'; 

const styles = {
  chat: {
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
        const { classes } = this.props; 
      if (this.props.activeAddress == "new"){
        return (
            <React.Fragment>
                <Row className={classes.chatHeader}>
                    <Col className={classes.chatHeaderInner} sm={12}>
                        <FormGroup controlId="formValidationSuccess1">
                            <InputGroup>
                                <FormControl placeholder="Enter NEO Address (A...)" type="text"  type="text" value={this.state.inputAddress} onChange={this.handleChangeAddr.bind(this)} key="newMessage"/>
                                <InputGroup.Addon>
                                    <Glyphicon glyph="user" />
                                </InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row className={classes.chatMessages}>
                    <Col sm={12} className={classes.chatMessagesBody}>
                    </Col>
                </Row>
                <Row className={classes.chatReply}>
                    <Col className={classes.replyEmojis} sm={1}>
                        emojis
                    </Col>
                    <Col className={classes.replyInput} sm={11}>
                        <FormGroup controlId="formValidationSuccess2">
                            <InputGroup>
                                <FormControl type="text" value={this.state.message} onChange={this.handleChangeMsg.bind(this)} key="newMessage"/>
                                <InputGroup.Button>
                                <Button onClick={({}) => {
                                        this.props.onInvokeSend(this.state.inputAddress,this.state.message);
                                        this.setState({
                                            message: "",
                                            count: 0
                                        });
                                    }}>
                                    <Glyphicon glyph="send" />
                                </Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
            </React.Fragment>
          )
      }
      else if (this.props.activeAddress == "welcome"){
        return (
            <React.Fragment>   
                <Row className={classes.chatHeader}>
                    <Col className={classes.chatHeaderInner} sm={12}>
                        <span className={classes.headerText2}>Welcome to NeoChat on nOS!</span>
                    </Col>
                </Row>
                <Row className={classes.chatMessages}>
                    <Col sm={12} className={classes.chatMessagesBody}>
                        <Row key="welcome" className={classes.message}>
                            <Col className={classes.messageReceive} sm={12}>
                                <div className={classes.receiver}>
                                    <span className={classes.headerText3} >Getting startet</span>
                                    <div className={classes.messageText}>
                                        New message, load, send.
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className={classes.chatReply}>
                    <Col className={classes.welcomeFooter} sm={12}>
                        <span className={classes.headerText4}>NeoChat on Github: https://github.com/kokahunter/neochat-local/</span>
                    </Col>
                </Row>
            </React.Fragment>
        )
        }
        else if (this.props.activeAddress == "reload"){
            return (
                <React.Fragment>   
                    <Row className={classes.chatHeader}>
                        <Col className={classes.chatHeaderInner} sm={12}>
                        </Col>
                    </Row>
                    <Row className={classes.chatMessages}>
                        <Col sm={12} className={classes.chatMessagesBody}>
                        </Col>
                    </Row>
                    <Row className={classes.chatReply}>
                        <Col className={classes.welcomeFooter} sm={12}>
                        </Col>
                    </Row>
                </React.Fragment>
            )
            }
      else{
        return (
            <React.Fragment>   
                <Row className={classes.chatHeader}>
                    <Col className={classes.chatHeaderInner} sm={12}>
                        <span className={classes.headerText2}>{this.props.activeAddress}</span>
                    </Col>
                </Row>
                <Row className={classes.chatMessages}>
                    <Col sm={12} className={classes.chatMessagesBody}>
                        {this.props.chatMessages.map(t=> {
                            if(t.direction == "receive"){
                                return(  
                                <Row key={t.key} className={classes.message}>
                                    <Col className={classes.messageReceive} sm={12}>
                                        <div className={classes.receiver}>
                                            <div className={classes.messageText}>
                                                {t.message}
                                            </div>
                                            <span className={classes.messageTime}>{t.dateTime}</span>
                                        </div>
                                    </Col>
                                </Row>)
                            } else if(t.direction == "send"){
                                return (
                                <Row key={t.key} className={classes.message}>
                                    <Col className={classes.messageSend} sm={12}>
                                        <div className={classes.sender}>
                                            <div className={classes.messageText}>
                                                {t.message}
                                            </div>
                                            <span className={classes.messageTime}>{t.dateTime}</span>
                                        </div>
                                    </Col>
                                </Row>)
                            }
                        })}
                    </Col>
                </Row>
                <Row className={classes.chatReply}>
                    <Col className={classes.replyEmojis} sm={1}>
                        emojis
                    </Col>
                    <Col className={classes.replyInput} sm={11}>
                        <FormGroup controlId="formValidationSuccess3">
                        <InputGroup>
                            <FormControl type="text" value={this.state.message} onChange={this.handleChangeMsg.bind(this)} key="newMessage"/>
                            <InputGroup.Button>
                            <Button onClick={({}) => {
                                    this.props.onInvokeSend(this.props.activeAddress,this.state.message);
                                    this.setState({
                                        message: "",
                                        count: 0
                                    });
                                }}>
                                <Glyphicon glyph="send" />
                            </Button>
                            </InputGroup.Button>
                        </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
            </React.Fragment>
          )
      }
  }
}

export default injectStore(injectNOS(injectSheet(styles)(ChatContent)));
