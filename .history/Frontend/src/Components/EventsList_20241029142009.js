import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../Images/AV.jpg";
import "../Styles/EventsList.css";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date();

  // Retrieve user info from local storage
  const userInfo = JSON.parse(localStorage.getItem("userinfo"));
  const userType = userInfo?.type || ""; // Get user type (admin or user)
  const token = localStorage.getItem("token");
  // Fetch the events dynamically from the backend
  useEffect(() => {
    // Check if the token exists and redirect if not
    console.log(token);
    if (!token) {
      navigate("/signup"); // Redirect to signup if not logged in
      return; // Exit early
    }

    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);

        // If the token is invalid or expired
        if (error.response && error.response.status === 401) {
          navigate("/signup"); // Redirect to signup if unauthorized
        }
      }
    };

    fetchEvents();
  }, [token, navigate]);

  const handleEventClick = (event) => {
    if (userType === "admin") {
      navigate(`/admin/events/${event._id}`);
    } else {
      const nominationStartDate = new Date(event.startNominationPhase);
      const nominationEndDate = new Date(event.endNominationPhase);
      const electionStartDate = new Date(event.startVotingPhase);
      const electionEndDate = new Date(event.endVotingPhase);
      const resultsDate = new Date(event.resultPhase);

      if (event.isActive) {
        if (today >= nominationStartDate && today <= nominationEndDate) {
          navigate(`/nomination/${event._id}`);
        } else if (today >= electionStartDate && today <= electionEndDate) {
          navigate(`/voting/${event._id}`); // Redirects to VotingPhase.js
        } else if (today >= resultsDate) {
          navigate("/results");
        } else {
          navigate("/inactive");
        }
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <Navbar variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">
            <img
              src={Logo}
              alt="AspireVote Logo"
              style={{ width: "50px", height: "50px", marginRight: "10px" }}
            />
            AspireVote
          </Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/home">Home</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Events List */}
      <Container className="mt-5">
        <h2 className="text-center mb-4">Select an Event</h2>
        <Row>
          {events.length > 0 ? (
            events.map((event) => (
              <Col md={4} key={event._id} className="mb-4">
                <Card
                  className="shadow-sm"
                  onClick={() => handleEventClick(event)}
                >
                  <Card.Img
                    variant="top"
                    src={event.picture}
                    alt={event.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{event.name}</Card.Title>
                    <Card.Text>{event.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No events available at the moment.</p>
          )}
        </Row>
      </Container>

      {/* Footer */}
      <footer className="text-white text-center py-3 mt-5">
        <Container>
          <p>&copy; 2024 Campus Voting System. All rights reserved.</p>
          <p>Follow us on:</p>
          <Nav className="justify-content-center">
            <Nav.Link href="#" className="text-white">
              Facebook
            </Nav.Link>
            <Nav.Link href="#" className="text-white">
              Twitter
            </Nav.Link>
            <Nav.Link href="#" className="text-white">
              Instagram
            </Nav.Link>
          </Nav>
        </Container>
      </footer>
    </>
  );
};

export default EventsList;