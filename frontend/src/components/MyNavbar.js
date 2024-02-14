import React from "react";

import SubMenu from "./SubMenu";
import "./Navbar.css";
import AuthContext from '../context/AuthContext'
import {SidebarData} from "./SidebarData";
import {Container, ListGroup, Nav, Navbar} from "react-bootstrap";

export default function MyNavbar({open, handler, handleListItemClick, selectedIndex}) {
    let {user, logoutUser} = React.useContext(AuthContext)
    const {authTokens} = React.useContext(AuthContext);
    const [greeting, setGreeting] = React.useState(null);

    function returnGreeting(name) {
        // ToDo а надо ли время?
        if ((name === undefined) || (name === null))
            name = 'Пользователь'
        if ((new Date().getHours() >= 4) && (new Date().getHours() < 12))
            // return ('Доброе утро, ' + name + '! Ваше текущее время - ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, "0"))
            return ('Доброе утро, ' + name + '!')
        else if ((new Date().getHours() >= 12) && (new Date().getHours() < 17))
            // return ('Добрый день, ' + name + '! Ваше текущее время - ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, "0"))
            return ('Добрый день, ' + name + '!')
        else if ((new Date().getHours() >= 17) && (new Date().getHours() < 24))
            // return ('Добрый вечер, ' + name + '! Ваше текущее время - ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, "0"))
            return ('Добрый вечер, ' + name + '!')
        else
            // return ('Доброй ночи, ' + name + '! Ваше текущее время - ' + new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, "0"))
            return ('Доброй ночи, ' + name + '!')
    }

    async function getUsername() {
        try {
            const response = await fetch('http://localhost:80/auth/username/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens)
                }
            });
            if (response.status === 200) {
                // console.log(response)
                let data = await response.json()
                setGreeting(returnGreeting(data.username))
            } else if (response.statusText === 'Unauthorized') {
                logoutUser()
            } else {
                throw new Error("Ответ сети был не ok.");
            }
        } catch (error) {
            console.log("Возникла проблема с вашим fetch запросом: ", error.message);
        }
    }

    React.useEffect(() => {
        getUsername();
    }, [user]);

    return (
        <>
            {user && (
                <Navbar bg="dark" variant="dark" expand="lg" fixed="top" style={{color: "white"}}>
                    <Container fluid>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => handler(open)}/>
                        <Navbar.Brand>{greeting}</Navbar.Brand>
                        <Nav.Link key="logout_1" onClick={logoutUser} className="justify-content-end d-lg-none">
                            <span style={{color: 'white'}}><i className="bi bi-box-arrow-right"/></span>
                            <span> Выйти</span>
                        </Nav.Link>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {SidebarData.map((item, index) => (
                                <ListGroup as="nav-link" key={item.id}>
                                    <SubMenu item={item}
                                             handleListItemClick={handleListItemClick} selectedIndex={selectedIndex}/>
                                </ListGroup>
                            ))}
                        </Navbar.Collapse>
                        <Nav.Link key="logout_2" onClick={logoutUser} className="justify-content-end d-none d-lg-block">
                            <span style={{color: 'white'}}><i className="bi bi-box-arrow-right"/></span>
                            <span> Выйти</span>
                        </Nav.Link>
                    </Container>
                </Navbar>
            )}
        </>
    );
}