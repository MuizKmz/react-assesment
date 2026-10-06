package com.placefinder.favourite;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/** A starred place. The table is created by Flyway (V1), Hibernate only validates it. */
@Entity
@Table(name = "favourite_place")
public class FavouritePlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "place_id", nullable = false, unique = true, length = 255)
    private String placeId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "formatted_address", length = 500)
    private String formattedAddress;

    @Column(name = "latitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** For JPA only. */
    protected FavouritePlace() {}

    public FavouritePlace(String placeId, String name, String formattedAddress,
                          BigDecimal latitude, BigDecimal longitude, Instant createdAt) {
        this.placeId = placeId;
        this.name = name;
        this.formattedAddress = formattedAddress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
    }

    /** PUT replaces the details but keeps the original createdAt. */
    public void updateDetails(String name, String formattedAddress, BigDecimal latitude, BigDecimal longitude) {
        this.name = name;
        this.formattedAddress = formattedAddress;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }
    public String getPlaceId() { return placeId; }
    public String getName() { return name; }
    public String getFormattedAddress() { return formattedAddress; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public Instant getCreatedAt() { return createdAt; }
}
