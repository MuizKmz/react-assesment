package com.placefinder.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Title and description shown in Swagger UI (/swagger-ui.html). */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI placeFinderOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Place Finder API")
                .version("v1")
                .description("Save and list favourite places. Favourites are global: there is no login in this demo."));
    }
}
