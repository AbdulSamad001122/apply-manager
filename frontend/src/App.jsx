import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', postLink: '', accountLink: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?page=${currentPage}&limit=5&search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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

  const handleDelete = (id) => {
    setDeleteModalId(id);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    try {
      const response = await fetch(`${API_URL}/${deleteModalId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setDeleteModalId(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', postLink: '', accountLink: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
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
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', margin: '0 8px 0 0' }}></div>
                    Saving...
                  </>
                ) : (
                  <>{editingId ? 'Update' : 'Save'} Application</>
                )}
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
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 && !showForm ? (
          <div className="empty-state">
            <p>No job applications saved yet. Click "New Application" to add one.</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="card">
              <div className="card-header">
                <div>
                  <h3 
                    className="card-title copyable" 
                    onClick={() => handleCopy(app.name, `${app._id}-name`)}
                    title="Click to copy"
                  >
                    {app.name}
                    {copiedId === `${app._id}-name` && <span className="copy-feedback">Copied!</span>}
                  </h3>
                  <div 
                    className="card-subtitle copyable" 
                    onClick={() => handleCopy(app.email, `${app._id}-email`)}
                    title="Click to copy"
                  >
                    {app.email}
                    {copiedId === `${app._id}-email` && <span className="copy-feedback">Copied!</span>}
                  </div>
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

      {deleteModalId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Application</h3>
            <p>Are you sure you want to delete this application? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModalId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
