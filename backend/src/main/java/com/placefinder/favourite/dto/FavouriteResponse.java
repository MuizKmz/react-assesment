package com.placefinder.favourite.dto;

import java.time.Instant;

/** One favourite as the frontend sees it. Matches the Favourite type in frontend/src/types/place.ts. */
public record FavouriteResponse(
        String placeId,
        String name,
        String address,
        double latitude,
        double longitude,
        Instant createdAt) {}
