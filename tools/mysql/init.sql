CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(128) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL UNIQUE,
  is_verified TINYINT(1) DEFAULT 0
);

-- Insert the default user -- pass:Asd123
INSERT INTO users (email, username, password, verification_token, is_verified)
VALUES ('scienitive77@gmail.com', 'Scienitive', '$2y$10$bWalLkPJOSlmHgYZxzL.guH3hrg0LRVRvUokm3rF9i2ubSz6RLBdS', 'verification_token_here', 1);