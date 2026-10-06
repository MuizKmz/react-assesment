package com.placefinder.favourite;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.placefinder.favourite.dto.FavouriteRequest;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FavouriteServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-06T02:05:00Z");
    private static final FavouriteRequest REQUEST =
            new FavouriteRequest("Pavilion Kuala Lumpur", "168 Jalan Bukit Bintang", 3.149, 101.7133);

    @Mock
    private FavouriteRepository repository;

    private FavouriteService service;

    @BeforeEach
    void setUp() {
        service = new FavouriteService(repository, new FavouriteMapper(), Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void saveCreatesWhenNew() {
        when(repository.findByPlaceId("p1")).thenReturn(Optional.empty());
        when(repository.save(any(FavouritePlace.class))).thenAnswer(call -> call.getArgument(0));

        FavouriteService.SaveResult result = service.save("p1", REQUEST);

        assertThat(result.created()).isTrue();
        assertThat(result.favourite().placeId()).isEqualTo("p1");
        assertThat(result.favourite().latitude()).isEqualTo(3.149);
        assertThat(result.favourite().createdAt()).isEqualTo(NOW);
    }

    @Test
    void saveIsIdempotentWhenItAlreadyExists() {
        Instant original = Instant.parse("2026-01-01T00:00:00Z");
        FavouritePlace existing = new FavouritePlace("p1", "Old name", null,
                new BigDecimal("1.000000"), new BigDecimal("2.000000"), original);
        when(repository.findByPlaceId("p1")).thenReturn(Optional.of(existing));

        FavouriteService.SaveResult result = service.save("p1", REQUEST);

        assertThat(result.created()).isFalse();
        assertThat(result.favourite().name()).isEqualTo("Pavilion Kuala Lumpur");
        assertThat(result.favourite().createdAt()).isEqualTo(original);
        verify(repository, never()).save(any());
    }

    @Test
    void deleteOfMissingPlaceIsFine() {
        when(repository.deleteByPlaceId("missing")).thenReturn(0L);

        service.delete("missing");

        verify(repository).deleteByPlaceId("missing");
    }

    @Test
    void listMapsEntitiesNewestFirst() {
        FavouritePlace place = new FavouritePlace("p1", "Pavilion", null,
                new BigDecimal("3.149000"), new BigDecimal("101.713300"), NOW);
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(place));

        assertThat(service.listNewestFirst())
                .singleElement()
                .satisfies(f -> {
                    assertThat(f.placeId()).isEqualTo("p1");
                    assertThat(f.address()).isEmpty();
                    assertThat(f.longitude()).isEqualTo(101.7133);
                });
    }
}
