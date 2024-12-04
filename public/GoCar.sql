CREATE TABLE users (
    _id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(11),
    gender VARCHAR(7),
    nid VARCHAR(16),
    dob DATE,
    division VARCHAR(15),
    district VARCHAR(15),
    upazilla VARCHAR(20),
    keyArea VARCHAR(15),
    area VARCHAR(200),
    image VARCHAR(255),
    userRole NOT NULL,
    verified BOOLEAN
    accountStatus ENUM('Active', 'Inactive', 'Suspended'),
    license_number VARCHAR(20),
    expire_date DATE,
    experience TINYINT
);


CREATE TABLE agencies (
    agency_id VARCHAR(20) PRIMARY KEY,
    agency_Name VARCHAR(50) NOT NULL,
    agency_Email VARCHAR(100) UNIQUE NOT NULL,
    owner_id VARCHAR(20)
    phone_Number VARCHAR(11),
    image VARCHAR(255),
    total_vehicles TINYINT,
    division VARCHAR(15),
    district VARCHAR(15),
    upazilla VARCHAR(20),
    keyArea VARCHAR(15),
    area VARCHAR(250),
    businessRegNumber VARCHAR(30),
    TIN VARCHAR(30),
    insuranceNumber VARCHAR(30),
    registration_date DATE,
    licenseExpiryDate DATE,
    status ENUM('active', 'inactive', 'suspended'),
    verified BOOLEAN,

    FOREIGN KEY (owner_id) REFERENCES users(_id)
);


CREATE TABLE vehicles (
    vehicle_id VARCHAR(20) PRIMARY KEY,
    agency_id VARCHAR(20),
    brand VARCHAR(20),
    model VARCHAR(20),
    car_type VARCHAR(20),
    trim_level VARCHAR(30),
    build_year YEAR,
    photo VARCHAR(255),
    seats TINYINT,
    mileage DECIMAL(5,2),
    gear ENUM('Manual', 'Automatic'),
    fuel VARCHAR(20),
    rental_price INT,
    transmission_type VARCHAR(20),
    about TEXT,
    air_conditioning BOOLEAN,
    gps BOOLEAN,
    Bluetooth BOOLEAN,
    central_locking BOOLEAN,
    heater BOOLEAN,
    status ENUM('available', 'unavailable', 'suspended') DEFAULT 'available',
    verified BOOLEAN,

    FOREIGN KEY (agency_id) REFERENCES agencies(agency_id)
);


CREATE TABLE vehicle_documentation (
    documentation_id VARCHAR(20) PRIMARY KEY,
    vehicle_id INT,
    license_number VARCHAR(30),
    expire_date DATE,
    fitness_certificate VARCHAR(30),
    issuing_authority VARCHAR(30),
    insurance_number VARCHAR(30),
    insurance_start_date DATE,
    insurance_ending_date DATE,
    insurance_provider VARCHAR(100),
    insurance_coverage_type VARCHAR(30),

    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);


CREATE TABLE vehicle_reviews_and_ratings (
    _id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    vehicle_id VARCHAR(20),
    date DATE,
    review TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

    FOREIGN KEY (user_id) REFERENCES users(_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);


CREATE TABLE agency_reviews_and_ratings (
    _id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    agency_id VARCHAR(20),
    date DATE,
    review TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

    FOREIGN KEY (user_id) REFERENCES users(_id),
    FOREIGN KEY (agency_id) REFERENCES agencies(agency_id)
);


CREATE TABLE booking_info (
    booking_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20),
    vehicle_id VARCHAR(20),
    booking_date DATE,
    pickup_date DATE,
    dropoff_date DATE,
    total_rent_hours INT,
    driver_cost DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

CREATE TABLE payment_info (
    payment_id VARCHAR(20) PRIMARY KEY,
    booking_id VARCHAR(20),
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    advance_paid DECIMAL(10,2),
    payment_date DATE,
    Trx_id VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES booking_info(booking_id)
);


