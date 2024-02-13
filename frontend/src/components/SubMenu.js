import React from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, ListGroup} from "react-bootstrap";

const SubMenu = ({item, selectedIndex, handleListItemClick}) => {
    return (
        <ListGroup.Item key={item.title} id={item.id}>
            <Nav.Link as={NavLink} key={item.id} className="text-center p-2" to={item.path}
                      onClick={() => handleListItemClick(item.id)}>
                <span style={{color: 'white'}}>{item.icon}</span>
                <span> {item.title}</span>
            </Nav.Link>
        </ListGroup.Item>
    );
};

export default SubMenu;
