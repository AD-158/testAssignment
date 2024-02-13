--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

-- Started on 2024-02-12 00:49:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4931 (class 1262 OID 25081)
-- Name: test_assignment; Type: DATABASE; Schema: -; Owner: postgres
--
\connect "test_assignment"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- TOC entry 242 (class 1255 OID 25893)
-- Name: afunc_create_employee_json("json"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_create_employee_json"("a_record" "json") RETURNS smallint
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO "t_employees" ("t_employees_last_name", "t_employees_first_name", "t_employees_patronymic", 
							   "t_employees_birth_date", "t_employees_position", "t_employees_residential_address")
    VALUES ((a_record->>'t_employees_last_name')::varchar, (a_record->>'t_employees_first_name')::varchar,
			 (a_record->>'t_employees_patronymic')::varchar, (a_record->>'t_employees_birth_date')::date,
			 (a_record->>'t_employees_position')::integer, (a_record->>'t_employees_residential_address')::varchar		   
		   );
    RETURN 201;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$$;


ALTER FUNCTION "public"."afunc_create_employee_json"("a_record" "json") OWNER TO "postgres";

--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 242
-- Name: FUNCTION "afunc_create_employee_json"("a_record" "json"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_create_employee_json"("a_record" "json") IS 'Добавление сотрудника';


--
-- TOC entry 239 (class 1255 OID 25115)
-- Name: afunc_create_position_json("json"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_create_position_json"("a_record" "json") RETURNS smallint
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO "t_position" ("t_position_name")
    VALUES ((a_record->>'t_position_name')::varchar);
    RETURN 201;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$$;


ALTER FUNCTION "public"."afunc_create_position_json"("a_record" "json") OWNER TO "postgres";

--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 239
-- Name: FUNCTION "afunc_create_position_json"("a_record" "json"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_create_position_json"("a_record" "json") IS 'Добавление должности';


--
-- TOC entry 255 (class 1255 OID 25895)
-- Name: afunc_delete_employee_json(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_delete_employee_json"("a_employee_id" integer) RETURNS smallint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    b_employee_last_name varchar;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "t_employees" AS t_e
        WHERE t_e."t_employees_id" = a_employee_id AND t_e."t_employees_last_name" NOT ILIKE '%(УДАЛЕН)%'
    ) THEN
        SELECT t_e."t_employees_last_name" INTO b_employee_last_name
        FROM "t_employees" AS t_e
        WHERE t_e."t_employees_id" = a_employee_id;

        UPDATE "t_employees"
        SET "t_employees_last_name" = CONCAT('(УДАЛЕН) ', b_employee_last_name)
        WHERE "t_employees_id" = a_employee_id;

        RETURN 204;
    ELSE
        RETURN 500;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$$;


ALTER FUNCTION "public"."afunc_delete_employee_json"("a_employee_id" integer) OWNER TO "postgres";

--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 255
-- Name: FUNCTION "afunc_delete_employee_json"("a_employee_id" integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_delete_employee_json"("a_employee_id" integer) IS 'Удаление сотрудника';


--
-- TOC entry 256 (class 1255 OID 25118)
-- Name: afunc_delete_position_json(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_delete_position_json"("a_position_id" integer) RETURNS smallint
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."afunc_delete_position_json"("a_position_id" integer) OWNER TO "postgres";

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 256
-- Name: FUNCTION "afunc_delete_position_json"("a_position_id" integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_delete_position_json"("a_position_id" integer) IS 'Удаление должности';


--
-- TOC entry 240 (class 1255 OID 25109)
-- Name: afunc_get_employees_json(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_get_employees_json"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
	RETURN (SELECT json_agg(a) FROM (
        SELECT
            "t_employees_id",
			"t_employees_last_name",
			"t_employees_first_name",
			"t_employees_patronymic",
			"t_employees_birth_date",
			"t_employees_position",
			"t_position_name",
			"t_employees_residential_address"
        FROM public."t_employees"
		LEFT JOIN public."t_position"
		ON public."t_employees"."t_employees_position" = public."t_position"."t_position_id"
        ORDER BY "t_employees_id"
	) a);
END
$$;


ALTER FUNCTION "public"."afunc_get_employees_json"() OWNER TO "postgres";

--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 240
-- Name: FUNCTION "afunc_get_employees_json"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_get_employees_json"() IS 'Получение списка сотрудников в формате JSON';


--
-- TOC entry 238 (class 1255 OID 25108)
-- Name: afunc_get_positions_json(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_get_positions_json"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
	RETURN (SELECT json_agg(a) FROM (
        SELECT
            "t_position_id",
            "t_position_name"
        FROM public."t_position"
        ORDER BY "t_position_id"
	) a);
END
$$;


ALTER FUNCTION "public"."afunc_get_positions_json"() OWNER TO "postgres";

--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 238
-- Name: FUNCTION "afunc_get_positions_json"(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_get_positions_json"() IS 'Получение справочника должностей в формате JSON';


--
-- TOC entry 247 (class 1255 OID 25894)
-- Name: afunc_update_employee_json("json"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_update_employee_json"("a_record" "json") RETURNS smallint
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE "t_employees" AS t_e
    SET
		"t_employees_last_name" = (a_record->>'t_employees_last_name')::varchar,
		"t_employees_first_name" = (a_record->>'t_employees_first_name')::varchar,
		"t_employees_patronymic" = (a_record->>'t_employees_patronymic')::varchar,
		"t_employees_birth_date" = (a_record->>'t_employees_birth_date')::date,
		"t_employees_position" = (a_record->>'t_employees_position')::integer,
		"t_employees_residential_address" = (a_record->>'t_employees_residential_address')::varchar
    WHERE
		(t_e."t_employees_id" = (a_record->>'t_employees_id')::integer);
    RETURN 200;
EXCEPTION WHEN OTHERS THEN
    RETURN 500;
END
$$;


ALTER FUNCTION "public"."afunc_update_employee_json"("a_record" "json") OWNER TO "postgres";

--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 247
-- Name: FUNCTION "afunc_update_employee_json"("a_record" "json"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_update_employee_json"("a_record" "json") IS 'Обновление данных сотрудника';


--
-- TOC entry 241 (class 1255 OID 25116)
-- Name: afunc_update_position_json("json"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."afunc_update_position_json"("a_record" "json") RETURNS smallint
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."afunc_update_position_json"("a_record" "json") OWNER TO "postgres";

--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 241
-- Name: FUNCTION "afunc_update_position_json"("a_record" "json"); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."afunc_update_position_json"("a_record" "json") IS 'Обновление данных должности';


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- TOC entry 226 (class 1259 OID 33296)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_group" (
    "id" integer NOT NULL,
    "name" character varying(150) NOT NULL
);


ALTER TABLE "public"."auth_group" OWNER TO "postgres";

--
-- TOC entry 225 (class 1259 OID 33295)
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_group" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_group_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 33304)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_group_permissions" (
    "id" bigint NOT NULL,
    "group_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);


ALTER TABLE "public"."auth_group_permissions" OWNER TO "postgres";

--
-- TOC entry 227 (class 1259 OID 33303)
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_group_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_group_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 33290)
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_permission" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "content_type_id" integer NOT NULL,
    "codename" character varying(100) NOT NULL
);


ALTER TABLE "public"."auth_permission" OWNER TO "postgres";

--
-- TOC entry 223 (class 1259 OID 33289)
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_permission" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_permission_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 33310)
-- Name: auth_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_user" (
    "id" integer NOT NULL,
    "password" character varying(128) NOT NULL,
    "last_login" timestamp with time zone,
    "is_superuser" boolean NOT NULL,
    "username" character varying(150) NOT NULL,
    "first_name" character varying(150) NOT NULL,
    "last_name" character varying(150) NOT NULL,
    "email" character varying(254) NOT NULL,
    "is_staff" boolean NOT NULL,
    "is_active" boolean NOT NULL,
    "date_joined" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."auth_user" OWNER TO "postgres";

--
-- TOC entry 232 (class 1259 OID 33318)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_user_groups" (
    "id" bigint NOT NULL,
    "user_id" integer NOT NULL,
    "group_id" integer NOT NULL
);


ALTER TABLE "public"."auth_user_groups" OWNER TO "postgres";

--
-- TOC entry 231 (class 1259 OID 33317)
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_user_groups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_user_groups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 33309)
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_user" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 33324)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."auth_user_user_permissions" (
    "id" bigint NOT NULL,
    "user_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);


ALTER TABLE "public"."auth_user_user_permissions" OWNER TO "postgres";

--
-- TOC entry 233 (class 1259 OID 33323)
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."auth_user_user_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_user_user_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 33382)
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."django_admin_log" (
    "id" integer NOT NULL,
    "action_time" timestamp with time zone NOT NULL,
    "object_id" "text",
    "object_repr" character varying(200) NOT NULL,
    "action_flag" smallint NOT NULL,
    "change_message" "text" NOT NULL,
    "content_type_id" integer,
    "user_id" integer NOT NULL,
    CONSTRAINT "django_admin_log_action_flag_check" CHECK (("action_flag" >= 0))
);


ALTER TABLE "public"."django_admin_log" OWNER TO "postgres";

--
-- TOC entry 235 (class 1259 OID 33381)
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."django_admin_log" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."django_admin_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 33282)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."django_content_type" (
    "id" integer NOT NULL,
    "app_label" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL
);


ALTER TABLE "public"."django_content_type" OWNER TO "postgres";

--
-- TOC entry 221 (class 1259 OID 33281)
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."django_content_type" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."django_content_type_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 33274)
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."django_migrations" (
    "id" bigint NOT NULL,
    "app" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "applied" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."django_migrations" OWNER TO "postgres";

--
-- TOC entry 219 (class 1259 OID 33273)
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."django_migrations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."django_migrations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 33410)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."django_session" (
    "session_key" character varying(40) NOT NULL,
    "session_data" "text" NOT NULL,
    "expire_date" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."django_session" OWNER TO "postgres";

--
-- TOC entry 216 (class 1259 OID 25088)
-- Name: t_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."t_employees" (
    "t_employees_id" integer NOT NULL,
    "t_employees_last_name" character varying(75) NOT NULL,
    "t_employees_birth_date" "date" NOT NULL,
    "t_employees_position" integer NOT NULL,
    "t_employees_residential_address" character varying(255) NOT NULL,
    "t_employees_first_name" character varying(50) NOT NULL,
    "t_employees_patronymic" character varying(75)
);


ALTER TABLE "public"."t_employees" OWNER TO "postgres";

--
-- TOC entry 215 (class 1259 OID 25087)
-- Name: t_employees_t_employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."t_employees_t_employees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_employees_t_employees_id_seq" OWNER TO "postgres";

--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 215
-- Name: t_employees_t_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."t_employees_t_employees_id_seq" OWNED BY "public"."t_employees"."t_employees_id";


--
-- TOC entry 218 (class 1259 OID 25097)
-- Name: t_position; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."t_position" (
    "t_position_id" integer NOT NULL,
    "t_position_name" character varying(255) NOT NULL
);


ALTER TABLE "public"."t_position" OWNER TO "postgres";

--
-- TOC entry 217 (class 1259 OID 25096)
-- Name: t_position_t_position_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."t_position_t_position_id_seq"
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_position_t_position_id_seq" OWNER TO "postgres";

--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 217
-- Name: t_position_t_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."t_position_t_position_id_seq" OWNED BY "public"."t_position"."t_position_id";


--
-- TOC entry 4696 (class 2604 OID 25091)
-- Name: t_employees t_employees_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."t_employees" ALTER COLUMN "t_employees_id" SET DEFAULT "nextval"('"public"."t_employees_t_employees_id_seq"'::"regclass");


--
-- TOC entry 4697 (class 2604 OID 25854)
-- Name: t_position t_position_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."t_position" ALTER COLUMN "t_position_id" SET DEFAULT "nextval"('"public"."t_position_t_position_id_seq"'::"regclass");


--
-- TOC entry 4914 (class 0 OID 33296)
-- Dependencies: 226
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4916 (class 0 OID 33304)
-- Dependencies: 228
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4912 (class 0 OID 33290)
-- Dependencies: 224
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (13, 'Can add user', 4, 'add_user');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (14, 'Can change user', 4, 'change_user');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (15, 'Can delete user', 4, 'delete_user');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (16, 'Can view user', 4, 'view_user');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (17, 'Can add content type', 5, 'add_contenttype');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (18, 'Can change content type', 5, 'change_contenttype');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (19, 'Can delete content type', 5, 'delete_contenttype');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (20, 'Can view content type', 5, 'view_contenttype');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (21, 'Can add session', 6, 'add_session');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (22, 'Can change session', 6, 'change_session');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (23, 'Can delete session', 6, 'delete_session');
INSERT INTO "public"."auth_permission" ("id", "name", "content_type_id", "codename") VALUES (24, 'Can view session', 6, 'view_session');


--
-- TOC entry 4918 (class 0 OID 33310)
-- Dependencies: 230
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."auth_user" ("id", "password", "last_login", "is_superuser", "username", "first_name", "last_name", "email", "is_staff", "is_active", "date_joined") VALUES (1, 'pbkdf2_sha256$720000$kH20qq68BVGTxSQIbiaR3v$sAM5a+dc+b8YNlSE28bOiG8oJ23BKLkp1obJTn7hjyA=', NULL, true, 'admin', '', '', '', true, true, '2024-02-12 00:36:03.144544+03');


--
-- TOC entry 4920 (class 0 OID 33318)
-- Dependencies: 232
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4922 (class 0 OID 33324)
-- Dependencies: 234
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4924 (class 0 OID 33382)
-- Dependencies: 236
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4910 (class 0 OID 33282)
-- Dependencies: 222
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (1, 'admin', 'logentry');
INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (2, 'auth', 'permission');
INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (3, 'auth', 'group');
INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (4, 'auth', 'user');
INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (5, 'contenttypes', 'contenttype');
INSERT INTO "public"."django_content_type" ("id", "app_label", "model") VALUES (6, 'sessions', 'session');


--
-- TOC entry 4908 (class 0 OID 33274)
-- Dependencies: 220
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (1, 'contenttypes', '0001_initial', '2024-02-12 00:35:36.414955+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (2, 'auth', '0001_initial', '2024-02-12 00:35:36.587492+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (3, 'admin', '0001_initial', '2024-02-12 00:35:36.606771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (4, 'admin', '0002_logentry_remove_auto_add', '2024-02-12 00:35:36.611772+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (5, 'admin', '0003_logentry_add_action_flag_choices', '2024-02-12 00:35:36.616771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (6, 'contenttypes', '0002_remove_content_type_name', '2024-02-12 00:35:36.629771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (7, 'auth', '0002_alter_permission_name_max_length', '2024-02-12 00:35:36.634771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (8, 'auth', '0003_alter_user_email_max_length', '2024-02-12 00:35:36.639771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (9, 'auth', '0004_alter_user_username_opts', '2024-02-12 00:35:36.644771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (10, 'auth', '0005_alter_user_last_login_null', '2024-02-12 00:35:36.64977+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (11, 'auth', '0006_require_contenttypes_0002', '2024-02-12 00:35:36.650772+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (12, 'auth', '0007_alter_validators_add_error_messages', '2024-02-12 00:35:36.655771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (13, 'auth', '0008_alter_user_username_max_length', '2024-02-12 00:35:36.666771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (14, 'auth', '0009_alter_user_last_name_max_length', '2024-02-12 00:35:36.671771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (15, 'auth', '0010_alter_group_name_max_length', '2024-02-12 00:35:36.677772+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (16, 'auth', '0011_update_proxy_permissions', '2024-02-12 00:35:36.682771+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (17, 'auth', '0012_alter_user_first_name_max_length', '2024-02-12 00:35:36.68877+03');
INSERT INTO "public"."django_migrations" ("id", "app", "name", "applied") VALUES (18, 'sessions', '0001_initial', '2024-02-12 00:35:36.697772+03');


--
-- TOC entry 4925 (class 0 OID 33410)
-- Dependencies: 237
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4904 (class 0 OID 25088)
-- Dependencies: 216
-- Data for Name: t_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (1, 'Денисов', '2001-09-07', 2, 'Российская Федерация, Нижегородская область, город Саров, улица Маяковского, дом 3, блок 205, комната 1', 'Алексей', 'Дмитриевич');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (2, 'Иванов', '1970-01-01', 1, 'Страна страна, область область, город город, улица улица, дом дом, квартира квартира', 'Иван', 'Иванович');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (3, 'Петров', '2020-01-01', 3, 'Страна страна, область область, город город, улица улица, дом дом, квартира квартира', 'Петр', NULL);
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (4, 'Денисов', '2001-09-07', 1, '1', 'Алексей', 'Дмитриевич');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (6, 'Денисов', '2001-09-07', 1, 'Тест', 'Алексей', 'Дмитриевич');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (7, 'Тестовый', '2001-09-07', 3, 'Тестовый', 'Тест', '');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (5, 'Тестов', '2001-09-07', 3, 'Тестовый', 'Тест', '');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (8, '(УДАЛЕН) Тестов', '2001-09-07', 3, '3', 'тестовый', '');
INSERT INTO "public"."t_employees" ("t_employees_id", "t_employees_last_name", "t_employees_birth_date", "t_employees_position", "t_employees_residential_address", "t_employees_first_name", "t_employees_patronymic") VALUES (9, 'ТестФинал', '2001-09-07', 16, 'Финал', 'Тест', '');


--
-- TOC entry 4906 (class 0 OID 25097)
-- Dependencies: 218
-- Data for Name: t_position; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (1, 'Инженер-программист');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (2, 'Инженер');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (3, 'Водитель');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (2024024, '(УДАЛЕН) тест1');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (5, 'тест2');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (6, 'тест3');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (7, 'тест4');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (8, '111');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (9, '111');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (10, '222');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (11, '333');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (12, '4444');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (13, 'тест5');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (14, 'тест5');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (15, 'тест6');
INSERT INTO "public"."t_position" ("t_position_id", "t_position_name") VALUES (16, 'Тест7');


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 225
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_group_id_seq"', 1, false);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 227
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_group_permissions_id_seq"', 1, false);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 223
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_permission_id_seq"', 24, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 231
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_user_groups_id_seq"', 1, false);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 229
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_user_id_seq"', 1, true);


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 233
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."auth_user_user_permissions_id_seq"', 1, false);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 235
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."django_admin_log_id_seq"', 1, false);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 221
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."django_content_type_id_seq"', 6, true);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 219
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."django_migrations_id_seq"', 18, true);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 215
-- Name: t_employees_t_employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."t_employees_t_employees_id_seq"', 9, true);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 217
-- Name: t_position_t_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."t_position_t_position_id_seq"', 16, true);


--
-- TOC entry 4716 (class 2606 OID 33408)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group"
    ADD CONSTRAINT "auth_group_name_key" UNIQUE ("name");


--
-- TOC entry 4721 (class 2606 OID 33339)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group_permissions"
    ADD CONSTRAINT "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" UNIQUE ("group_id", "permission_id");


--
-- TOC entry 4724 (class 2606 OID 33308)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group_permissions"
    ADD CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4718 (class 2606 OID 33300)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group"
    ADD CONSTRAINT "auth_group_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4711 (class 2606 OID 33330)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_permission"
    ADD CONSTRAINT "auth_permission_content_type_id_codename_01ab375a_uniq" UNIQUE ("content_type_id", "codename");


--
-- TOC entry 4713 (class 2606 OID 33294)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_permission"
    ADD CONSTRAINT "auth_permission_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4732 (class 2606 OID 33322)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_groups"
    ADD CONSTRAINT "auth_user_groups_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4735 (class 2606 OID 33354)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_groups"
    ADD CONSTRAINT "auth_user_groups_user_id_group_id_94350c0c_uniq" UNIQUE ("user_id", "group_id");


--
-- TOC entry 4726 (class 2606 OID 33314)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user"
    ADD CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4738 (class 2606 OID 33328)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_user_permissions"
    ADD CONSTRAINT "auth_user_user_permissions_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4741 (class 2606 OID 33368)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_user_permissions"
    ADD CONSTRAINT "auth_user_user_permissions_user_id_permission_id_14a6b632_uniq" UNIQUE ("user_id", "permission_id");


--
-- TOC entry 4729 (class 2606 OID 33403)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user"
    ADD CONSTRAINT "auth_user_username_key" UNIQUE ("username");


--
-- TOC entry 4744 (class 2606 OID 33389)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_admin_log"
    ADD CONSTRAINT "django_admin_log_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4706 (class 2606 OID 33288)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_content_type"
    ADD CONSTRAINT "django_content_type_app_label_model_76bd3d3b_uniq" UNIQUE ("app_label", "model");


--
-- TOC entry 4708 (class 2606 OID 33286)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_content_type"
    ADD CONSTRAINT "django_content_type_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4704 (class 2606 OID 33280)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_migrations"
    ADD CONSTRAINT "django_migrations_pkey" PRIMARY KEY ("id");


--
-- TOC entry 4748 (class 2606 OID 33416)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_session"
    ADD CONSTRAINT "django_session_pkey" PRIMARY KEY ("session_key");


--
-- TOC entry 4700 (class 2606 OID 25095)
-- Name: t_employees t_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."t_employees"
    ADD CONSTRAINT "t_employees_pkey" PRIMARY KEY ("t_employees_id");


--
-- TOC entry 4702 (class 2606 OID 25856)
-- Name: t_position t_position_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."t_position"
    ADD CONSTRAINT "t_position_pkey" PRIMARY KEY ("t_position_id");


--
-- TOC entry 4714 (class 1259 OID 33409)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_group_name_a6ea08ec_like" ON "public"."auth_group" USING "btree" ("name" "varchar_pattern_ops");


--
-- TOC entry 4719 (class 1259 OID 33350)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "public"."auth_group_permissions" USING "btree" ("group_id");


--
-- TOC entry 4722 (class 1259 OID 33351)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "public"."auth_group_permissions" USING "btree" ("permission_id");


--
-- TOC entry 4709 (class 1259 OID 33336)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "public"."auth_permission" USING "btree" ("content_type_id");


--
-- TOC entry 4730 (class 1259 OID 33366)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_user_groups_group_id_97559544" ON "public"."auth_user_groups" USING "btree" ("group_id");


--
-- TOC entry 4733 (class 1259 OID 33365)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_user_groups_user_id_6a12ed8b" ON "public"."auth_user_groups" USING "btree" ("user_id");


--
-- TOC entry 4736 (class 1259 OID 33380)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_user_user_permissions_permission_id_1fbb5f2c" ON "public"."auth_user_user_permissions" USING "btree" ("permission_id");


--
-- TOC entry 4739 (class 1259 OID 33379)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_user_user_permissions_user_id_a95ead1b" ON "public"."auth_user_user_permissions" USING "btree" ("user_id");


--
-- TOC entry 4727 (class 1259 OID 33404)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "auth_user_username_6821ab7c_like" ON "public"."auth_user" USING "btree" ("username" "varchar_pattern_ops");


--
-- TOC entry 4742 (class 1259 OID 33400)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "public"."django_admin_log" USING "btree" ("content_type_id");


--
-- TOC entry 4745 (class 1259 OID 33401)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "django_admin_log_user_id_c564eba6" ON "public"."django_admin_log" USING "btree" ("user_id");


--
-- TOC entry 4746 (class 1259 OID 33418)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "django_session_expire_date_a5c62663" ON "public"."django_session" USING "btree" ("expire_date");


--
-- TOC entry 4749 (class 1259 OID 33417)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "django_session_session_key_c0390e0f_like" ON "public"."django_session" USING "btree" ("session_key" "varchar_pattern_ops");


--
-- TOC entry 4752 (class 2606 OID 33345)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group_permissions"
    ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."auth_permission"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4753 (class 2606 OID 33340)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_group_permissions"
    ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."auth_group"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4751 (class 2606 OID 33331)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_permission"
    ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."django_content_type"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4754 (class 2606 OID 33360)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_groups"
    ADD CONSTRAINT "auth_user_groups_group_id_97559544_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."auth_group"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4755 (class 2606 OID 33355)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_groups"
    ADD CONSTRAINT "auth_user_groups_user_id_6a12ed8b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4756 (class 2606 OID 33374)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_user_permissions"
    ADD CONSTRAINT "auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."auth_permission"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4757 (class 2606 OID 33369)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."auth_user_user_permissions"
    ADD CONSTRAINT "auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4758 (class 2606 OID 33390)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_admin_log"
    ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."django_content_type"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4759 (class 2606 OID 33395)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."django_admin_log"
    ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 4750 (class 2606 OID 25857)
-- Name: t_employees t_employees_t_employees_position_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."t_employees"
    ADD CONSTRAINT "t_employees_t_employees_position_fkey" FOREIGN KEY ("t_employees_position") REFERENCES "public"."t_position"("t_position_id") NOT VALID;


-- Completed on 2024-02-12 00:49:02

--
-- PostgreSQL database dump complete
--

CREATE TABLE public.tokens_for_users (
    token_id serial PRIMARY KEY,
    auth_user integer NOT NULL,
    token_ua character varying(200) NOT NULL, /* user-agent */
    token_ip character varying(15) NOT NULL,
    token_exp timestamp with time zone NOT NULL,
    token_iat timestamp with time zone NOT NULL DEFAULT now(),
    token_value character varying(255) NOT NULL
);

ALTER TABLE ONLY public.tokens_for_users
    ADD CONSTRAINT auth_2_fk FOREIGN KEY (auth_user) REFERENCES public.auth_user(id) NOT VALID;