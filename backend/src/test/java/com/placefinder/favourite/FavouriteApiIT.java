package com.placefinder.favourite;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.placefinder.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/** The whole stack: HTTP -> controller -> service -> JPA -> SQL Server. Skipped without Docker. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Testcontainers(disabledWithoutDocker = true)
class FavouriteApiIT {

    private static final String BODY = """
            { "name": "Pavilion Kuala Lumpur", "address": "168 Jalan Bukit Bintang",
              "latitude": 3.149, "longitude": 101.7133 }
            """;

    @Autowired
    private MockMvc mvc;

    @Test
    void putGetDeleteRoundTrip() throws Exception {
        mvc.perform(put("/api/v1/favourites/ChIJ-api-test").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated());
        mvc.perform(put("/api/v1/favourites/ChIJ-api-test").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/favourites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.placeId == 'ChIJ-api-test')].latitude").value(3.149));

        mvc.perform(delete("/api/v1/favourites/ChIJ-api-test")).andExpect(status().isNoContent());
        mvc.perform(delete("/api/v1/favourites/ChIJ-api-test")).andExpect(status().isNoContent());

        mvc.perform(get("/api/v1/favourites"))
                .andExpect(jsonPath("$[?(@.placeId == 'ChIJ-api-test')]").isEmpty());
    }

    @Test
    void healthIsUp() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
