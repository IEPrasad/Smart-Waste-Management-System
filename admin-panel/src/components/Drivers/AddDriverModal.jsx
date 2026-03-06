import { X } from 'lucide-react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabaseClient';

const CloseButton = styled.button`
  background: #EF4444;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;

  &:hover {
    background: #DC2626;
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  }
`;

const AddDriverModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        mobile: '',
        empNo: '',
        nic: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                fullName: '',
                email: '',
                mobile: '',
                empNo: '',
                nic: ''
            });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.mobile || !formData.empNo || !formData.nic) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }

        try {
            // Get current session for token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session found. Please log in.");

            const { data: { user } } = await supabase.auth.getUser();

            // Construct function URL (replace with your actual project ref if needed, or derive from client)
            // Using the project ID we saw in previous step: lmvzbwffclioedwfxwud
            const projectRef = 'lmvzbwffclioedwfxwud';
            const functionUrl = `https://${projectRef}.supabase.co/functions/v1/create-driver`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formData)
            });

            const responseText = await response.text();

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                // If not JSON, use text
                responseData = { error: responseText };
            }

            if (!response.ok) {
                throw new Error(responseData.error || responseText || "Failed to create driver");
            }

            // Success
            alert("Driver created successfully!");
            onClose();
        } catch (err) {
            console.error("Error creating driver:", err);
            setError(err.message || "Failed to create driver.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add New Driver</h2>
                    <CloseButton onClick={onClose} disabled={isLoading}>
                        <X size={20} strokeWidth={2.5} />
                    </CloseButton>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. Kamal Perera"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="driver@example.com"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                type="text"
                                placeholder="07x xxxxxxx"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Employee Number</label>
                            <input
                                name="empNo"
                                value={formData.empNo}
                                onChange={handleChange}
                                type="text"
                                placeholder="EMP-001"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>NIC Number</label>
                        <input
                            name="nic"
                            value={formData.nic}
                            onChange={handleChange}
                            type="text"
                            placeholder="xxxxxxxxx V"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="create-driver-btn" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Creating...' : (
                            <>
                                <span>+</span> Add Driver
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddDriverModal;
