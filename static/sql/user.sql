create table users (
  ID int NOT NULL AUTO_INCREMENT,
  email varchar(50),
  password varchar(50)
);

insert into users (email, password) values ('arron_ferguson@bcit.ca', 'admin');