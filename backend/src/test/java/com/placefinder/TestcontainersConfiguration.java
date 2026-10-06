package com.placefinder;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mssqlserver.MSSQLServerContainer;

/**
 * A throwaway SQL Server 2022 in Docker for integration tests.
 * @ServiceConnection points the datasource at it, so no URLs or passwords are needed.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    MSSQLServerContainer sqlServerContainer() {
        return new MSSQLServerContainer("mcr.microsoft.com/mssql/server:2022-latest").acceptLicense();
    }
}
