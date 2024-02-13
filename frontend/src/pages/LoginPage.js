import React, {useContext, useState} from "react";
import AuthContext from "../context/AuthContext";
import {Container, Row, Col, FloatingLabel, Form, Button, Card, Nav} from 'react-bootstrap';

function Copyright() {
    return (
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
            <div className="text-white mb-3 mb-md-0">
                Copyright © {new Date().getFullYear()}. All rights reserved.
            </div>
            <div className="text-white mb-3 mb-md-0">
                Великолепный сайт
            </div>
        </div>
    )
}

export default function LoginPage() {
    let {loginUser} = useContext(AuthContext)
    const [height, setHeight] = React.useState(0)
    let {validated} = useContext(AuthContext)

    let updateDimensions = () => {
        setHeight(window.innerHeight);
    }

    React.useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions)
        document.title = 'Страница авторизации';
    }, []);

    React.useEffect(() => {
        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, []);

    return (
        <Container fluid className="px-0 h-100 d-flex justify-content-between flex-column" style={{minHeight:height}}>
            <Container className="py-2" style={{maxWidth: "500px"}}>
                <Card className="shadow-lg rounded text-center">
                    <Card.Header>
                        <Card.Title>Войдите в систему</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Form noValidate validated={validated} onSubmit={loginUser}>
                            <Container>
                                <Col className="mb-2">
                                    <Form.Group md="3" controlId="validationCustom01">
                                        <FloatingLabel label="Ваше имя пользователя">
                                            <Form.Control type="text" placeholder="Username" id="username"
                                                          name="username"
                                                          required/>
                                        </FloatingLabel>
                                        <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col className="mb-2">
                                    <Form.Group md="3" controlId="validationCustom02">
                                        <FloatingLabel label="Ваш пароль">
                                            <Form.Control type="password" placeholder="password" id="password"
                                                          name="password" required/>
                                        </FloatingLabel>
                                        <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Row className="align-items-center">
                                    <Col xs={5}>
                                        <Form.Group md="3" controlId="validationCustom03">
                                            <Form.Check label="Запомнить меня" id="remember"/>
                                            <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={7} className="d-flex justify-content-end">
                                        <Nav>
                                            <Nav.Item>
                                                <Nav.Link href="#">
                                                    Забыли пароль?
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Col>
                                </Row>
                                <Col className="mb-2">
                                    <Nav fill>
                                        <Nav.Item>
                                            <Nav.Link href="#">
                                                "Нет аккаунта? Зарегистрируйтесь!"
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col className="mb-2">
                                    <div className="d-grid gap-2">
                                        <Button type="submit" variant="outline-success">Войти в систему</Button>
                                    </div>
                                </Col>
                            </Container>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <Copyright></Copyright>
        </Container>
    );
}
