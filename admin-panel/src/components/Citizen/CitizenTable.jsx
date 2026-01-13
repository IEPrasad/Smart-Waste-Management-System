import React, { useState } from 'react';
import './CitizenTable.css';

const ROWS_PER_PAGE = 5;

const CitizenTable = ({ citizens, isLoading, statusLabel }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when citizens data changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [citizens]);

    // Get initials from name (first two letters of first and last name)
    const getInitials = (name) => {
        if (!name) return '??';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="citizen-table__loading">
                <div className="citizen-table__spinner"></div>
                <span>Loading citizens...</span>
            </div>
        );
    }

    if (!citizens || citizens.length === 0) {
        return (
            <div className="citizen-table__empty">
                <span>No {statusLabel} citizens found.</span>
            </div>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(citizens.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentCitizens = citizens.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="citizen-table__container">
            <div className="citizen-table__wrapper">
                <table className="citizen-table">
                    <thead>
                        <tr>
                            <th>Citizen Details</th>
                            <th>Division</th>
                            <th>GN Division</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCitizens.map((citizen) => (
                            <tr key={citizen.id}>
                                <td>
                                    <div className="citizen-info">
                                        <div className="citizen-avatar">
                                            {getInitials(citizen.full_name)}
                                        </div>
                                        <div className="citizen-details">
                                            <span className="citizen-name">{citizen.full_name}</span>
                                            <span className="citizen-assessment">{citizen.assessment_number?.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{citizen.division}</td>
                                <td>{citizen.gn_division}</td>
                                <td>
                                    <button className="view-btn" onClick={() => console.log('View citizen:', citizen.id)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination__info">
                        Showing {startIndex + 1} to {Math.min(endIndex, citizens.length)} of {citizens.length} entries
                    </div>
                    <div className="pagination__controls">
                        <button
                            className="pagination__btn"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
                            ) : (
                                <button
                                    key={page}
                                    className={`pagination__btn pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        <button
                            className="pagination__btn"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenTable;
