# VERIXA PROJECT CONTEXT

---

# Project Information

Project Name

Verixa

Tagline

Intelligent Property Decision & Verification Platform

Version

1.0

Project Type

Full Stack Web Application

Status

Active Development

---

# Project Vision

Verixa is a Property Intelligence Platform designed to help buyers make informed real estate decisions.

Unlike traditional listing websites, Verixa combines verified property information, locality intelligence, builder credibility, machine learning, GIS mapping, OCR verification, and data analytics into one platform.

The platform focuses on trust, transparency, and intelligent decision making rather than simply displaying listings.

---

# Project Objectives

• Centralize property information.

• Verify builder and property authenticity.

• Predict fair market prices.

• Analyze locality growth.

• Compare multiple properties.

• Verify documents using OCR.

• Provide investment insights.

• Create a scalable production-ready architecture.

---

# Problem Statement

Current real estate platforms mainly provide listings.

Users still need to visit multiple websites for

- RERA Verification

- Builder Information

- Maps

- Schools

- Hospitals

- Price Analysis

- Market Trends

- Property Comparison

This process is slow and often unreliable.

Verixa solves this by creating a single Property Intelligence Platform.

---

# Target Users

Property Buyers

Property Investors

Builders

Real Estate Agents

Administrators

---

# Tech Stack

Frontend

React

Vite

Tailwind CSS

Axios

React Router

Leaflet

Backend

Django

Django REST Framework

JWT Authentication

Google OAuth

Database

PostgreSQL

Machine Learning

Scikit-learn

Pandas

NumPy

OCR

Tesseract OCR

OpenCV

Web Scraping

Selenium

BeautifulSoup

Maps

OpenStreetMap

Overpass API

Nominatim API

Version Control

Git

GitHub

---

# Project Modules

Authentication

Properties

Builders

Localities

Amenities

Property Images

Property Documents

Price Prediction

Property Scores

Nearby Places

Saved Properties

Comparison

Reports

Enquiries

OCR

Machine Learning

Scrapers

Admin Dashboard

---

# Backend Apps

accounts

properties

builders

locations

comparison

reports

inquiries

core

---

# Database Tables

Users

Builders

Localities

Properties

Amenities

PropertyAmenities

PropertyImages

NearbyPlaces

PropertyDocuments

PriceHistory

PropertyScores

SavedProperties

ComparisonSessions

ComparisonProperties

Reports

Enquiries

PropertySources

---

# Core Entity

Properties

Everything revolves around the Property entity.

Every module either provides data for a property or consumes data from a property.

---

# Data Sources

GUJRERA

Builder Websites

OpenStreetMap

Government Public Data

Manual Admin Entry

Future APIs

---

# Machine Learning Goals

Fair Price Prediction

Investment Score

Builder Score

Risk Score

Locality Score

Connectivity Score

Future Price Prediction

Confidence Score

---

# OCR Goals

Extract Property Information

Extract Owner Information

Verify Documents

Detect Missing Fields

Support Multiple Document Types

---

# GIS Goals

Nearby Schools

Nearby Hospitals

Nearby Parks

Nearby Bus Stops

Nearby Metro

Nearby Shopping Centers

Travel Distance

Travel Time

---

# User Flow

User

↓

Login

↓

Search Property

↓

View Property

↓

Builder Information

↓

Locality Information

↓

Nearby Places

↓

Price Analysis

↓

Property Scores

↓

Compare Properties

↓

Generate Report

↓

Save Property

↓

Send Enquiry

---

# Data Flow

Web Scrapers

↓

Data Cleaning

↓

PostgreSQL Database

↓

Machine Learning

↓

OCR

↓

Django REST API

↓

React Frontend

↓

User

---

# Coding Standards

Use UUID Primary Keys.

Follow PEP8.

Follow Django Best Practices.

Use meaningful variable names.

Avoid duplicate code.

Keep business logic inside services.

Use reusable components.

Never hardcode secrets.

---

# Naming Convention

Classes

PascalCase

Functions

snake_case

Variables

snake_case

Constants

UPPER_CASE

React Components

PascalCase

Folders

lowercase

---

# Database Rules

Use Foreign Keys.

Avoid redundancy.

Follow Third Normal Form.

Use Composite Keys where required.

Use proper indexing.

Maintain Referential Integrity.

---

# API Standards

REST APIs

JSON Responses

Status Codes

Authentication Required

Pagination

Filtering

Searching

Sorting

---

# Security

JWT Authentication

Google OAuth

Password Hashing

CSRF Protection

Input Validation

SQL Injection Prevention

Rate Limiting

---

# Future Features

AI Chatbot

Loan Calculator

Property Recommendation Engine

Satellite Analysis

Heat Maps

Market Forecasting

Notification System

Broker Dashboard

Mobile Application

---

# Development Rules

Never redesign the database without approval.

Never duplicate models.

Keep architecture modular.

Follow Clean Architecture.

Write scalable code.

Write reusable code.

Every new feature should integrate with the existing architecture.

---

# End Goal

Build Verixa as a production-ready Property Intelligence Platform that demonstrates professional Full Stack Development, Machine Learning, OCR, GIS Analysis, Web Scraping, and Database Engineering.