import {Nav, Navbar, Container, NavDropdown} from 'react-bootstrap';  

function Navbar1() {  
  return (  
    <Navbar bg="primary" expand="md">  
    <Container>  
      <Navbar.Brand href="#home">Navbar Brand</Navbar.Brand>  
      <Navbar.Toggle aria-controls="basic-navbar-nav" />  
      <Navbar.Collapse id="basic-navbar-nav">  
        <Nav className="me-auto">  
          <Nav.Link href="#home">Home</Nav.Link>  
          <Nav.Link href="#link">Link</Nav.Link>  
          <NavDropdown title="Dropdown" id="basic-nav-dropdown">  
            <NavDropdown.Item href="#action/3.1">Dropdown Item 1</NavDropdown.Item>  
            <NavDropdown.Item href="#action/3.2">Dropdown Item 2</NavDropdown.Item>  
            <NavDropdown.Item href="#action/3.3">Dropdown Item 3</NavDropdown.Item>  
            <NavDropdown.Divider />  
            <NavDropdown.Item href="#action/3.4">Another Item</NavDropdown.Item>  
          </NavDropdown>  
        </Nav>  
      </Navbar.Collapse>  
    </Container>  
  </Navbar>  
  );  
}  
export default Navbar1;  