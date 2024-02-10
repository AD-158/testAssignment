CREATE DATABASE test_assignment
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Russian_Russia.1251'
    LC_CTYPE = 'Russian_Russia.1251'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE IF NOT EXISTS public.t_employees
(
    t_employees_id integer NOT NULL DEFAULT nextval('t_employees_t_employees_id_seq'::regclass),
    t_employees_last_name character varying(75) COLLATE pg_catalog."default" NOT NULL,
    t_employees_first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    t_employees_patronymic character varying(75) COLLATE pg_catalog."default",
    t_employees_birth_date date NOT NULL,
    t_employees_position integer NOT NULL,
    t_employees_residential_address character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT t_employees_pkey PRIMARY KEY (t_employees_id),
    CONSTRAINT t_employees_t_employees_position_fkey FOREIGN KEY (t_employees_position)
        REFERENCES public.t_position (t_position_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.t_position
(
    t_position_id integer NOT NULL DEFAULT nextval('t_position_t_position_id_seq'::regclass),
    t_position_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT t_position_pkey PRIMARY KEY (t_position_id)
);

CREATE OR REPLACE FUNCTION public.afunc_get_positions_json() RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	RETURN (SELECT json_agg(a) FROM (
	                                SELECT
	                                    "t_position_id",
	                                    "t_position_name"
	                                FROM
	                                    public."t_position"
	                                ORDER BY
	                                    "t_position_id"
	                                )
	    a);
END
$BODY$;
COMMENT ON FUNCTION public.afunc_get_positions_json() IS 'Получение справочника должностей в формате JSON';

CREATE OR REPLACE FUNCTION public.afunc_create_position_json(a_record json) RETURNS smallint
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    INSERT INTO "t_position" ("t_position_name")
    VALUES ((a_record->>'t_position_name')::varchar);
    RETURN 201;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$BODY$;
COMMENT ON FUNCTION public.afunc_create_position_json(json) IS 'Добавление должности';

CREATE OR REPLACE FUNCTION public.afunc_update_position_json(a_record json) RETURNS smallint
    LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    UPDATE "t_position" AS t_p
    SET
		"t_position_name" = (a_record->>'t_position_name')::varchar
    WHERE
		(t_p."t_position_id" = (a_record->>'t_position_id')::integer);
    RETURN 200;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$BODY$;
COMMENT ON FUNCTION public.afunc_update_position_json(json) IS 'Обновление данных должности';

CREATE OR REPLACE FUNCTION public.afunc_delete_position_json(a_position_id integer) RETURNS SMALLINT
    LANGUAGE plpgsql
    AS $$
DECLARE
    b_position_id integer;
    b_position_name varchar;
BEGIN
    SELECT
		t_p."t_position_id",
		t_p."t_position_name"
	INTO
		b_position_id,
		b_position_name
    FROM
		"t_position" AS t_p
    WHERE
		t_p."t_position_id" = a_position_id AND t_p."t_position_name" NOT LIKE '%УДАЛЕН%';

    IF FOUND THEN

        INSERT INTO "t_position" ("t_position_id", "t_position_name")
        SELECT CONCAT(SUBSTRING(CURRENT_DATE::varchar, 1,4), SUBSTRING(CURRENT_DATE::varchar, 6,2), b_position_id)::integer,
               CONCAT('(УДАЛЕН) ', b_position_name);

        UPDATE
			"t_employees"
        SET
			"t_employees_position" = CONCAT(SUBSTRING(CURRENT_DATE::varchar, 1,4), SUBSTRING(CURRENT_DATE::varchar, 6,2), b_position_id)::integer
        WHERE
			"t_employees_position" = a_position_id;

        DELETE FROM "t_position" WHERE "t_position_id" = a_position_id;

        RETURN 204;
    ELSE
        RETURN 500;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$$;
COMMENT ON FUNCTION public.afunc_delete_position_json(a_position_id integer) IS 'Удаление должности';
