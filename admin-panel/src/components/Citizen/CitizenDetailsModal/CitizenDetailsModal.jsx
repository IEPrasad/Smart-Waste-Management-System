import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, IconButton, Typography, Divider, Avatar, TextField, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { toast } from 'react-hot-toast';
import {
    suspendCitizen,
    approveCitizen,
    rejectCitizen,
    removeSuspension,
    deleteCitizen
} from '../../../services/citizenService';
import './CitizenDetailsModal.css';

const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ').filter(w => w);
    if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
    if (!name) return 'hsl(220, 15%, 60%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 50%, 45%)`;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

const CitizenDetailsModal = ({ open, onClose, citizen, onActionSuccess }) => {
    const [isSuspending, setIsSuspending] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens/closes with different citizen
    React.useEffect(() => {
        setIsSuspending(false);
        setSuspendReason('');
        setIsRejecting(false);
        setRejectReason('');
        setIsDeleting(false);
        setIsLoading(false);
    }, [open, citizen]);

    if (!citizen) return null;

    const avatarSrc = citizen.avatar_url || citizen.profile_image;
    const status = citizen.account_status?.toLowerCase() || 'pending';

    const handleSuspendClick = () => setIsSuspending(true);
    const handleCancelSuspend = () => {
        setIsSuspending(false);
        setSuspendReason('');
    };

    const handleConfirmSuspend = async () => {
        if (!suspendReason.trim()) {
            toast.error('Please provide a reason for suspension.');
            return;
        }
        setIsLoading(true);
        const { success, error } = await suspendCitizen(citizen.id, suspendReason.trim());
        setIsLoading(false);
        if (success) {
            toast.success(`${citizen.full_name} has been suspended.`);
            if (onActionSuccess) onActionSuccess('suspended');
        } else {
            toast.error(error || 'Failed to suspend citizen.');
        }
    };

    const handleApprove = async () => {
        setIsLoading(true);
        const { success, error } = await approveCitizen(citizen.id);
        setIsLoading(false);
        if (success) {
            toast.success('Citizen approved successfully.');
            if (onActionSuccess) onActionSuccess('approved');
        } else {
            toast.error(error || 'Failed to approve citizen.');
        }
    };

    const handleRejectClick = () => setIsRejecting(true);
    const handleCancelReject = () => {
        setIsRejecting(false);
        setRejectReason('');
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }
        setIsLoading(true);
        const { success, error } = await rejectCitizen(citizen.id, rejectReason.trim());
        setIsLoading(false);
        if (success) {
            toast.success('Citizen request rejected.');
            if (onActionSuccess) onActionSuccess('rejected');
        } else {
            toast.error(error || 'Failed to reject citizen.');
        }
    };

    const handleRemoveSuspension = async () => {
        setIsLoading(true);
        const { success, error } = await removeSuspension(citizen.id);
        setIsLoading(false);
        if (success) {
            toast.success('Suspension removed successfully.');
            if (onActionSuccess) onActionSuccess('approved');
        } else {
            toast.error(error || 'Failed to remove suspension.');
        }
    };

    const handleDeleteClick = () => setIsDeleting(true);
    const handleCancelDelete = () => setIsDeleting(false);

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        const { success, error } = await deleteCitizen(citizen.id);
        setIsLoading(false);
        if (success) {
            toast.success('Citizen deleted permanently.');
            if (onActionSuccess) onActionSuccess('deleted'); // Will cause close and refetch in parent
        } else {
            toast.error(error || 'Failed to delete citizen.');
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth={false}
                PaperProps={{
                    className: 'citizen-modal-paper',
                    style: { width: '100%', maxWidth: '750px' }
                }}
            >
                <DialogTitle className="citizen-modal-title">
                    Citizen Details
                    <IconButton aria-label="close" onClick={onClose} className="citizen-modal-close-btn">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent className="citizen-modal-content-wrapper">
                    <div className="citizen-modal-main-content">
                        {/* Left Column - Profile & Contact info */}
                        <div className="citizen-modal-left-col">
                            <div className="citizen-profile-section">
                                {avatarSrc ? (
                                    <Avatar
                                        src={avatarSrc}
                                        alt={citizen.full_name}
                                        className="citizen-modal-avatar-large"
                                    />
                                ) : (
                                    <Avatar
                                        className="citizen-modal-avatar-large text-avatar"
                                        style={{ backgroundColor: getAvatarColor(citizen.full_name) }}
                                    >
                                        {getInitials(citizen.full_name)}
                                    </Avatar>
                                )}
                                <Typography variant="h5" className="citizen-profile-name">
                                    {citizen.full_name || 'N/A'}
                                </Typography>
                            </div>

                            <div className="citizen-contact-list">
                                <div className="contact-item">
                                    <BadgeIcon className="contact-icon" />
                                    <span>{citizen.nic_number || 'N/A'}</span>
                                </div>
                                <div className="contact-item">
                                    <PhoneIcon className="contact-icon" />
                                    <span>{citizen.mobile_number || 'N/A'}</span>
                                </div>
                                <div className="contact-item">
                                    <EmailIcon className="contact-icon" />
                                    <span>{citizen.email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Location */}
                        <div className="citizen-modal-right-col">
                            <div className="property-location-header">
                                <LocationOnIcon className="location-icon" />
                                <Typography variant="h6">Property Location</Typography>
                            </div>

                            <div className="property-details-grid">
                                <div className="property-info-box">
                                    <span className="property-label">ASSESSMENT NO</span>
                                    <span className="property-val">{citizen.assessment_number || 'N/A'}</span>
                                </div>
                                <div className="property-info-box">
                                    <span className="property-label">GN DIVISION</span>
                                    <span className="property-val">{citizen.gn_division || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="property-details-grid single-col">
                                <div className="property-info-box">
                                    <span className="property-label">DIVISION</span>
                                    <span className="property-val">{citizen.division || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Display Suspended/Rejected Reason */}
                            {(status === 'suspended' || status === 'rejected') && citizen.status_reason && (
                                <div className="suspend-reason-display-box">
                                    <Typography variant="subtitle2" color="error" className="suspend-reason-title">
                                        {status === 'suspended' ? 'Suspension Details' : 'Rejection Details'}
                                    </Typography>
                                    <Typography variant="body2" className="suspend-reason-text">
                                        {citizen.status_reason}
                                    </Typography>
                                    <Typography variant="caption" className="suspend-reason-date">
                                        {status === 'suspended' ? 'Suspended' : 'Rejected'} on: {formatDate(citizen.status_updated_at)}
                                    </Typography>
                                </div>
                            )}

                        </div>
                    </div>
                </DialogContent>

                <div className="citizen-modal-footer">
                    <div className="citizen-registered-date">
                        <CalendarTodayIcon className="calendar-icon" />
                        <span>Registered: {formatDate(citizen.created_at)}</span>
                    </div>

                    <div className="citizen-action-buttons">
                        {status === 'pending' && !isRejecting && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    className="action-btn reject-btn"
                                    onClick={handleRejectClick}
                                    disabled={isLoading}
                                >
                                    Reject Request
                                </Button>
                                <Button
                                    variant="contained"
                                    className="action-btn approve-btn"
                                    onClick={handleApprove}
                                    disabled={isLoading}
                                >
                                    Approve Citizen
                                </Button>
                            </>
                        )}

                        {status === 'approved' && !isSuspending && (
                            <Button
                                variant="outlined"
                                color="error"
                                className="action-btn reject-btn"
                                onClick={handleSuspendClick}
                                disabled={isLoading}
                                startIcon={<BlockIcon />}
                            >
                                Suspend Account
                            </Button>
                        )}

                        {status === 'rejected' && !isDeleting && (
                            <Button
                                variant="outlined"
                                color="error"
                                className="action-btn reject-btn"
                                onClick={handleDeleteClick}
                                disabled={isLoading}
                                startIcon={<DeleteIcon />}
                            >
                                Delete Request
                            </Button>
                        )}

                        {status === 'suspended' && !isDeleting && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    className="action-btn reject-btn"
                                    onClick={handleDeleteClick}
                                    disabled={isLoading}
                                    startIcon={<DeleteIcon />}
                                >
                                    Delete User
                                </Button>
                                <Button
                                    variant="contained"
                                    className="action-btn approve-btn"
                                    onClick={handleRemoveSuspension}
                                    disabled={isLoading}
                                    startIcon={<RestoreIcon />}
                                >
                                    Remove Suspension
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Dialog>

            {/* Secondary Action Modal (Suspend / Reject / Delete) */}
            <Dialog
                open={isSuspending || isRejecting || isDeleting}
                onClose={isSuspending ? handleCancelSuspend : isRejecting ? handleCancelReject : handleCancelDelete}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '12px', padding: '8px' }
                }}
                style={{ zIndex: 1400 }}
            >
                <DialogTitle>
                    <Typography variant="h6" color="error" style={{ fontWeight: 700 }}>
                        {isSuspending ? 'Suspend Citizen Account' : isRejecting ? 'Reject Citizen Request' : 'Delete Citizen Record'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {!isDeleting ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder={`Enter reason for ${isSuspending ? 'suspension' : 'rejection'}...`}
                            variant="outlined"
                            value={isSuspending ? suspendReason : rejectReason}
                            onChange={(e) => {
                                if (isSuspending) setSuspendReason(e.target.value);
                                else setRejectReason(e.target.value);
                            }}
                            disabled={isLoading}
                            autoFocus
                            style={{ marginTop: '8px' }}
                        />
                    ) : (
                        <Typography variant="body1" style={{ color: '#444', marginTop: '8px', lineHeight: 1.6 }}>
                            Are you sure you want to permanently delete this record? All associated data will be removed. This action cannot be undone.
                        </Typography>
                    )}
                </DialogContent>

                {/* Fixed Action Footer using DialogActions */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button
                        variant="text"
                        onClick={isSuspending ? handleCancelSuspend : isRejecting ? handleCancelReject : handleCancelDelete}
                        disabled={isLoading}
                        style={{ textTransform: 'none', fontWeight: 600, color: '#666' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={isSuspending ? handleConfirmSuspend : isRejecting ? handleConfirmReject : handleConfirmDelete}
                        disabled={isLoading || (isSuspending && !suspendReason.trim()) || (isRejecting && !rejectReason.trim())}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : (isDeleting ? <DeleteIcon /> : <BlockIcon />)}
                        style={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' }}
                    >
                        {isDeleting ? 'Delete' : 'Confirm'}
                    </Button>
                </div>
            </Dialog>
        </>
    );
};

export default CitizenDetailsModal;
