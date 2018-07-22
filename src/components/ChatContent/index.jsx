import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
// import { injectNOS } from "../../nos";
import { react } from "@nosplatform/api-functions";
// import { injectStore } from "./../../store";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import InputGroup from "react-bootstrap/lib/InputGroup";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import Button from "react-bootstrap/lib/Button";

const { injectNOS } = react.default;

const styles = {
  chat: {}
};

class ChatContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputAddress: "",
      message: "",
      count: 0,
      uuid: "",
      name: ""
    };
    this.handleChangeAddr = this.handleChangeAddr.bind(this);
    this.handleChangeMsg = this.handleChangeMsg.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangeUUID = this.handleChangeUUID.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }
  handleSendMessage = async (addr, message) => {
    // validate message length
    let pk = await this.props.verifyReceiver(addr);
    let send = false;
    let encrypted = 0;
    // if pk = false then receiver is not registered. Message cannot be encrypted
    if (pk === false) {
      // eslint-disable-next-line no-alert
      if (window.confirm("Receiver is not registered. Message will not be encrypted. Continue?")) {
        send = true;
        encrypted = 0;
      }
    } else if (Object.keys(this.props.userAccount).length === 0) {
      // eslint-disable-next-line no-alert
      if (window.confirm("You are not registered. Message will not be encrypted. Continue?")) {
        send = true;
        encrypted = 0;
        pk = false;
      }
    } else {
      send = true;
      encrypted = 1;
      [, , , , , , , , , pk] = pk;
    }
    if (send) {
      this.props.onInvokeSend(addr, message, pk, encrypted);
      this.setState({
        message: "",
        count: 0
      });
    }
  };
  handleChangeAddr(event) {
    this.setState({ inputAddress: event.target.value });
  }
  handleChangeMsg(event) {
    this.state.count = event.target.value.length;
    this.setState({
      message: event.target.value,
      count: this.state.count
    });
  }
  handleChangeUUID(event) {
    this.state.uuid = event.target.value;
    this.setState({ uuid: this.state.uuid });
  }
  handleChangeName(event) {
    this.state.name = event.target.value;
    this.setState({ name: this.state.name });
  }
  render() {
    const { classes } = this.props;
    if (this.props.activeAddress === "new") {
      return (
        <React.Fragment>
          <Row className={classes.chatHeader}>
            <Col className={classes.chatHeaderInner} sm={12}>
              <FormGroup controlId="formValidationSuccess1">
                <InputGroup>
                  <FormControl
                    placeholder="Enter NEO Address (A...)"
                    type="text"
                    value={this.state.inputAddress}
                    onChange={this.handleChangeAddr}
                    key="newMessage"
                  />
                  <InputGroup.Addon>
                    <Glyphicon glyph="user" />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </Col>
          </Row>
          <Row className={classes.chatMessages}>
            <Col sm={12} className={classes.chatMessagesBody} />
          </Row>
          <Row className={classes.chatReply}>
            <Col className={classes.replyEmojis} sm={1}>
              emojis
            </Col>
            <Col className={classes.replyInput} sm={11}>
              <FormGroup controlId="formValidationSuccess2">
                <InputGroup>
                  <FormControl
                    type="text"
                    value={this.state.message}
                    onChange={this.handleChangeMsg}
                    key="newMessage"
                  />
                  <InputGroup.Button>
                    <Button
                      onClick={() => {
                        this.handleSendMessage(this.state.inputAddress, this.state.message);
                      }}
                    >
                      <Glyphicon glyph="send" />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </Col>
          </Row>
        </React.Fragment>
      );
    } else if (this.props.activeAddress === "welcome") {
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
                    <span className={classes.headerText3}>Getting startet</span>
                    <div className={classes.messageText}>New message, load, send.</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={classes.chatReply}>
            <Col className={classes.welcomeFooter} sm={12}>
              <span className={classes.headerText4}>
                NeoChat on Github: https://github.com/kokahunter/neochat-local/
              </span>
            </Col>
          </Row>
        </React.Fragment>
      );
    } else if (this.props.activeAddress === "reload") {
      return (
        <React.Fragment>
          <Row className={classes.chatHeader}>
            <Col className={classes.chatHeaderInner} sm={12} />
          </Row>
          <Row className={classes.chatMessages}>
            <Col sm={12} className={classes.chatMessagesBody} />
          </Row>
          <Row className={classes.chatReply}>
            <Col className={classes.welcomeFooter} sm={12} />
          </Row>
        </React.Fragment>
      );
    } else if (this.props.activeAddress === "account") {
      return (
        <React.Fragment>
          <Row className={classes.chatHeader}>
            <Col className={classes.chatHeaderInner} sm={12}>
              <span className={classes.headerText2}>Account information</span>
            </Col>
          </Row>
          <Row className={classes.chatMessages}>
            <Col sm={12} className={classes.chatMessagesBody}>
              {Object.keys(this.props.userAccount).map(key => (
                <Row key={key} className={classes.message}>
                  <Col className={classes.messageReceive} sm={2}>
                    <span>{key}</span>
                  </Col>
                  <Col className={classes.messageReceive} sm={10}>
                    <span>{this.props.userAccount[key]}</span>
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
          <Row className={classes.chatReply}>
            <Col className={classes.welcomeFooter} sm={12} />
          </Row>
        </React.Fragment>
      );
    } else if (this.props.activeAddress === "register") {
      return (
        <React.Fragment>
          <Row className={classes.chatHeader}>
            <Col className={classes.chatHeaderInner} sm={12}>
              <span className={classes.headerText2}>Register</span>
            </Col>
          </Row>
          <Row className={classes.chatMessages}>
            <Col sm={12} className={classes.chatMessagesBody}>
              <Row key="uuid" className={classes.message}>
                <Col className={classes.messageReceive} sm={4}>
                  <span>Username</span>
                </Col>
                <Col className={classes.messageReceive} sm={8}>
                  <FormControl
                    type="text"
                    value={this.state.uuid}
                    onChange={this.handleChangeUUID}
                    key="uuid"
                  />
                </Col>
              </Row>
              <Row key="name" className={classes.message}>
                <Col className={classes.messageReceive} sm={4}>
                  <span>Display name</span>
                </Col>
                <Col className={classes.messageReceive} sm={8}>
                  <FormControl
                    type="text"
                    value={this.state.name}
                    onChange={this.handleChangeName}
                    key="name"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={classes.chatReply}>
            <Col className={classes.welcomeFooter} sm={12}>
              <span>Send registration </span>
              <Button
                onClick={() => {
                  this.props.onInvokeRegister(this.state.uuid, this.state.name);
                }}
              >
                <Glyphicon glyph="send" />
              </Button>
            </Col>
          </Row>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Row className={classes.chatHeader}>
          <Col className={classes.chatHeaderInner} sm={12}>
            <span className={classes.headerText2}>{this.props.activeAddress}</span>
          </Col>
        </Row>
        <Row className={classes.chatMessages}>
          <Col sm={12} className={classes.chatMessagesBody}>
            {this.props.chatMessages.map(t => {
              if (t.direction === "receive") {
                return (
                  <Row key={t.key} className={classes.message}>
                    <Col className={classes.messageReceive} sm={12}>
                      <div className={classes.receiver}>
                        <div className={classes.messageText}>{t.message}</div>
                        <span className={classes.messageTime}>{t.dateTime}</span>
                      </div>
                    </Col>
                  </Row>
                );
              } else if (t.direction === "send") {
                return (
                  <Row key={t.key} className={classes.message}>
                    <Col className={classes.messageSend} sm={12}>
                      <div className={classes.sender}>
                        <div className={classes.messageText}>{t.message}</div>
                        <span className={classes.messageTime}>{t.dateTime}</span>
                      </div>
                    </Col>
                  </Row>
                );
              }
              return 0;
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
                <FormControl
                  type="text"
                  value={this.state.message}
                  onChange={this.handleChangeMsg}
                  key="newMessage"
                />
                <InputGroup.Button>
                  <Button
                    onClick={() => {
                      this.handleSendMessage(this.props.activeAddress, this.state.message);
                    }}
                  >
                    <Glyphicon glyph="send" />
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
ChatContent.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  activeAddress: PropTypes.string.isRequired,
  onInvokeSend: PropTypes.func.isRequired,
  chatMessages: PropTypes.array.isRequired,
  onInvokeRegister: PropTypes.func.isRequired,
  userAccount: PropTypes.object.isRequired,
  verifyReceiver: PropTypes.func.isRequired
};
export default injectNOS(injectSheet(styles)(ChatContent));
