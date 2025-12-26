package com.chaseelkins.assetmanagement.service;

import com.chaseelkins.assetmanagement.dto.AssetDTO;
import com.chaseelkins.assetmanagement.dto.imports.BulkImportRequests;
import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.Asset.AssetStatus;
import com.chaseelkins.assetmanagement.model.Asset.AssetCondition;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ExcelService {

    private static final Logger log = LoggerFactory.getLogger(ExcelService.class);

    /**
     * Parse Excel file (.xlsx) and convert to AssetItem list for bulk import
     */
    public BulkImportRequests.AssetsRequest parseExcelFile(MultipartFile file) throws IOException {
        List<BulkImportRequests.AssetItem> assets = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Read header row to understand column positions
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Excel file is empty");
            }
            
            // Skip header row, start from row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }
                
                try {
                    BulkImportRequests.AssetItem asset = parseAssetFromRow(row);
                    assets.add(asset);
                } catch (Exception e) {
                    log.warn("Failed to parse row {}: {}", i, e.getMessage());
                    // Continue with other rows
                }
            }
        }
        
        log.info("Parsed {} assets from Excel file", assets.size());
        return new BulkImportRequests.AssetsRequest(assets);
    }
    
    private BulkImportRequests.AssetItem parseAssetFromRow(Row row) {
        // Expected columns: Name, Asset Tag, Serial Number, Brand, Model, Category, 
        // Purchase Price, Purchase Date, Vendor, Location, Status, Condition, 
        // Warranty Expiry, Next Maintenance, Description, Notes
        
        return new BulkImportRequests.AssetItem(
            getCellValueAsString(row, 0), // name (column A)
            getCellValueAsString(row, 1), // assetTag (column B)
            getCellValueAsString(row, 14), // description (column O)
            getCellValueAsString(row, 3), // brand (column D)
            getCellValueAsString(row, 4), // model (column E)
            getCellValueAsString(row, 2), // serialNumber (column C)
            getCellValueAsBigDecimal(row, 6), // purchasePrice (column G)
            getCellValueAsLocalDate(row, 7), // purchaseDate (column H)
            getCellValueAsString(row, 8), // vendor (column I)
            getCellValueAsString(row, 9), // location (column J)
            getCellValueAsStatus(row, 10), // status (column K)
            getCellValueAsCondition(row, 11), // condition (column L)
            getCellValueAsLocalDate(row, 12), // warrantyExpiry (column M)
            getCellValueAsLocalDate(row, 13), // nextMaintenance (column N)
            getCellValueAsString(row, 15), // notes (column P)
            null, // categoryId (will be resolved from categoryName)
            getCellValueAsString(row, 5) // categoryName (column F)
        );
    }
    
    /**
     * Export assets to Excel file (.xlsx)
     */
    public void exportAssetsToExcel(List<Asset> assets, HttpServletResponse response) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Assets");
            
            // Create header style
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Name", "Asset Tag", "Serial Number", "Brand", "Model", "Category",
                "Purchase Price", "Purchase Date", "Vendor", "Location", "Status", "Condition",
                "Warranty Expiry", "Next Maintenance", "Description", "Notes"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 1;
            for (Asset asset : assets) {
                Row row = sheet.createRow(rowNum++);
                
                createCell(row, 0, asset.getName());
                createCell(row, 1, asset.getAssetTag());
                createCell(row, 2, asset.getSerialNumber());
                createCell(row, 3, asset.getBrand());
                createCell(row, 4, asset.getModel());
                createCell(row, 5, asset.getCategory() != null ? asset.getCategory().getName() : "");
                createCurrencyCell(row, 6, asset.getPurchasePrice(), currencyStyle);
                createDateCell(row, 7, asset.getPurchaseDate(), dateStyle);
                createCell(row, 8, asset.getVendor());
                createCell(row, 9, asset.getLocation());
                createCell(row, 10, asset.getStatus() != null ? asset.getStatus().name() : "");
                createCell(row, 11, asset.getCondition() != null ? asset.getCondition().name() : "");
                createDateCell(row, 12, asset.getWarrantyExpiry(), dateStyle);
                createDateCell(row, 13, asset.getNextMaintenance(), dateStyle);
                createCell(row, 14, asset.getDescription());
                createCell(row, 15, asset.getNotes());
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Write to response
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=assets_export_" + 
                LocalDateTime.now().toString().replace(":", "-") + ".xlsx");
            
            ServletOutputStream outputStream = response.getOutputStream();
            workbook.write(outputStream);
            workbook.close();
            outputStream.flush();
            outputStream.close();
        }
    }
    
    // Helper methods
    
    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }
    
    private String getCellValueAsString(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    // Remove decimal point if it's a whole number
                    double value = cell.getNumericCellValue();
                    if (value == (long) value) {
                        yield String.valueOf((long) value);
                    } else {
                        yield String.valueOf(value);
                    }
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }
    
    private BigDecimal getCellValueAsBigDecimal(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) return null;
                // Remove currency symbols and commas
                value = value.replaceAll("[$,]", "");
                return new BigDecimal(value);
            }
        } catch (Exception e) {
            log.warn("Failed to parse BigDecimal from cell: {}", e.getMessage());
        }
        return null;
    }
    
    private LocalDate getCellValueAsLocalDate(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        
        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                return cell.getLocalDateTimeCellValue().toLocalDate();
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) return null;
                return LocalDate.parse(value);
            }
        } catch (Exception e) {
            log.warn("Failed to parse LocalDate from cell: {}", e.getMessage());
        }
        return null;
    }
    
    private AssetStatus getCellValueAsStatus(Row row, int cellIndex) {
        String value = getCellValueAsString(row, cellIndex);
        if (value == null || value.isEmpty()) return null;
        
        try {
            return AssetStatus.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (Exception e) {
            log.warn("Invalid status value: {}", value);
            return null;
        }
    }
    
    private AssetCondition getCellValueAsCondition(Row row, int cellIndex) {
        String value = getCellValueAsString(row, cellIndex);
        if (value == null || value.isEmpty()) return null;
        
        try {
            return AssetCondition.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (Exception e) {
            log.warn("Invalid condition value: {}", value);
            return null;
        }
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("$#,##0.00"));
        return style;
    }
    
    private void createCell(Row row, int column, String value) {
        Cell cell = row.createCell(column);
        if (value != null) {
            cell.setCellValue(value);
        }
    }
    
    private void createDateCell(Row row, int column, LocalDate value, CellStyle dateStyle) {
        Cell cell = row.createCell(column);
        if (value != null) {
            cell.setCellValue(Date.from(value.atStartOfDay(ZoneId.systemDefault()).toInstant()));
            cell.setCellStyle(dateStyle);
        }
    }
    
    private void createCurrencyCell(Row row, int column, BigDecimal value, CellStyle currencyStyle) {
        Cell cell = row.createCell(column);
        if (value != null) {
            cell.setCellValue(value.doubleValue());
            cell.setCellStyle(currencyStyle);
        }
    }
}
