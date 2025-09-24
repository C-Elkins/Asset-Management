package com.chaseelkins.assetmanagement.repository;

import com.chaseelkins.assetmanagement.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Basic finder methods
    Optional<Category> findByName(String name);
    
    boolean existsByName(String name);
    
    Optional<Category> findByNameIgnoreCase(String name);
    
    // Find active/inactive categories
    List<Category> findByActive(Boolean active);
    
    Page<Category> findByActive(Boolean active, Pageable pageable);
    
    // Find categories ordered by sort order
    List<Category> findByActiveOrderBySortOrderAsc(Boolean active);
    
    // Search categories
    @Query("SELECT c FROM Category c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Category> searchCategories(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find categories with assets
    @Query("SELECT DISTINCT c FROM Category c JOIN c.assets a")
    List<Category> findCategoriesWithAssets();
    
    // Find categories without assets
    @Query("SELECT c FROM Category c WHERE c.assets IS EMPTY")
    List<Category> findCategoriesWithoutAssets();
    
    // Count active categories
    long countByActive(Boolean active);
    
    // Find categories with asset count
    @Query("SELECT c, COUNT(a) as assetCount FROM Category c LEFT JOIN c.assets a " +
           "WHERE c.active = true GROUP BY c ORDER BY c.sortOrder ASC")
    List<Object[]> findCategoriesWithAssetCount();
    
    // Find most used categories
    @Query("SELECT c, COUNT(a) as assetCount FROM Category c JOIN c.assets a " +
           "GROUP BY c ORDER BY assetCount DESC")
    List<Object[]> findMostUsedCategories();
    
    // Find categories by color code
    List<Category> findByColorCode(String colorCode);
    
    // Find categories by icon
    List<Category> findByIcon(String icon);
    
    // Find recently created categories using Spring Data naming convention
    List<Category> findByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime cutoffDate);
    
    // Find categories ordered by creation date (most recent first)
    List<Category> findAllByOrderByCreatedAtDesc();
    
    // Find categories ordered by name
    List<Category> findByActiveOrderByNameAsc(Boolean active);
    
    // Find next sort order
    @Query("SELECT COALESCE(MAX(c.sortOrder), 0) + 1 FROM Category c")
    Integer findNextSortOrder();
}