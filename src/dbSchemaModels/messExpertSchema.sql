--CREATE TABLE 
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  fullName VARCHAR(150) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL
);


-- Members Table
CREATE TABLE Members (
    member_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    image TEXT,
    role VARCHAR(20) DEFAULT 'member',
    joining_date DATE NOT NULL,
    total_deposit NUMERIC(10, 2) DEFAULT 0,
    total_meal NUMERIC(10, 2) DEFAULT 0,
    user_id INT REFERENCES users(id)
);

-- Mess (for multi-group support)
CREATE TABLE Mess (
    mess_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT,
    admin_id INT REFERENCES Members(member_id)
);

-- Member-Mess mapping (if needed for multi-membership in future)
CREATE TABLE MemberMess (
    member_id INT REFERENCES Members(member_id),
    mess_id INT REFERENCES Mess(mess_id),
    PRIMARY KEY(member_id, mess_id)
);

-- Meals Table
CREATE TABLE Meals (
    meal_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES Members(member_id),
    mess_id INT REFERENCES Mess(mess_id),
    date DATE NOT NULL,
    meal_type VARCHAR(20)  -- breakfast, lunch, dinner
);

-- Deposits Table
CREATE TABLE Deposits (
    deposit_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES Members(member_id),
    mess_id INT REFERENCES Mess(mess_id),
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    note TEXT
);

-- Expenses Table
CREATE TABLE Expenses (
    expense_id SERIAL PRIMARY KEY,
    mess_id INT REFERENCES Mess(mess_id),
    member_id INT REFERENCES Members(member_id),
    category VARCHAR(50),
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_settled BOOLEAN DEFAULT FALSE
);

-- Shared Expenses (for bill splitting)
CREATE TABLE BillSplits (
    split_id SERIAL PRIMARY KEY,
    expense_id INT REFERENCES Expenses(expense_id),
    member_id INT REFERENCES Members(member_id),
    split_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Dues (auto-generated or from split bills)
CREATE TABLE Dues (
    due_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES Members(member_id),
    expense_id INT REFERENCES Expenses(expense_id),
    amount_due NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL
);

-- Payments Table
CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES Members(member_id),
    transaction_id INT,
    amount_paid NUMERIC(10,2),
    paid_on DATE NOT NULL,
    payment_method VARCHAR(50)
);

-- Notifications Table
CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES Members(member_id),
    message TEXT NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'unread',
    type VARCHAR(50)
);

-- Monthly Reports (optional summary storage)
CREATE TABLE MonthlyReports (
    report_id SERIAL PRIMARY KEY,
    mess_id INT REFERENCES Mess(mess_id),
    month VARCHAR(20),
    total_meals NUMERIC(10, 2),
    total_expense NUMERIC(10, 2),
    generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
