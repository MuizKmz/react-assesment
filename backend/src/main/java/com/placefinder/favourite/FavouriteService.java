package com.placefinder.favourite;

import com.placefinder.favourite.dto.FavouriteRequest;
import com.placefinder.favourite.dto.FavouriteResponse;
import java.time.Clock;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business rules for favourites: idempotent save, delete-if-exists. */
@Service
public class FavouriteService {

    /** The saved favourite, and whether this call created it (201) or it already existed (200). */
    public record SaveResult(FavouriteResponse favourite, boolean created) {}

    private final FavouriteRepository repository;
    private final FavouriteMapper mapper;
    private final Clock clock;

    public FavouriteService(FavouriteRepository repository, FavouriteMapper mapper, Clock clock) {
        this.repository = repository;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<FavouriteResponse> listNewestFirst() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Create the favourite, or update it if it already exists.
     * Calling it twice with the same body gives the same result (idempotent PUT).
     */
    @Transactional
    public SaveResult save(String placeId, FavouriteRequest request) {
        return repository.findByPlaceId(placeId)
                .map(existing -> {
                    mapper.updateEntity(existing, request);
                    return new SaveResult(mapper.toResponse(existing), false);
                })
                .orElseGet(() -> {
                    FavouritePlace created = repository.save(mapper.toEntity(placeId, request, clock.instant()));
                    return new SaveResult(mapper.toResponse(created), true);
                });
    }

    /** Deleting something that is not there is fine: the end state is the same. */
    @Transactional
    public void delete(String placeId) {
        repository.deleteByPlaceId(placeId);
    }
}
