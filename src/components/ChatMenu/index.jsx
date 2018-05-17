import React from "react";
import injectSheet from "react-jss";
import { injectNOS } from "../../nos";
import { injectStore } from "./../../store";
import { Menu, Icon } from 'antd';

const { SubMenu } = Menu;

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
  render() {
    return (
      <React.Fragment>
              <Menu
                onClick={this.props.onClick}
                mode="inline"
                defaultSelectedKeys={['2']}
                defaultOpenKeys={['2']}
                style={{ height: '100%' }}
              >
                <Menu.Item key="reload">
                  <Icon type="reload" />
                  <span>load /reload</span>
                </Menu.Item>
                <Menu.Item key="new">
                  <Icon type="message" />
                  <span>New message</span>
                </Menu.Item>
                <SubMenu key="2" title={<span><Icon type="inbox" /><span>Chats</span></span>}>
                  {
                    Object.keys(this.props.menu).map(function(key){
                      const item = this.props.menu[key];
                      return <Menu.Item key={key}>{item}</Menu.Item>
                    }.bind(this))
                  }
              </SubMenu>
              </Menu>
      </React.Fragment>
    );
  }
}

export default injectStore(injectNOS(ChatMenu));
