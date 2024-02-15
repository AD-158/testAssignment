import React, {useContext, useEffect, useState} from 'react';
import AuthContext from '../context/AuthContext'
import {Button, Col, Container, Form, InputGroup, Row, Stack, Table} from "react-bootstrap";
import MyPagination from "../components/Pagination";
import MyModal from "../components/MyModal";
import "../components/styles.css"
import {MyContext} from "../App";

const EmployeesPage = () => {
    const {authTokens, logoutUser} = useContext(AuthContext);
    let [jsonPositions, setJsonPositions] = useState([])
    let [jsonEmployees, setJsonEmployees] = useState([])
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
    let [chosenPosition, setChosenPosition] = useState("");
    let [url, setUrl] = useState('http://localhost/api/employees_api/create/');
    let [method, setMethod] = useState('POST');
    const [selectValue, setSelectValue] = useState("-1");
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const searchValue = useContext(MyContext);
    const handleTableRowClick = (index, last_name) => {
        if (!last_name.includes("УДАЛЕН"))
            setSelectedRowIndex(index);
    };

    const handleAddButtonClick = () => {
        setShow(true)
        setButtonText("Сохранить")
        setTitleText("Добавить нового сотрудника.")
        setUrl('http://localhost/api/employees_api/create/')
        setMethod('POST')
        const x = (
            <>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Фамилия</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Фамилия"
                            name="t_employees_last_name"
                            id="t_employees_last_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={1}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустую
                            фамилию!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Имя</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Имя"
                            name="t_employees_first_name"
                            id="t_employees_first_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={2}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустое имя!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Отчество</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Отчество"
                            name="t_employees_patronymic"
                            id="t_employees_patronymic"
                            key={3}
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Дата рождения</Form.Label>
                        <Form.Control
                            required
                            type="date"
                            name="t_employees_birth_date"
                            id="t_employees_birth_date"
                            key={4}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите дату!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Должность</Form.Label>
                        <InputGroup>
                            <Form.Control
                                required
                                as="select"
                                placeholder="Должность"
                                pattern="(^([0-9])+$)"
                                defaultValue={selectValue || ''}
                                onChange={(event) => setSelectValue(event.target.value)}
                                name="t_employees_position"
                                id="t_employees_position"
                                key={5}
                            >
                                <option key={-1} value="">Выберите должность...</option>
                                {jsonPositions.map((item) => (
                                    <option key={item.t_position_id}
                                            value={item.t_position_id}>{item.t_position_name}</option>
                                ))}
                            </Form.Control>
                            <Button variant="outline-success" onClick={handleAddPositionButtonClick}>Добавить</Button>
                            <Form.Control.Feedback type="invalid">Пожалуйста, добавьте
                                должность!</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Row className="mb-0">
                    <Form.Group as={Col}>
                        <Form.Label>Адрес проживания</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Адрес проживания"
                            name="t_employees_residential_address"
                            id="t_employees_residential_address"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={6}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустой адрес
                            проживания!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
            </>
        )
        setBodyObject(x)
    };
    const handleUpdateButtonClick = () => {
        let selectedEmployee = null
        jsonEmployees.forEach(el => {
            if (el.t_employees_id === selectedRowIndex) {
                selectedEmployee = el
                setChosenPosition(el.t_employees_position.t_position_id)
            }
        })
        setShow(true)
        setButtonText("Сохранить")
        setTitleText("Изменить сотрудника.")
        setUrl('http://localhost/api/employees_api/update/')
        setMethod('PUT')
        const x = (
            <>
                <Row className="mb-3">
                    <Form.Group as={Col} className="d-none">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            required
                            type="number"
                            defaultValue={selectedEmployee.t_employees_id}
                            name="t_employees_id"
                            id="t_employees_id"
                            key={1}
                        />
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Фамилия</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Фамилия"
                            defaultValue={selectedEmployee.t_employees_last_name}
                            name="t_employees_last_name"
                            id="t_employees_last_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={2}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустую
                            фамилию!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Имя</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Имя"
                            defaultValue={selectedEmployee.t_employees_first_name}
                            name="t_employees_first_name"
                            id="t_employees_first_name"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={3}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустое имя!</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Отчество</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Отчество"
                            defaultValue={selectedEmployee.t_employees_patronymic}
                            name="t_employees_patronymic"
                            id="t_employees_patronymic"
                            key={4}
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Дата рождения</Form.Label>
                        <Form.Control
                            required
                            type="date"
                            defaultValue={selectedEmployee.t_employees_birth_date}
                            name="t_employees_birth_date"
                            id="t_employees_birth_date"
                            key={5}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите дату!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col}>
                        <Form.Label>Должность</Form.Label>
                        <InputGroup>
                            <Form.Control
                                required
                                as="select"
                                placeholder="Должность"
                                pattern="(^([0-9])+$)"
                                onChange={e => setChosenPosition(e.target.value)}
                                defaultValue={chosenPosition}
                                name="t_employees_position"
                                id="t_employees_position"
                                key={6}
                            >
                                <option key={-1} value="">Выберите должность...</option>
                                {jsonPositions.map((item) => (
                                    <option key={item.t_position_id}
                                            value={item.t_position_id}>{item.t_position_name}</option>
                                ))}
                            </Form.Control>
                            <Button variant="outline-success">Добавить</Button>
                            <Form.Control.Feedback type="invalid">Пожалуйста, добавьте
                                должность!</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <Row className="mb-0">
                    <Form.Group as={Col}>
                        <Form.Label>Адрес проживания</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Адрес проживания"
                            defaultValue={selectedEmployee.t_employees_residential_address}
                            name="t_employees_residential_address"
                            id="t_employees_residential_address"
                            pattern="(^((.|\s)*\S(.|\s)*)$)"
                            key={7}
                        />
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустой адрес
                            проживания!</Form.Control.Feedback>
                    </Form.Group>
                </Row>
            </>
        )

        setBodyObject(x)
    };
    const handleDeleteButtonClick = () => {
        setShow(true)
        setButtonText("Удалить")
        setTitleText("Удалить сотрудника.")
        setUrl('http://localhost/api/employees_api/delete/')
        setMethod('DELETE')
        let selectedEmployee = null

        jsonEmployees.forEach(el => {
            if (el.t_employees_id === selectedRowIndex) {
                selectedEmployee = el
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
                            defaultValue={selectedEmployee.t_employees_id}
                            name="t_employees_id"
                            id="t_employees_id"
                        />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <h5 className="text-center">Вы действительно хотите удалить данного сотрудника?</h5>
                </Row>
            </>
        )

        setBodyObject(x)
    };

    const handleAddPositionButtonClick = () => {
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
                        <Form.Control.Feedback type="invalid">Пожалуйста, введите не пустое
                            наименование!</Form.Control.Feedback>
                    </Form.Group>
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
        document.title = 'Сотрудники';
        window.addEventListener('resize', updateDimensions)
    }, []);

    React.useEffect(() => {
        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, []);


    let url_positions = 'http://localhost/api/positions_api/filtered/'; // URL API для данных
    let url_employees = 'http://localhost/api/employees_api/'; // URL API для данных

    useEffect(() => {
        getData()
    }, [currentPage, itemsPerPage])
    useEffect(() => {
        getData()
    }, [searchValue])

    async function getData() {

        let response = await fetch(url_positions, {
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
        let searchUrl;
        if ((searchValue) && (searchValue !== "")) {
            searchUrl = `${url_employees}?page=${currentPage}&limit=${itemsPerPage}&search=${searchValue}`
        } else {
            searchUrl = `${url_employees}?page=${currentPage}&limit=${itemsPerPage}`
        }
        response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens)
            }
        })
        data = await response.json()
        if (response.status === 200) {
            setJsonEmployees(data)
        } else if (response.statusText === 'Unauthorized') {
            logoutUser()
        }
        if ((searchValue) && (searchValue !== "")) {
            searchUrl = `http://localhost/api/employees_api/count?search=${searchValue}`
        } else {
            searchUrl = `http://localhost/api/employees_api/count/`
        }
        response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens)
            }
        })
        data = await response.json()
        if (response.status === 200) {
            setTotalPages(Math.ceil(data.total_employees / itemsPerPage))
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
            .then(response => response.json()
                .then(data => {
                    switch (data["error"]) {
                        case "All fields are required":
                            alert("Не все поля были заполнены!")
                            break;
                        case "Employee must be at least 15 years old":
                            alert("Сотрудник должен быть старше 15 лет!")
                            break;
                        default:
                            alert("ФИО должны содержать только русские буквы!")
                            break;
                    }
                })
            )
            .catch(function () {
                setShow(false)
                getData()
            })

    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSelectedRowIndex(null)
    };

    React.useEffect(() => {
        jsonEmployees.forEach(el => {
            if (el.t_employees_id === selectedRowIndex) {
                setChosenPosition(el.t_employees_position.t_position_id)
            }
        })
    }, [selectedRowIndex]);

    return (
        <>
            <MyModal show={show} setShow={setShow} buttonText={buttonText} bodyObject={bodyObject}
                     titleText={titleText} sentData={sentData} setSelectValue={setSelectValue}/>
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
                {jsonEmployees.length !== 0 ? (
                    <>
                        <Row className="px-1">
                            <Table bordered hover responsive className="align-middle">
                                <thead>
                                <tr className="align-middle text-center">
                                    <th className="bg-white sorted" id="t_employees_last_name"
                                        style={{minWidth: "100px"}}>
                                        Фамилия
                                    </th>
                                    <th className="bg-white sorted" id="t_employees_first_name">Имя</th>
                                    <th className="bg-white sorted" id="t_employees_patronymic">Отчество</th>
                                    <th className="bg-white sorted" id="t_employees_birth_date"
                                        style={{minWidth: "148px"}}>
                                        Дата рождения
                                    </th>
                                    <th className="bg-white sorted" id="t_position_name" style={{minWidth: "100px"}}>
                                        Должность
                                    </th>
                                    <th className="bg-white sorted" id="t_employees_residential_address">
                                        Адрес проживания
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="page_data" id="page_data">
                                {
                                    jsonEmployees.map((item) => (
                                        <tr key={item.t_employees_id}
                                            className={(selectedRowIndex === item.t_employees_id) ? "data-selected" : ""}
                                            onClick={() => handleTableRowClick(item.t_employees_id, item.t_employees_last_name)}>
                                            <td>{item.t_employees_last_name}</td>
                                            <td>{item.t_employees_first_name}</td>
                                            <td>{item.t_employees_patronymic}</td>
                                            <td>{item.t_employees_birth_date}</td>
                                            <td>{item.t_employees_position.t_position_name}</td>
                                            <td>{item.t_employees_residential_address}</td>
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
                    </>
                ) : (
                    <h3 className="text-center no_data">"Нет данных!"</h3>
                )}
            </Container>
        </>
    );
};

export default EmployeesPage;