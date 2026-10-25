-- Synthetic relational mechanism probe. Run only in a disposable PostgreSQL database.
-- All objects and rows are rolled back. This is not an application migration.
\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA curve_roadmap_relationship_probe;
SET LOCAL search_path = curve_roadmap_relationship_probe, public;
CREATE TABLE product (
  workspace_id uuid NOT NULL, id uuid PRIMARY KEY,
  UNIQUE (workspace_id, id)
);
CREATE TABLE roadmap (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, id uuid PRIMARY KEY,
  UNIQUE (workspace_id, product_id, id),
  FOREIGN KEY (workspace_id, product_id) REFERENCES product (workspace_id, id)
);
CREATE TABLE milestone (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, roadmap_id uuid NOT NULL, id uuid PRIMARY KEY,
  position bigint NOT NULL CHECK (position >= 0),
  UNIQUE (workspace_id, roadmap_id, position) DEFERRABLE INITIALLY DEFERRED,
  UNIQUE (workspace_id, product_id, roadmap_id, id),
  FOREIGN KEY (workspace_id, product_id, roadmap_id) REFERENCES roadmap (workspace_id, product_id, id)
);
CREATE TABLE feature (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, id uuid PRIMARY KEY,
  UNIQUE (workspace_id, product_id, id),
  FOREIGN KEY (workspace_id, product_id) REFERENCES product (workspace_id, id)
);
CREATE TABLE initiative (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, id uuid PRIMARY KEY,
  mode text NOT NULL, roadmap_item_id uuid,
  CHECK ((mode = 'STANDALONE' AND roadmap_item_id IS NULL) OR (mode = 'ROADMAP' AND roadmap_item_id IS NOT NULL)),
  UNIQUE (workspace_id, product_id, id, roadmap_item_id),
  FOREIGN KEY (workspace_id, product_id) REFERENCES product (workspace_id, id)
);
CREATE TABLE item (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, roadmap_id uuid NOT NULL,
  milestone_id uuid NOT NULL, feature_id uuid NOT NULL, defining_initiative_id uuid NOT NULL,
  id uuid PRIMARY KEY,
  UNIQUE (workspace_id, product_id, id),
  UNIQUE (workspace_id, product_id, defining_initiative_id, id),
  UNIQUE (workspace_id, defining_initiative_id),
  UNIQUE (workspace_id, milestone_id, feature_id),
  FOREIGN KEY (workspace_id, product_id, roadmap_id, milestone_id)
    REFERENCES milestone (workspace_id, product_id, roadmap_id, id),
  FOREIGN KEY (workspace_id, product_id, feature_id) REFERENCES feature (workspace_id, product_id, id),
  FOREIGN KEY (workspace_id, product_id, defining_initiative_id, id)
    REFERENCES initiative (workspace_id, product_id, id, roadmap_item_id)
    DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE initiative ADD CONSTRAINT reciprocal_item
  FOREIGN KEY (workspace_id, product_id, id, roadmap_item_id)
  REFERENCES item (workspace_id, product_id, defining_initiative_id, id)
  DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE item_history (
  workspace_id uuid NOT NULL, product_id uuid NOT NULL, item_id uuid NOT NULL,
  sequence bigint NOT NULL CHECK (sequence > 0), payload jsonb NOT NULL,
  UNIQUE (workspace_id, item_id, sequence),
  FOREIGN KEY (workspace_id, product_id, item_id) REFERENCES item (workspace_id, product_id, id)
);
CREATE FUNCTION history_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'HISTORY_IMMUTABLE'; END;
$$;
CREATE TRIGGER history_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON item_history
  FOR EACH STATEMENT EXECUTE FUNCTION history_immutable();

CREATE FUNCTION synthetic_id(n integer) RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT ('95000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid;
$$;
INSERT INTO product VALUES (synthetic_id(1), synthetic_id(2));
INSERT INTO roadmap VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3)),
  (synthetic_id(1), synthetic_id(2), synthetic_id(4));
INSERT INTO milestone VALUES
  (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(5), 0),
  (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(6), 1),
  (synthetic_id(1), synthetic_id(2), synthetic_id(4), synthetic_id(7), 0);
INSERT INTO feature VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(8)),
  (synthetic_id(1), synthetic_id(2), synthetic_id(9));

DO $$
DECLARE passed integer := 0; statement text;
BEGIN
  -- Both valid insertion orders must survive deferred validation.
  INSERT INTO initiative VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(10), 'ROADMAP', synthetic_id(11));
  INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(5), synthetic_id(8), synthetic_id(10), synthetic_id(11));
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  passed := passed + 1;
  INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(5), synthetic_id(9), synthetic_id(12), synthetic_id(13));
  INSERT INTO initiative VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(12), 'ROADMAP', synthetic_id(13));
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  passed := passed + 1;
  INSERT INTO initiative VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(14), 'STANDALONE', NULL);
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  passed := passed + 1;

  UPDATE milestone SET position = CASE position WHEN 0 THEN 1 ELSE 0 END WHERE roadmap_id = synthetic_id(3);
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  passed := passed + 1;
  BEGIN
    UPDATE milestone SET position = 0 WHERE roadmap_id = synthetic_id(3);
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Duplicate final ordering unexpectedly accepted';
  EXCEPTION WHEN unique_violation THEN passed := passed + 1; END;

  BEGIN
    INSERT INTO initiative VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(20), 'ROADMAP', synthetic_id(21));
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Half Initiative unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(6), synthetic_id(8), synthetic_id(22), synthetic_id(23));
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Half Item unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    INSERT INTO initiative VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(24), 'ROADMAP', synthetic_id(25));
    INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(6), synthetic_id(8), synthetic_id(24), synthetic_id(26));
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Mismatched pair unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(5), synthetic_id(8), synthetic_id(27), synthetic_id(28));
    RAISE EXCEPTION 'Duplicate Feature placement unexpectedly accepted';
  EXCEPTION WHEN unique_violation THEN passed := passed + 1; END;
  BEGIN
    INSERT INTO item VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(3), synthetic_id(6), synthetic_id(8), synthetic_id(10), synthetic_id(29));
    RAISE EXCEPTION 'Duplicate defining Initiative unexpectedly accepted';
  EXCEPTION WHEN unique_violation THEN passed := passed + 1; END;
  BEGIN
    UPDATE item SET workspace_id = synthetic_id(90) WHERE id = synthetic_id(11);
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Cross-workspace link unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    UPDATE item SET product_id = synthetic_id(90) WHERE id = synthetic_id(11);
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Cross-Product link unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    UPDATE item SET milestone_id = synthetic_id(7) WHERE id = synthetic_id(11);
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Other-Roadmap Milestone unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    DELETE FROM initiative WHERE id = synthetic_id(10);
    SET CONSTRAINTS ALL IMMEDIATE;
    RAISE EXCEPTION 'Linked Initiative deletion unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  BEGIN
    DELETE FROM product WHERE id = synthetic_id(2);
    RAISE EXCEPTION 'Product cascading deletion unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;

  UPDATE item SET milestone_id = synthetic_id(6) WHERE id = synthetic_id(11);
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  passed := passed + 1;
  INSERT INTO item_history VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(11), 1, '{"example":"retained"}');
  BEGIN
    INSERT INTO item_history VALUES (synthetic_id(1), synthetic_id(2), synthetic_id(11), 1, '{}');
    RAISE EXCEPTION 'Duplicate history sequence unexpectedly accepted';
  EXCEPTION WHEN unique_violation THEN passed := passed + 1; END;
  BEGIN
    INSERT INTO item_history VALUES (synthetic_id(90), synthetic_id(2), synthetic_id(11), 2, '{}');
    RAISE EXCEPTION 'Foreign history scope unexpectedly accepted';
  EXCEPTION WHEN foreign_key_violation THEN passed := passed + 1; END;
  FOREACH statement IN ARRAY ARRAY[
    'UPDATE item_history SET payload = ''{}''',
    'DELETE FROM item_history',
    'TRUNCATE item_history'
  ] LOOP
    BEGIN
      EXECUTE statement;
      RAISE EXCEPTION 'History modification unexpectedly accepted';
    EXCEPTION WHEN raise_exception THEN
      IF SQLERRM <> 'HISTORY_IMMUTABLE' THEN RAISE; END IF;
      passed := passed + 1;
    END;
  END LOOP;
  IF passed <> 21 THEN RAISE EXCEPTION 'Expected 21 checks, got %', passed; END IF;
  IF (SELECT count(*) FROM initiative) <> 3 OR (SELECT count(*) FROM item) <> 2
    OR (SELECT count(*) FROM item_history) <> 1 THEN
    RAISE EXCEPTION 'Rejected operations changed retained rows';
  END IF;
  RAISE NOTICE '21 relational mechanism checks passed; retained rows verified';
END;
$$;
ROLLBACK;
SELECT NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'curve_roadmap_relationship_probe') AS probe_objects_rolled_back;
