CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(128) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL UNIQUE,
  is_verified TINYINT(1) DEFAULT 0,
  email_notification TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT NOW(),
  user_id INT NOT NULL,
  image VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  comment VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY user_post_unique (user_id, post_id)
);


-- Insert the default user -- pass:Asd123
INSERT INTO users (email, username, password, verification_token, is_verified)
VALUES ('scienitive77@gmail.com', 'Scienitive', '$2y$10$bWalLkPJOSlmHgYZxzL.guH3hrg0LRVRvUokm3rF9i2ubSz6RLBdS', 'verification_token_here', 1);

-- Some premade posts
INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 12:34:56', 1, 'https://static.wikia.nocookie.net/the-rick-hernia-omniverse/images/7/7e/MOhammad.png');

INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 13:11:12', 1, 'https://store.donanimhaber.com/73/d4/06/73d406f9b732575d70b83cab86577403.png');

INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 13:11:12', 1, 'https://cdn.discordapp.com/attachments/588224082789662720/1077706545237872701/02d50539-7694-4790-b8ca-fd57be63edc0.jpg');

INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 13:11:12', 1, 'https://cdn.discordapp.com/attachments/588224082789662720/1071590375661240380/image.png');

INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 13:11:12', 1, 'https://cdn.discordapp.com/attachments/588224082789662720/1091453249183301802/image.png');

INSERT INTO posts (created_at, user_id, image)
VALUES ('2023-07-22 13:11:12', 1, 'https://cdn.discordapp.com/attachments/588224082789662720/1082394143285850152/FqfljNDWcAEqWCW.png');

INSERT INTO posts (user_id, image)
VALUES (1, 'https://cdn.discordapp.com/attachments/588224082789662720/1082116946641829928/150794_306757352735748_1124051446_n.png');