ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX ON categories(parent_id);
