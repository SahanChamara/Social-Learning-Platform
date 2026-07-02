package com.sociallearning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.graphql.server.webmvc.GraphiQlHandler;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GraphiQlConfiguration {

    @Bean
    @Order(0)
    public RouterFunction<ServerResponse> graphiQlRouterFunction() {
        ClassPathResource graphiQlPage = new ClassPathResource("graphiql/index.html");
        GraphiQlHandler graphiQlHandler = new GraphiQlHandler("/graphql", "/graphql-ws", graphiQlPage);
        return RouterFunctions.route()
            .GET("/graphiql", graphiQlHandler::handleRequest)
            .build();
    }
}