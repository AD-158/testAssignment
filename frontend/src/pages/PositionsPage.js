import React, {useContext, useEffect, useState} from 'react';
import AuthContext from '../context/AuthContext'
import {Button, Col, Container, Form, InputGroup, Row, Stack, Table} from "react-bootstrap";
import MyPagination from "../components/Pagination";
import MyModal from "../components/MyModal";
import "../components/styles.css"

const PositionsPage = () => {
    const {authTokens, logoutUser} = useContext(AuthContext);
    let [jsonPositions, setJsonPositions] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [numberOfPages, setNumberOfPages] = useState(8)
    const [totalPages, setTotalPages] = useState(0)
    const [width, setWidth] = React.useState(0)
    const [height, setHeight] = React.useState(0)
    let [show, setShow] = useState(false);
    let [buttonText, setButtonText] = useState("Сохранить");
    let [titleText, setTitleText] = useState("Добавить нового сотрудника.");
    let [bodyObject, setBodyObject] = useState();
    let [url, setUrl] = useState('http://localhost/api/positions_api/create/');
    let [method, setMethod] = useState('POST');
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const handleTableRowClick = (index, last_name) => {
        if (!last_name.includes("УДАЛЕН"))
            setSelectedRowIndex(index);
    };

    const handleAddButtonClick = () => {
        setShow(true)
        setButtonText("Сохранить")
        setTitleText("Добавить новую должность.")
        setUrl('http://localhost/api/positions_api/create/')
        setMethod('POST')
        const x = (
            <>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Наименование должности</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Дожность"
                            name="t_position_name"
                            id="t_position_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={1}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустое наименование!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
            </>
        )
        setBodyObject(x)
    };
    const handleUpdateButtonClick = () => {
        let selectedPosition = null
         jsonPositions.forEach(el => {
            if (el.t_position_id === selectedRowIndex) {
                selectedPosition = el
            }
        })
        setShow(true)
        setButtonText("Сохранить")
        setTitleText("Изменить должность.")
        setUrl('http://localhost/api/positions_api/update/')
        setMethod('PUT')
        const x = (
            <>
                <Row className="mb-3">
                    <Form.Group as={Col} className="d-none">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            defaultValue={selectedPosition.t_position_id}
                            name="t_position_id"
                            id="t_position_id"
                            key={1}
                        />
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Наименование должности</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Должность"
                            defaultValue={selectedPosition.t_position_name}
                            name="t_position_name"
                            id="t_position_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={2}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустое название!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
            </>
        )

        setBodyObject(x)
    };
    const handleDeleteButtonClick = () => {
        setShow(true)
        setButtonText("Удалить")
        setTitleText("Удалить должность.")
        setUrl('http://localhost/api/positions_api/delete/')
        setMethod('DELETE')
        let selectedPosition = null

        jsonPositions.forEach(el => {
            if (el.t_position_id === selectedRowIndex) {
                selectedPosition = el
            }
        })
        const x = (
            <>
                <Row className="mb-3">
                    <Form.Group as={Col} className="d-none">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            defaultValue={selectedPosition.t_position_id}
                            name="t_position_id"
                            id="t_position_id"
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <h5 className="text-center">Вы действительно хотите удалить данную должность?</h5>
                </Row>
            </>
        )

        setBodyObject(x)
    };

    const handleChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(0)
        setSelectedRowIndex(null)
    };

    let updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    React.useEffect(() => {
        updateDimensions();
        setNumberOfPages(width < 1360 ? 8 : 12)
        window.addEventListener('resize', updateDimensions)
    }, []);

    React.useEffect(() => {
        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, []);


    let url_positions = 'http://localhost/api/positions_api/'; // URL API для данных

    useEffect(() => {
        getData()
    }, [currentPage, itemsPerPage])

    async function getData() {
        let response = await fetch(`${url_positions}?page=${currentPage}&limit=${itemsPerPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens)
            }
        })
        let data = await response.json()
        if (response.status === 200) {
            setJsonPositions(data)
        } else if (response.statusText === 'Unauthorized') {
            logoutUser()
        }
        response = await fetch(`http://localhost/api/positions_api/count/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens)
            }
        })
        data = await response.json()
        if (response.status === 200) {
            setTotalPages(Math.ceil(data.total_positions / itemsPerPage))
        } else if (response.statusText === 'Unauthorized') {
            logoutUser()
        }
    }

    function getCookie(name) {
        return new RegExp('(?:^|;\\s*)' + name
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)')
            .exec(document.cookie)?.[1];
    }

    let sentData = async (data) => {
        let csrftoken = getCookie('csrftoken');
        let response = await fetch(url, { // Изменение URL для загрузки данных только для текущей страницы
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens),
                'X-CSRFToken': csrftoken
            },
            body: data
        })
            .then(response => response.json())
            .catch(function () {
                setShow(false)
                getData()
            })

    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSelectedRowIndex(null)
    };

    return (
        <>
            <MyModal show={show} setShow={setShow} buttonText={buttonText} bodyObject={bodyObject}
                     titleText={titleText} sentData={sentData}/>
            <Container className="py-2 shadow-lg position-relative" style={{top: "70px"}}>
                <Row className="py-2 px-1">
                    <Col>
                        <Button variant="success" onClick={handleAddButtonClick}>Добавить</Button>
                    </Col>
                    <Col className="text-end">
                        <Stack direction="horizontal" gap={3}>
                            <Button className="ms-auto" variant="warning" onClick={handleUpdateButtonClick}
                                    disabled={selectedRowIndex === null}>
                                Изменить
                            </Button>
                            <Button variant="danger" onClick={handleDeleteButtonClick}
                                    disabled={selectedRowIndex === null}>
                                Удалить
                            </Button>
                        </Stack>
                    </Col>
                </Row>
                <Row className="px-1">
                    <Table bordered hover responsive className="align-middle">
                        <thead>
                        <tr className="align-middle text-center">
                            <th className="bg-white sorted" id="t_position_name">Наименование должности</th>
                        </tr>
                        </thead>
                        <tbody className="page_data align-middle text-center" id="page_data">
                        {
                            jsonPositions.map((item) => (
                                <tr key={item.t_position_id}
                                    className={(selectedRowIndex === item.t_position_id) ? "data-selected" : ""}
                                    onClick={() => handleTableRowClick(item.t_position_id, item.t_position_name)}>
                                    <td>{item.t_position_name}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </Table>
                </Row>
                <Row className="ms-0 py-lg-3 d-flex">
                    <Col className="d-flex justify-content-center align-items-center py-2">
                        <MyPagination number_of_pg={numberOfPages} total_pages_number={totalPages}
                                      handlePageChange={handlePageChange} currentPage={currentPage}/>
                    </Col>
                    <Col md="auto" className="d-flex align-items-center py-2">
                        <InputGroup className="d-flex align-items-center">
                            <Form.Text className="px-2">Показывать по </Form.Text>
                            <Form.Select onChange={handleChange} value={itemsPerPage}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="20">20</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default PositionsPage;