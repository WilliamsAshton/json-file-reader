import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Pagination, Form, Modal, Button } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [bodyData, setBodyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [filteredTimelineData, setFilteredTimelineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    axios.get('https://arthurfrost.qflo.co.za/php/getTimeline.php')
      .then(response => {
        setBodyData(response.data.Body);
        setTimelineData(response.data.Timeline);
        setFilteredTimelineData(response.data.Timeline);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (event: { target: { value: string; }; }) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = timelineData.filter(item =>
      
      item.Title.toLowerCase().includes(value) ||
      item.Episode.includes(value) ||
      item.MediaName.toLowerCase().includes(value) ||
      item.CreateDate.includes(value) ||
      item.Category.toLowerCase().includes(value)
    );
    setFilteredTimelineData(filteredData);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTimelineData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: React.SetStateAction<number>) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredTimelineData.length / itemsPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination>
        {currentPage > 1 && (
          <>
            <Pagination.First onClick={() => paginate(1)} />
            <Pagination.Prev onClick={() => paginate(currentPage - 1)} />
          </>
        )}
        {currentPage > 3 && <Pagination.Ellipsis />}
        {pageNumbers.slice(Math.max(0, currentPage - 3), currentPage + 2).map(number => (
          <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
            {number}
          </Pagination.Item>
        ))}
        {currentPage < totalPages - 2 && <Pagination.Ellipsis />}
        {currentPage < totalPages && (
          <>
            <Pagination.Next onClick={() => paginate(currentPage + 1)} />
            <Pagination.Last onClick={() => paginate(totalPages)} />
          </>
        )}
      </Pagination>
    );
  };

  const handleRowDoubleClick = (item: React.SetStateAction<null>) => {
    setSelectedRow(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Please wait as we load the appropriate data</p>
      </div>
    );
  }
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div className="app-container">
    {bodyData.map(item => (
      <div key={item.Id} className="body-item">
        <div
          className="background-section"
          style={{
            backgroundImage: `url(https://arthurfrost.qflo.co.za/${item.Background})`,
            opacity: item.BackgroundOpacity / 100
          }}
        />
        <div className="about-section">
          <div dangerouslySetInnerHTML={{ __html: item.About }} />
        </div>
      </div>
      ))}

      <Form.Control
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        
      />
      <div className="table-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Id</th>
              <th>Episode</th>
              <th>Title</th>
              <th>Media</th>
              <th>Image</th>
              <th>Icon</th>
              <th>Audio</th>
              <th>Status</th>
              <th>Active</th>
              <th>Create Date</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.Id} onDoubleClick={() => handleRowDoubleClick(item)}>
                <td>{item.Id}</td>
                <td>{item.Episode}</td>
                <td>{item.Title}</td>
                <td>{item.MediaName}</td>
                <td><img src={`https://arthurfrost.qflo.co.za/${item.Image}`} alt={item.Title} style={{ width: '40px' }} /></td>
                <td><img src={`https://arthurfrost.qflo.co.za/${item.Icon}`} alt={item.Title} style={{ width: '40px' }} /></td>
                <td>
                  {item.Audio && (
                    <audio controls>
                      <source src={`https://arthurfrost.qflo.co.za/${item.Audio}`} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </td>
                <td>{item.Status}</td>
                <td>{item.isActive}</td>
                <td>{item.CreateDate}</td>
                <td>{item.Category}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {renderPagination()}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Item Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow && (
            <div className="modal-content-container">
              <h2 className="modal-title">{selectedRow.Title}</h2>
              <div className="modal-gap"></div>
              <img src={`https://arthurfrost.qflo.co.za/${selectedRow.Image}`} alt={selectedRow.Title} className="modal-image" />
              <div className="modal-gap"></div>
              <div className="modal-icons">
                <img src={`https://arthurfrost.qflo.co.za/${selectedRow.Icon}`} alt="Icon" className="modal-icon" />
              </div>
              <div className="modal-gap"></div>
              {selectedRow.Audio && (
                <audio controls className="modal-audio">
                  <source src={`https://arthurfrost.qflo.co.za/${selectedRow.Audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <div className="modal-gap"></div>
              <p className="modal-audio-size">{selectedRow.AudioSize}</p>
              <div className="modal-gap"></div>
              <p><strong>ID:</strong> {selectedRow.Id} <strong>Media:</strong> {selectedRow.MediaNumber} <strong>Category:</strong> {selectedRow.Category}</p>
              <div className="modal-gap"></div>
              <p><strong>Description:</strong> {selectedRow.Description}</p>
              <div className="modal-gap"></div>
              <p><strong>Status:</strong> {selectedRow.Status} <strong>isActive:</strong> {selectedRow.isActive}</p>
              <p><strong>RemoteId:</strong> {selectedRow.RemoteId} <strong>inId:</strong> {selectedRow.inId}</p>
              <p><strong>CreateDate:</strong> {selectedRow.CreateDate} <strong>MediaName:</strong> {selectedRow.MediaName} <strong>Epoch:</strong> {selectedRow.Epoch}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;