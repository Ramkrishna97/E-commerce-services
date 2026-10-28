package com.example.user.checkout;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class Catalog {
    private final Map<String, Product> products;

    public Catalog(ObjectMapper mapper) throws IOException {
        try (var stream = new ClassPathResource("products.json").getInputStream()) {
            List<Product> catalog = mapper.readValue(stream, new TypeReference<>() { });
            products = catalog.stream().collect(Collectors.toUnmodifiableMap(Product::id, Function.identity()));
            if (products.isEmpty() || products.values().stream().anyMatch(product -> product.price().signum() <= 0)) {
                throw new IllegalStateException("Catalog requires products with positive prices");
            }
        }
    }

    public Product get(String id) { return products.get(id); }

    public record Product(String id, String name, String brand, String category, BigDecimal price,
                          String rating, String color, String icon) { }
}
