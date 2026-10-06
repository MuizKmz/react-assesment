package com.placefinder.favourite;

import com.placefinder.favourite.dto.FavouriteRequest;
import com.placefinder.favourite.dto.FavouriteResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import org.springframework.stereotype.Component;

/** Entity <-> DTO. Keeps the JPA entity out of the HTTP layer. */
@Component
public class FavouriteMapper {

    /** Matches DECIMAL(9,6): about 10 cm precision. */
    private static final int COORDINATE_SCALE = 6;

    public FavouriteResponse toResponse(FavouritePlace entity) {
        return new FavouriteResponse(
                entity.getPlaceId(),
                entity.getName(),
                entity.getFormattedAddress() == null ? "" : entity.getFormattedAddress(),
                entity.getLatitude().doubleValue(),
                entity.getLongitude().doubleValue(),
                entity.getCreatedAt());
    }

    public FavouritePlace toEntity(String placeId, FavouriteRequest request, Instant createdAt) {
        return new FavouritePlace(
                placeId,
                request.name().trim(),
                blankToNull(request.address()),
                toCoordinate(request.latitude()),
                toCoordinate(request.longitude()),
                createdAt);
    }

    public void updateEntity(FavouritePlace entity, FavouriteRequest request) {
        entity.updateDetails(
                request.name().trim(),
                blankToNull(request.address()),
                toCoordinate(request.latitude()),
                toCoordinate(request.longitude()));
    }

    private static BigDecimal toCoordinate(double value) {
        return BigDecimal.valueOf(value).setScale(COORDINATE_SCALE, RoundingMode.HALF_UP);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
