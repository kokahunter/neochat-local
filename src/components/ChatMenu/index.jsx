import React from "react";
import injectSheet from "react-jss";

import { react } from "@nosplatform/api-functions";

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Navbar from 'react-bootstrap/lib/Navbar';

const { injectNOS, nosProps } = react.default;
const styles = {
  button: {
    margin: "16px",
    fontSize: "14px"
  }
};

class ChatMenu extends React.Component {
  /*handleClick = (e) => {
    console.log(e.key);
  }*/
  clickBack = e => {
    alert(console.log(e));
  }
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
                key={this.props.activeAddress}>
              {
                Object.keys(this.props.menu).map(function(key){
                  const item = this.props.menu[key];
                  return (
                      <NavItem eventKey={item} key={item} className={classes.siderChatBody} href="#">{item}</NavItem>
                  )}.bind(this))
              }
              </Nav>
      </React.Fragment>
    );
  }
}

export default injectNOS(ChatMenu);
