CREATE DATABASE todoapp;

CREATE TABLE todos (
    id VARCHAR (255) PRIMARY KEY,
    user_email VARCHAR (255),
    title VARCHAR (30),
    progres INT,
    date VARCHAR (300)
);

CREATE TABLE users (
    email VARCHAR (255) PRIMARY KEY,
    hashed_password VARCHAR (22)
);

INSERT INTO todos (id, user_email, title, progres, date)
VALUES ('0', 'jdbm69@gmail.com', 'go to beach', 5, 'monday');