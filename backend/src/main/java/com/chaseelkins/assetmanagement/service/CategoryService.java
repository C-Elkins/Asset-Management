package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.CategoryDTO;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(CategoryDTO dto) {
        log.info("Creating category: {}", dto.getName());

        if (categoryRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + dto.getName());
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setColorCode(dto.getColorCode() != null ? dto.getColorCode() : "#6366f1");
        category.setIcon(dto.getIcon() != null ? dto.getIcon() : "\uD83D\uDCE6");
    // Default to true when dto.getActive() is null, otherwise use the provided value
    category.setActive(dto.getActive() == null || dto.getActive());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : categoryRepository.findNextSortOrder());

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, CategoryDTO dto) {
        log.info("Updating category: {}", id);

        Category existing = getCategoryById(id);

        if (!existing.getName().equalsIgnoreCase(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + dto.getName());
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        if (dto.getColorCode() != null) existing.setColorCode(dto.getColorCode());
        if (dto.getIcon() != null) existing.setIcon(dto.getIcon());
        if (dto.getActive() != null) existing.setActive(dto.getActive());
        if (dto.getSortOrder() != null) existing.setSortOrder(dto.getSortOrder());

        return categoryRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    public void deleteCategory(Long id) {
        log.info("Deleting category: {}", id);
        Category existing = getCategoryById(id);
        // If category has assets, prevent delete in this basic implementation
        if (existing.getAssets() != null && !existing.getAssets().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with assigned assets");
        }
        categoryRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public Page<Category> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<Category> getActiveCategories() {
        return categoryRepository.findByActiveOrderBySortOrderAsc(true);
    }

    @Transactional(readOnly = true)
    public Page<Category> searchCategories(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return getAllCategories(pageable);
        }
        return categoryRepository.searchCategories(query.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public List<Category> getRecentlyCreatedCategories() {
        return categoryRepository.findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime.now().minusDays(30));
    }
}
