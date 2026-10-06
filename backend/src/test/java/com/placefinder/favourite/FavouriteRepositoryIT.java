package com.placefinder.favourite;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.placefinder.TestcontainersConfiguration;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Runs against a real SQL Server: Flyway creates the schema and Hibernate validates it.
 * Skipped automatically when Docker is not available.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
@Testcontainers(disabledWithoutDocker = true)
class FavouriteRepositoryIT {

    @Autowired
    private FavouriteRepository repository;

    private static FavouritePlace place(String placeId, String name, Instant createdAt) {
        return new FavouritePlace(placeId, name, "Kuala Lumpur",
                new BigDecimal("3.149000"), new BigDecimal("101.713300"), createdAt);
    }

    @Test
    void savesUnicodeNamesAndFindsByPlaceId() {
        repository.saveAndFlush(place("p1", "Menara Kuala Lumpur 吉隆坡塔", Instant.parse("2026-10-06T02:05:00Z")));

        assertThat(repository.findByPlaceId("p1"))
                .get()
                .satisfies(found -> {
                    assertThat(found.getName()).isEqualTo("Menara Kuala Lumpur 吉隆坡塔");
                    assertThat(found.getLatitude()).isEqualByComparingTo("3.149");
                });
    }

    @Test
    void listsNewestFirst() {
        repository.save(place("old", "Old", Instant.parse("2026-01-01T00:00:00Z")));
        repository.save(place("new", "New", Instant.parse("2026-10-06T00:00:00Z")));
        repository.flush();

        assertThat(repository.findAllByOrderByCreatedAtDesc())
                .extracting(FavouritePlace::getPlaceId)
                .containsExactly("new", "old");
    }

    @Test
    void deleteByPlaceIdReturnsHowManyRowsWentAway() {
        repository.saveAndFlush(place("p1", "Pavilion", Instant.now()));

        assertThat(repository.deleteByPlaceId("p1")).isEqualTo(1);
        assertThat(repository.deleteByPlaceId("p1")).isZero();
    }

    @Test
    void placeIdIsUnique() {
        repository.saveAndFlush(place("p1", "Pavilion", Instant.now()));

        assertThatThrownBy(() -> repository.saveAndFlush(place("p1", "Duplicate", Instant.now())))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
