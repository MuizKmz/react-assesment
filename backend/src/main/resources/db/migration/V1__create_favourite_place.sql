CREATE TABLE favourite_place (
    id                BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT pk_favourite_place PRIMARY KEY,
    place_id          NVARCHAR(255) NOT NULL,
    name              NVARCHAR(255) NOT NULL,
    formatted_address NVARCHAR(500) NULL,
    latitude          DECIMAL(9,6)  NOT NULL,
    longitude         DECIMAL(9,6)  NOT NULL,
    created_at        DATETIME2     NOT NULL CONSTRAINT df_favourite_place_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_favourite_place_place_id UNIQUE (place_id)
);
