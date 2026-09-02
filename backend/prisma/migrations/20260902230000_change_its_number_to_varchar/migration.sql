ALTER TABLE "Student"
ALTER COLUMN "itsNumber"
TYPE VARCHAR(10)
USING "itsNumber"::text;