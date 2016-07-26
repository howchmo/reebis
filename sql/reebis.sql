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
    month date NOT NULL,
    project integer,
    resource text,
    hours integer,
    percent double precision,
    note text
);


ALTER TABLE projections OWNER TO postgres;

--
-- Name: projects_project_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE projects_project_seq
    START WITH 0
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
    resource text NOT NULL,
    department text,
    category text,
    supervisor text,
    status text
);


ALTER TABLE resources OWNER TO postgres;

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
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project);


--
-- Name: resources resource_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resources
    ADD CONSTRAINT resource_pkey PRIMARY KEY (resource);


--
-- Name: fki_projects_parent_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_projects_parent_fkey ON projects USING btree (parent);


--
-- Name: projections projections_month_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections
    ADD CONSTRAINT projections_month_fkey FOREIGN KEY (month) REFERENCES months(month);


--
-- Name: projections projections_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections
    ADD CONSTRAINT projections_project_fkey FOREIGN KEY (project) REFERENCES projects(project);


--
-- Name: projections projections_resource_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections
    ADD CONSTRAINT projections_resource_fkey FOREIGN KEY (resource) REFERENCES resources(resource);


--
-- Name: projects projects_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_parent_fkey FOREIGN KEY (parent) REFERENCES projects(project);


--
-- PostgreSQL database dump complete
--

