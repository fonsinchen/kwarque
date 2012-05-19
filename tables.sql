CREATE TABLE account(
    id SERIAL PRIMARY KEY,
    nick VARCHAR(63) UNIQUE NOT NULL,
    password VARCHAR(63) NOT NULL
);

CREATE TABLE fragment (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    title VARCHAR(63),
    text TEXT,
    time TIMESTAMP NOT NULL,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP(0) NOT NULL,
    owner VARCHAR(63) REFERENCES account (nick)
);
    