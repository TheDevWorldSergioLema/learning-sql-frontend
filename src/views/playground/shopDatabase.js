export const SHOP_TABLES = ['bricks', 'orders']

export const SHOP_SEED = `
CREATE TABLE bricks (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  studs INTEGER,
  price REAL,
  stock INTEGER,
  added_on DATE
);

INSERT INTO bricks VALUES
  (1, 'Classic 2x4', 'red', 8, 0.25, 120, '2024-01-15'),
  (2, 'Classic 2x2', 'blue', 4, 0.15, 80, '2024-02-03'),
  (3, 'Plate 1x6', 'yellow', 6, 0.20, 0, '2024-03-10'),
  (4, 'Slope 2x3', 'red', 6, 0.30, 45, '2024-03-22'),
  (5, 'Classic 1x1', 'white', 1, 0.05, 300, '2023-11-30'),
  (6, 'Tile 2x2', 'green', 4, 0.18, 12, '2024-05-05'),
  (7, 'Classic 2x6', 'black', 12, 0.40, 0, '2023-12-18'),
  (8, 'Round 1x1', 'yellow', 1, 0.08, 150, '2024-06-01'),
  (9, 'Plate 2x8', 'blue', 16, 0.45, 30, '2024-07-14'),
  (10, 'Arch 1x4', 'white', 4, 0.35, 8, '2024-08-09');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  brick_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  ordered_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

INSERT INTO orders VALUES
  (1, 'Ana', 1, 50, '2024-09-02', 'shipped'),
  (2, 'Ben', 4, 10, '2024-09-15', 'shipped'),
  (3, 'Chloe', 2, 25, '2024-10-01', 'pending'),
  (4, 'Ana', 9, 5, '2024-10-03', 'pending'),
  (5, 'David', 5, 100, '2024-10-20', 'cancelled'),
  (6, 'Emma', 8, 40, '2024-11-02', 'pending'),
  (7, 'Ben', 6, 12, '2024-11-05', 'shipped'),
  (8, 'Farid', 1, 30, '2024-11-11', 'pending');
`
