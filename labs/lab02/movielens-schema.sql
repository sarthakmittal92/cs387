create table links
	(movieId		varchar(7),
	 imdbId		varchar(7),
	 tmdbId		varchar(7)
	);
create table movies
	(movieId		varchar(7),
	 title		varchar(200),
	 genres		varchar(200)
	);	
	
create table ratings
	(userId		varchar(7),
	 movieId		varchar(25),
	 rating 	numeric(2,1),
	 timestamp		int
	);
		
create table tags
	(userId		varchar(7),
	 movieId		varchar(25),
	 tag 	varchar(100),
	 timestamp		int
	);


