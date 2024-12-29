import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import './styles.css'; // Import the CSS file for background styling

// App Component
function App() {
    return (
        <div className="app-container">
            <Container>
                <Row>
                    <Col md={{ offset: 3, span: 6 }}>
                        <TodoListCard />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

// TodoListCard Component
function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then((r) => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        (newItem) => {
            setItems([...items, newItem]);
        },
        [items]
    );

    const onItemUpdate = React.useCallback(
        (item) => {
            const index = items.findIndex((i) => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items]
    );

    const onItemRemoval = React.useCallback(
        (item) => {
            const index = items.findIndex((i) => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items]
    );

    if (items === null) return 'Loading...';

    return (
        <div className="todo-list-card">
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">No items yet! Add one above!</p>
            )}
            {items.map((item) => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </div>
    );
}

// AddItemForm Component
function AddItemForm({ onNewItem }) {
    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = (e) => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((r) => r.json())
            .then((item) => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add Item'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

// ItemDisplay Component
function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((r) => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item)
        );
    };

    return (
        <div className={`item ${item.completed ? 'completed' : ''}`}>
            <Container fluid>
                <Row>
                    <Col xs={1} className="text-center">
                        <Button
                            size="sm"
                            variant="link"
                            onClick={toggleCompletion}
                            aria-label={
                                item.completed
                                    ? 'Mark item as incomplete'
                                    : 'Mark item as complete'
                            }
                        >
                            <i
                                className={`far ${
                                    item.completed
                                        ? 'fa-check-square'
                                        : 'fa-square'
                                }`}
                            />
                        </Button>
                    </Col>
                    <Col xs={10} className="name">
                        {item.name}
                    </Col>
                    <Col xs={1} className="text-center remove">
                        <Button
                            size="sm"
                            variant="link"
                            onClick={removeItem}
                            aria-label="Remove Item"
                        >
                            <i className="fa fa-trash text-danger" />
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
