import React from "react";
import { react } from "@nosplatform/api-functions";
import PropTypes from "prop-types";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

const { injectNOS } = react.default;
class ChatMenu extends React.Component {
  clickBack = e => {
    alert(console.log(e));
  };
  render() {
    const { classes, onClick } = this.props;
    return (
      <React.Fragment>
        <Nav
          bsStyle="pills"
          stacked
          onSelect={onClick}
          className={classes.noMargin}
          activeKey={this.props.activeAddress}
          key={this.props.activeAddress}
        >
          {Object.keys(this.props.menu).map(key => {
            /*
            menu[addr] = array:
              0: address
              1: boolean encrypted. True if receiver has account
              2: unique id
              3: display name
              4: public key
            */
            const item = this.props.menu[key];
            if (item[1]) {
              return (
                <NavItem
                  eventKey={item[0]}
                  key={item[0]}
                  className={classes.siderChatBody}
                  href="#"
                >
                  <Row>
                    <Col sm={12}>
                      <strong>{item[3]}</strong> @{item[2]}
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>{item[0]}</Col>
                  </Row>
                </NavItem>
              );
            }
            return (
              <NavItem eventKey={item[0]} key={item[0]} className={classes.siderChatBody} href="#">
                {item[0]}
              </NavItem>
            );
          })}
        </Nav>
      </React.Fragment>
    );
  }
}
ChatMenu.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  menu: PropTypes.objectOf(PropTypes.array).isRequired,
  activeAddress: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default injectNOS(ChatMenu);
