CREATE DATABASE reservationDB;
USE reservationDB;
CREATE TABLE station
(
    Id   int          NOT NULL AUTO_INCREMENT,
    Name varchar(255) NOT NULL,
    PRIMARY KEY (Id)
);


CREATE TABLE rolle
(
    Id                 int          NOT NULL AUTO_INCREMENT,
    name               varchar(255) NOT NULL,
    viewTermin         boolean,
    viewAllUser        boolean,
    viewAllStationUser boolean,
    editUser           boolean,
    PRIMARY KEY (Id)
);

CREATE TABLE account
(
    Id       int          NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    role_id  int          not null,
    PRIMARY KEY (Id),
    FOREIGN KEY (role_id) REFERENCES rolle (id)
);

CREATE TABLE betreuer
(
    Id         int          not null AUTO_INCREMENT,
    name       varchar(255) NOT NULL,
    station_id int          not null,
    account_id int,
    PRIMARY KEY (id),
    FOREIGN KEY (station_id) REFERENCES station (Id),
    FOREIGN KEY (account_id) REFERENCES account (id)
);


CREATE TABLE tablets
(
    Id          int          NOT NULL AUTO_INCREMENT,
    name        varchar(255) NOT NULL,
    maintenance boolean      NOT NULL,
    station_id  int,
    PRIMARY KEY (Id),
    FOREIGN KEY (station_id) REFERENCES station (id)
);

CREATE TABLE bewohner
(
    Id         int          NOT NULL AUTO_INCREMENT,
    name       varchar(255) NOT NULL,
    station_id int          NOT NULL,
    inviteLink varchar(512) NOT NULL,
    createLink varchar(512) NOT NULL,
    joinLink   varchar(512) NOT NULL,
    account_id int,
    PRIMARY KEY (Id),
    FOREIGN KEY (station_id) REFERENCES station (id),
    FOREIGN KEY (account_id) REFERENCES account (id)
);


CREATE TABLE besucher
(
    Id         int          NOT NULL AUTO_INCREMENT,
    name       varchar(255) NOT NULL,
    mail       varchar(255) NOT NULL,
    account_id int,
    PRIMARY KEY (Id),
    FOREIGN KEY (account_id) REFERENCES account (id)
);


CREATE TABLE meeting
(
    Id          int      NOT NULL AUTO_INCREMENT,
    start_date  datetime NOT NULL,
    end_date    datetime NOT NULL,
    bewohner_id int      not null,
    besucher_id int,
    tablets_id  int,
    PRIMARY KEY (Id),
    Foreign Key (tablets_id) REFERENCES tablets (Id),
    foreign key (bewohner_id) references bewohner (Id),
    foreign key (besucher_id) references besucher (Id)
);

CREATE TABLE bewohner_hat_besucher
(
    Id          int NOT NULL AUTO_INCREMENT,
    bewohner_id int NOT NULL,
    besucher_id int NOT NULL,
    PRIMARY KEY (Id),
    Foreign Key (bewohner_id) REFERENCES bewohner (Id),
    Foreign Key (besucher_id) REFERENCES besucher (Id)
);





INSERT INTO rolle #Admin
VALUES (1, 'Admin', true, true, true, true);
INSERT INTO rolle #Betreuer
VALUES (2, 'Betreuer', true, false, true, false);
INSERT INTO rolle #Bewohner/Besucher
VALUES (3, 'User', true, false, false, false);

#insert into account #Admin Account
#values (1, 'admin', 'admin', 1)

insert into station value (1, 'testStation')
