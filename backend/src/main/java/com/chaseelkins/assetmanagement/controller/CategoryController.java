package com.chaseelkins.assetmanagement.controller;

import com.chaseelkins.assetmanagement.dto.CategoryDTO;
import com.chaseelkins.assetmanagement.dto.CategorySummaryDTO;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryDTO>> getAll() {
        List<Category> categories = categoryService.getAllCategories(Pageable.unpaged()).getContent();
        List<CategorySummaryDTO> dtos = categories.stream()
                .map(CategorySummaryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategorySummaryDTO>> getActive() {
        List<Category> categories = categoryService.getActiveCategories();
        List<CategorySummaryDTO> dtos = categories.stream()
                .map(CategorySummaryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<CategorySummaryDTO>> getRecent() {
        List<Category> categories = categoryService.getRecentlyCreatedCategories();
        List<CategorySummaryDTO> dtos = categories.stream()
                .map(CategorySummaryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Category>> search(@RequestParam String query, Pageable pageable) {
        return ResponseEntity.ok(categoryService.searchCategories(query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoryService.getCategoryById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Category> create(@Valid @RequestBody CategoryDTO dto) {
        Category created = categoryService.createCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','MANAGER','SUPER_ADMIN')")
    public ResponseEntity<Category> update(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        try {
            return ResponseEntity.ok(categoryService.updateCategory(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('IT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
