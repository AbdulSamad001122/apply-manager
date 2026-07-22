import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', postLink: '', accountLink: '' });
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}?page=${currentPage}&limit=5&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchApplications();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      name: app.name,
      email: app.email,
      postLink: app.postLink,
      accountLink: app.accountLink || '',
    });
    setEditingId(app._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchApplications();
        }
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', postLink: '', accountLink: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Job Application Tracker</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Application
          </button>
        )}
      </header>

      {showForm && (
        <div className="form-container">
          <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Application' : 'Add New Application'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name / Company</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Contact Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="postLink">Job Post Link</label>
              <input
                type="url"
                id="postLink"
                name="postLink"
                className="form-control"
                value={formData.postLink}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="accountLink">Account / Profile Link (Optional)</label>
              <input
                type="url"
                id="accountLink"
                name="accountLink"
                className="form-control"
                value={formData.accountLink}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Save'} Application
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setCurrentPage(1), fetchApplications())}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={() => { setCurrentPage(1); fetchApplications(); }}>
            Search
          </button>
        </div>
      )}

      <div className="applications-list">
        {applications.length === 0 && !showForm ? (
          <div className="empty-state">
            <p>No job applications saved yet. Click "New Application" to add one.</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{app.name}</h3>
                  <div className="card-subtitle">{app.email}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEdit(app)} title="Edit">
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(app._id)} title="Delete">
                    Delete
                  </button>
                </div>
              </div>
              <div className="links">
                <a href={app.postLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                  Job Post
                </a>
                {app.accountLink && (
                  <a href={app.accountLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                    Profile Link
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!showForm && totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', paddingBottom: '20px' }}>
          <button 
            className="btn btn-secondary" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages}</span>
          <button 
            className="btn btn-secondary" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
