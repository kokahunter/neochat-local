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
      count: 0
    };
    this.handleChangeAddr = this.handleChangeAddr.bind(this);
    this.handleChangeMsg = this.handleChangeMsg.bind(this);
  }
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
                        this.props.onInvokeSend(this.state.inputAddress, this.state.message);
                        this.setState({
                          message: "",
                          count: 0
                        });
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
                      this.props.onInvokeSend(this.props.activeAddress, this.state.message);
                      this.setState({
                        message: "",
                        count: 0
                      });
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
  chatMessages: PropTypes.array.isRequired
};
export default injectNOS(injectSheet(styles)(ChatContent));
