import React, { useState, useEffect, useRef } from 'react';
import './Drivers.css';
import AddDriverButton from '../../components/Drivers/AddDriverButton';
import AddDriverModal from '../../components/Drivers/AddDriverModal';
import DriverCard from '../../components/Drivers/DriverCard';
import DriverDetailsModal from '../../components/Drivers/DriverDetailsModal';
import AddVehicleModal from '../../components/Vehicles/AddVehicleModal';
import VehicleCard from '../../components/Vehicles/VehicleCard';
import VehicleDetailsModal from '../../components/Vehicles/VehicleDetailsModal';
import { getAllDrivers } from '../../services/driverService';
import { getAllVehicles } from '../../services/vehicleService';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Drivers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vehiclesError, setVehiclesError] = useState(null);
    const carouselRef = useRef(null);
    const vehicleCarouselRef = useRef(null);

    // Fetch drivers and vehicles on component mount
    useEffect(() => {
        fetchDrivers();
        fetchVehicles();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await getAllDrivers();

        if (fetchError) {
            setError('Failed to load drivers. Please try again.');
            console.error('Error fetching drivers:', fetchError);
        } else {
            setDrivers(data);
        }
        setLoading(false);
    };

    const fetchVehicles = async () => {
        setVehiclesLoading(true);
        setVehiclesError(null);
        const { data, error: fetchError } = await getAllVehicles();

        if (fetchError) {
            setVehiclesError('Failed to load vehicles. Please try again.');
            console.error('Error fetching vehicles:', fetchError);
        } else {
            setVehicles(data);
        }
        setVehiclesLoading(false);
    };

    const handleViewDriver = (driver) => {
        setSelectedDriver(driver);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedDriver(null);
    };

    const handleAddModalClose = () => {
        setIsModalOpen(false);
        // Refresh drivers list after adding new driver
        fetchDrivers();
    };

    const handleVehicleModalClose = () => {
        setIsVehicleModalOpen(false);
    };

    const handleVehicleSuccess = () => {
        // Refresh vehicle list after adding new vehicle
        fetchVehicles();
    };

    const handleViewVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsVehicleDetailsModalOpen(true);
    };

    const handleCloseVehicleDetailsModal = () => {
        setIsVehicleDetailsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleVehicleUpdate = () => {
        fetchVehicles();
    };

    const handleVehicleDelete = () => {
        fetchVehicles();
    };

    // Scroll driver carousel left
    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        }
    };

    // Scroll driver carousel right
    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        }
    };

    // Scroll vehicle carousel left
    const scrollVehiclesLeft = () => {
        if (vehicleCarouselRef.current) {
            vehicleCarouselRef.current.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        }
    };

    // Scroll vehicle carousel right
    const scrollVehiclesRight = () => {
        if (vehicleCarouselRef.current) {
            vehicleCarouselRef.current.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="drivers-container">
            {/* Page Header Section */}
            <div className="drivers-page-header">
                <h1 className="drivers-main-heading">Drivers & Vehicles Management</h1>
                <p className="drivers-subtext">Manage drivers, vehicles, and assignments for daily waste collection operations.</p>
            </div>

            <div className="drivers-header">
                <h1 className="drivers-title">Drivers Management</h1>
                <AddDriverButton onClick={() => setIsModalOpen(true)} />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="drivers-loading">
                    <CircularProgress style={{ color: '#00d2a0' }} />
                    <p>Loading drivers...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="drivers-error">
                    <p>{error}</p>
                    <button onClick={fetchDrivers} className="retry-btn">Retry</button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && drivers.length === 0 && (
                <div className="drivers-empty">
                    <div className="empty-icon">👤</div>
                    <h3>No Drivers Found</h3>
                    <p>Start by adding a new driver to manage your fleet.</p>
                </div>
            )}

            {/* Driver Cards Carousel */}
            {!loading && !error && drivers.length > 0 && (
                <div className="drivers-carousel-container">
                    {/* Left Arrow */}
                    <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft}>
                        <ChevronLeftIcon />
                    </button>

                    {/* Carousel Track */}
                    <div className="drivers-carousel" ref={carouselRef}>
                        {drivers.map((driver) => (
                            <DriverCard
                                key={driver.id}
                                driver={driver}
                                onViewClick={handleViewDriver}
                            />
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight}>
                        <ChevronRightIcon />
                    </button>
                </div>
            )}

            {/* Vehicles Management Section */}
            <div className="vehicles-section">
                <div className="drivers-header">
                    <h1 className="drivers-title">Vehicles Management</h1>
                    <button className="add-vehicle-btn" onClick={() => setIsVehicleModalOpen(true)}>
                        <span>+</span> Add New Vehicle
                    </button>
                </div>

                {/* Vehicles Loading State */}
                {vehiclesLoading && (
                    <div className="drivers-loading">
                        <CircularProgress style={{ color: '#00d2a0' }} />
                        <p>Loading vehicles...</p>
                    </div>
                )}

                {/* Vehicles Error State */}
                {vehiclesError && !vehiclesLoading && (
                    <div className="drivers-error">
                        <p>{vehiclesError}</p>
                        <button onClick={fetchVehicles} className="retry-btn">Retry</button>
                    </div>
                )}

                {/* Vehicles Empty State */}
                {!vehiclesLoading && !vehiclesError && vehicles.length === 0 && (
                    <div className="drivers-empty">
                        <div className="empty-icon">🚛</div>
                        <h3>No Vehicles Found</h3>
                        <p>Start by adding a new vehicle to manage your fleet.</p>
                    </div>
                )}

                {/* Vehicle Cards Carousel */}
                {!vehiclesLoading && !vehiclesError && vehicles.length > 0 && (
                    <div className="drivers-carousel-container">
                        {/* Left Arrow */}
                        <button className="carousel-arrow carousel-arrow-left" onClick={scrollVehiclesLeft}>
                            <ChevronLeftIcon />
                        </button>

                        {/* Carousel Track */}
                        <div className="drivers-carousel" ref={vehicleCarouselRef}>
                            {vehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onViewClick={handleViewVehicle}
                                />
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button className="carousel-arrow carousel-arrow-right" onClick={scrollVehiclesRight}>
                            <ChevronRightIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Driver Modal */}
            <AddDriverModal
                isOpen={isModalOpen}
                onClose={handleAddModalClose}
            />

            {/* Driver Details Modal */}
            <DriverDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                driver={selectedDriver}
            />

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={isVehicleModalOpen}
                onClose={handleVehicleModalClose}
                onSuccess={handleVehicleSuccess}
            />

            {/* Vehicle Details Modal */}
            <VehicleDetailsModal
                isOpen={isVehicleDetailsModalOpen}
                onClose={handleCloseVehicleDetailsModal}
                vehicle={selectedVehicle}
                onUpdate={handleVehicleUpdate}
                onDelete={handleVehicleDelete}
            />
        </div>
    );
};

export default Drivers;
