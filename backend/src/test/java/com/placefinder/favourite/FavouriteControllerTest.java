package com.placefinder.favourite;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.placefinder.favourite.dto.FavouriteRequest;
import com.placefinder.favourite.dto.FavouriteResponse;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FavouriteController.class)
class FavouriteControllerTest {

    private static final FavouriteResponse PAVILION = new FavouriteResponse(
            "p1", "Pavilion Kuala Lumpur", "168 Jalan Bukit Bintang", 3.149, 101.7133,
            Instant.parse("2026-10-06T02:05:00Z"));

    private static final String VALID_BODY = """
            { "name": "Pavilion Kuala Lumpur", "address": "168 Jalan Bukit Bintang",
              "latitude": 3.149, "longitude": 101.7133 }
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private FavouriteService service;

    @Test
    void listReturnsFavourites() throws Exception {
        when(service.listNewestFirst()).thenReturn(List.of(PAVILION));

        mvc.perform(get("/api/v1/favourites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].placeId").value("p1"))
                .andExpect(jsonPath("$[0].createdAt").value("2026-10-06T02:05:00Z"));
    }

    @Test
    void putReturns201WhenCreated() throws Exception {
        when(service.save(eq("p1"), any(FavouriteRequest.class)))
                .thenReturn(new FavouriteService.SaveResult(PAVILION, true));

        mvc.perform(put("/api/v1/favourites/p1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", endsWith("/api/v1/favourites/p1")))
                .andExpect(jsonPath("$.name").value("Pavilion Kuala Lumpur"));
    }

    @Test
    void putReturns200WhenItAlreadyExisted() throws Exception {
        when(service.save(eq("p1"), any(FavouriteRequest.class)))
                .thenReturn(new FavouriteService.SaveResult(PAVILION, false));

        mvc.perform(put("/api/v1/favourites/p1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isOk());
    }

    @Test
    void putReturns400ProblemDetailWithFieldErrors() throws Exception {
        String invalid = """
                { "name": "", "latitude": 91, "longitude": 101.7 }
                """;

        mvc.perform(put("/api/v1/favourites/p1").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors[*].field", hasItem("name")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("latitude")));

        verifyNoInteractions(service);
    }

    @Test
    void putReturns400WhenPlaceIdIsTooLong() throws Exception {
        String longId = "x".repeat(256);

        mvc.perform(put("/api/v1/favourites/" + longId).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("placeId"));
    }

    @Test
    void deleteReturns204() throws Exception {
        mvc.perform(delete("/api/v1/favourites/p1"))
                .andExpect(status().isNoContent());

        verify(service).delete("p1");
    }
}
