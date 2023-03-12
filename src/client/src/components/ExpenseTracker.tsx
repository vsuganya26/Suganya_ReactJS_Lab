import { useState, useEffect, useRef } from 'react';
import { Button, Container, Form, FormSelect, Modal, Table } from 'react-bootstrap';
import IItem from '../models/IItem';
import { getItems, postItem } from '../services/items';

type FormErrors = {
    payeeName: string[],
    price: string[],
    product: string[],
    date: string[]
}

const ExpenseTracker = () => {
    const [ items, setItems ] = useState<IItem[]>( [] );
    const [ loading, setLoading ] = useState( true );
    const [ formErrors, setFormErrors ] = useState<FormErrors>({
        payeeName: [],
        price: [],
        product: [],
        date: []
    });
    const [ show, setShow ] = useState(false);
    const [ validated, setValidated ] = useState(false);

    const payeeNameRef = useRef<HTMLSelectElement | null>( null );
    const priceRef = useRef<HTMLInputElement | null>( null );
    const productRef = useRef<HTMLInputElement | null>( null );
    const dateRef = useRef<HTMLInputElement | null>( null );

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setFormErrors({
            payeeName: [],
            price: [],
            product: [],
            date: []
        });
        setShow(true);
    }

    const Validate = () =>  {
        const errors: FormErrors = {
            payeeName: [],
            price: [],
            product: [],
            date: []
        };

        let isValid = true;

        if (payeeNameRef.current?.value === null || payeeNameRef.current?.value.trim() === ''){
            errors.payeeName.push('Payee name is mandatory');
            isValid = false;
        }

        if (priceRef.current?.value === null || priceRef.current?.value.trim() === ''){
            errors.price.push('Price is mandatory');
            isValid = false;
        }

        if (productRef.current?.value === null || productRef.current?.value.trim() === ''){
            errors.product.push('Description is mandatory');
            isValid = false;
        }

        if (dateRef.current?.value === null || dateRef.current?.value.trim() === ''){
            // no validation yet!
        }

        const pricePat = /^\d+$/;

        if (!pricePat.test(priceRef.current?.value || '')) {
            errors.price.push('Price needs to be a valid currency value. Decimals not allowed');
            isValid = false;
        }
        
        setFormErrors(errors);
        return isValid;
    }

    const addItem = async () => {
        
        if(!Validate()){
            return;
        }

        var date = dateRef.current?.value || '';
        var setDate = date === ''? (new Date()).toISOString().substring(0, 10) : date;
        const item = {
            payeeName: payeeNameRef.current?.value || '',
            price: parseInt(priceRef.current?.value || '0'),
            product: productRef.current?.value || '',
            setDate: setDate
        }

        const newItem = await postItem(item);
        setItems([...items, newItem]);
        setShow(false);
    }

    const fetchItems = async () => {
        setLoading( true );
        const items = await getItems();
        setItems( items );
        setLoading( false );
    };

    const personalExpense = ( payeeName : string ) => {
        return items.filter(i=> i.payeeName === payeeName) // only items paid for by payeeName
        .reduce(
            (acc, item) => acc + item.price, 0
        )
    }

    const getPayable = () =>{
        const rahulPaid = Math.abs(personalExpense('Rahul'));
        const rameshPaid = Math.abs(personalExpense('Ramesh'));
        var msg:string;
        if(rahulPaid === rameshPaid){
            msg = 'Amt is settled'
        }
        else if(rahulPaid < rameshPaid) {
            msg = 'Rahul has to pay'
        }
        else{
            msg = 'Ramesh has to pay'
        }

        return {
            payable:Math.abs(rahulPaid - rameshPaid) / 2,
            message:msg
        }
    }

    useEffect( 
        () => {
            fetchItems();
        },
        [] // effect function to run only on component load
    );

    return (
        <Container className="my-4">
            <h1>Expense Tracker
                <Button variant='primary float-end' onClick={handleShow}>Add Expense</Button>
            </h1>
            <hr />

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add a expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="payeeName">
                            <Form.Label aria-required>Who paid?</Form.Label>
                            <Form.Select 
                            required
                            isInvalid={formErrors?.payeeName.length !== 0}
                            aria-label="Default select example" ref={payeeNameRef}>
                                <option value="">Select one</option>
                                <option value="Rahul">Rahul</option>
                                <option value="Ramesh">Ramesh</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                    {
                                        formErrors?.payeeName.map(
                                            err => <div key={err}>{err}</div>
                                        )
                                    }
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="price"
                        >
                            <Form.Label>Expense amount</Form.Label>
                            <Form.Control
                                required
                                isInvalid={formErrors?.price.length !== 0}
                                type="number"
                                placeholder="How much was spent? (Rs.)"
                                ref={priceRef}
                            />
                            <Form.Control.Feedback type="invalid">
                                    {
                                        formErrors?.price.map(
                                            err => <div key={err}>{err}</div>
                                        )
                                    }
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group
                            className="mb-3"
                            controlId="product"
                        >
                            <Form.Label>Describe the expense</Form.Label>
                            <Form.Control
                                required
                                isInvalid={formErrors?.product.length !== 0}
                                placeholder="Describe for what the said expense was paid for."
                                ref={productRef}
                            />
                            <Form.Control.Feedback type="invalid">
                                    {
                                        formErrors?.product.map(
                                            err => <div key={err}>{err}</div>
                                        )
                                    }
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="date"
                        >
                            <Form.Label>Date (Optional)</Form.Label>
                            <Form.Control
                                isInvalid={formErrors?.date.length !== 0}
                                type='date'
                                placeholder="When was the expense paid?"
                                ref={dateRef}
                            />
                            <Form.Control.Feedback type="invalid">
                                    {
                                        formErrors?.date.map(
                                            err => <div key={err}>{err}</div>
                                        )
                                    }
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={addItem}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Table striped bordered hover size="sm">
                <thead>
                    <tr className='bg-light'>
                        <th>Payee</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        /* map through items and display a row for every expense item */
                        items.map(
                            item => (
                                <tr key={item.id}>
                                    <td 
                                    style={item.payeeName === 'Rahul'? 
                                        {fontWeight:'bold', backgroundColor:'#2cab7c'} : 
                                        {fontWeight:'bold', backgroundColor:'#2ca5ab'}}
                                    >{item.payeeName}</td>
                                    <td>{item.setDate}</td>
                                    <td>{item.product}</td>
                                    <td>{item.price}</td>
                                </tr>
                            )
                        )
                    }
                </tbody>
                <tfoot style={{fontWeight:'bold', backgroundColor:'skyblue'}}>
                    <tr>
                        <td colSpan={3} className="text-end">Total amt</td>
                        <td>{personalExpense('Ramesh') + personalExpense('Rahul')}</td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="text-end">Rahul paid</td>
                        <td>{personalExpense('Rahul')}</td>
                    </tr> 
                    <tr>
                        <td colSpan={3} className="text-end">Ramesh paid</td>
                        <td>{personalExpense('Ramesh')}</td>
                    </tr>
                    <tr className='bg-warning'>
                        <td colSpan={3} className="text-end">{getPayable().message}</td>
                        <td>{getPayable().payable}</td>
                    </tr>
                </tfoot>
            </Table>
        </Container>
    );
};

export default ExpenseTracker;