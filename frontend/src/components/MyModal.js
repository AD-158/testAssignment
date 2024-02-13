import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {useState} from "react";
import {Form} from "react-bootstrap";

export default function MyModal({show, setShow, titleText, bodyObject, buttonText, sentData, setSelectValue}) {
    const [validated, setValidated] = useState(false);
    const handleClose = () => {
        setShow(false);
        setValidated(false);
        try {
            setSelectValue(-1)
        }
        catch (e) { }
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        setValidated(true);
        if (!form.checkValidity() === false) {
            const formData = new FormData(event.target),
                formDataObj = Object.fromEntries(formData.entries())
            // Преобразование объекта в JSON-строку
            const jsonData = JSON.stringify(formDataObj);
            sentData(jsonData)
            setValidated(false)
        }
    };

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{titleText}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        {bodyObject}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Отменить
                        </Button>
                        <Button variant="primary" type="submit">{buttonText}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}