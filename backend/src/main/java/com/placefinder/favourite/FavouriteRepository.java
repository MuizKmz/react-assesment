package com.placefinder.favourite;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data derives each query from the method name. */
public interface FavouriteRepository extends JpaRepository<FavouritePlace, Long> {

    Optional<FavouritePlace> findByPlaceId(String placeId);

    List<FavouritePlace> findAllByOrderByCreatedAtDesc();

    /** Returns how many rows were deleted (0 or 1). */
    long deleteByPlaceId(String placeId);
}
