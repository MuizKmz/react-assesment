package com.placefinder.favourite;

import com.placefinder.favourite.dto.FavouriteRequest;
import com.placefinder.favourite.dto.FavouriteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** HTTP only: map the request, call the service, pick the status code. */
@RestController
@RequestMapping("/api/v1/favourites")
@Tag(name = "Favourites")
public class FavouriteController {

    private final FavouriteService service;

    public FavouriteController(FavouriteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List favourites, newest first")
    public List<FavouriteResponse> list() {
        return service.listNewestFirst();
    }

    @PutMapping("/{placeId}")
    @Operation(summary = "Save a favourite (201 created, 200 if it already existed)")
    public ResponseEntity<FavouriteResponse> save(
            @PathVariable @NotBlank @Size(max = 255) String placeId,
            @Valid @RequestBody FavouriteRequest request) {
        FavouriteService.SaveResult result = service.save(placeId, request);
        if (result.created()) {
            return ResponseEntity
                    .created(ServletUriComponentsBuilder.fromCurrentRequest().build().toUri())
                    .body(result.favourite());
        }
        return ResponseEntity.ok(result.favourite());
    }

    @DeleteMapping("/{placeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a favourite (204 even if it did not exist)")
    public void delete(@PathVariable String placeId) {
        service.delete(placeId);
    }
}
