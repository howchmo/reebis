--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

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
-- Name: months; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE months (
    month date NOT NULL,
    work integer NOT NULL,
    holidays integer
);


ALTER TABLE months OWNER TO postgres;

--
-- Name: projections; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
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
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
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
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
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
-- Name: projection; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projections ALTER COLUMN projection SET DEFAULT nextval('projections_projection_seq'::regclass);


--
-- Name: resource; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY resources ALTER COLUMN resource SET DEFAULT nextval('resources_resource_seq'::regclass);


--
-- Data for Name: months; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY months (month, work, holidays) FROM stdin;
2016-01-01	168	8
2016-02-01	168	\N
2016-03-01	184	\N
2016-04-01	168	\N
2016-05-01	176	8
2016-06-01	176	\N
2016-07-01	168	8
2016-08-01	184	\N
2016-09-01	176	8
2016-10-01	168	\N
2016-11-01	176	16
2016-12-01	176	8
2017-01-01	176	8
2017-02-01	160	\N
2017-03-01	184	\N
2017-04-01	160	\N
2017-05-01	184	8
2017-06-01	176	\N
2017-07-01	168	8
2017-08-01	184	\N
2017-09-01	168	8
2017-10-01	176	\N
2017-11-01	184	16
2017-12-01	168	8
\.


--
-- Data for Name: projections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY projections (projection, month, project, resource, hours, percent, note) FROM stdin;
1	2016-07-01	2	11	152	\N	\N
2	2016-08-01	2	11	40	\N	\N
3	2016-07-01	9	15	112	\N	\N
4	2016-08-01	9	15	184	\N	\N
5	2016-07-01	2	15	40	\N	\N
6	2016-09-01	5	14	160	\N	\N
7	2016-07-01	5	14	152	\N	\N
8	2016-11-01	5	14	144	\N	\N
9	2016-12-01	5	14	1	\N	\N
10	2016-08-01	5	14	184	\N	\N
11	2016-10-01	5	14	168	\N	\N
12	2016-07-01	7	17	60	\N	\N
13	2016-07-01	4	17	42	\N	\N
14	2016-07-01	6	17	50	\N	\N
15	2016-08-01	4	17	88	\N	\N
16	2016-08-01	7	17	0	\N	\N
17	2016-08-01	6	17	50	\N	\N
18	2016-09-01	7	17	0	\N	\N
19	2016-09-01	6	17	50	\N	\N
20	2016-10-01	7	17	0	\N	\N
21	2016-10-01	6	17	50	\N	\N
22	2016-11-01	7	17	0	\N	\N
23	2016-11-01	6	17	50	\N	\N
24	2016-12-01	7	17	0	\N	\N
25	2016-12-01	6	17	50	\N	\N
26	2016-07-01	2	7	0	\N	\N
27	2016-07-01	8	7	152	\N	\N
28	2016-08-01	8	7	184	\N	\N
29	2016-09-01	8	7	160	\N	\N
30	2016-10-01	8	7	168	\N	\N
31	2016-11-01	8	7	59	\N	\N
32	2016-12-01	8	7	0	\N	\N
33	2016-07-01	8	13	136	\N	\N
34	2016-08-01	8	13	0	\N	\N
35	2016-07-01	5	9	76	\N	\N
36	2016-07-01	2	9	40	\N	\N
37	2016-08-01	5	9	92	\N	\N
38	2016-09-01	5	9	80	\N	\N
39	2016-10-01	5	9	84	\N	\N
40	2016-11-01	5	9	72	\N	\N
41	2016-07-01	2	10	152	\N	\N
42	2016-07-01	8	10	0	\N	\N
43	2016-08-01	2	10	44	\N	\N
44	2016-08-01	8	10	140	\N	\N
45	2016-09-01	8	10	160	\N	\N
46	2016-10-01	8	10	168	\N	\N
47	2016-11-01	8	10	0	\N	\N
48	2016-12-01	8	10	0	\N	\N
\.


--
-- Name: projections_projection_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('projections_projection_seq', 48, true);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY projects (project, parent, title, chargenumber, start, "end", manager, customer, description, status) FROM stdin;
1	\N	JKO Course Conversion Bridge Funding	1603	2016-04-01	2016-08-31	K. Martin	Northrop Grumman	Continue work started under 1602 and bridge the gap until new contract is awarded, expected Aug - Sep 2016--	Active
2	\N	NATO-ITE: CJOC & Additional Security Modules	8108	2016-03-01	2016-08-31	K. Martin	NATO		Active
3	\N	Clinical Skills	8715	2015-09-30	2016-09-30	E. Martin	ARL		Active
4	\N	Humeral Head Interosseous SBIR Phase II	1506	2015-10-12	2016-10-11	H. Corbett	SIMETRI		Active
5	\N	Picatinney VBS3 Support		2016-06-13	2016-11-30				Active
6	\N	TRB		2016-04-01	2016-12-31	H. Corbett			Active
7	\N	TC3Sim Modernization: Task 7: Multimodal Training Evaluation	8980	2016-03-01	2017-02-28	C. Ringer	ARL		Active
8	\N	VA-VMC BPA Call 06	9606	2016-06-01	2017-05-31	K. Garrison	VA	Rural Health, Conference Center, Profiles, Cal"end"ars, Navigation, additional VETAs, etc.	Active
9	\N	VA-VMC BPA Call 05	9605	2016-06-01	2017-05-31	K. Garrison	VA		Active
10	\N	VA-VMC BPA Call 07	9607	2016-06-01	2017-05-31	K. Garrison	VA Sim Learn	Crash Cart Upgrades	Active
\.


--
-- Name: projects_project_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('projects_project_seq', 10, true);


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY resources (resource, first, last, department, category, supervisor, status) FROM stdin;
1	Brian	Compton	Art	\N	S. Taber	active
2	Timothy	Hall	Art	\N	S. Taber	active
3	Eric	Hernandez	Art	\N	K. Martin	active
4	Kyle	Martin	Art	\N	S. Taber	active
5	Jason	Pancho	Art	\N	C. Valentin	active
6	Shane	Taber	Art	\N	M. Spruill	active
7	Justin	Welzien	Art	\N	S. Taber	active
8	Denis	Alvarado	Engineering	\N	Martin	active
9	Scott	Beck	Engineering	\N	Mall	active
10	Vincent	Biancardi	Engineering	\N	Mall	active
11	Alexander	Czarnopys	Engineering	\N	Mall	active
12	Howard	Mall	Engineering	\N	M. Spruill	active
13	Eric	Martin	Engineering	\N	Mall	active
14	Benjamin	Miles	Engineering	\N	Quintero	active
15	Anthony	Nicholas	Engineering	\N	Mall	active
16	Benjamin	Quintero	Engineering	\N	Mall	active
17	Corey	Ringer	Engineering	\N	Pigora	active
18	James	Sherrill	Engineering	\N	Quintero	active
19	Troy	Chapman	QA	\N	M. Spruill	active
20	Andrew	Fuerstenberg	QA	\N	T. Chapman	active
21	Hunter	Smith	QA	\N	T. Chapman	active
22	Kenneth	Garrison	Mgmt	\N		active
23	Hayley	Corbett	Mgmt	\N		active
24	Terry	Smith	ISD	\N		active
\.


--
-- Name: resources_resource_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('resources_resource_seq', 24, true);


--
-- Name: months_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY months
    ADD CONSTRAINT months_month_key UNIQUE (month);


--
-- Name: months_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY months
    ADD CONSTRAINT months_pkey PRIMARY KEY (month);


--
-- Name: projections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY projections
    ADD CONSTRAINT projections_pkey PRIMARY KEY (projection);


--
-- Name: projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project);


--
-- Name: fki_projects_parent_fkey; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX fki_projects_parent_fkey ON projects USING btree (parent);


--
-- Name: projects_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_parent_fkey FOREIGN KEY (parent) REFERENCES projects(project);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

