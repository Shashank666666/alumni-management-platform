-- MySQL Script for Alumni Management Platform
-- This script contains MySQL-specific syntax and should be run on a MySQL server

-- Database creation
-- Note: This script is designed for MySQL. Syntax may differ for other database systems.

-- Create database (run this separately or ensure the database exists)
-- CREATE DATABASE alumni_db;
-- USE alumni_db;

-- Alumni table
CREATE TABLE IF NOT EXISTS alumni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    graduation_year YEAR NOT NULL,
    degree VARCHAR(100),
    major VARCHAR(100),
    current_job_title VARCHAR(100),
    current_company VARCHAR(100),
    linkedin_profile VARCHAR(255),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    profile_picture VARCHAR(255),
    bio TEXT,
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    organizer_id INT,
    max_attendees INT,
    registration_deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES alumni(id)
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    alumni_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (alumni_id) REFERENCES alumni(id),
    UNIQUE KEY unique_registration (event_id, alumni_id)
);

-- Fundraising campaigns table
CREATE TABLE IF NOT EXISTS fundraising_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(10, 2),
    raised_amount DECIMAL(10, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES alumni(id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    alumni_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (campaign_id) REFERENCES fundraising_campaigns(id),
    FOREIGN KEY (alumni_id) REFERENCES alumni(id)
);

-- Messaging system tables
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    recipient_id INT,
    subject VARCHAR(255),
    content TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES alumni(id),
    FOREIGN KEY (recipient_id) REFERENCES alumni(id)
);

-- Alumni networks/groups table
CREATE TABLE IF NOT EXISTS alumni_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES alumni(id)
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT,
    alumni_id INT,
    role ENUM('member', 'admin', 'moderator') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES alumni_groups(id),
    FOREIGN KEY (alumni_id) REFERENCES alumni(id),
    UNIQUE KEY unique_membership (group_id, alumni_id)
);

-- Create indexes for better performance
CREATE INDEX idx_alumni_email ON alumni(email);
CREATE INDEX idx_alumni_graduation_year ON alumni(graduation_year);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);