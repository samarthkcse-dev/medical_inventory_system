# 💊 Medical Inventory and Expiry Alert Management System

A web-based medical inventory management system designed to help manage
medicine records and monitor stock and expiry dates. This project is
developed as an academic micro-project to demonstrate how digital tools
can make inventory tracking more organized and efficient.

## 📌 Project Overview

Maintaining medicine inventory manually can make it difficult to track
available stock and identify medicines that are nearing expiry. This
system provides a centralized interface for managing medicine
information and reviewing inventory details.

## ✨ Key Features

-   **Landing page:** Introduces the system and provides a starting
    point for users.
-   **Admin authentication:** Login and registration interface for
    administrators.
-   **Medicine inventory:** Organize and manage medicine records,
    depending on the features enabled in the application.
-   **Expiry monitoring:** Help identify medicines approaching their
    expiry dates, if enabled in the current build.
-   **Stock overview:** Review medicine and inventory information from
    the application.
-   **Responsive interface:** Designed for convenient use on supported
    screen sizes.

> **Note:** The available features depend on the current implementation.
> Update this list to match the functionality present in your
> repository.

## 🛠️ Technology

-   **Frontend:** Web technologies used by the project
-   **Backend and database services:** Supabase (if configured in this
    repository)
-   **Development tools:** A code editor and a modern web browser

Check the project files and configuration to confirm the exact framework
and dependencies.

## 🚀 Getting Started

### Prerequisites

-   Git
-   Node.js and npm, if this is an npm-based frontend project
-   Access to the Supabase project, if the application uses Supabase

### 1. Clone the repository

``` bash
git clone https://github.com/samarthkcse-dev/medical_inventory_system.git
cd medical_inventory_system
```

### 2. Install dependencies

If the repository contains a `package.json` file, run:

``` bash
npm install
```

### 3. Configure environment variables

If the application connects to Supabase, create the environment file
expected by your frontend framework and add your project's Supabase URL
and public/anonymous key.

For a Vite-based project, the variables commonly look like this:

``` env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the variable names expected by your actual code. Never commit
private service-role keys, database passwords, or other secrets to
GitHub.

### 4. Run the application

For a Vite-based project, run:

``` bash
npm run dev
```

Open the local URL printed in the terminal. If the project uses another
framework or scripts, follow the commands in its `package.json`.

## 🧭 How to Use

1.  Open the application.
2.  Select **Get Started** to continue from the landing page.
3.  Register an administrator account or log in with an existing
    account.
4.  Open the available inventory sections.
5.  Add or review medicine records and check stock or expiry information
    supported by the application.

## 🎓 Project Purpose

This academic project demonstrates the use of a web application to
organize medicine inventory information. It can help students understand
user authentication, data management, database integration, and the
design of a practical inventory interface.

## 🔒 Security Notes

-   Keep credentials and secret keys out of source control.
-   Configure database access policies before using real inventory data.
-   Use test data for demonstrations.
-   This academic project should not be treated as a validated medical
    or pharmacy compliance system without further testing and review.

## 🔮 Possible Future Enhancements

-   Automatic low-stock and near-expiry alerts
-   Search, sorting, and filtering for medicine records
-   Batch number and supplier management
-   Inventory reports and export options
-   Role-based access control
-   Audit history for inventory updates

## 👨‍💻 Author

**Samarth Kore**

-   GitHub: [@samarthkcse-dev](https://github.com/samarthkcse-dev)
-   Repository:
    [medical_inventory_system](https://github.com/samarthkcse-dev/medical_inventory_system)

## 📄 License

No license is specified here. Add a `LICENSE` file if you want to define
how others may use, modify, and distribute this project.
