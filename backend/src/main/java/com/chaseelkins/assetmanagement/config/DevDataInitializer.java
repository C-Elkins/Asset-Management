package com.chaseelkins.assetmanagement.config;

import com.chaseelkins.assetmanagement.model.Asset;
import com.chaseelkins.assetmanagement.model.Category;
import com.chaseelkins.assetmanagement.model.MaintenanceRecord;
import com.chaseelkins.assetmanagement.model.User;
import com.chaseelkins.assetmanagement.repository.AssetRepository;
import com.chaseelkins.assetmanagement.repository.CategoryRepository;
import com.chaseelkins.assetmanagement.repository.MaintenanceRepository;
import com.chaseelkins.assetmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@Profile("dev")
public class DevDataInitializer implements CommandLineRunner {

    private final UserRepository users;
    private final CategoryRepository categories;
    private final AssetRepository assets;
    private final MaintenanceRepository maintenance;
    private final PasswordEncoder encoder;

    public DevDataInitializer(UserRepository users,
                              CategoryRepository categories,
                              AssetRepository assets,
                              MaintenanceRepository maintenance,
                              PasswordEncoder encoder) {
        this.users = users;
        this.categories = categories;
        this.assets = assets;
        this.maintenance = maintenance;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() == 0) {
            users.save(new User("admin", "admin@example.com", encoder.encode("admin123"), "Alice", "Admin", "IT", "IT Admin", "555-1000", User.Role.SUPER_ADMIN, true));
            users.save(new User("manager", "manager@example.com", encoder.encode("manager123"), "Bob", "Manager", "Ops", "Manager", "555-2000", User.Role.MANAGER, true));
            users.save(new User("user", "user@example.com", encoder.encode("user123"), "Carol", "User", "Sales", "Sales Rep", "555-3000", User.Role.USER, true));
        }

        if (categories.count() == 0) {
            Category laptops = new Category();
            laptops.setName("Laptops");
            laptops.setDescription("Portable computers");
            laptops.setActive(true);
            categories.save(laptops);

            Category phones = new Category();
            phones.setName("Phones");
            phones.setDescription("Mobile devices");
            phones.setActive(true);
            categories.save(phones);

            // Create one asset
            Asset mac = new Asset();
            mac.setName("MacBook Pro");
            mac.setAssetTag("MBP-001");
            mac.setStatus(Asset.AssetStatus.AVAILABLE);
            mac.setCondition(Asset.AssetCondition.EXCELLENT);
            mac.setCategory(laptops);
            mac.setPurchaseDate(LocalDate.now().minusMonths(6));
            mac.setPurchasePrice(new BigDecimal("2499.00"));
            mac.setWarrantyExpiry(LocalDate.now().plusYears(2));
            assets.save(mac);

            MaintenanceRecord m = new MaintenanceRecord();
            m.setAsset(mac);
            m.setMaintenanceDate(LocalDate.now().plusDays(7));
            m.setMaintenanceType("Battery Check");
            m.setDescription("Check battery health");
            m.setStatus(MaintenanceRecord.MaintenanceStatus.SCHEDULED);
            m.setPriority(MaintenanceRecord.MaintenancePriority.MEDIUM);
            maintenance.save(m);
        }
    }
}
