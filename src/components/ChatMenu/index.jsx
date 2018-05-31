import React from "react";
import { react } from "@nosplatform/api-functions";
import PropTypes from "prop-types";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";

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
            const item = this.props.menu[key];
            return (
              <NavItem eventKey={item} key={item} className={classes.siderChatBody} href="#">
                {item}
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
  menu: PropTypes.objectOf(PropTypes.any).isRequired,
  activeAddress: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default injectNOS(ChatMenu);
