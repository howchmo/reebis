CREATE TABLE months (
    month date NOT NULL,
    work int(11) NOT NULL,
    holidays int(11)
,PRIMARY KEY(month)
);

CREATE TABLE projections (
    projection int(11) auto_increment NOT NULL, 
    month date NOT NULL,
    project int(11),
    resource int(11),
    hours int(11),
    percent double precision,
    note text
,PRIMARY KEY (projection)
);

CREATE TABLE projects (
    project int(11) auto_increment NOT NULL,
    parent int(11),
    title text NOT NULL,
    chargenumber text,
    start date NOT NULL,
    `end` date NOT NULL,
    manager text,
    customer text,
    description text,
    `status` text
, PRIMARY KEY(project)
);

CREATE TABLE resources (
    resource int(11) NOT NULL,
    first text,
    last text,
    department text,
    category text,
    supervisor text,
    `status` text
,PRIMARY KEY(resource)
);

ALTER TABLE `projects` ADD INDEX ( parent ) ;
