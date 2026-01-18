import React, { useState, useEffect } from 'react';
import './CitizenTable.css';

const ROWS_PER_PAGE = 5;

/**
 * Generate initials from a name (first letter of first and last name)
 * @param {string} name - Full name
 * @returns {string} Two letter initials
 */
const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ').filter(w => w);
    if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Generate a consistent color based on name (for avatar background)
 * @param {string} name - Full name
 * @returns {string} HSL color string
 */
const getAvatarColor = (name) => {
    if (!name) return 'hsl(220, 15%, 60%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 50%, 45%)`;
};

/**
 * CitizenTable Component
 * Displays a table of citizens with pagination
 * @param {Array} citizens - Array of citizen objects
 * @param {boolean} isLoading - Loading state
 * @param {string} tableTitle - Title for the table section
 * @param {function} onViewCitizen - Callback when View button is clicked
 */
const CitizenTable = ({ citizens, isLoading, tableTitle, onViewCitizen }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when citizens data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [citizens]);

    // Handle View button click
    const handleView = (citizen) => {
        if (onViewCitizen) {
            onViewCitizen(citizen);
        } else {
            console.log('View citizen:', citizen.id);
        }
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
            <div className="citizen-table__wrapper">
                {/* Search & Download placeholder area */}
                <div className="citizen-table__toolbar">
                    <div className="citizen-table__toolbar-placeholder">
                        {/* Reserved space for search bar */}
                    </div>
                    <div className="citizen-table__toolbar-placeholder">
                        {/* Reserved space for download button */}
                    </div>
                </div>

                <h2 className="citizen-table__title">{tableTitle}</h2>

                <div className="citizen-table__empty">
                    <span>No {tableTitle?.toLowerCase() || 'citizens'} found.</span>
                </div>
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
        <div className="citizen-table__wrapper">
            {/* Search & Download placeholder area */}
            <div className="citizen-table__toolbar">
                <div className="citizen-table__search-placeholder">
                    {/* Reserved space for search bar */}
                </div>
                <div className="citizen-table__actions-placeholder">
                    {/* Reserved space for download button */}
                </div>
            </div>

            <h2 className="citizen-table__title">{tableTitle}</h2>

            <div className="citizen-table__container">
                <div className="citizen-table__scroll">
                    <table className="citizen-table">
                        <thead>
                            <tr>
                                <th className="citizen-table__th--details">Citizen Details</th>
                                <th className="citizen-table__th--division">Division</th>
                                <th className="citizen-table__th--gn">DN Division</th>
                                <th className="citizen-table__th--action">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCitizens.map((citizen) => (
                                <tr key={citizen.id}>
                                    <td>
                                        <div className="citizen-info">
                                            {citizen.profile_image ? (
                                                <img
                                                    src={citizen.profile_image}
                                                    alt={citizen.full_name}
                                                    className="citizen-avatar citizen-avatar--image"
                                                />
                                            ) : (
                                                <div
                                                    className="citizen-avatar citizen-avatar--initials"
                                                    style={{ backgroundColor: getAvatarColor(citizen.full_name) }}
                                                >
                                                    {getInitials(citizen.full_name)}
                                                </div>
                                            )}
                                            <div className="citizen-details">
                                                <span className="citizen-name">{citizen.full_name}</span>
                                                <span className="citizen-assessment">
                                                    {citizen.assessment_number || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="citizen-table__td--division">
                                        {citizen.division || '-'}
                                    </td>
                                    <td className="citizen-table__td--gn">
                                        {citizen.gn_division || '-'}
                                    </td>
                                    <td className="citizen-table__td--action">
                                        <button
                                            className="view-btn"
                                            onClick={() => handleView(citizen)}
                                            aria-label={`View ${citizen.full_name}`}
                                        >
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
                        <button
                            className="pagination__btn pagination__btn--nav"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <span className="pagination__chevron">&#8249;</span>
                            Previous
                        </button>

                        <div className="pagination__pages">
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`pagination__btn pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                                        onClick={() => handlePageClick(page)}
                                        aria-label={`Page ${page}`}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            className="pagination__btn pagination__btn--nav"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            Next
                            <span className="pagination__chevron">&#8250;</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenTable;
