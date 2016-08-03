--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6beta1
-- Dumped by pg_dump version 9.6beta1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: months; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE months (
    month date NOT NULL,
    work integer NOT NULL,
    holidays integer
);


ALTER TABLE months OWNER TO postgres;

--
-- Name: projections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE projections (
    projection integer NOT NULL,
    month date NOT NULL,
    project integer,
    resource integer,
    hours integer,
    percent double precision,
    note text
);


ALTER TABLE projections OWNER TO postgres;

--
-- Name: projections_projection_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE projections_projection_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE projections_projection_seq OWNER TO postgres;

--
-- Name: projections_projection_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE projections_projection_seq OWNED BY projections.projection;


--
-- Name: projects_project_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE projects_project_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE projects_project_seq OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE projects (
    project integer DEFAULT nextval('projects_project_seq'::regclass) NOT NULL,
    parent integer,
    title text NOT NULL,
    chargenumber text,
    start date NOT NULL,
    "end" date NOT NULL,
    manager text,
    customer text,
    description text,
    status text
);


ALTER TABLE projects OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE resources (
    resource integer NOT NULL,
    first text,
    last text,
    department text,
    category text,
    supervisor text,
    status text
);


ALTER TABLE resources OWNER TO postgres;

--
-- Name: resources_resource_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE resources_resource_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE resources_resource_seq OWNER TO postgres;

--
-- Name: resources_resource_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE resources_resource_seq OWNED BY resources.resource;


--
-- Name: projections projection; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections ALTER COLUMN projection SET DEFAULT nextval('projections_projection_seq'::regclass);


--
-- Name: resources resource; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resources ALTER COLUMN resource SET DEFAULT nextval('resources_resource_seq'::regclass);


--
-- Name: months months_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY months
    ADD CONSTRAINT months_month_key UNIQUE (month);


--
-- Name: months months_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY months
    ADD CONSTRAINT months_pkey PRIMARY KEY (month);


--
-- Name: projections projections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections
    ADD CONSTRAINT projections_pkey PRIMARY KEY (projection);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project);


--
-- Name: fki_projects_parent_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_projects_parent_fkey ON projects USING btree (parent);


--
-- Name: projects projects_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_parent_fkey FOREIGN KEY (parent) REFERENCES projects(project);


--
-- PostgreSQL database dump complete
--

